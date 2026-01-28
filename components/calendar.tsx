"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

type ViewType = "DAY" | "WEEK" | "MONTH"

interface CalendarProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  wordsCount?: Record<string, number>
}

export function Calendar({ selectedDate, onSelectDate, wordsCount = {} }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate))
  const [view, setView] = useState<ViewType>("MONTH")

  useEffect(() => {
    setCurrentDate(new Date(selectedDate))
  }, [selectedDate])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"]
  const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const daysInPrevMonth = getDaysInMonth(year, month - 1)

  const prevMonthDays = []
  for (let i = firstDay - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i)
  }

  const currentMonthDays = []
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDays.push(i)
  }

  const totalCells = 42
  const nextMonthDays = []
  const remainingCells = totalCells - prevMonthDays.length - currentMonthDays.length
  for (let i = 1; i <= remainingCells; i++) {
    nextMonthDays.push(i)
  }

  const goToPrev = () => {
    if (view === "DAY") {
      const newDate = new Date(selectedDate)
      newDate.setDate(newDate.getDate() - 1)
      onSelectDate(newDate)
      setCurrentDate(newDate)
    } else if (view === "WEEK") {
      const newDate = new Date(selectedDate)
      newDate.setDate(newDate.getDate() - 7)
      onSelectDate(newDate)
      setCurrentDate(newDate)
    } else {
      setCurrentDate(new Date(year, month - 1, 1))
    }
  }

  const goToNext = () => {
    if (view === "DAY") {
      const newDate = new Date(selectedDate)
      newDate.setDate(newDate.getDate() + 1)
      onSelectDate(newDate)
      setCurrentDate(newDate)
    } else if (view === "WEEK") {
      const newDate = new Date(selectedDate)
      newDate.setDate(newDate.getDate() + 7)
      onSelectDate(newDate)
      setCurrentDate(newDate)
    } else {
      setCurrentDate(new Date(year, month + 1, 1))
    }
  }

  const handleDayClick = (day: number) => {
    const newDate = new Date(year, month, day)
    onSelectDate(newDate)
  }

  const isSelectedDay = (day: number) => {
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    )
  }

  const getWordCount = (day: number) => {
    const dateStr = formatDateString(year, month, day)
    return wordsCount[dateStr] || 0
  }

  // Get week days for WEEK view
  const getWeekDays = () => {
    const start = new Date(selectedDate)
    const dayOfWeek = start.getDay()
    start.setDate(start.getDate() - dayOfWeek)
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push(d)
    }
    return days
  }

  const getHeaderText = () => {
    if (view === "DAY") {
      return `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
    }
    return `${monthNames[month]} ${year}`
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">
            {getHeaderText()}
          </h2>
          <button
            onClick={goToPrev}
            className="p-1 hover:bg-secondary rounded-md transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={goToNext}
            className="p-1 hover:bg-secondary rounded-md transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-secondary rounded-full p-1">
          {(["DAY", "WEEK", "MONTH"] as ViewType[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                view === v
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* DAY View */}
      {view === "DAY" && (
        <div className="flex flex-col items-center py-8">
          <p className="text-sm text-muted-foreground mb-2">
            {fullDayNames[selectedDate.getDay()]}
          </p>
          <div className="w-24 h-24 flex items-center justify-center bg-foreground text-background rounded-full text-4xl font-bold">
            {selectedDate.getDate()}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {wordsCount[formatDateString(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())] || 0} words
          </p>
        </div>
      )}

      {/* WEEK View */}
      {view === "WEEK" && (
        <>
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map((day, index) => (
              <div
                key={index}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {getWeekDays().map((date, index) => {
              const isSelected = 
                date.getFullYear() === selectedDate.getFullYear() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getDate() === selectedDate.getDate()
              const count = wordsCount[formatDateString(date.getFullYear(), date.getMonth(), date.getDate())] || 0
              const isCurrentMonth = date.getMonth() === currentDate.getMonth()
              
              return (
                <div
                  key={index}
                  onClick={() => onSelectDate(date)}
                  className={`relative text-center py-3 text-sm font-medium cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-foreground text-background rounded-full mx-2"
                      : isCurrentMonth
                        ? "text-foreground hover:bg-secondary rounded-full mx-2"
                        : "text-muted-foreground/50 hover:bg-secondary rounded-full mx-2"
                  }`}
                >
                  {date.getDate()}
                  {count > 0 && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-foreground rounded-full" />
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* MONTH View */}
      {view === "MONTH" && (
        <>
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map((day, index) => (
              <div
                key={index}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {prevMonthDays.map((day, index) => (
              <div
                key={`prev-${index}`}
                className="text-center py-3 text-sm text-muted-foreground/50"
              >
                {day}
              </div>
            ))}
            {currentMonthDays.map((day) => {
              const count = getWordCount(day)
              return (
                <div
                  key={`current-${day}`}
                  onClick={() => handleDayClick(day)}
                  className={`relative text-center py-3 text-sm font-medium cursor-pointer transition-colors ${
                    isSelectedDay(day)
                      ? "bg-foreground text-background rounded-full mx-2"
                      : "text-foreground hover:bg-secondary rounded-full mx-2"
                  }`}
                >
                  {day}
                  {count > 0 && !isSelectedDay(day) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-foreground rounded-full" />
                  )}
                </div>
              )
            })}
            {nextMonthDays.map((day, index) => (
              <div
                key={`next-${index}`}
                className="text-center py-3 text-sm text-muted-foreground/50"
              >
                {day}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
