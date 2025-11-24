import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'

// GET - List artworks with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const medium = searchParams.get('medium')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const artistId = searchParams.get('artistId')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '12', 10)

    const where: any = {
      status: 'PUBLISHED',
    }

    if (category) where.category = category
    if (medium) where.medium = medium
    if (artistId) where.artistId = artistId
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ]
    }

    const orderBy: any = {}
    switch (sort) {
      case 'oldest':
        orderBy.createdAt = 'asc'
        break
      case 'price_low':
        orderBy.price = 'asc'
        break
      case 'price_high':
        orderBy.price = 'desc'
        break
      case 'popular':
        orderBy.views = 'desc'
        break
      default:
        orderBy.createdAt = 'desc'
    }

    const [artworks, total] = await Promise.all([
      prisma.artwork.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          artist: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      }),
      prisma.artwork.count({ where }),
    ])

    return NextResponse.json({
      items: artworks,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artworks' },
      { status: 500 }
    )
  }
}

// POST - Create artwork (artists only)
const createArtworkSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  images: z.array(z.string()).min(1),
  medium: z.string().optional(),
  dimensions: z.string().optional(),
  year: z.number().optional(),
  edition: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.artistId) {
      return NextResponse.json(
        { error: 'You must be an artist to create artworks' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = createArtworkSchema.parse(body)

    const artwork = await prisma.artwork.create({
      data: {
        ...data,
        artistId: session.user.artistId,
        tags: data.tags || [],
        status: data.status || 'DRAFT',
      },
      include: {
        artist: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(artwork, { status: 201 })
  } catch (error) {
    console.error('Error creating artwork:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create artwork' },
      { status: 500 }
    )
  }
}
