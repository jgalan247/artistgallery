import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { processCheckoutCompletion } from '@/lib/sumup'
import {
  sendOrderConfirmationEmail,
  sendArtistSaleNotificationEmail,
} from '@/lib/email'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')
    const checkoutId = searchParams.get('checkout_id')

    if (!reference) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/cart?error=missing_reference`
      )
    }

    // Find the pending order
    const order = await prisma.order.findUnique({
      where: { id: reference },
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
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/cart?error=order_not_found`
      )
    }

    // If we have a checkout ID, verify the payment with SumUp
    if (checkoutId) {
      const result = await processCheckoutCompletion(checkoutId)

      if (result.success) {
        // Update order status
        await prisma.order.update({
          where: { id: reference },
          data: {
            status: 'PAID',
            notes: JSON.stringify({
              ...JSON.parse(order.notes || '{}'),
              sumupCheckoutId: checkoutId,
              sumupTransactionId: result.transactionId,
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
              totalEarnings: { increment: item.price * 0.9 }, // 90% to artist
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

        // Send to artists
        for (const item of order.items) {
          await sendArtistSaleNotificationEmail(item.artwork.artist.user.email!, {
            artworkTitle: item.artwork.title,
            price: item.price,
            buyerName: order.user.name || 'A collector',
            orderId: order.id,
          })
        }

        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${reference}`
        )
      } else {
        // Payment failed
        await prisma.order.update({
          where: { id: reference },
          data: { status: 'CANCELLED' },
        })

        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/cart?error=payment_failed`
        )
      }
    }

    // No checkout ID, payment was cancelled
    await prisma.order.update({
      where: { id: reference },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/cart?error=payment_cancelled`
    )
  } catch (error) {
    console.error('Checkout callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/cart?error=processing_error`
    )
  }
}
