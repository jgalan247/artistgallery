import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import {
  sendOrderConfirmationEmail,
  sendArtistSaleNotificationEmail,
} from '@/lib/email'

// SumUp webhook event types
interface SumUpWebhookEvent {
  event_type: string
  id: string
  timestamp: string
  payload: {
    checkout_reference?: string
    transaction_id?: string
    transaction_code?: string
    amount?: number
    currency?: string
    status?: string
    merchant_code?: string
  }
}

export async function POST(request: Request) {
  try {
    const body: SumUpWebhookEvent = await request.json()

    console.log('SumUp webhook received:', body.event_type)

    switch (body.event_type) {
      case 'CHECKOUT_COMPLETED':
      case 'TRANSACTION_COMPLETED':
        await handlePaymentCompleted(body)
        break

      case 'CHECKOUT_FAILED':
      case 'TRANSACTION_FAILED':
        await handlePaymentFailed(body)
        break

      case 'REFUND_COMPLETED':
        await handleRefundCompleted(body)
        break

      default:
        console.log('Unhandled webhook event:', body.event_type)
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

async function handlePaymentCompleted(event: SumUpWebhookEvent) {
  const checkoutReference = event.payload.checkout_reference

  if (!checkoutReference) {
    console.error('No checkout reference in webhook')
    return
  }

  // Find the order
  const order = await prisma.order.findUnique({
    where: { id: checkoutReference },
    include: {
      user: true,
      items: {
        include: {
          artwork: {
            include: {
              artist: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!order) {
    console.error('Order not found:', checkoutReference)
    return
  }

  // Check if already processed
  if (order.status === 'PAID') {
    console.log('Order already processed:', checkoutReference)
    return
  }

  // Update order status
  await prisma.order.update({
    where: { id: checkoutReference },
    data: {
      status: 'PAID',
      notes: JSON.stringify({
        ...JSON.parse(order.notes || '{}'),
        sumupTransactionId: event.payload.transaction_id || event.payload.transaction_code,
        webhookProcessedAt: new Date().toISOString(),
      }),
    },
  })

  // Update artwork status to SOLD
  const artworkIds = order.items.map((item) => item.artworkId)
  await prisma.artwork.updateMany({
    where: { id: { in: artworkIds } },
    data: { status: 'SOLD' },
  })

  // Update artist stats
  for (const item of order.items) {
    await prisma.artist.update({
      where: { id: item.artwork.artistId },
      data: {
        totalSales: { increment: 1 },
        totalEarnings: { increment: item.price * 0.9 },
      },
    })
  }

  // Send confirmation emails
  await sendOrderConfirmationEmail(order.user.email!, {
    orderId: order.id,
    items: order.items.map((item) => ({
      title: item.artwork.title,
      price: item.price,
      image: item.artwork.images[0],
    })),
    total: order.total,
    shippingAddress: [
      order.shippingName,
      order.shippingAddress,
      `${order.shippingCity}, ${order.shippingState} ${order.shippingZip}`,
      order.shippingCountry,
    ]
      .filter(Boolean)
      .join('\n'),
  })

  // Notify artists
  for (const item of order.items) {
    await sendArtistSaleNotificationEmail(item.artwork.artist.user.email!, {
      artworkTitle: item.artwork.title,
      price: item.price,
      buyerName: order.user.name || 'A collector',
      orderId: order.id,
    })
  }

  console.log('Order completed:', checkoutReference)
}

async function handlePaymentFailed(event: SumUpWebhookEvent) {
  const checkoutReference = event.payload.checkout_reference

  if (!checkoutReference) return

  await prisma.order.update({
    where: { id: checkoutReference },
    data: {
      status: 'CANCELLED',
      notes: JSON.stringify({
        failedAt: new Date().toISOString(),
        reason: 'Payment failed',
      }),
    },
  })

  console.log('Order cancelled due to payment failure:', checkoutReference)
}

async function handleRefundCompleted(event: SumUpWebhookEvent) {
  const transactionId = event.payload.transaction_id || event.payload.transaction_code

  if (!transactionId) return

  // Find order by transaction ID in notes
  const orders = await prisma.order.findMany({
    where: {
      notes: {
        contains: transactionId,
      },
    },
  })

  for (const order of orders) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'REFUNDED' },
    })
  }

  console.log('Refund processed for transaction:', transactionId)
}
