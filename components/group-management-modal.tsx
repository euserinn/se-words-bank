"use client"

import { useState } from "react"
import { X, Sparkles, Download, Edit2, Trash2, Check, ChevronDown, ChevronUp } from "lucide-react"
import { suggestGroups, downloadAllWords, downloadGroupWords } from "@/lib/download-words"

interface Word {
  id: string
  word: string
  meaning: string
  date: string
  group_id: string | null
  correct_count?: number
}

interface Group {
  id: string
  name: string
}

interface GroupSuggestion {
  groupName: string
  wordIds: string[]
}

interface GroupManagementModalProps {
  groups: Group[]
  words: Word[]
  onClose: () => void
  onUpdateGroups: (groups: Group[]) => void
  onMoveWords: (wordIds: string[], groupId: string) => void
  onCreateGroup: (name: string) => Promise<string | null>
  onDeleteGroup: (groupId: string) => void
  onRenameGroup: (groupId: string, name: string) => void
}

export function GroupManagementModal({
  groups,
  words,
  onClose,
  onMoveWords,
  onCreateGroup,
  onDeleteGroup,
  onRenameGroup,
}: GroupManagementModalProps) {
  const [suggestions, setSuggestions] = useState<GroupSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null)
  const [showDownloadOptions, setShowDownloadOptions] = useState(false)

  const handleAutoGroup = () => {
    const newSuggestions = suggestGroups(words)
    setSuggestions(newSuggestions)
    setShowSuggestions(true)
  }

  const handleApplySuggestion = async (suggestion: GroupSuggestion) => {
    // 해당 이름의 그룹이 이미 있는지 확인
    let targetGroup = groups.find(g => g.name === suggestion.groupName)
    
    if (!targetGroup) {
      // 새 그룹 생성
      const newGroupId = await onCreateGroup(suggestion.groupName)
      if (newGroupId) {
        onMoveWords(suggestion.wordIds, newGroupId)
      }
    } else {
      // 기존 그룹에 단어 이동
      onMoveWords(suggestion.wordIds, targetGroup.id)
    }
    
    // 적용된 추천 제거
    setSuggestions(prev => prev.filter(s => s.groupName !== suggestion.groupName))
  }

  const handleStartEditing = (group: Group) => {
    setEditingGroupId(group.id)
    setEditingName(group.name)
  }

  const handleSaveEdit = () => {
    if (editingGroupId && editingName.trim()) {
      onRenameGroup(editingGroupId, editingName.trim())
      setEditingGroupId(null)
      setEditingName("")
    }
  }

  const getWordsInGroup = (groupId: string) => {
    return words.filter(w => w.group_id === groupId)
  }

  const handleDownloadAll = () => {
    downloadAllWords(words)
    setShowDownloadOptions(false)
  }

  const handleDownloadGroup = (groupId: string) => {
    downloadGroupWords(words, groups, groupId)
    setShowDownloadOptions(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">그룹 관리</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAutoGroup}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-foreground text-background rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              자동 그룹화 추천
            </button>
            <button
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-border rounded-xl font-medium hover:bg-secondary transition-colors"
            >
              <Download className="w-4 h-4" />
              사전 다운로드
            </button>
          </div>

          {/* Download Options */}
          {showDownloadOptions && (
            <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
              <button
                onClick={handleDownloadAll}
                className="w-full text-left px-4 py-3 bg-background rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="font-medium">모든 단어 다운로드</div>
                <div className="text-sm text-muted-foreground">{words.length}개 단어</div>
              </button>
              <div className="text-sm font-medium text-muted-foreground px-2 pt-2">그룹별 다운로드</div>
              {groups.map(group => {
                const count = getWordsInGroup(group.id).length
                return (
                  <button
                    key={group.id}
                    onClick={() => handleDownloadGroup(group.id)}
                    disabled={count === 0}
                    className="w-full text-left px-4 py-2 bg-background rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="font-medium">{group.name}</span>
                    <span className="text-muted-foreground ml-2">({count}개)</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Auto Group Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">추천 그룹</span>
              </div>
              {suggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-center justify-between bg-background rounded-lg p-3">
                  <div>
                    <div className="font-medium">{suggestion.groupName}</div>
                    <div className="text-sm text-muted-foreground">{suggestion.wordIds.length}개 단어</div>
                  </div>
                  <button
                    onClick={() => handleApplySuggestion(suggestion)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    적용
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Group List */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">그룹 목록</div>
            {groups.map(group => {
              const groupWords = getWordsInGroup(group.id)
              const isExpanded = expandedGroupId === group.id
              
              return (
                <div key={group.id} className="border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-secondary/30">
                    {editingGroupId === group.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-2 py-1 bg-background border border-border rounded"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                          className="flex items-center gap-2 flex-1"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          <span className="font-medium">{group.name}</span>
                          <span className="text-sm text-muted-foreground">({groupWords.length})</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEditing(group)}
                            className="p-1.5 hover:bg-secondary rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => onDeleteGroup(group.id)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {isExpanded && (
                    <div className="p-4 space-y-2 bg-background">
                      {groupWords.length === 0 ? (
                        <div className="text-sm text-muted-foreground">단어가 없습니다</div>
                      ) : (
                        groupWords.map(word => (
                          <div key={word.id} className="flex items-center justify-between text-sm py-1">
                            <span>{word.word}</span>
                            <span className="text-muted-foreground">{word.meaning}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
