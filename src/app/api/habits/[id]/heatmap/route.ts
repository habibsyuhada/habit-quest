import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLast12MonthsContributions, getContributionStats } from '@/lib/contribution-calendar'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: habitId } = await params

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in',
          },
        },
        { status: 401 }
      )
    }

    const habit = await prisma.userHabit.findFirst({
      where: {
        id: habitId,
        userId: session.user.id,
        isActive: true,
      },
    })

    if (!habit) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Habit not found',
          },
        },
        { status: 404 }
      )
    }

    // Get logs for the last 12 months
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 12)
    startDate.setDate(1)
    startDate.setHours(0, 0, 0, 0)

    const logs = await prisma.habitLog.findMany({
      where: {
        habitId: habitId,
        userId: session.user.id,
        completedDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        option: true,
      },
      orderBy: {
        completedDate: 'asc',
      },
    })

    // Build contribution calendar - cast logs to HabitLog type
    const contributions = getLast12MonthsContributions(logs as any, habit.targetCount)

    // Get stats
    const stats = getContributionStats(contributions)

    return NextResponse.json({
      success: true,
      data: {
        contributions,
        stats,
        habit: {
          id: habit.id,
          title: habit.title,
          recurrenceType: habit.recurrenceType,
          targetCount: habit.targetCount,
        },
      },
    })
  } catch (error) {
    console.error('Heatmap data fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching heatmap data',
        },
      },
      { status: 500 }
    )
  }
}
