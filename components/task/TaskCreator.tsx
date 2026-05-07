'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { TagInput } from './TagInput';
import type { Task, TaskType, TaskDifficulty, HabitType, WeeklyRepeat } from '@/lib/types';

interface TaskCreatorProps {
  mode?: 'create' | 'edit';
  initialData?: Task;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TaskCreator({ mode = 'create', initialData, open: controlledOpen, onOpenChange }: TaskCreatorProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Initialize form with initialData or defaults
  const getInitialValues = () => {
    if (mode === 'edit' && initialData) {
      return {
        title: initialData.title,
        description: initialData.description || '',
        type: initialData.type,
        difficulty: initialData.difficulty,
        value: [initialData.value],
        tags: initialData.tags || [],
        habitType: initialData.habitType || 'positive',
        repeat: initialData.repeat || {
          mon: true,
          tue: true,
          wed: true,
          thu: true,
          fri: true,
          sat: false,
          sun: false,
        },
      };
    }
    return {
      title: '',
      description: '',
      type: 'todo' as TaskType,
      difficulty: 'medium' as TaskDifficulty,
      value: [1],
      tags: [] as string[],
      habitType: 'positive' as HabitType,
      repeat: {
        mon: true,
        tue: true,
        wed: true,
        thu: true,
        fri: true,
        sat: false,
        sun: false,
      },
    };
  };

  const initialValues = getInitialValues();
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [type, setType] = useState<TaskType>(initialValues.type);
  const [difficulty, setDifficulty] = useState<TaskDifficulty>(initialValues.difficulty);
  const [value, setValue] = useState(initialValues.value);
  const [habitType, setHabitType] = useState<HabitType>(initialValues.habitType);
  const [repeat, setRepeat] = useState<WeeklyRepeat>(initialValues.repeat);
  const [tags, setTags] = useState<string[]>(initialValues.tags);

  const addTask = useGameStore((state) => state.addTask);
  const updateTask = useGameStore((state) => state.updateTask);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      difficulty,
      value: 1,
      tags,
    };

    if (type === 'habit') {
      taskData.habitType = habitType;
    } else if (type === 'daily') {
      taskData.repeat = repeat;
      taskData.streak = mode === 'edit' && initialData?.type === 'daily' ? initialData.streak : 0;
      taskData.completedToday = mode === 'edit' && initialData?.type === 'daily' ? initialData.completedToday : false;
    } else if (type === 'todo') {
      taskData.completed = mode === 'edit' && initialData?.type === 'todo' ? initialData.completed : false;
    }

    if (mode === 'edit' && initialData) {
      updateTask(initialData.id, taskData);
    } else {
      addTask(taskData);
    }

    // Reset form hanya untuk create mode
    if (mode === 'create') {
      setTitle('');
      setDescription('');
      setType('todo');
      setDifficulty('medium');
      setValue([1]);
      setTags([]);
      setHabitType('positive');
      setRepeat({
        mon: true,
        tue: true,
        wed: true,
        thu: true,
        fri: true,
        sat: false,
        sun: false,
      });
    }

    setOpen(false);
  };

  return (
    <>
      {mode === 'create' && (
        <Button
          size="lg"
          className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 font-semibold shadow-md shadow-amber-500/25"
          onClick={() => setOpen(true)}
        >
          <Plus className="mr-2 h-5 w-5" strokeWidth={2.5} />
          <span className="hidden sm:inline">New Quest</span>
          <span className="sm:hidden">New</span>
        </Button>
      )}

      <Dialog
        open={open}
        onOpenChange={setOpen}
        key={initialData?.id || 'create'}
      >
        <DialogContent className="max-w-md border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{mode === 'edit' ? 'Edit Task' : 'Create New Quest'}</DialogTitle>
          <DialogDescription className="text-stone-600 dark:text-stone-400">
            {mode === 'edit' ? 'Modify your existing task' : 'Add a new habit, daily, or to-do to your quest log'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quest title"
              required
              className="border-stone-300 dark:border-stone-700"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
              className="border-stone-300 dark:border-stone-700"
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Type</label>
            <Select value={type} onValueChange={(value) => setType(value as TaskType)}>
              <SelectTrigger className="border-stone-300 dark:border-stone-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="habit">Habit</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="todo">To-Do</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Difficulty</label>
            <Select value={difficulty} onValueChange={(value) => setDifficulty(value as TaskDifficulty)}>
              <SelectTrigger className="border-stone-300 dark:border-stone-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="very_easy">Very Easy</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="very_hard">Very Hard</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Higher difficulty = Better rewards
            </p>
          </div>

          {/* Tags */}
          <TagInput value={tags} onChange={setTags} />

          {/* Habit-specific options */}
          {type === 'habit' && (
            <div>
              <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Habit Type</label>
              <Select value={habitType} onValueChange={(value) => setHabitType(value as HabitType)}>
                <SelectTrigger className="border-stone-300 dark:border-stone-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive Only</SelectItem>
                  <SelectItem value="negative">Negative Only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Daily-specific options */}
          {type === 'daily' && (
            <div>
              <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2 block">Repeat On</label>
              <div className="grid grid-cols-7 gap-2">
                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setRepeat({ ...repeat, [day]: !repeat[day as keyof WeeklyRepeat] })}
                    className={`
                      p-2 text-xs font-medium rounded-lg capitalize transition-all
                      ${repeat[day as keyof WeeklyRepeat]
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-500/25'
                        : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600'
                      }
                    `}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 font-semibold shadow-md shadow-amber-500/25">
            {mode === 'edit' ? 'Save Changes' : 'Create Quest'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
