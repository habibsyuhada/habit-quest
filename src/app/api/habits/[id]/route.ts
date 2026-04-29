import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateHabitSchema } from '@/lib/validators'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

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
        id: params.id,
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

    const updatedHabit = await prisma.userHabit.update({
      where: { id: params.id },
      data: updateData,
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

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
        id: params.id,
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
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      data: { id: params.id },
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
