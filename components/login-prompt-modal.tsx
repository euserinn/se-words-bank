"use client"

import { X } from "lucide-react"
import Link from "next/link"

interface LoginPromptModalProps {
  onClose: () => void
}

export function LoginPromptModal({ onClose }: LoginPromptModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-center mb-2">
          단어를 저장하려면 로그인하세요
        </h2>
        <p className="text-muted-foreground text-center mb-6">
          로그인하면 입력한 단어가 자동으로 저장됩니다
        </p>

        <div className="space-y-3">
          <Link
            href="/auth/login"
            className="block w-full py-3 bg-foreground text-background rounded-lg text-center font-medium hover:opacity-90 transition-opacity"
          >
            로그인
          </Link>
          <Link
            href="/auth/sign-up"
            className="block w-full py-3 border border-border rounded-lg text-center font-medium hover:bg-secondary transition-colors"
          >
            회원가입
          </Link>
          <button
            onClick={onClose}
            className="block w-full py-3 text-muted-foreground text-center text-sm hover:text-foreground transition-colors"
          >
            나중에 하기
          </button>
        </div>
      </div>
    </div>
  )
}
