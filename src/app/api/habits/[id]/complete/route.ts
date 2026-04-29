import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { habitCompletionSchema } from '@/lib/validators'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
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
      include: {
        options: {
          where: { isActive: true },
        },
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

    const body = await request.json()
    const validationResult = habitCompletionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid completion data',
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      )
    }

    const completedDate = validationResult.data.date
      ? new Date(validationResult.data.date)
      : new Date()

    // Normalize completedDate to start of day
    completedDate.setHours(0, 0, 0, 0)

    // Check if completing with options
    const optionIds = validationResult.data.optionIds

    if (optionIds && optionIds.length > 0) {
      // Validate that all options belong to this habit
      const validOptions = await prisma.habitOption.findMany({
        where: {
          id: { in: optionIds },
          habitId: habitId,
          isActive: true,
        },
      })

      if (validOptions.length !== optionIds.length) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_OPTIONS',
              message: 'Some options are invalid',
            },
          },
          { status: 400 }
        )
      }

      // Create completion logs for each option
      const logs = await Promise.all(
        optionIds.map((optionId) =>
          prisma.habitLog.create({
            data: {
              userId: session.user.id,
              habitId: habitId,
              optionId: optionId,
              completedAt: new Date(),
              completedDate: completedDate,
              value: 1,
              expEarned: validOptions.find((o) => o.id === optionId)?.exp || habit.xp,
              note: validationResult.data.note,
            },
          })
        )
      )

      // Calculate total XP earned
      const totalExp = logs.reduce((sum, log) => sum + log.expEarned, 0)

      // Update user progress
      await updateProgress(session.user.id, totalExp)

      return NextResponse.json({
        success: true,
        data: {
          logs,
          totalExp,
        },
      })
    } else {
      // Direct habit completion
      // Check for duplicate if multiple completions are not allowed
      if (!habit.allowMultipleCompletions) {
        const existingLog = await prisma.habitLog.findFirst({
          where: {
            userId: session.user.id,
            habitId: habitId,
            completedDate: completedDate,
            optionId: null,
          },
        })

        if (existingLog) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'ALREADY_COMPLETED',
                message: 'Habit already completed for this date',
              },
            },
            { status: 400 }
          )
        }
      }

      const log = await prisma.habitLog.create({
        data: {
          userId: session.user.id,
          habitId: habitId,
          completedAt: new Date(),
          completedDate: completedDate,
          value: 1,
          expEarned: habit.xp,
          note: validationResult.data.note,
        },
      })

      // Update user progress
      await updateProgress(session.user.id, habit.xp)

      return NextResponse.json({
        success: true,
        data: {
          log,
          expEarned: habit.xp,
        },
      })
    }
  } catch (error) {
    console.error('Habit completion error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while completing the habit',
        },
      },
      { status: 500 }
    )
  }
}

// DELETE /api/habits/[id]/complete - Uncomplete a habit
export async function DELETE(
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

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const optionId = searchParams.get('optionId')

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_DATE',
            message: 'Date parameter is required',
          },
        },
        { status: 400 }
      )
    }

    const completedDate = new Date(date)
    completedDate.setHours(0, 0, 0, 0)

    // Delete the completion log(s)
    const where: any = {
      userId: session.user.id,
      habitId: habitId,
      completedDate: completedDate,
    }

    if (optionId) {
      where.optionId = optionId
    } else {
      where.optionId = null
    }

    const logs = await prisma.habitLog.findMany({
      where,
    })

    if (logs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Completion log not found',
          },
        },
        { status: 404 }
      )
    }

    // Calculate total XP to deduct
    const totalExpToDeduct = logs.reduce((sum, log) => sum + log.expEarned, 0)

    await prisma.habitLog.deleteMany({
      where,
    })

    // Update user progress (deduct XP)
    await deductProgress(session.user.id, totalExpToDeduct)

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: logs.length,
        expDeducted: totalExpToDeduct,
      },
    })
  } catch (error) {
    console.error('Habit uncompletion error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while uncompleting the habit',
        },
      },
      { status: 500 }
    )
  }
}

async function updateProgress(userId: string, expToAdd: number) {
  const progress = await prisma.userProgress.findUnique({
    where: { userId },
  })

  if (progress) {
    const newTotalXp = Math.max(0, progress.totalXp + expToAdd)

    // Calculate new level (every 100 XP = 1 level)
    const newLevel = Math.floor(newTotalXp / 100) + 1

    await prisma.userProgress.update({
      where: { userId },
      data: {
        totalXp: newTotalXp,
        currentLevel: newLevel,
        lastActivityAt: new Date(),
      },
    })
  } else {
    await prisma.userProgress.create({
      data: {
        userId,
        totalXp: expToAdd,
        currentLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
        recoveryTokens: 3,
        lastActivityAt: new Date(),
      },
    })
  }
}

async function deductProgress(userId: string, expToDeduct: number) {
  const progress = await prisma.userProgress.findUnique({
    where: { userId },
  })

  if (progress) {
    const newTotalXp = Math.max(0, progress.totalXp - expToDeduct)
    const newLevel = Math.floor(newTotalXp / 100) + 1

    await prisma.userProgress.update({
      where: { userId },
      data: {
        totalXp: newTotalXp,
        currentLevel: newLevel,
      },
    })
  }
}
