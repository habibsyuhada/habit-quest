import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const isPremium = searchParams.get('premium')

    const where: any = {
      isActive: true,
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (isPremium === 'true') {
      where.isPremium = true
    } else if (isPremium === 'false') {
      where.isPremium = false
    }

    const templates = await prisma.habitTemplate.findMany({
      where,
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: templates,
      meta: {
        api_version: process.env.NEXT_PUBLIC_API_VERSION || '1',
        server_time: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Templates fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching templates',
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
