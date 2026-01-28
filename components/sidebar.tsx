"use client"

import { Search, Plus, Hash, Settings, LogOut, User, Clock } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Group {
  id: string
  name: string
}

interface RecentEntry {
  date: string
  label: string
}

interface DisplayUser {
  email: string
  name: string
}

interface SidebarProps {
  groups: Group[]
  recentEntries: RecentEntry[]
  user: DisplayUser | null
  isDemo: boolean
  onAddGroup: () => void
  onSelectGroup: (groupId: string | null) => void
  selectedGroupId: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
  onSelectDate: (date: string) => void
}

export function Sidebar({ 
  groups, 
  recentEntries, 
  user, 
  isDemo,
  onAddGroup, 
  onSelectGroup, 
  selectedGroupId,
  searchQuery,
  onSearchChange,
  onSelectDate
}: SidebarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <aside className="w-60 h-screen border-r border-border flex flex-col bg-background">
      {/* Header Icons */}
      <div className="flex items-center justify-between p-4">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          <path d="M8 7h6" />
          <path d="M8 11h8" />
        </svg>
      </div>

      {/* Search */}
      <div className="px-3 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search anything here..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-secondary rounded-lg border-0 outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Groups */}
      <div className="px-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground tracking-wide">GROUPS</span>
          <button
            onClick={onAddGroup}
            className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => onSelectGroup(group.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${
                selectedGroupId === group.id 
                  ? "bg-secondary text-foreground" 
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              <Hash className="w-4 h-4 text-muted-foreground" />
              {group.name}
            </button>
          ))}
        </div>

        {/* Recent Entries */}
        <div className="mt-6">
          <span className="text-xs font-medium text-muted-foreground">최근 입력</span>
          <div className="mt-2 space-y-1">
            {recentEntries.map((entry) => (
              <button
                key={entry.date}
                onClick={() => onSelectDate(entry.date)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
              >
                <Clock className="w-4 h-4" />
                {entry.label}
              </button>
            ))}
            {recentEntries.length === 0 && (
              <div className="text-xs text-muted-foreground px-2 py-1">
                아직 입력된 단어가 없습니다
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        {user ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="truncate font-medium">{user.name}</span>
              {isDemo && (
                <span className="text-xs text-muted-foreground">(데모)</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground px-2 truncate">
              {user.email}
            </div>
            {!isDemo && (
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            )}
            {isDemo && (
              <Link 
                href="/auth/login"
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings className="w-4 h-4" />
                로그인
              </Link>
            )}
          </div>
        ) : (
          <Link 
            href="/auth/sign-up"
            className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
            회원가입
          </Link>
        )}
      </div>
    </aside>
  )
}
