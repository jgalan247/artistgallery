import prisma from './db'

// SumUp OAuth Configuration
const SUMUP_API_URL = 'https://api.sumup.com'
const SUMUP_AUTH_URL = 'https://api.sumup.com/authorize'
const SUMUP_TOKEN_URL = 'https://api.sumup.com/token'

interface SumUpTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

interface SumUpCheckout {
  id: string
  checkout_reference: string
  amount: number
  currency: string
  pay_to_email: string
  merchant_code: string
  description: string
  status: string
  date: string
  valid_until: string
  transactions?: SumUpTransaction[]
}

interface SumUpTransaction {
  id: string
  transaction_code: string
  amount: number
  currency: string
  timestamp: string
  status: string
  payment_type: string
  entry_mode: string
  merchant_code: string
}

// Token storage in memory (in production, use Redis or database)
let tokenCache: {
  accessToken: string
  refreshToken: string
  expiresAt: number
} | null = null

/**
 * Get OAuth authorization URL for SumUp
 */
export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SUMUP_CLIENT_ID!,
    redirect_uri: process.env.SUMUP_REDIRECT_URI!,
    scope: 'payments user.app-settings transactions.history',
    state,
  })

  return `${SUMUP_AUTH_URL}?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<SumUpTokenResponse> {
  const response = await fetch(SUMUP_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.SUMUP_CLIENT_ID!,
      client_secret: process.env.SUMUP_CLIENT_SECRET!,
      code,
      redirect_uri: process.env.SUMUP_REDIRECT_URI!,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code: ${error}`)
  }

  const data: SumUpTokenResponse = await response.json()

  // Cache the tokens
  tokenCache = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return data
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken?: string): Promise<string> {
  const tokenToUse = refreshToken || tokenCache?.refreshToken || process.env.SUMUP_REFRESH_TOKEN

  if (!tokenToUse) {
    throw new Error('No refresh token available')
  }

  const response = await fetch(SUMUP_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.SUMUP_CLIENT_ID!,
      client_secret: process.env.SUMUP_CLIENT_SECRET!,
      refresh_token: tokenToUse,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  const data: SumUpTokenResponse = await response.json()

  // Update cache
  tokenCache = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return data.access_token
}

/**
 * Get valid access token (refresh if expired)
 */
export async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60000) {
    return tokenCache.accessToken
  }

  // Try to refresh the token
  return refreshAccessToken()
}

/**
 * Create a SumUp checkout
 */
export async function createCheckout(params: {
  amount: number
  currency?: string
  checkoutReference: string
  description: string
  returnUrl: string
  merchantCode?: string
}): Promise<SumUpCheckout> {
  const accessToken = await getAccessToken()

  const response = await fetch(`${SUMUP_API_URL}/v0.1/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      checkout_reference: params.checkoutReference,
      amount: params.amount,
      currency: params.currency || 'GBP',
      pay_to_email: process.env.SUMUP_MERCHANT_EMAIL,
      merchant_code: params.merchantCode || process.env.SUMUP_MERCHANT_CODE,
      description: params.description,
      return_url: params.returnUrl,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create checkout: ${error}`)
  }

  return response.json()
}

/**
 * Get checkout status
 */
export async function getCheckout(checkoutId: string): Promise<SumUpCheckout> {
  const accessToken = await getAccessToken()

  const response = await fetch(`${SUMUP_API_URL}/v0.1/checkouts/${checkoutId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get checkout: ${error}`)
  }

  return response.json()
}

/**
 * Process checkout completion (called after redirect from SumUp)
 */
export async function processCheckoutCompletion(checkoutId: string): Promise<{
  success: boolean
  checkout: SumUpCheckout
  transactionId?: string
}> {
  const checkout = await getCheckout(checkoutId)

  const success = checkout.status === 'PAID'
  const transactionId = checkout.transactions?.[0]?.transaction_code

  return {
    success,
    checkout,
    transactionId,
  }
}

/**
 * Get transaction history
 */
export async function getTransactions(params?: {
  limit?: number
  offset?: number
}): Promise<SumUpTransaction[]> {
  const accessToken = await getAccessToken()

  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.set('limit', params.limit.toString())
  if (params?.offset) queryParams.set('offset', params.offset.toString())

  const response = await fetch(
    `${SUMUP_API_URL}/v0.1/me/transactions/history?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get transactions: ${error}`)
  }

  const data = await response.json()
  return data.items || []
}

/**
 * Refund a transaction
 */
export async function refundTransaction(transactionId: string, amount?: number): Promise<boolean> {
  const accessToken = await getAccessToken()

  const body: Record<string, any> = {}
  if (amount) {
    body.amount = amount
  }

  const response = await fetch(
    `${SUMUP_API_URL}/v0.1/me/refund/${transactionId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refund transaction: ${error}`)
  }

  return true
}

/**
 * Generate checkout URL for redirect
 */
export function getCheckoutUrl(checkoutId: string): string {
  return `https://pay.sumup.com/b2c/Q${checkoutId}`
}

/**
 * Create checkout session for cart items
 */
export interface CreateCheckoutSessionParams {
  items: Array<{
    artworkId: string
    title: string
    price: number
    quantity: number
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
  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Generate unique checkout reference
  const checkoutReference = `AG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  // Create description from items
  const description = items.length === 1
    ? items[0].title
    : `${items.length} artworks from Artist Gallery`

  // Store checkout metadata in database for retrieval after payment
  await prisma.order.create({
    data: {
      id: checkoutReference,
      userId,
      status: 'PENDING',
      subtotal: totalAmount,
      tax: 0,
      shipping: 0,
      total: totalAmount,
      shippingEmail: customerEmail,
      notes: JSON.stringify({
        items: items.map(i => ({ artworkId: i.artworkId, price: i.price, quantity: i.quantity })),
        metadata,
        successUrl,
        cancelUrl,
      }),
      items: {
        create: items.map((item) => ({
          artworkId: item.artworkId,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    },
  })

  // Create SumUp checkout
  const checkout = await createCheckout({
    amount: totalAmount,
    checkoutReference,
    description,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/callback?reference=${checkoutReference}`,
  })

  return {
    checkoutId: checkout.id,
    checkoutReference,
    url: getCheckoutUrl(checkout.id),
  }
}
