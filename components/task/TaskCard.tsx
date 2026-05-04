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
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={cn('text-white', typeColor)}>
                  {task.type}
                </Badge>
                <Badge variant="outline" className={cn('text-white border-0', difficultyColor)}>
                  {task.difficulty}
                </Badge>
                {task.type === 'daily' && task.streak !== undefined && task.streak > 0 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    🔥 {task.streak} day streak
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{task.title}</CardTitle>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              )}
            </div>
            <div className="flex space-x-1">
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
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
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Positive
              </Button>
              <Button
                onClick={() => onHabitAction('negative')}
                variant="destructive"
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Negative
              </Button>
            </div>
          )}

          {task.type === 'daily' && onComplete && (
            <Button
              onClick={onComplete}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={task.completedToday}
            >
              <Check className="mr-2 h-4 w-4" />
              {task.completedToday ? 'Completed Today' : 'Complete Daily'}
            </Button>
          )}

          {task.type === 'todo' && onComplete && (
            <Button
              onClick={onComplete}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={task.completed}
            >
              <Check className="mr-2 h-4 w-4" />
              {task.completed ? 'Completed' : 'Complete To-Do'}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}