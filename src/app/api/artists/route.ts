import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') === 'true'
    const verified = searchParams.get('verified') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const where: any = {
      artworks: {
        some: {
          status: 'PUBLISHED',
        },
      },
    }

    if (featured) where.featured = true
    if (verified) where.verified = true

    const artists = await prisma.artist.findMany({
      where,
      take: limit,
      orderBy: { totalSales: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            artworks: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    })

    return NextResponse.json(artists)
  } catch (error) {
    console.error('Error fetching artists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artists' },
      { status: 500 }
    )
  }
}
