import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'

// GET - Get single artwork
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id: params.id },
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
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            favorites: true,
            reviews: true,
          },
        },
      },
    })

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }

    // Increment views
    await prisma.artwork.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json(artwork)
  } catch (error) {
    console.error('Error fetching artwork:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artwork' },
      { status: 500 }
    )
  }
}

// PUT - Update artwork (owner only)
const updateArtworkSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  images: z.array(z.string()).optional(),
  medium: z.string().optional(),
  dimensions: z.string().optional(),
  year: z.number().optional(),
  edition: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SOLD', 'ARCHIVED']).optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.artistId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check ownership
    const existing = await prisma.artwork.findUnique({
      where: { id: params.id },
      select: { artistId: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }

    if (existing.artistId !== session.user.artistId) {
      return NextResponse.json(
        { error: 'You can only edit your own artworks' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = updateArtworkSchema.parse(body)

    const artwork = await prisma.artwork.update({
      where: { id: params.id },
      data,
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

    return NextResponse.json(artwork)
  } catch (error) {
    console.error('Error updating artwork:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update artwork' },
      { status: 500 }
    )
  }
}

// DELETE - Delete artwork (owner only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.artistId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check ownership
    const existing = await prisma.artwork.findUnique({
      where: { id: params.id },
      select: { artistId: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }

    if (existing.artistId !== session.user.artistId) {
      return NextResponse.json(
        { error: 'You can only delete your own artworks' },
        { status: 403 }
      )
    }

    await prisma.artwork.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting artwork:', error)
    return NextResponse.json(
      { error: 'Failed to delete artwork' },
      { status: 500 }
    )
  }
}
