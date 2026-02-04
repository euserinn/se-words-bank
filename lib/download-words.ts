import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx"

interface Word {
  id: string
  word: string
  meaning: string
  date: string
  group_id: string | null
  correct_count?: number
}

interface Group {
  id: string
  name: string
}

// 브라우저 네이티브 다운로드 함수
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 알파벳/한글 첫 글자로 정렬
function getFirstChar(str: string): string {
  const char = str.charAt(0).toUpperCase()
  // 한글인 경우
  if (/[가-힣]/.test(char)) {
    const code = char.charCodeAt(0) - 0xAC00
    const cho = Math.floor(code / 588)
    const choList = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
    return choList[cho] || char
  }
  // 영문인 경우
  if (/[A-Z]/.test(char)) {
    return char
  }
  return '#'
}

// 단어를 알파벳/한글 순으로 그룹화
function groupWordsByFirstChar(words: Word[]): Record<string, Word[]> {
  const grouped: Record<string, Word[]> = {}
  
  const sortedWords = [...words].sort((a, b) => 
    a.word.localeCompare(b.word, 'ko')
  )
  
  for (const word of sortedWords) {
    const firstChar = getFirstChar(word.word)
    if (!grouped[firstChar]) {
      grouped[firstChar] = []
    }
    grouped[firstChar].push(word)
  }
  
  return grouped
}

// 모든 단어 다운로드
export async function downloadAllWords(words: Word[], filename: string = "나의_사전") {
  const grouped = groupWordsByFirstChar(words)
  const children: Paragraph[] = []
  
  // 제목
  children.push(
    new Paragraph({
      text: "나의 사전",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  )
  
  children.push(
    new Paragraph({
      text: `총 ${words.length}개 단어`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 }
    })
  )
  
  // 알파벳/한글 순으로 정렬
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    // 한글 자음 순서
    const koreanOrder = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
    const aIsKorean = koreanOrder.includes(a)
    const bIsKorean = koreanOrder.includes(b)
    
    if (aIsKorean && bIsKorean) {
      return koreanOrder.indexOf(a) - koreanOrder.indexOf(b)
    }
    if (aIsKorean) return 1
    if (bIsKorean) return -1
    return a.localeCompare(b)
  })
  
  for (const key of sortedKeys) {
    // 섹션 헤더
    children.push(
      new Paragraph({
        text: key,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      })
    )
    
    // 단어 목록
    for (const word of grouped[key]) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: word.word, bold: true }),
            new TextRun({ text: " : " }),
            new TextRun({ text: word.meaning }),
          ],
          spacing: { after: 100 }
        })
      )
    }
  }
  
  const doc = new Document({
    sections: [{ children }]
  })
  
  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, `${filename}.docx`)
}

// 그룹별 다운로드
export async function downloadGroupWords(
  words: Word[], 
  groups: Group[], 
  groupId: string
) {
  const group = groups.find(g => g.id === groupId)
  const groupWords = words.filter(w => w.group_id === groupId)
  
  if (!group || groupWords.length === 0) {
    alert("다운로드할 단어가 없습니다.")
    return
  }
  
  await downloadAllWords(groupWords, `나의_사전_${group.name}`)
}

// AI 기반 자동 그룹 추천 (간단한 규칙 기반)
export function suggestGroups(words: Word[]): { groupName: string; wordIds: string[] }[] {
  const suggestions: { groupName: string; wordIds: string[] }[] = []
  
  // 비즈니스/업무 관련 키워드
  const businessKeywords = ['회의', '미팅', 'meeting', '업무', '보고', '프로젝트', 'project', '일정', '마감', '계약', '매출', 'revenue', 'sales', '협업', 'collaboration', '팀', 'team']
  // IT/기술 관련 키워드
  const techKeywords = ['코드', 'code', '프로그램', 'program', 'API', '데이터', 'data', '서버', 'server', '개발', 'develop', 'GPS', '좌표', 'coordinate', '시스템', 'system']
  // 일상/생활 관련 키워드
  const dailyKeywords = ['음식', 'food', '커피', 'coffee', '점심', 'lunch', '저녁', 'dinner', '여행', 'travel', '취미', 'hobby', '운동', 'exercise', '쇼핑', 'shopping']
  // 감정/표현 관련 키워드
  const emotionKeywords = ['기쁨', 'happy', '슬픔', 'sad', '화남', 'angry', '사랑', 'love', '감사', 'thank', '축하', 'congratulation']
  
  const businessWords: string[] = []
  const techWords: string[] = []
  const dailyWords: string[] = []
  const emotionWords: string[] = []
  const uncategorized: string[] = []
  
  for (const word of words) {
    const text = `${word.word} ${word.meaning}`.toLowerCase()
    
    if (businessKeywords.some(k => text.includes(k.toLowerCase()))) {
      businessWords.push(word.id)
    } else if (techKeywords.some(k => text.includes(k.toLowerCase()))) {
      techWords.push(word.id)
    } else if (dailyKeywords.some(k => text.includes(k.toLowerCase()))) {
      dailyWords.push(word.id)
    } else if (emotionKeywords.some(k => text.includes(k.toLowerCase()))) {
      emotionWords.push(word.id)
    } else {
      uncategorized.push(word.id)
    }
  }
  
  if (businessWords.length > 0) {
    suggestions.push({ groupName: "업무/비즈니스", wordIds: businessWords })
  }
  if (techWords.length > 0) {
    suggestions.push({ groupName: "IT/기술", wordIds: techWords })
  }
  if (dailyWords.length > 0) {
    suggestions.push({ groupName: "일상/생활", wordIds: dailyWords })
  }
  if (emotionWords.length > 0) {
    suggestions.push({ groupName: "감정/표현", wordIds: emotionWords })
  }
  if (uncategorized.length > 0) {
    suggestions.push({ groupName: "기타", wordIds: uncategorized })
  }
  
  return suggestions
}
