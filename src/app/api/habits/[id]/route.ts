import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateHabitSchema } from '@/lib/validators'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to update habits',
          },
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = updateHabitSchema.safeParse(body)

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

    const habit = await prisma.userHabit.findFirst({
      where: {
        id: id,
        userId: session.user.id,
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

    const updateData: any = {}
    if (validationResult.data.title !== undefined) updateData.title = validationResult.data.title
    if (validationResult.data.description !== undefined) updateData.description = validationResult.data.description
    if (validationResult.data.xp !== undefined) updateData.xp = validationResult.data.xp
    if (validationResult.data.order !== undefined) updateData.order = validationResult.data.order
    if (validationResult.data.recurrenceType !== undefined) updateData.recurrenceType = validationResult.data.recurrenceType
    if (validationResult.data.targetCount !== undefined) updateData.targetCount = validationResult.data.targetCount
    if (validationResult.data.allowMultipleCompletions !== undefined) updateData.allowMultipleCompletions = validationResult.data.allowMultipleCompletions

    // Handle categories update - delete existing and create new ones
    if (validationResult.data.categoryIds !== undefined) {
      await prisma.habitCategoryAssignment.deleteMany({
        where: { habitId: id },
      })

      if (validationResult.data.categoryIds.length > 0) {
        updateData.categoryAssignments = {
          create: validationResult.data.categoryIds.map((categoryId) => ({
            categoryId,
          })),
        }
      }
    }

    // Handle options update - delete existing and create new ones
    if (validationResult.data.options !== undefined) {
      await prisma.habitOption.deleteMany({
        where: { habitId: id },
      })

      updateData.options = {
        create: validationResult.data.options.map((option) => ({
          label: option.label,
          description: option.description,
          exp: option.exp,
          sortOrder: option.sortOrder,
          isActive: option.isActive ?? true,
        })),
      }
    }

    const updatedHabit = await prisma.userHabit.update({
      where: { id: id },
      data: updateData,
      include: {
        categoryAssignments: {
          include: {
            category: true,
          },
        },
        options: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedHabit,
    })
  } catch (error) {
    console.error('Habit update error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while updating the habit',
        },
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to delete habits',
          },
        },
        { status: 401 }
      )
    }

    const habit = await prisma.userHabit.findFirst({
      where: {
        id: id,
        userId: session.user.id,
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

    await prisma.userHabit.delete({
      where: { id: id },
    })

    return NextResponse.json({
      success: true,
      data: { id: id },
    })
  } catch (error) {
    console.error('Habit delete error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while deleting the habit',
        },
      },
      { status: 500 }
    )
  }
}
