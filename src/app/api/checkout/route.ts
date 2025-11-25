import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { createCheckoutSession } from '@/lib/sumup'

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      artworkId: z.string(),
      quantity: z.number().int().positive().default(1),
    })
  ).min(1),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Please sign in to checkout' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items } = checkoutSchema.parse(body)

    // Fetch artworks
    const artworkIds = items.map((item) => item.artworkId)
    const artworks = await prisma.artwork.findMany({
      where: {
        id: { in: artworkIds },
        status: 'PUBLISHED',
      },
      include: {
        artist: true,
      },
    })

    if (artworks.length !== items.length) {
      return NextResponse.json(
        { error: 'Some items are no longer available' },
        { status: 400 }
      )
    }

    // Build checkout items
    const checkoutItems = items.map((item) => {
      const artwork = artworks.find((a) => a.id === item.artworkId)!
      return {
        artworkId: artwork.id,
        title: artwork.title,
        price: artwork.price,
        quantity: item.quantity,
      }
    })

    // Create SumUp checkout session
    const checkoutSession = await createCheckoutSession({
      items: checkoutItems,
      userId: session.user.id,
      customerEmail: session.user.email,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        artworkIds: artworkIds.join(','),
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid checkout data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
