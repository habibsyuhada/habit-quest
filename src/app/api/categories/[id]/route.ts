import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateCategorySchema } from '@/lib/validators'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/categories/[id] - Update a category
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
            message: 'You must be logged in',
          },
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = updateCategorySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid category data',
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      )
    }

    const category = await prisma.habitCategory.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found',
          },
        },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (validationResult.data.name !== undefined) updateData.name = validationResult.data.name
    if (validationResult.data.color !== undefined) updateData.color = validationResult.data.color
    if (validationResult.data.icon !== undefined) updateData.icon = validationResult.data.icon

    const updatedCategory = await prisma.habitCategory.update({
      where: { id: id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: updatedCategory,
    })
  } catch (error) {
    console.error('Category update error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while updating the category',
        },
      },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - Delete a category
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
            message: 'You must be logged in',
          },
        },
        { status: 401 }
      )
    }

    const category = await prisma.habitCategory.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found',
          },
        },
        { status: 404 }
      )
    }

    // Unlink habits from this category
    await prisma.habitCategoryAssignment.deleteMany({
      where: { categoryId: id },
    })

    await prisma.habitCategory.delete({
      where: { id: id },
    })

    return NextResponse.json({
      success: true,
      data: { id: id },
    })
  } catch (error) {
    console.error('Category delete error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while deleting the category',
        },
      },
      { status: 500 }
    )
  }
}
