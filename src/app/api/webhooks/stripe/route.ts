import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import prisma from '@/lib/db'
import { constructWebhookEvent, retrieveSession } from '@/lib/stripe'
import {
  sendOrderConfirmationEmail,
  sendArtistSaleNotificationEmail,
} from '@/lib/email'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = await constructWebhookEvent(body, signature)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', paymentIntent.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const artworkIds = session.metadata?.artworkIds?.split(',') || []

  if (!userId || artworkIds.length === 0) {
    console.error('Missing metadata in checkout session')
    return
  }

  // Retrieve full session with line items
  const fullSession = await retrieveSession(session.id)
  const shippingDetails = fullSession.shipping_details

  // Fetch artworks
  const artworks = await prisma.artwork.findMany({
    where: { id: { in: artworkIds } },
    include: {
      artist: {
        include: {
          user: true,
        },
      },
    },
  })

  // Calculate totals
  const subtotal = artworks.reduce((sum, a) => sum + a.price, 0)
  const tax = subtotal * 0.08
  const shipping = fullSession.shipping_cost?.amount_total
    ? fullSession.shipping_cost.amount_total / 100
    : 15
  const total = subtotal + tax + shipping

  // Create order
  const order = await prisma.order.create({
    data: {
      userId,
      status: 'PAID',
      subtotal,
      tax,
      shipping,
      total,
      stripeSessionId: session.id,
      stripePaymentId: fullSession.payment_intent as string,
      shippingName: shippingDetails?.name,
      shippingAddress: shippingDetails?.address?.line1,
      shippingCity: shippingDetails?.address?.city,
      shippingState: shippingDetails?.address?.state,
      shippingZip: shippingDetails?.address?.postal_code,
      shippingCountry: shippingDetails?.address?.country,
      items: {
        create: artworks.map((artwork) => ({
          artworkId: artwork.id,
          price: artwork.price,
          quantity: 1,
        })),
      },
    },
    include: {
      user: true,
      items: {
        include: {
          artwork: true,
        },
      },
    },
  })

  // Update artwork status to SOLD
  await prisma.artwork.updateMany({
    where: { id: { in: artworkIds } },
    data: { status: 'SOLD' },
  })

  // Update artist stats
  for (const artwork of artworks) {
    await prisma.artist.update({
      where: { id: artwork.artistId },
      data: {
        totalSales: { increment: 1 },
        totalEarnings: { increment: artwork.price * 0.9 }, // 90% to artist
      },
    })
  }

  // Send confirmation emails
  const shippingAddress = [
    shippingDetails?.name,
    shippingDetails?.address?.line1,
    shippingDetails?.address?.line2,
    `${shippingDetails?.address?.city}, ${shippingDetails?.address?.state} ${shippingDetails?.address?.postal_code}`,
    shippingDetails?.address?.country,
  ]
    .filter(Boolean)
    .join('\n')

  // Send to buyer
  await sendOrderConfirmationEmail(order.user.email!, {
    orderId: order.id,
    items: order.items.map((item) => ({
      title: item.artwork.title,
      price: item.price,
      image: item.artwork.images[0],
    })),
    total: order.total,
    shippingAddress,
  })

  // Send to artists
  for (const artwork of artworks) {
    await sendArtistSaleNotificationEmail(artwork.artist.user.email!, {
      artworkTitle: artwork.title,
      price: artwork.price,
      buyerName: order.user.name || 'A collector',
      orderId: order.id,
    })
  }

  console.log('Order created:', order.id)
}
