"use client"

import { X, Play, Circle, CheckCircle2 } from "lucide-react"
import { useState } from "react"

interface Word {
  id: string
  word: string
  meaning: string
  date: string
  group_id: string | null
}

interface DetailsPanelProps {
  words: Word[]
  selectedDate: Date
  onClose: () => void
}

const dayNames = ["일", "월", "화", "수", "목", "금", "토"]

export function DetailsPanel({ words, selectedDate, onClose }: DetailsPanelProps) {
  const [checkedWords, setCheckedWords] = useState<Set<string>>(new Set())

  const toggleWord = (id: string) => {
    setCheckedWords(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const month = selectedDate.getMonth() + 1
  const day = selectedDate.getDate()
  const dayOfWeek = dayNames[selectedDate.getDay()]
  const dateStr = `${month}.${day}(${dayOfWeek})`

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
          <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
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

      {/* Word List */}
      {words.length > 0 ? (
        <div className="space-y-3">
          {words.map((word) => (
            <div 
              key={word.id}
              onClick={() => toggleWord(word.id)}
              className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              {checkedWords.has(word.id) ? (
                <CheckCircle2 className="w-5 h-5 text-foreground flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              )}
              <span className={`text-sm ${checkedWords.has(word.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {word.word} : {word.meaning}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          이 날짜에 저장된 단어가 없습니다.
        </p>
      )}
    </div>
  )
}
