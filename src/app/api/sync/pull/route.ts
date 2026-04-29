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

    // Fetch data with individual error handling
    let templates: any[] = []
    let userHabits: any[] = []
    let habitLogs: any[] = []
    let userProgress: any = null

    try {
      templates = await prisma.habitTemplate.findMany({
        where: {
          isActive: true,
          updatedAt: { gt: sinceDate },
        },
        include: {
          items: true,
        },
      })
    } catch (error) {
      console.error('Error fetching templates:', error)
    }

    try {
      userHabits = await prisma.userHabit.findMany({
        where: {
          userId: session.user.id,
          updatedAt: { gt: sinceDate },
        },
      })
    } catch (error) {
      console.error('Error fetching user habits:', error)
    }

    try {
      habitLogs = await prisma.habitLog.findMany({
        where: {
          userId: session.user.id,
          createdAt: { gt: sinceDate },
        },
      })
    } catch (error) {
      console.error('Error fetching habit logs:', error)
    }

    try {
      userProgress = await prisma.userProgress.findUnique({
        where: { userId: session.user.id },
      })
    } catch (error) {
      console.error('Error fetching user progress:', error)
    }

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
    console.error('Error details:', JSON.stringify(error, null, 2))

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching sync data',
          details: error instanceof Error ? error.message : 'Unknown error',
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
