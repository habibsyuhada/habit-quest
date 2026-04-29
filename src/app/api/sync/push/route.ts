import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { syncPushRequestSchema } from '@/lib/validators'
import { startOfDay, endOfDay } from 'date-fns'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validationResult = syncPushRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid sync payload',
            details: validationResult.error.issues,
          },
          meta: {
            api_version: process.env.NEXT_PUBLIC_API_VERSION || '1',
            server_time: new Date().toISOString(),
          },
        },
        { status: 400 }
      )
    }

    const { events } = validationResult.data
    const userId = session.user.id
    const processedEvents: string[] = []

    let userProgress = await prisma.userProgress.findUnique({
      where: { userId },
    })

    if (!userProgress) {
      userProgress = await prisma.userProgress.create({
        data: {
          userId,
          totalXp: 0,
          currentLevel: 1,
          currentStreak: 0,
          longestStreak: 0,
          recoveryTokens: 3,
        },
      })
    }

    for (const event of events) {
      try {
        const existingEvent = await prisma.syncEvent.findUnique({
          where: { clientEventId: event.client_event_id },
        })

        if (existingEvent) {
          processedEvents.push(event.client_event_id)
          continue
        }

        switch (event.event_type) {
          case 'HABIT_COMPLETED': {
            const { habitId, date, xp } = event.payload as {
              habitId: string
              date: string
              xp: number
            }

            const habit = await prisma.userHabit.findFirst({
              where: {
                id: habitId,
                userId,
              },
            })

            if (!habit) {
              throw new Error('Habit not found')
            }

            const habitDate = date ? new Date(date) : new Date()
            const startOfDate = startOfDay(habitDate)
            const endOfDate = endOfDay(habitDate)

            const existingLog = await prisma.habitLog.findFirst({
              where: {
                habitId,
                userId,
                completedDate: {
                  gte: startOfDate,
                  lte: endOfDate,
                },
              },
            })

            if (!existingLog) {
              await prisma.habitLog.create({
                data: {
                  userId,
                  habitId,
                  completedAt: new Date(event.client_created_at),
                  completedDate: habitDate,
                  value: 1,
                  expEarned: habit.xp,
                },
              })

              const todayLogs = await prisma.habitLog.findMany({
                where: {
                  userId,
                  completedDate: {
                    gte: startOfDate,
                    lte: endOfDate,
                  },
                },
              })

              if (todayLogs.length === 1) {
                userProgress = await prisma.userProgress.update({
                  where: { id: userProgress.id },
                  data: {
                    currentStreak: { increment: 1 },
                    lastActivityAt: new Date(),
                  },
                })
              }

              userProgress = await prisma.userProgress.update({
                where: { id: userProgress.id },
                data: {
                  totalXp: { increment: habit.xp },
                  currentLevel: Math.floor((userProgress.totalXp + habit.xp) / 100) + 1,
                },
              })
            }

            break
          }

          case 'HABIT_UNCOMPLETED': {
            const { habitId, date } = event.payload as {
              habitId: string
              date: string
            }

            const habitDate = date ? new Date(date) : new Date()
            const startOfDate = startOfDay(habitDate)
            const endOfDate = endOfDay(habitDate)

            const log = await prisma.habitLog.findFirst({
              where: {
                habitId,
                userId,
                completedDate: {
                  gte: startOfDate,
                  lte: endOfDate,
                },
              },
            })

            if (log) {
              await prisma.habitLog.delete({
                where: { id: log.id },
              })

              const remainingLogs = await prisma.habitLog.findMany({
                where: {
                  userId,
                  completedDate: {
                    gte: startOfDate,
                    lte: endOfDate,
                  },
                },
              })

              if (remainingLogs.length === 0) {
                userProgress = await prisma.userProgress.update({
                  where: { id: userProgress.id },
                  data: {
                    currentStreak: { decrement: 1 },
                  },
                })
              }

              userProgress = await prisma.userProgress.update({
                where: { id: userProgress.id },
                data: {
                  totalXp: { decrement: log.expEarned },
                  currentLevel: Math.max(1, Math.floor((userProgress.totalXp - log.expEarned) / 100) + 1),
                },
              })
            }

            break
          }

          case 'TEMPLATE_STARTED': {
            const { templateId, habitIds } = event.payload as {
              templateId: string
              habitIds: string[]
            }

            break
          }

          default:
            break
        }

        await prisma.syncEvent.create({
          data: {
            userId,
            clientEventId: event.client_event_id,
            eventType: event.event_type,
            eventVersion: event.event_version,
            payload: event.payload as any,
            createdAt: new Date(event.client_created_at),
          },
        })

        processedEvents.push(event.client_event_id)
      } catch (error) {
        console.error('Failed to process event:', event.client_event_id, error)
      }
    }

    const updatedProgress = await prisma.userProgress.findUnique({
      where: { id: userProgress.id },
    })

    return NextResponse.json({
      success: true,
      data: {
        processed_events: processedEvents,
        user_progress: {
          totalXp: updatedProgress?.totalXp || 0,
          currentLevel: updatedProgress?.currentLevel || 1,
          currentStreak: updatedProgress?.currentStreak || 0,
          longestStreak: updatedProgress?.longestStreak || 0,
          recoveryTokens: updatedProgress?.recoveryTokens || 3,
        },
      },
      meta: {
        api_version: process.env.NEXT_PUBLIC_API_VERSION || '1',
        server_time: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Sync push error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while processing sync',
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
