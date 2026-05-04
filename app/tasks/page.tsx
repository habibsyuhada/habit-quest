'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskCreator } from '@/components/task/TaskCreator';
import { useGameStore } from '@/lib/store';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { AnimatePresence } from 'framer-motion';

export default function TasksPage() {
  const tasks = useGameStore((state) => state.tasks);
  const completeTask = useGameStore((state) => state.completeTask);
  const completeHabit = useGameStore((state) => state.completeHabit);
  const deleteTask = useGameStore((state) => state.deleteTask);
  const checkDailies = useGameStore((state) => state.checkDailies);
  const [activeTab, setActiveTab] = useState<'habits' | 'dailies' | 'todos'>('habits');

  useEffect(() => {
    checkDailies();
  }, [checkDailies]);

  const habits = tasks.filter((t) => t.type === 'habit');
  const dailies = tasks.filter((t) => t.type === 'daily');
  const todos = tasks.filter((t) => t.type === 'todo');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <StatsBar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quest Log</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your tasks and earn rewards</p>
          </div>
          <TaskCreator />
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'habits' | 'dailies' | 'todos')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="habits" className="relative">
              Habits
              {habits.length > 0 && (
                <span className="ml-2 bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                  {habits.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="dailies" className="relative">
              Dailies
              {dailies.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                  {dailies.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="todos" className="relative">
              To-Dos
              {todos.length > 0 && (
                <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                  {todos.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="habits">
            <div className="space-y-4">
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
                      onHabitAction={(direction) => completeHabit(task.id, direction)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </TabsContent>

          <TabsContent value="dailies">
            <div className="space-y-4">
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
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </TabsContent>

          <TabsContent value="todos">
            <div className="space-y-4">
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
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}