"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Calendar } from "@/components/calendar"
import { WordInput } from "@/components/word-input"
import { WordList } from "@/components/word-list"
import { DetailsPanel } from "@/components/details-panel"
import { PracticeMode } from "@/components/practice-mode"
import { GroupManagementModal } from "@/components/group-management-modal"

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

export default function Home() {
  const [groups, setGroups] = useState<Group[]>(DEMO_GROUPS)
  const [words, setWords] = useState<Word[]>([])
  const [isDark, setIsDark] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [showDetailsPanel, setShowDetailsPanel] = useState(false)
  const [showPracticeMode, setShowPracticeMode] = useState(false)
  const [showGroupManagement, setShowGroupManagement] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const savedWords = localStorage.getItem("words")
    const savedGroups = localStorage.getItem("groups")
    if (savedWords) {
      setWords(JSON.parse(savedWords))
    }
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups))
    }
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem("words", JSON.stringify(words))
  }, [words])

  useEffect(() => {
    localStorage.setItem("groups", JSON.stringify(groups))
  }, [groups])

  const handleAddGroup = () => {
    const name = prompt("새 그룹 이름을 입력하세요:")
    if (name?.trim()) {
      const newGroup = { id: `group-${Date.now()}`, name: name.trim() }
      setGroups(prev => [...prev, newGroup])
    }
  }

  const handleAddWord = (word: string, meaning: string) => {
    const dateStr = selectedDate.toISOString().split("T")[0]
    const newWord: Word = {
      id: `word-${Date.now()}`,
      word,
      meaning: meaning || "뜻 없음",
      date: dateStr,
      group_id: selectedGroupId,
      correct_count: 0
    }
    setWords(prev => [...prev, newWord])
  }

  const handleUpdateCorrectCount = (wordId: string, count: number) => {
    setWords(prev => prev.map(w => 
      w.id === wordId ? { ...w, correct_count: count } : w
    ))
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

  const handleCreateGroup = (name: string): Promise<string | null> => {
    const newId = `group-${Date.now()}`
    setGroups(prev => [...prev, { id: newId, name }])
    return Promise.resolve(newId)
  }

  const handleDeleteGroup = (groupId: string) => {
    if (confirm("이 그룹을 삭제하시겠습니까? 그룹 내 단어는 삭제되지 않습니다.")) {
      setGroups(prev => prev.filter(g => g.id !== groupId))
    }
  }

  const handleRenameGroup = (groupId: string, name: string) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, name } : g))
  }

  const handleMoveWords = (wordIds: string[], groupId: string) => {
    setWords(prev => prev.map(w => 
      wordIds.includes(w.id) ? { ...w, group_id: groupId } : w
    ))
  }

  const filteredWords = words.filter(w => {
    const matchesSearch = searchQuery === "" || 
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.meaning.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGroup = selectedGroupId === null || w.group_id === selectedGroupId
    return matchesSearch && matchesGroup
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

  return (
    <div className="flex min-h-screen bg-background" onClick={handleBackgroundClick}>
      <Sidebar 
        groups={groups} 
        recentEntries={recentEntries}
        user={DEMO_USER}
        isDemo={true}
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
        onOpenGroupManagement={() => setShowGroupManagement(true)}
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

      {/* Group Management Modal */}
      {showGroupManagement && (
        <GroupManagementModal
          groups={groups}
          words={words}
          onClose={() => setShowGroupManagement(false)}
          onUpdateGroups={setGroups}
          onMoveWords={handleMoveWords}
          onCreateGroup={handleCreateGroup}
          onDeleteGroup={handleDeleteGroup}
          onRenameGroup={handleRenameGroup}
        />
      )}
    </div>
  )
}
