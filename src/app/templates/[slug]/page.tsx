'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Star, Lock, CheckCircle } from 'lucide-react'
import { db, LocalTemplate, LocalTemplateItem } from '@/lib/local-db'
import { useSession } from 'next-auth/react'

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [template, setTemplate] = useState<LocalTemplate | null>(null)
  const [items, setItems] = useState<LocalTemplateItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)

  useEffect(() => {
    loadTemplate()
  }, [params.slug])

  const loadTemplate = async () => {
    setIsLoading(true)
    try {
      const localTemplate = await db.templates.where('slug').equals(params.slug as string).first()

      if (localTemplate) {
        setTemplate(localTemplate)
        let templateItems = await db.template_items.where('templateId').equals(localTemplate.id).toArray()

        console.log('Template ID:', localTemplate.id)
        console.log('Template Items from DB:', templateItems)

        // If no items found, force sync
        if (templateItems.length === 0) {
          console.log('No items found, forcing sync...')
          const { getSyncEngine } = await import('@/lib/sync-engine')
          const syncEngine = getSyncEngine()
          await syncEngine.forceSync()

          // Try loading items again after sync
          templateItems = await db.template_items.where('templateId').equals(localTemplate.id).toArray()
          console.log('Template Items after sync:', templateItems)
        }

        setItems(templateItems)
      }
    } catch (error) {
      console.error('Failed to load template:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartTemplate = async () => {
    if (!template || !session?.user) return

    setIsStarting(true)

    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        const { addToSyncQueue } = await import('@/lib/sync-utils')
        await addToSyncQueue({
          client_event_id: crypto.randomUUID(),
          event_type: 'TEMPLATE_STARTED',
          event_version: 1,
          client_created_at: new Date().toISOString(),
          payload: {
            templateId: template.id,
            templateVersion: template.version,
            habitIds: result.data.habits.map((h: any) => h.id),
          },
        })

        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to start template:', error)
    } finally {
      setIsStarting(false)
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
            <p className="text-gray-600">Loading template...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!template) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="mb-4 text-6xl">😕</div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Template not found
            </h1>
            <p className="mb-6 text-gray-600">
              The template you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push('/templates')}>
              Browse Templates
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="p-4">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className={`rounded-3xl bg-gradient-to-br ${template.coverGradient || 'from-blue-500 to-indigo-500'} p-8 text-white shadow-xl`}>
            <div className="mb-4">
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold backdrop-blur-sm">
                {template.category}
              </span>
            </div>

            <h1 className="mb-2 text-3xl font-bold">{template.title}</h1>
            <p className="text-lg text-white/90">{template.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="font-medium">{template.durationDays} days</span>
              </div>

              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="font-medium">{template.xpPerHabit} XP per habit</span>
              </div>

              {template.isPremium && (
                <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-medium">Premium</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl"
        >
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Daily Habits ({items.length})
          </h2>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
                  <span>+{item.xp}</span>
                  <span className="text-xs">XP</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {template.changelog && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl"
          >
            <h2 className="mb-3 text-xl font-bold text-gray-900">
              What's New
            </h2>
            <p className="text-gray-600 whitespace-pre-line">{template.changelog}</p>
            <p className="mt-2 text-sm text-gray-500">Version {template.version}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="fixed bottom-20 left-0 right-0 z-10 p-4"
        >
          <div className="mx-auto max-w-md">
            {template.isPremium ? (
              <Button
                size="lg"
                className="w-full"
                disabled
              >
                <Lock className="mr-2 h-5 w-5" />
                Premium Template
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full"
                onClick={handleStartTemplate}
                disabled={isStarting}
              >
                {isStarting ? (
                  'Starting Template...'
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Start This Journey
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AppShell>
  )
}
