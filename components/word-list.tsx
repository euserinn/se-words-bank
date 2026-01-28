"use client"

import { Play, Circle, CheckCircle2 } from "lucide-react"
import { useState } from "react"

interface Word {
  id: string
  word: string
  meaning: string
  date: string
  group_id: string | null
}

interface WordListProps {
  words: Word[]
  selectedDate: Date
}

export function WordList({ words, selectedDate }: WordListProps) {
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

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const dateStr = `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}`

  if (words.length === 0) {
    return null
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">
          {dateStr} - {words.length} word{words.length !== 1 ? 's' : ''}
        </h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
          <Play className="w-4 h-4 fill-current" />
          PRACTICE
        </button>
      </div>

      {/* Word List */}
      <div className="space-y-3">
        {words.map((word) => (
          <div 
            key={word.id}
            onClick={() => toggleWord(word.id)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {checkedWords.has(word.id) ? (
              <CheckCircle2 className="w-5 h-5 text-foreground" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
            <span className={`text-sm ${checkedWords.has(word.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {word.word} : {word.meaning}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
