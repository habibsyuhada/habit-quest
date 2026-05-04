'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Check, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TASK_COLORS, DIFFICULTY_COLORS } from '@/lib/constants';
import type { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onComplete?: () => void;
  onDelete?: () => void;
  onHabitAction?: (direction: 'positive' | 'negative') => void;
}

export function TaskCard({ task, onComplete, onDelete, onHabitAction }: TaskCardProps) {
  const difficultyColor = DIFFICULTY_COLORS[task.difficulty];
  const typeColor = TASK_COLORS[task.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'hover:shadow-lg transition-all duration-200 border-l-4',
          task.type === 'todo' && task.completed && 'opacity-50',
          task.type === 'habit' && 'border-l-purple-500',
          task.type === 'daily' && task.type === 'daily' && 'border-l-blue-500',
          task.type === 'todo' && 'border-l-green-500'
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <Badge className={cn('text-white text-xs', typeColor)}>
                  {task.type}
                </Badge>
                <Badge variant="outline" className={cn('text-white border-0 text-xs', difficultyColor)}>
                  {task.difficulty}
                </Badge>
                {task.type === 'daily' && task.streak !== undefined && task.streak > 0 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                    🔥 {task.streak}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-base sm:text-lg leading-tight">{task.title}</CardTitle>
              {task.description && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
              )}
            </div>
            <div className="flex space-x-1 flex-shrink-0">
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Actions based on task type */}
          {task.type === 'habit' && onHabitAction && (
            <div className="flex space-x-2">
              <Button
                onClick={() => onHabitAction('positive')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                size="sm"
              >
                <Plus className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Positive</span>
                <span className="sm:hidden">+</span>
              </Button>
              <Button
                onClick={() => onHabitAction('negative')}
                variant="destructive"
                className="flex-1 text-xs sm:text-sm"
                size="sm"
              >
                <X className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Negative</span>
                <span className="sm:hidden">-</span>
              </Button>
            </div>
          )}

          {task.type === 'daily' && onComplete && (
            <Button
              onClick={onComplete}
              className="w-full bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
              size="sm"
              disabled={task.completedToday}
            >
              <Check className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
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
              className="w-full bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
              size="sm"
              disabled={task.completed}
            >
              <Check className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
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