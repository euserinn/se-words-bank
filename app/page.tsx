"use client"

import { useState, useEffect, useCallback } from "react"
import { Moon, Sun } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Calendar } from "@/components/calendar"
import { WordInput } from "@/components/word-input"
import { WordList } from "@/components/word-list"
import { DetailsPanel } from "@/components/details-panel"
import { PracticeMode } from "@/components/practice-mode"
import { LoginPromptModal } from "@/components/login-prompt-modal"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface Group {
  id: string
  name: string
}

interface Word {
  id: string
  word: string
  meaning: string
  date: string
  group_id: string | null
  correct_count?: number
}

// 데모 데이터
const DEMO_USER = {
  email: "serene@blumn.ai",
  name: "너굴너굴"
}

const DEMO_GROUPS: Group[] = [
  { id: "demo-1", name: "업무용어" },
  { id: "demo-2", name: "생활용어" },
]

const today = new Date().toISOString().split("T")[0]
const DEMO_WORDS: Word[] = [
  { id: "demo-w1", word: "GPS 좌표", meaning: "GPS coordinates", date: today, group_id: "demo-1", correct_count: 0 },
]

export default function Home() {
  const [groups, setGroups] = useState<Group[]>(DEMO_GROUPS)
  const [words, setWords] = useState<Word[]>(DEMO_WORDS)
  const [user, setUser] = useState<User | null>(null)
  const [isDark, setIsDark] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [showDetailsPanel, setShowDetailsPanel] = useState(false)
  const [showPracticeMode, setShowPracticeMode] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [isDemo, setIsDemo] = useState(true)
  const [localWords, setLocalWords] = useState<Word[]>([])

  const fetchGroups = useCallback(async () => {
    if (!user) return
    const res = await fetch("/api/groups")
    if (res.ok) {
      const data = await res.json()
      setGroups(data)
    }
  }, [user])

  const fetchWords = useCallback(async () => {
    if (!user) return
    const params = new URLSearchParams()
    if (selectedGroupId) {
      params.set("groupId", selectedGroupId)
    }
    const res = await fetch(`/api/words?${params.toString()}`)
    if (res.ok) {
      const data = await res.json()
      setWords(data)
    }
  }, [user, selectedGroupId])

  useEffect(() => {
    const supabase = createClient()
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        setIsDemo(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setIsDemo(false)
      } else {
        setIsDemo(true)
        setGroups(DEMO_GROUPS)
        setWords([...DEMO_WORDS, ...localWords])
      }
    })

    return () => subscription.unsubscribe()
  }, [localWords])

  useEffect(() => {
    if (user && !isDemo) {
      fetchGroups()
      fetchWords()
    }
  }, [user, isDemo, fetchGroups, fetchWords])

  // 데모 모드일 때 로컬 단어 추가
  useEffect(() => {
    if (isDemo) {
      setWords([...DEMO_WORDS, ...localWords])
    }
  }, [localWords, isDemo])

  const handleAddGroup = async () => {
    if (!user && !isDemo) {
      setShowLoginPrompt(true)
      return
    }
    
    const name = prompt("새 그룹 이름을 입력하세요:")
    if (name?.trim()) {
      if (user) {
        const res = await fetch("/api/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() }),
        })
        if (res.ok) {
          fetchGroups()
        }
      } else {
        // 데모 모드에서 로컬로 그룹 추가
        setGroups(prev => [...prev, { id: `local-${Date.now()}`, name: name.trim() }])
      }
    }
  }

  const handleAddWord = async (word: string, meaning: string) => {
    const dateStr = selectedDate.toISOString().split("T")[0]
    
    if (user) {
      // 로그인된 경우 DB에 저장
      const res = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          word, 
          meaning: meaning || "뜻 없음",
          groupId: selectedGroupId,
          date: dateStr
        }),
      })
      if (res.ok) {
        fetchWords()
      }
    } else {
      // 비로그인 시 로컬에 임시 저장하고 로그인 프롬프트 표시
      const newWord: Word = {
        id: `local-${Date.now()}`,
        word,
        meaning: meaning || "뜻 없음",
        date: dateStr,
        group_id: selectedGroupId,
        correct_count: 0
      }
      setLocalWords(prev => [...prev, newWord])
      setShowLoginPrompt(true)
    }
  }

  const handleUpdateCorrectCount = async (wordId: string, count: number) => {
    if (user) {
      // 로그인된 경우 DB 업데이트
      await fetch("/api/words", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId, correctCount: count }),
      })
      // 로컬 상태도 업데이트
      setWords(prev => prev.map(w => 
        w.id === wordId ? { ...w, correct_count: count } : w
      ))
    } else {
      // 데모/비로그인 모드에서는 로컬 상태만 업데이트
      setWords(prev => prev.map(w => 
        w.id === wordId ? { ...w, correct_count: count } : w
      ))
      setLocalWords(prev => prev.map(w => 
        w.id === wordId ? { ...w, correct_count: count } : w
      ))
    }
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setShowDetailsPanel(true)
    setShowPracticeMode(false)
  }

  const handleWordListClick = () => {
    setShowDetailsPanel(true)
    setShowPracticeMode(false)
  }

  const handleStartPractice = () => {
    setShowDetailsPanel(false)
    setShowPracticeMode(true)
  }

  const handleClosePanel = () => {
    setShowDetailsPanel(false)
    setShowPracticeMode(false)
  }

  const handleBackgroundClick = () => {
    if (showDetailsPanel || showPracticeMode) {
      handleClosePanel()
    }
  }

  const filteredWords = words.filter(w => {
    const matchesSearch = searchQuery === "" || 
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.meaning.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const wordsForSelectedDate = filteredWords.filter(w => 
    w.date === selectedDate.toISOString().split("T")[0]
  )

  const wordsCountByDate = filteredWords.reduce((acc, w) => {
    acc[w.date] = (acc[w.date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // 최근 입력 날짜 계산
  const recentDates = [...new Set(words.map(w => w.date))].sort().reverse().slice(0, 5)
  const recentEntries = recentDates.map(date => {
    const d = new Date(date)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const dayNames = ['일', '월', '화', '수', '목', '금', '토']
    const dayName = dayNames[d.getDay()]
    return { date, label: `${month}.${day}(${dayName})` }
  })

  // 사용자 표시용 정보
  const displayUser = user ? {
    email: user.email || "",
    name: user.user_metadata?.name || user.email?.split("@")[0] || ""
  } : (isDemo ? DEMO_USER : null)

  return (
    <div className="flex min-h-screen bg-background" onClick={handleBackgroundClick}>
      <Sidebar 
        groups={groups} 
        recentEntries={recentEntries}
        user={displayUser}
        isDemo={isDemo}
        onAddGroup={handleAddGroup}
        onSelectGroup={setSelectedGroupId}
        selectedGroupId={selectedGroupId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectDate={(date) => {
          setSelectedDate(new Date(date))
          setShowDetailsPanel(true)
          setShowPracticeMode(false)
        }}
      />

      <main className="flex-1 p-8 bg-secondary/30" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              오늘의 단어장
            </h1>
            <p className="text-muted-foreground">
              Focus on your learning, day by day.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>

        {/* Calendar */}
        <div className="max-w-4xl" onClick={(e) => e.stopPropagation()}>
          <Calendar 
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect}
            wordsCount={wordsCountByDate}
          />
        </div>

        {/* Words for selected date - clickable to open panel */}
        <div 
          className="max-w-4xl cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation()
            handleWordListClick()
          }}
        >
          <WordList 
            words={wordsForSelectedDate}
            selectedDate={selectedDate}
          />
        </div>

        {/* Word Input */}
        <div className="max-w-4xl mt-12" onClick={(e) => e.stopPropagation()}>
          <WordInput onAddWord={handleAddWord} />
        </div>
      </main>

      {/* Details Panel */}
      {showDetailsPanel && (
        <DetailsPanel
          words={wordsForSelectedDate}
          selectedDate={selectedDate}
          onClose={handleClosePanel}
          onStartPractice={handleStartPractice}
        />
      )}

      {/* Practice Mode */}
      {showPracticeMode && (
        <PracticeMode
          words={wordsForSelectedDate}
          selectedDate={selectedDate}
          onClose={handleClosePanel}
          onUpdateCorrectCount={handleUpdateCorrectCount}
        />
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />
      )}
    </div>
  )
}
