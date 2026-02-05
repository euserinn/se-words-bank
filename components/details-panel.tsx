"use client"

import { X, Play, Circle, CheckCircle2 } from "lucide-react"

interface Word {
  id: string
  word: string
  meaning: string
  date: string
  group_id: string | null
  correct_count?: number
}

interface DetailsPanelProps {
  words: Word[]
  selectedDate: Date
  onClose: () => void
  onStartPractice: () => void
}

const dayNames = ["일", "월", "화", "수", "목", "금", "토"]

export function DetailsPanel({ words, selectedDate, onClose, onStartPractice }: DetailsPanelProps) {
  const month = selectedDate.getMonth() + 1
  const day = selectedDate.getDate()
  const dayOfWeek = dayNames[selectedDate.getDay()]
  const dateStr = `${month}.${day}(${dayOfWeek})`

  // 외운 단어 개수 (correct_count >= 4)
  const memorizedCount = words.filter(w => (w.correct_count || 0) >= 4).length

  return (
    <div 
      className="w-80 bg-background border-l border-border h-full p-6 overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-muted-foreground font-medium tracking-wider mb-1">DETAILS</p>
          <h2 className="text-2xl font-bold text-foreground">{dateStr}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onStartPractice}
            disabled={words.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            PRACTICE
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Stats */}
      {words.length > 0 && (
        <div className="mb-4 p-3 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{memorizedCount}</span>/{words.length} 단어 외움
          </p>
        </div>
      )}

      {/* Word List */}
      {words.length > 0 ? (
        <div className="space-y-2">
          {words.map((word) => {
            const isMemorized = (word.correct_count || 0) >= 4
            return (
              <div 
                key={word.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
              >
                {isMemorized ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${isMemorized ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {word.word} : {word.meaning}
                  </span>
                  {!isMemorized && (word.correct_count || 0) > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      정답 {word.correct_count}/4
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          이 날짜에 저장된 단어가 없습니다.
        </p>
      )}
    </div>
  )
}
