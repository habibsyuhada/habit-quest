import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startTemplateSchema } from '@/lib/validators'
import { z } from 'zod'

const createCustomHabitSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  xp: z.number().int().positive().default(10),
})

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
            message: 'You must be logged in to fetch habits',
          },
        },
        { status: 401 }
      )
    }

    const habits = await prisma.userHabit.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: habits,
    })
  } catch (error) {
    console.error('Habits fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching habits',
        },
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

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

    const body = await request.json()

    // Check if it's a custom habit creation
    if (body.title && !body.templateId) {
      const validationResult = createCustomHabitSchema.safeParse(body)

      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid habit data',
              details: validationResult.error.issues,
            },
          },
          { status: 400 }
        )
      }

      // Get current max order
      const maxOrder = await prisma.userHabit.findFirst({
        where: {
          userId: session.user.id,
          isActive: true,
        },
        orderBy: { order: 'desc' },
      })

      const nextOrder = (maxOrder?.order ?? -1) + 1

      const habit = await prisma.userHabit.create({
        data: {
          userId: session.user.id,
          title: validationResult.data.title,
          description: validationResult.data.description,
          xp: validationResult.data.xp,
          order: nextOrder,
          sourceTemplateId: null,
          sourceTemplateVersion: null,
        },
      })

      // Initialize user progress if doesn't exist
      let userProgress = await prisma.userProgress.findUnique({
        where: { userId: session.user.id },
      })

      if (!userProgress) {
        userProgress = await prisma.userProgress.create({
          data: {
            userId: session.user.id,
            totalXp: 0,
            currentLevel: 1,
            currentStreak: 0,
            longestStreak: 0,
            recoveryTokens: 3,
          },
        })
      }

      return NextResponse.json({
        success: true,
        data: habit,
      })
    }

    // Original template logic
    const validationResult = startTemplateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      )
    }

    const { templateId } = validationResult.data

    const template = await prisma.habitTemplate.findUnique({
      where: { id: templateId },
      include: { items: true },
    })

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Template not found',
          },
        },
        { status: 404 }
      )
    }

    if (template.isPremium) {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: session.user.id,
          status: 'active',
        },
      })

      if (!subscription) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PREMIUM_REQUIRED',
              message: 'This template requires a premium subscription',
            },
          },
          { status: 403 }
        )
      }
    }

    await prisma.userHabit.deleteMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    })

    const habits = await Promise.all(
      template.items.map((item) =>
        prisma.userHabit.create({
          data: {
            userId: session.user.id,
            title: item.title,
            description: item.description,
            xp: item.xp,
            order: item.order,
            sourceTemplateId: template.id,
            sourceTemplateVersion: template.version,
          },
        })
      )
    )

    let userProgress = await prisma.userProgress.findUnique({
      where: { userId: session.user.id },
    })

    if (!userProgress) {
      userProgress = await prisma.userProgress.create({
        data: {
          userId: session.user.id,
          totalXp: 0,
          currentLevel: 1,
          currentStreak: 0,
          longestStreak: 0,
          recoveryTokens: 3,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        habits,
        template: {
          id: template.id,
          title: template.title,
          version: template.version,
        },
      },
      meta: {
        api_version: process.env.NEXT_PUBLIC_API_VERSION || '1',
        server_time: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Habits POST error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred',
        },
      },
      { status: 500 }
    )
  }
}
