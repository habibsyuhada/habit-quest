import { AppVersion } from '@/types/version'

const CURRENT_APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
const MINIMUM_SUPPORTED_APP_VERSION = process.env.MINIMUM_SUPPORTED_APP_VERSION || '1.0.0'
const LATEST_APP_VERSION = process.env.LATEST_APP_VERSION || '1.0.0'
const FORCE_UPDATE = process.env.FORCE_UPDATE === 'true'

export async function fetchAppVersion(): Promise<AppVersion | null> {
  try {
    const response = await fetch('/api/app-version')

    if (!response.ok) {
      console.warn('Failed to fetch app version:', response.statusText)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching app version:', error)
    return null
  }
}

export function getLocalAppVersion(): string {
  if (typeof window === 'undefined') {
    return CURRENT_APP_VERSION
  }

  return localStorage.getItem('app_version') || CURRENT_APP_VERSION
}

export function setLocalAppVersion(version: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_version', version)
  }
}

export function shouldShowUpdateBanner(remoteVersion: AppVersion | null): boolean {
  if (!remoteVersion) {
    return false
  }

  const localVersion = getLocalAppVersion()

  if (remoteVersion.force_update) {
    return true
  }

  return remoteVersion.latest_app_version !== localVersion
}

export function shouldForceUpdate(remoteVersion: AppVersion | null): boolean {
  if (!remoteVersion) {
    return false
  }

  const localVersion = getLocalAppVersion()

  if (remoteVersion.force_update) {
    return true
  }

  return isVersionLessThan(localVersion, remoteVersion.minimum_supported_app_version)
}

export function isVersionLessThan(version1: string, version2: string): boolean {
  const v1 = version1.split('.').map(Number)
  const v2 = version2.split('.').map(Number)

  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0
    const num2 = v2[i] || 0

    if (num1 < num2) {
      return true
    }
    if (num1 > num2) {
      return false
    }
  }

  return false
}

export function getCurrentAppVersion(): string {
  return CURRENT_APP_VERSION
}

export function getMinimumSupportedAppVersion(): string {
  return MINIMUM_SUPPORTED_APP_VERSION
}

export function getLatestAppVersion(): string {
  return LATEST_APP_VERSION
}

export function getForceUpdate(): boolean {
  return FORCE_UPDATE
}
