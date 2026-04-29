'use client'

import { Download, X } from 'lucide-react'
import { useAppVersionStore } from '@/stores/useAppVersionStore'
import { useState } from 'react'

export function AppUpdateBanner() {
  const { hasUpdate, clearUpdate } = useAppVersionStore()
  const [isVisible, setIsVisible] = useState(true)

  if (!hasUpdate || !isVisible) {
    return null
  }

  const handleUpdate = () => {
    window.location.reload()
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 text-white shadow-lg">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              A new version is available
            </p>
            <p className="text-xs text-blue-100">
              Update to get the latest features and improvements
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpdate}
              className="rounded-xl bg-white px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Update
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-xl p-1.5 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
