import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'

// GET - Get user's favorites
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Please sign in to view favorites' },
        { status: 401 }
      )
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        artwork: {
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
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(favorites.map((f) => f.artwork))
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

// POST - Add to favorites
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Please sign in to add favorites' },
        { status: 401 }
      )
    }

    const { artworkId } = await request.json()

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_artworkId: {
          userId: session.user.id,
          artworkId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        artworkId,
      },
    })

    return NextResponse.json(favorite)
  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

// DELETE - Remove from favorites
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Please sign in to remove favorites' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const artworkId = searchParams.get('artworkId')

    if (!artworkId) {
      return NextResponse.json(
        { error: 'Artwork ID is required' },
        { status: 400 }
      )
    }

    await prisma.favorite.delete({
      where: {
        userId_artworkId: {
          userId: session.user.id,
          artworkId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}
