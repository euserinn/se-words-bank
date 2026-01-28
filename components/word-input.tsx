"use client"

import React from "react"
import { Plus, Send } from "lucide-react"
import { useState } from "react"

interface WordInputProps {
  onAddWord: (word: string, meaning: string) => void
}

export function WordInput({ onAddWord }: WordInputProps) {
  const [value, setValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!value.trim() || isSubmitting) return

    // 콜론으로 단어와 뜻 분리
    const parts = value.split(":").map(p => p.trim())
    const word = parts[0]
    const meaning = parts[1] || ""

    if (!word) return

    setIsSubmitting(true)
    await onAddWord(word, meaning)
    setValue("")
    setIsSubmitting(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <div className="mt-16 text-center">
      <h3 className="text-xl font-semibold text-foreground mb-6">
        Expand your vocabulary
      </h3>
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 bg-card rounded-full px-4 py-3 shadow-sm border border-border/50">
          <Plus className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="apple : 사과..."
            disabled={isSubmitting}
            className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !value.trim()}
            className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
