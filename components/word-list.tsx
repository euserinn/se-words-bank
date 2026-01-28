"use client"

import { Play, Circle, CheckCircle2 } from "lucide-react"

interface Word {
  id: string
  word: string
  meaning: string
  date: string
  group_id: string | null
  correct_count?: number
}

interface WordListProps {
  words: Word[]
  selectedDate: Date
  onPracticeClick?: () => void
}

export function WordList({ words, selectedDate, onPracticeClick }: WordListProps) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const dateStr = `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}`

  if (words.length === 0) {
    return null
  }

  const masteredCount = words.filter(w => (w.correct_count || 0) >= 3).length

  return (
    <div 
      className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 mt-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onPracticeClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">
          {dateStr} - {words.length} word{words.length !== 1 ? 's' : ''} 
          {masteredCount > 0 && <span className="text-muted-foreground ml-2">({masteredCount} mastered)</span>}
        </h3>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onPracticeClick?.()
          }}
        >
          <Play className="w-4 h-4 fill-current" />
          PRACTICE
        </button>
      </div>

      {/* Word List */}
      <div className="space-y-3">
        {words.map((word) => {
          const isMastered = (word.correct_count || 0) >= 3
          const progress = word.correct_count || 0
          
          return (
            <div 
              key={word.id}
              className="flex items-center gap-3"
            >
              {isMastered ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <Circle className="w-5 h-5 text-muted-foreground" />
                  {progress > 0 && (
                    <span className="absolute text-[10px] font-bold text-foreground">{progress}</span>
                  )}
                </div>
              )}
              <span className={`text-sm ${isMastered ? 'text-green-600' : 'text-foreground'}`}>
                {word.word} : {word.meaning}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
