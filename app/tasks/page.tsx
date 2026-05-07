'use client';

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskCreator } from '@/components/task/TaskCreator';
import { useGameStore } from '@/lib/store';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Scroll } from 'lucide-react';
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

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tasks.forEach(task => {
      task.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [tasks]);

  const filterTasksByTag = (tasks: Task[]) => {
    return selectedTag
      ? tasks.filter(task => task.tags?.includes(selectedTag))
      : tasks;
  };

  const habits = filterTasksByTag(tasks.filter((t) => t.type === 'habit'));
  const dailies = filterTasksByTag(tasks.filter((t) => t.type === 'daily'));
  const todos = filterTasksByTag(tasks.filter((t) => t.type === 'todo'));

  return (
    <div className="min-h-screen bg-theme-secondary">
      <StatsBar />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Scroll className="h-6 w-6 text-amber-500" />
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-theme-primary">
                  Quest Log
                </h1>
              </div>
              <p className="text-theme-secondary text-base">
                Manage your adventures and earn rewards
              </p>
            </div>
            <TaskCreator />
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-theme-secondary font-medium">Filter by tag:</span>
              <Badge
                variant={selectedTag === null ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1"
                onClick={() => setSelectedTag(null)}
              >
                All
              </Badge>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => setSelectedTag(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'habits' | 'dailies' | 'todos')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-auto bg-gray-200-custom p-1">
            <TabsTrigger value="habits" className="relative text-sm py-2.5 data-[state=active]:bg-theme-primary data-[state=active]:shadow-sm">
              Habits
              {habits.length > 0 && (
                <span className="ml-2 bg-purple-100-custom text-purple-700-custom text-xs px-2 py-0.5 rounded-full font-semibold">
                  {habits.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="dailies" className="relative text-sm py-2.5 data-[state=active]:bg-theme-primary data-[state=active]:shadow-sm">
              Dailies
              {dailies.length > 0 && (
                <span className="ml-2 bg-sky-100-custom text-sky-700-custom text-xs px-2 py-0.5 rounded-full font-semibold">
                  {dailies.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="todos" className="relative text-sm py-2.5 data-[state=active]:bg-theme-primary data-[state=active]:shadow-sm">
              To-Dos
              {todos.length > 0 && (
                <span className="ml-2 bg-green-100-custom text-green-700-custom text-xs px-2 py-0.5 rounded-full font-semibold">
                  {todos.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="habits">
            <div className="grid grid-cols-1 gap-4">
              {habits.length === 0 ? (
                <div className="text-center py-16 bg-theme-primary/50 rounded-2xl border-2 border-dashed border-gray-300-custom">
                  <p className="text-theme-tertiary mb-4 text-lg">No habits yet. Begin your journey!</p>
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
            <div className="grid grid-cols-1 gap-4">
              {dailies.length === 0 ? (
                <div className="text-center py-16 bg-theme-primary/50 rounded-2xl border-2 border-dashed border-gray-300-custom">
                  <p className="text-theme-tertiary mb-4 text-lg">No dailies yet. Set up your routine!</p>
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
            <div className="grid grid-cols-1 gap-4">
              {todos.length === 0 ? (
                <div className="text-center py-16 bg-theme-primary/50 rounded-2xl border-2 border-dashed border-gray-300-custom">
                  <p className="text-theme-tertiary mb-4 text-lg">No to-dos yet. Add your first quest!</p>
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
