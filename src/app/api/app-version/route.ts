import { NextResponse } from 'next/server'
import { AppVersion } from '@/types/version'

export const dynamic = 'force-dynamic'

export async function GET() {
  const appVersion: AppVersion = {
    app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    api_version: process.env.NEXT_PUBLIC_API_VERSION || '1',
    minimum_supported_app_version: process.env.MINIMUM_SUPPORTED_APP_VERSION || '1.0.0',
    latest_app_version: process.env.LATEST_APP_VERSION || '1.0.0',
    force_update: process.env.FORCE_UPDATE === 'true',
    message: null,
  }

  return NextResponse.json(appVersion)
}
