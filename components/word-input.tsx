"use client"

import React from "react"
import { Plus, Send } from "lucide-react"
import { useState, useEffect } from "react"
import { InputGuideModal } from "./input-guide-modal"
import { parseMultipleWords } from "@/lib/word-parser"

interface WordInputProps {
  onAddWord: (word: string, meaning: string) => void
}

export function WordInput({ onAddWord }: WordInputProps) {
  const [value, setValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // 처음 방문 시 자동으로 팝업 표시
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem("hasSeenInputGuide")
    if (!hasSeenGuide) {
      setShowModal(true)
      localStorage.setItem("hasSeenInputGuide", "true")
    }
  }, [])

  const handleModalSubmit = async (text: string) => {
    setIsSubmitting(true)
    
    // 스마트 파서로 자동 인식
    const parsedWords = parseMultipleWords(text)
    
    for (const parsed of parsedWords) {
      if (parsed.word) {
        await onAddWord(parsed.word, parsed.meaning)
      }
    }
    
    setIsSubmitting(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle key down logic here
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const parsedWords = parseMultipleWords(value)
    for (const parsed of parsedWords) {
      if (parsed.word) {
        await onAddWord(parsed.word, parsed.meaning)
      }
    }
    setIsSubmitting(false)
  }

  return (
    <>
      {showModal && (
        <InputGuideModal
          onClose={() => setShowModal(false)}
          onSubmit={handleModalSubmit}
          onMouseLeave={() => setShowModal(false)}
        />
      )}
      <div className="mt-16 text-center">
        <h3 className="text-xl font-semibold text-foreground mb-6">
          Expand your vocabulary
        </h3>
        <div className="max-w-lg mx-auto">
          <div 
            className="flex items-center gap-3 bg-card rounded-full px-4 py-3 shadow-sm border border-border/50 hover:border-foreground/30 transition-colors"
            onMouseEnter={() => setShowModal(true)}
          >
            <Plus className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="apple : 사과..."
              disabled={isSubmitting}
              className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed"
              readOnly
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
    </>
  )
}
