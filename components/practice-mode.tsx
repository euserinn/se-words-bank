"use client"

import React from "react"

import { useState, useEffect } from "react"
import { X, Lightbulb, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react"

interface Word {
  id: string
  word: string
  meaning: string
  date: string
  group_id: string | null
  correct_count?: number
}

interface PracticeModeProps {
  words: Word[]
  selectedDate: Date
  onClose: () => void
  onUpdateCorrectCount: (wordId: string, count: number) => void
}

const dayNames = ["일", "월", "화", "수", "목", "금", "토"]

// 힌트 생성 함수: 각 단어의 첫 글자만 표시
function generateHint(text: string): string {
  return text.split(" ").map(word => {
    if (word.length === 0) return ""
    const firstChar = word[0]
    return firstChar + ".."
  }).join(" ")
}

export function PracticeMode({ words, selectedDate, onClose, onUpdateCorrectCount }: PracticeModeProps) {
  // 아직 외우지 않은 단어들만 (correct_count < 3)
  const [practiceWords, setPracticeWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showMeaning, setShowMeaning] = useState(false) // true: 뜻을 보여주고 단어 입력, false: 단어를 보여주고 뜻 입력
  const [userInput, setUserInput] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [correctCounts, setCorrectCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    // 외우지 않은 단어들만 필터링하고 랜덤 섞기
    const unmemorized = words.filter(w => (w.correct_count || 0) < 3)
    const shuffled = [...unmemorized].sort(() => Math.random() - 0.5)
    setPracticeWords(shuffled)
    
    // 정답 횟수 초기화
    const counts: Record<string, number> = {}
    words.forEach(w => {
      counts[w.id] = w.correct_count || 0
    })
    setCorrectCounts(counts)
    
    // 랜덤하게 뜻/단어 결정
    setShowMeaning(Math.random() > 0.5)
  }, [words])

  const currentWord = practiceWords[currentIndex]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentWord || feedback) return

    const answer = showMeaning ? currentWord.word : currentWord.meaning
    const isCorrect = userInput.trim().toLowerCase() === answer.trim().toLowerCase()

    let newCount = 0; // Declare newCount variable

    if (isCorrect) {
      setFeedback("correct")
      newCount = (correctCounts[currentWord.id] || 0) + 1
      setCorrectCounts(prev => ({ ...prev, [currentWord.id]: newCount }))
      onUpdateCorrectCount(currentWord.id, newCount)
    } else {
      setFeedback("wrong")
      // 틀리면 횟수 리셋
      newCount = 0; // Set newCount to 0 for incorrect answer
      setCorrectCounts(prev => ({ ...prev, [currentWord.id]: newCount }))
      onUpdateCorrectCount(currentWord.id, newCount)
    }

    setTimeout(() => {
      setFeedback(null)
      setUserInput("")
      setShowHint(false)
      
      // 다음 문제로
      if (currentIndex < practiceWords.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setShowMeaning(Math.random() > 0.5)
      } else {
        // 모든 단어 완료 - 아직 외우지 않은 단어가 있는지 확인
        const stillUnmemorized = practiceWords.filter(w => 
          (correctCounts[w.id] || 0) < 3 && w.id !== currentWord.id
        )
        if (isCorrect && newCount >= 3) {
          // 현재 단어도 외움 처리됨
        }
        
        if (stillUnmemorized.length > 0 || (!isCorrect || (correctCounts[currentWord.id] || 0) + (isCorrect ? 1 : 0) < 3)) {
          // 아직 외우지 않은 단어가 있으면 다시 섞어서 시작
          const remaining = practiceWords.filter(w => {
            const count = w.id === currentWord.id 
              ? (isCorrect ? (correctCounts[w.id] || 0) + 1 : 0)
              : (correctCounts[w.id] || 0)
            return count < 3
          })
          if (remaining.length > 0) {
            const shuffled = [...remaining].sort(() => Math.random() - 0.5)
            setPracticeWords(shuffled)
            setCurrentIndex(0)
            setShowMeaning(Math.random() > 0.5)
          } else {
            setIsComplete(true)
          }
        } else {
          setIsComplete(true)
        }
      }
    }, 1500)
  }

  const handleRestart = () => {
    const unmemorized = words.filter(w => (correctCounts[w.id] || 0) < 3)
    const shuffled = [...unmemorized].sort(() => Math.random() - 0.5)
    setPracticeWords(shuffled)
    setCurrentIndex(0)
    setShowMeaning(Math.random() > 0.5)
    setIsComplete(false)
    setUserInput("")
    setShowHint(false)
  }

  const month = selectedDate.getMonth() + 1
  const day = selectedDate.getDate()
  const dayOfWeek = dayNames[selectedDate.getDay()]
  const dateStr = `${month}.${day}(${dayOfWeek})`

  const question = currentWord ? (showMeaning ? currentWord.meaning : currentWord.word) : ""
  const hint = currentWord ? (showMeaning ? generateHint(currentWord.word) : generateHint(currentWord.meaning)) : ""
  const currentCorrectCount = currentWord ? (correctCounts[currentWord.id] || 0) : 0

  // 전체 진행률
  const totalMemorized = Object.values(correctCounts).filter(c => c >= 3).length
  const totalWords = words.length

  if (practiceWords.length === 0 || isComplete) {
    return (
      <div 
        className="w-96 bg-background border-l border-border h-full p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-muted-foreground font-medium tracking-wider mb-1">PRACTICE</p>
            <h2 className="text-2xl font-bold text-foreground">{dateStr}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">축하합니다!</h3>
          <p className="text-muted-foreground text-center mb-6">
            모든 단어를 외웠습니다!<br />
            {totalMemorized}/{totalWords} 단어 완료
          </p>
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-4 h-4" />
            다시 연습하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="w-96 bg-background border-l border-border h-full p-6 overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-muted-foreground font-medium tracking-wider mb-1">PRACTICE</p>
          <h2 className="text-2xl font-bold text-foreground">{dateStr}</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">진행률</span>
          <span className="text-foreground font-medium">{totalMemorized}/{totalWords} 단어 외움</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-foreground transition-all duration-300"
            style={{ width: `${(totalMemorized / totalWords) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Word Progress */}
      <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">현재 단어 정답 횟수</span>
          <span className="text-sm font-medium">{currentCorrectCount}/3</span>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div 
              key={i}
              className={`flex-1 h-2 rounded-full transition-colors ${
                i < currentCorrectCount ? "bg-green-500" : "bg-secondary"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <p className="text-xs text-muted-foreground mb-2">
          {showMeaning ? "뜻을 보고 단어를 입력하세요" : "단어를 보고 뜻을 입력하세요"}
        </p>
        <div className="p-6 bg-secondary/30 rounded-xl text-center">
          <p className="text-xl font-bold text-foreground">{question}</p>
        </div>
      </div>

      {/* Hint */}
      {showHint && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Lightbulb className="w-4 h-4" />
            <span className="text-sm font-medium">힌트: {hint}</span>
          </div>
        </div>
      )}

      {/* Answer Input */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className={`relative rounded-xl border-2 transition-colors ${
          feedback === "correct" ? "border-green-500 bg-green-50 dark:bg-green-900/20" :
          feedback === "wrong" ? "border-red-500 bg-red-50 dark:bg-red-900/20" :
          "border-border"
        }`}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="정답을 입력하세요..."
            disabled={!!feedback}
            className="w-full px-4 py-3 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            type="submit"
            disabled={!userInput.trim() || !!feedback}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-foreground text-background rounded-full disabled:opacity-50 transition-opacity"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Feedback */}
      {feedback && (
        <div className={`text-center p-3 rounded-lg mb-4 ${
          feedback === "correct" 
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
        }`}>
          {feedback === "correct" ? (
            <p className="font-medium">정답입니다!</p>
          ) : (
            <p className="font-medium">
              오답입니다. 정답: {showMeaning ? currentWord.word : currentWord.meaning}
            </p>
          )}
        </div>
      )}

      {/* Hint Button */}
      {!showHint && !feedback && (
        <button
          onClick={() => setShowHint(true)}
          className="w-full flex items-center justify-center gap-2 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Lightbulb className="w-4 h-4" />
          <span className="text-sm">힌트 보기</span>
        </button>
      )}
    </div>
  )
}
