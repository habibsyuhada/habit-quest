'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Check, X, Plus, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TASK_COLORS, DIFFICULTY_COLORS } from '@/lib/constants';
import type { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onComplete?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onHabitAction?: (direction: 'positive' | 'negative') => void;
}

export function TaskCard({ task, onComplete, onDelete, onEdit, onHabitAction }: TaskCardProps) {
  const typeColor = TASK_COLORS[task.type];
  const difficultyColor = DIFFICULTY_COLORS[task.difficulty];

  // Determine which habit buttons to show based on habitType
  const habitType = task.habitType || 'both';
  const showPositiveButton = habitType === 'positive' || habitType === 'both';
  const showNegativeButton = habitType === 'negative' || habitType === 'both';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'border-gray-200-custom bg-theme-primary/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-l-4',
          task.type === 'todo' && task.completed && 'opacity-60',
          task.type === 'habit' && 'border-l-purple-500',
          task.type === 'daily' && 'border-l-sky-500',
          task.type === 'todo' && 'border-l-emerald-500'
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className={cn('text-white text-xs px-2.5 py-0.5 font-semibold', typeColor)}>
                  {task.type}
                </Badge>
                {task.type === 'habit' && task.habitType && task.habitType !== 'both' && (
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-medium border-gray-300-custom">
                    {task.habitType === 'positive' ? '+' : task.habitType === 'negative' ? '-' : '±'}
                  </Badge>
                )}
                <Badge variant="outline" className={cn('text-xs px-2.5 py-0.5 font-medium border-gray-300-custom', difficultyColor)}>
                  {task.difficulty === 'very_easy' ? 'Very Easy' : task.difficulty === 'very_hard' ? 'Very Hard' : task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                </Badge>
                {task.type === 'daily' && task.streak !== undefined && task.streak > 0 && (
                  <Badge variant="secondary" className="bg-orange-100-custom text-orange-700-custom text-xs px-2.5 py-0.5 font-semibold">
                    🔥 {task.streak}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg leading-tight text-theme-primary">{task.title}</CardTitle>
              {task.description && (
                <p className="text-sm text-theme-secondary mt-1.5 line-clamp-2">{task.description}</p>
              )}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs border-gray-300-custom px-2 py-0.5">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEdit}
                  className="h-9 w-9 text-sky-600-custom hover:bg-sky-100-custom"
                >
                  <Edit className="h-4 w-4" strokeWidth={2} />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="h-9 w-9 text-red-500 hover:bg-red-100-custom"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Actions based on task type */}
          {task.type === 'habit' && onHabitAction && (
            <div className="flex gap-3">
              {showPositiveButton && (
                <Button
                  onClick={() => onHabitAction('positive')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold shadow-md shadow-emerald-500/25"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Positive</span>
                  <span className="sm:hidden">+</span>
                </Button>
              )}
              {showNegativeButton && (
                <Button
                  onClick={() => onHabitAction('negative')}
                  variant="destructive"
                  className="flex-1 text-sm font-semibold"
                  size="sm"
                >
                  <X className="mr-2 h-4 w-4" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Negative</span>
                  <span className="sm:hidden">-</span>
                </Button>
              )}
            </div>
          )}

          {task.type === 'daily' && onComplete && (
            <Button
              onClick={onComplete}
              className="w-full bg-sky-600 hover:bg-sky-700 text-sm font-semibold shadow-md shadow-sky-500/25"
              size="sm"
              disabled={task.completedToday}
            >
              <Check className="mr-2 h-4 w-4" strokeWidth={2.5} />
              {task.completedToday ? (
                <>
                  <span className="hidden sm:inline">Completed Today</span>
                  <span className="sm:hidden">Done</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Complete Daily</span>
                  <span className="sm:hidden">Complete</span>
                </>
              )}
            </Button>
          )}

          {task.type === 'todo' && onComplete && (
            <Button
              onClick={onComplete}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold shadow-md shadow-emerald-500/25"
              size="sm"
              disabled={task.completed}
            >
              <Check className="mr-2 h-4 w-4" strokeWidth={2.5} />
              {task.completed ? (
                <>
                  <span className="hidden sm:inline">Completed</span>
                  <span className="sm:hidden">Done</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Complete To-Do</span>
                  <span className="sm:hidden">Complete</span>
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
