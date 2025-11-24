import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export interface CreateCheckoutSessionParams {
  items: Array<{
    artworkId: string
    title: string
    price: number
    image?: string
    quantity: number
    artistStripeAccountId?: string
  }>
  userId: string
  customerEmail: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

export async function createCheckoutSession({
  items,
  userId,
  customerEmail,
  successUrl,
  cancelUrl,
  metadata = {},
}: CreateCheckoutSessionParams) {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.title,
        images: item.image ? [item.image] : [],
        metadata: {
          artworkId: item.artworkId,
        },
      },
      unit_amount: Math.round(item.price * 100), // Convert to cents
    },
    quantity: item.quantity,
  }))

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      ...metadata,
    },
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: 1500, // $15.00
            currency: 'usd',
          },
          display_name: 'Standard Shipping',
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: 5,
            },
            maximum: {
              unit: 'business_day',
              value: 10,
            },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: 3500, // $35.00
            currency: 'usd',
          },
          display_name: 'Express Shipping',
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: 2,
            },
            maximum: {
              unit: 'business_day',
              value: 4,
            },
          },
        },
      },
    ],
  })

  return session
}

export async function createConnectedAccount(email: string, artistId: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    metadata: {
      artistId,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })

  return account
}

export async function createAccountLink(accountId: string, artistId: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?refresh=true`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=true`,
    type: 'account_onboarding',
  })

  return accountLink
}

export async function getAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId)

  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    requiresAction: !account.charges_enabled || !account.payouts_enabled,
  }
}

export async function createTransfer(
  amount: number,
  destinationAccountId: string,
  sourceTransactionId: string,
  metadata: Record<string, string> = {}
) {
  // Platform takes 10% commission
  const platformFee = Math.round(amount * 0.1)
  const artistPayout = amount - platformFee

  const transfer = await stripe.transfers.create({
    amount: artistPayout,
    currency: 'usd',
    destination: destinationAccountId,
    source_transaction: sourceTransactionId,
    metadata,
  })

  return { transfer, platformFee, artistPayout }
}

export async function constructWebhookEvent(body: string | Buffer, signature: string) {
  return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
}

export async function retrieveSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent', 'shipping_details'],
  })
}

export async function createRefund(paymentIntentId: string, amount?: number) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined, // Full refund if no amount specified
  })
}
