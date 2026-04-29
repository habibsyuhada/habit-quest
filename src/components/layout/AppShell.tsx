'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { BottomNav } from './BottomNav'
import { OnlineStatus } from './OnlineStatus'
import { AppUpdateBanner } from './AppUpdateBanner'
import { useAppVersionStore } from '@/stores/useAppVersionStore'
import { useSyncStore } from '@/stores/useSyncStore'
import { getSyncEngine } from '@/lib/sync-engine'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { checkForUpdate, hasUpdate, forceUpdate } = useAppVersionStore()
  const { setOnline, setSyncing } = useSyncStore()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const syncEngine = getSyncEngine()

    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    syncEngine.start()

    checkForUpdate()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      syncEngine.stop()
    }
  }, [setOnline, checkForUpdate])

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (forceUpdate) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md text-center">
          <div className="mb-6 text-6xl">🔄</div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Update Required
          </h1>
          <p className="mb-6 text-gray-600">
            The app version you're using is no longer supported. Please update to continue using HabitQuest.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-white shadow-lg hover:from-blue-600 hover:to-indigo-600"
          >
            Update Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <OnlineStatus />
      {hasUpdate && <AppUpdateBanner />}
      <main className="pb-24">
        {children}
      </main>
      {session && <BottomNav />}
    </div>
  )
}
