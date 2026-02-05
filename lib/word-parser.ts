// 단어 자동 인식 파서

// 언어 감지 함수
function detectLanguage(text: string): 'ko' | 'en' | 'mixed' {
  const koreanRegex = /[가-힣]/
  const englishRegex = /[a-zA-Z]/
  
  const hasKorean = koreanRegex.test(text)
  const hasEnglish = englishRegex.test(text)
  
  if (hasKorean && !hasEnglish) return 'ko'
  if (hasEnglish && !hasKorean) return 'en'
  return 'mixed'
}

// 약자 판별 함수 (대문자로만 구성되거나 짧은 단어)
function isAbbreviation(text: string): boolean {
  const trimmed = text.trim()
  // 대문자로만 구성되거나, 점이 포함된 약자 (예: GPS, U.S.A)
  return /^[A-Z\.]+$/.test(trimmed) || (trimmed.length <= 4 && /^[A-Z]+$/.test(trimmed))
}

// 텍스트 정리 함수: 불필요한 요소 제거
function cleanText(text: string): string {
  return text
    .replace(/[\[\](){}]/g, '') // 괄호 제거
    .replace(/[^\w\sㄱ-ㅎ가-힣:\-]/g, '') // 특수문자 제거 (콜론, 하이픈은 유지)
    .trim()
}

export interface ParsedWord {
  word: string
  meaning: string
}

/**
 * 단어 자동 인식 및 파싱
 * 규칙:
 * 1. 콜론(:)이 있으면 콜론 기준으로 분리
 * 2. 다른 언어 감지: 앞쪽이 영어면 단어, 뒤쪽이 한글이면 의미
 * 3. 약자 감지: 약자는 항상 단어로 판단
 */
export function parseWord(input: string): ParsedWord | null {
  const cleaned = cleanText(input)
  if (!cleaned) return null

  // 콜론으로 분리
  if (cleaned.includes(':')) {
    const parts = cleaned.split(':').map(p => p.trim())
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return {
        word: parts[0],
        meaning: parts.slice(1).join(':') // 여러 콜론이 있을 경우 뒤쪽 모두 의미로
      }
    }
  }

  // 공백으로 분리된 경우 자동 판별
  const words = cleaned.split(/\s+/)
  if (words.length >= 2) {
    const firstPart = words[0]
    const restPart = words.slice(1).join(' ')
    
    // 첫 단어가 약자인 경우
    if (isAbbreviation(firstPart)) {
      return {
        word: firstPart,
        meaning: restPart
      }
    }
    
    // 언어 감지
    const firstLang = detectLanguage(firstPart)
    const restLang = detectLanguage(restPart)
    
    // 영어 -> 한글 패턴
    if (firstLang === 'en' && restLang === 'ko') {
      return {
        word: firstPart,
        meaning: restPart
      }
    }
    
    // 한글 -> 영어 패턴 (역순)
    if (firstLang === 'ko' && restLang === 'en') {
      return {
        word: restPart,
        meaning: firstPart
      }
    }
    
    // 혼합된 경우: 첫 단어를 단어로, 나머지를 의미로
    return {
      word: firstPart,
      meaning: restPart
    }
  }

  // 단일 단어인 경우 (의미 없음)
  return {
    word: cleaned,
    meaning: ''
  }
}

/**
 * 여러 줄 텍스트 파싱
 */
export function parseMultipleWords(text: string): ParsedWord[] {
  const lines = text.split('\n').filter(line => line.trim())
  const results: ParsedWord[] = []
  
  for (const line of lines) {
    const parsed = parseWord(line)
    if (parsed && parsed.word) {
      results.push(parsed)
    }
  }
  
  return results
}
