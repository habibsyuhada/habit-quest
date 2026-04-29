import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to sync data',
          },
          meta: {
            api_version: process.env.NEXT_PUBLIC_API_VERSION || '1',
            server_time: new Date().toISOString(),
          },
        },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const since = searchParams.get('since') || new Date(0).toISOString()

    const sinceDate = new Date(since)

    const templates = await prisma.habitTemplate.findMany({
      where: {
        isActive: true,
        updatedAt: { gt: sinceDate },
      },
      include: {
        items: true,
      },
    })

    const userHabits = await prisma.userHabit.findMany({
      where: {
        userId: session.user.id,
        updatedAt: { gt: sinceDate },
      },
    })

    const habitLogs = await prisma.habitLog.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gt: sinceDate },
      },
    })

    const userProgress = await prisma.userProgress.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json({
      success: true,
      data: {
        templates,
        user_habits: userHabits,
        habit_logs: habitLogs,
        user_progress: userProgress,
        changed_templates: templates,
      },
      meta: {
        api_version: process.env.NEXT_PUBLIC_API_VERSION || '1',
        server_time: new Date().toISOString(),
        last_sync_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Sync pull error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching sync data',
        },
        meta: {
          api_version: process.env.NEXT_PUBLIC_API_VERSION || '1',
          server_time: new Date().toISOString(),
        },
      },
      { status: 500 }
    )
  }
}
