import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppVersion } from '@/types/version'
import { fetchAppVersion, getLocalAppVersion, setLocalAppVersion } from '@/lib/app-version'

interface AppVersionState {
  localVersion: string
  remoteVersion: AppVersion | null
  hasUpdate: boolean
  forceUpdate: boolean
  isLoading: boolean
  error: string | null
  checkForUpdate: () => Promise<void>
  clearUpdate: () => void
  setLocalVersion: (version: string) => void
}

export const useAppVersionStore = create<AppVersionState>()(
  persist(
    (set, get) => ({
      localVersion: getLocalAppVersion(),
      remoteVersion: null,
      hasUpdate: false,
      forceUpdate: false,
      isLoading: false,
      error: null,

      checkForUpdate: async () => {
        set({ isLoading: true, error: null })
        try {
          const remoteVersion = await fetchAppVersion()

          if (!remoteVersion) {
            set({ isLoading: false })
            return
          }

          const localVersion = getLocalAppVersion()
          const hasUpdate = remoteVersion.latest_app_version !== localVersion
          const forceUpdate = remoteVersion.force_update

          set({
            remoteVersion,
            localVersion,
            hasUpdate,
            forceUpdate,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to check for update',
            isLoading: false,
          })
        }
      },

      clearUpdate: () => {
        const { remoteVersion } = get()
        if (remoteVersion) {
          setLocalAppVersion(remoteVersion.latest_app_version)
          set({
            localVersion: remoteVersion.latest_app_version,
            hasUpdate: false,
            forceUpdate: false,
          })
        }
      },

      setLocalVersion: (version: string) => {
        setLocalAppVersion(version)
        set({ localVersion: version })
      },
    }),
    {
      name: 'app-version-storage',
    }
  )
)
