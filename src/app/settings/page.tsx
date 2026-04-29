'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, LogOut, RefreshCw, Trash2, Info, Wifi, WifiOff } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { getAppMeta, clearLocalData, updateAppMeta } from '@/lib/local-db'
import { useSyncStore } from '@/stores/useSyncStore'
import { forceSyncNow, isOnline } from '@/lib/sync-utils'
import { getLocalAppVersion } from '@/lib/app-version'
import { useAppVersionStore } from '@/stores/useAppVersionStore'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const router = useRouter()
  const { isOnline: syncOnline } = useSyncStore()
  const { checkForUpdate, localVersion } = useAppVersionStore()
  const [appMeta, setAppMeta] = useState<any>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    loadAppMeta()
  }, [])

  const loadAppMeta = async () => {
    const meta = await getAppMeta()
    setAppMeta(meta)
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await forceSyncNow()
      await loadAppMeta()
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCheckUpdate = async () => {
    await checkForUpdate()
  }

  const handleClearCache = async () => {
    if (!showClearConfirm) {
      setShowClearConfirm(true)
      return
    }

    setIsClearing(true)
    try {
      await clearLocalData()
      router.push('/login')
    } catch (error) {
      console.error('Failed to clear cache:', error)
      setIsClearing(false)
      setShowClearConfirm(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <AppShell>
      <div className="p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Settings
          </h1>
          <p className="text-gray-600">
            Manage your app and data
          </p>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl"
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <Info className="h-5 w-5" />
              App Information
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">App Version</span>
                <span className="font-medium text-gray-900">{localVersion}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Database Schema</span>
                <span className="font-medium text-gray-900">
                  v{appMeta?.local_db_schema_version || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Connection</span>
                <span className={cn(
                  'flex items-center gap-1 font-medium',
                  isOnline() ? 'text-green-600' : 'text-red-600'
                )}>
                  {isOnline() ? (
                    <>
                      <Wifi className="h-4 w-4" />
                      Online
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4" />
                      Offline
                    </>
                  )}
                </span>
              </div>

              {appMeta?.last_sync_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Sync</span>
                  <span className="font-medium text-gray-900">
                    {new Date(appMeta.last_sync_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl"
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <RefreshCw className="h-5 w-5" />
              Sync & Updates
            </h2>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleSync}
                disabled={isSyncing || !isOnline()}
              >
                <RefreshCw className={cn('mr-2 h-5 w-5', isSyncing && 'animate-spin')} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleCheckUpdate}
                disabled={!isOnline()}
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Check for Updates
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl"
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </h2>

            <div className="space-y-3">
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start',
                  showClearConfirm && 'border-red-500 text-red-600 hover:bg-red-50'
                )}
                onClick={handleClearCache}
                disabled={isClearing}
              >
                <Trash2 className="mr-2 h-5 w-5" />
                {showClearConfirm ? 'Confirm Clear Cache' : 'Clear Local Cache'}
              </Button>

              {showClearConfirm && (
                <p className="text-sm text-red-600">
                  This will delete all local data. Your account on the server will not be deleted.
                </p>
              )}

              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  )
}
