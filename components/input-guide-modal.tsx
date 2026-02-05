"use client"

import React, { useEffect, useState } from "react"
import { X } from "lucide-react"

interface InputGuideModalProps {
  onClose: () => void
  onSubmit: (text: string) => void
  initialValue?: string
  onMouseLeave?: () => void
}

export function InputGuideModal({ onClose, onSubmit, initialValue = "", onMouseLeave }: InputGuideModalProps) {
  const [value, setValue] = useState(initialValue)
  const [typingDemo, setTypingDemo] = useState("")
  const [showCursor, setShowCursor] = useState(true)

  const demoText = "apple : 사과"
  
  // 타이핑 애니메이션 효과
  useEffect(() => {
    if (value) return // 사용자가 입력하면 데모 중지
    
    let index = 0
    const typingInterval = setInterval(() => {
      if (index <= demoText.length) {
        setTypingDemo(demoText.slice(0, index))
        index++
      } else {
        // 타이핑 완료 후 지우고 다시 시작
        setTimeout(() => {
          setTypingDemo("")
          index = 0
        }, 2000)
      }
    }, 150)

    return () => clearInterval(typingInterval)
  }, [value])

  // 커서 깜빡임
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)
    return () => clearInterval(cursorInterval)
  }, [])

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value)
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
        onMouseLeave={() => {
          if (onMouseLeave) onMouseLeave()
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">외우고 싶은 단어를 입력하세요</h2>
          <p className="text-sm text-muted-foreground">
            단어와 뜻을 콜론(:)으로 구분해서 입력하거나, 여러 단어를 복사 붙여넣기 하세요.
          </p>
        </div>

        {/* 타이핑 데모 영역 */}
        {!value && (
          <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="text-sm text-muted-foreground mb-2">예시:</div>
            <div className="font-mono text-base">
              {typingDemo}
              {showCursor && <span className="inline-block w-0.5 h-5 bg-foreground ml-0.5 align-middle" />}
            </div>
          </div>
        )}

        {/* 입력 영역 */}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="apple : 사과&#10;banana : 바나나&#10;orange : 오렌지"
          className="w-full h-48 p-4 bg-card border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 text-base"
          autoFocus
        />

        <div className="mt-4 text-xs text-muted-foreground">
          팁: 여러 단어를 한 번에 입력하려면 각 줄에 하나씩 입력하세요.
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full border border-border hover:bg-muted transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="px-6 py-2 bg-foreground text-background rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            추가하기
          </button>
        </div>
      </div>
    </div>
  )
}
