'use client';

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskCreator } from '@/components/task/TaskCreator';
import { useGameStore } from '@/lib/store';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/lib/types';

export default function TasksPage() {
  const tasks = useGameStore((state) => state.tasks);
  const completeTask = useGameStore((state) => state.completeTask);
  const completeHabit = useGameStore((state) => state.completeHabit);
  const deleteTask = useGameStore((state) => state.deleteTask);
  const checkDailies = useGameStore((state) => state.checkDailies);
  const [activeTab, setActiveTab] = useState<'habits' | 'dailies' | 'todos'>('habits');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    checkDailies();
  }, [checkDailies]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditingTask(null);
    setIsEditDialogOpen(false);
  };

  // Get all unique tags from tasks
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tasks.forEach(task => {
      task.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [tasks]);

  // Filter tasks by type and tag
  const filterTasksByTag = (tasks: Task[]) => {
    return selectedTag
      ? tasks.filter(task => task.tags?.includes(selectedTag))
      : tasks;
  };

  const habits = filterTasksByTag(tasks.filter((t) => t.type === 'habit'));
  const dailies = filterTasksByTag(tasks.filter((t) => t.type === 'daily'));
  const todos = filterTasksByTag(tasks.filter((t) => t.type === 'todo'));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <StatsBar />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Quest Log</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">Manage your tasks and earn rewards</p>
            </div>
            <TaskCreator />
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
              <Badge
                variant={selectedTag === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedTag(null)}
              >
                All
              </Badge>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'habits' | 'dailies' | 'todos')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-auto">
            <TabsTrigger value="habits" className="relative text-xs sm:text-sm py-2 sm:py-2.5">
              Habits
              {habits.length > 0 && (
                <span className="ml-1 sm:ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                  {habits.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="dailies" className="relative text-xs sm:text-sm py-2 sm:py-2.5">
              Dailies
              {dailies.length > 0 && (
                <span className="ml-1 sm:ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                  {dailies.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="todos" className="relative text-xs sm:text-sm py-2 sm:py-2.5">
              To-Dos
              {todos.length > 0 && (
                <span className="ml-1 sm:ml-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                  {todos.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="habits">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {habits.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No habits yet. Create your first habit!</p>
                  <TaskCreator />
                </div>
              ) : (
                <AnimatePresence>
                  {habits.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={() => completeTask(task.id)}
                      onDelete={() => deleteTask(task.id)}
                      onEdit={() => handleEditTask(task)}
                      onHabitAction={(direction) => completeHabit(task.id, direction)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </TabsContent>

          <TabsContent value="dailies">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {dailies.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No dailies yet. Create your first daily task!</p>
                  <TaskCreator />
                </div>
              ) : (
                <AnimatePresence>
                  {dailies.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={() => completeTask(task.id)}
                      onDelete={() => deleteTask(task.id)}
                      onEdit={() => handleEditTask(task)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </TabsContent>

          <TabsContent value="todos">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {todos.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No to-dos yet. Create your first to-do!</p>
                  <TaskCreator />
                </div>
              ) : (
                <AnimatePresence>
                  {todos.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={() => completeTask(task.id)}
                      onDelete={() => deleteTask(task.id)}
                      onEdit={() => handleEditTask(task)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Task Dialog */}
        {editingTask && (
          <TaskCreator
            mode="edit"
            initialData={editingTask}
            open={isEditDialogOpen}
            onOpenChange={handleCloseEditDialog}
          />
        )}
      </main>
    </div>
  );
}