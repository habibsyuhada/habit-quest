'use client'

import { useState, useMemo } from 'react'
import { ContributionWeek, ContributionDay } from '@/types/habit'
import { getContributionColor, formatContributionDate, getMonthLabels, getWeekdayLabels } from '@/lib/contribution-calendar'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HabitContributionHeatmapProps {
  contributions: ContributionWeek[]
  showLegend?: boolean
  onDayClick?: (day: ContributionDay) => void
  className?: string
}

export function HabitContributionHeatmap({
  contributions,
  showLegend = true,
  onDayClick,
  className = '',
}: HabitContributionHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)

  const monthLabels = useMemo(() => getMonthLabels(contributions), [contributions])
  const weekdayLabels = useMemo(() => getWeekdayLabels(), [])

  const handleDayMouseEnter = (day: ContributionDay, event: React.MouseEvent) => {
    setHoveredDay(day)
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY,
    })
  }

  const handleDayMouseLeave = () => {
    setHoveredDay(null)
    setTooltipPosition(null)
  }

  const handleDayClick = (day: ContributionDay) => {
    if (onDayClick) {
      onDayClick(day)
    }
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Month labels */}
      <div className="mb-2 flex pl-8">
        {monthLabels.map((label, index) => (
          <div
            key={index}
            className="flex-1 text-xs text-gray-500"
            style={{
              visibility: label ? 'visible' : 'hidden',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {/* Weekday labels */}
        <div className="flex flex-col gap-1 pr-2 text-xs text-gray-500">
          {weekdayLabels.map((label, index) => (
            <div
              key={index}
              className="flex h-3 w-6 items-center justify-center"
              style={{ height: '13px' }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {contributions.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.days.map((day, dayIndex) => (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (weekIndex * 7 + dayIndex) * 0.002 }}
                className={cn(
                  'h-3 w-3 rounded-sm transition-all cursor-pointer hover:ring-2 hover:ring-blue-400',
                  getContributionColor(day.level),
                  day.count === 0 && 'hover:bg-gray-200'
                )}
                style={{ height: '13px', width: '13px' }}
                onMouseEnter={(e) => handleDayMouseEnter(day, e)}
                onMouseLeave={handleDayMouseLeave}
                onClick={() => handleDayClick(day)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-3 flex items-center justify-end gap-2 text-xs text-gray-600">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn('h-3 w-3 rounded-sm', getContributionColor(level))}
                style={{ height: '13px', width: '13px' }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      )}

      {/* Tooltip */}
      {hoveredDay && tooltipPosition && (
        <div
          className="fixed z-50 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-xl pointer-events-none"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="font-semibold">
            {formatContributionDate(hoveredDay.date)}
          </div>
          <div className="mt-1">
            {hoveredDay.count} {hoveredDay.count === 1 ? 'completion' : 'completions'}
          </div>
          {hoveredDay.expEarned > 0 && (
            <div className="mt-1 text-green-400">
              {hoveredDay.expEarned} XP earned
            </div>
          )}
          {hoveredDay.logs.length > 0 && hoveredDay.logs.some(log => log.option) && (
            <div className="mt-1 text-gray-400">
              Options completed: {hoveredDay.logs.filter(l => l.option).map(l => l.option?.label).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface HabitHeatmapStatsProps {
  stats: {
    totalDays: number
    activeDays: number
    totalCompletions: number
    totalExp: number
    currentStreak: number
    longestStreak: number
  }
  className?: string
}

export function HabitHeatmapStats({ stats, className = '' }: HabitHeatmapStatsProps) {
  const completionRate = stats.totalDays > 0
    ? Math.round((stats.activeDays / stats.totalDays) * 100)
    : 0

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-4', className)}>
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="text-2xl font-bold text-gray-900">{stats.activeDays}</div>
        <div className="text-sm text-gray-600">Active Days</div>
        <div className="mt-1 text-xs text-gray-500">{completionRate}% completion rate</div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="text-2xl font-bold text-gray-900">{stats.totalCompletions}</div>
        <div className="text-sm text-gray-600">Total Completions</div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="text-2xl font-bold text-green-600">{stats.totalExp}</div>
        <div className="text-sm text-gray-600">Total XP Earned</div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
        <div className="text-sm text-gray-600">Current Streak</div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="text-2xl font-bold text-purple-600">{stats.longestStreak}</div>
        <div className="text-sm text-gray-600">Longest Streak</div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="text-2xl font-bold text-blue-600">
          {stats.totalDays > 0 ? (stats.activeDays / stats.totalDays).toFixed(1) : '0.0'}
        </div>
        <div className="text-sm text-gray-600">Avg. Completions/Day</div>
      </div>
    </div>
  )
}
