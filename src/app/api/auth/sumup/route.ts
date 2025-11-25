import { NextResponse } from 'next/server'
import { getAuthorizationUrl, exchangeCodeForToken } from '@/lib/sumup'
import { randomBytes } from 'crypto'

// Initiate SumUp OAuth flow
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  // Handle OAuth callback
  if (searchParams.has('code')) {
    return handleOAuthCallback(request)
  }

  // Initiate OAuth flow
  if (action === 'connect') {
    const state = randomBytes(16).toString('hex')

    // In production, store state in session/cookie for verification
    const authUrl = getAuthorizationUrl(state)

    return NextResponse.redirect(authUrl)
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

async function handleOAuthCallback(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    console.error('SumUp OAuth error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=oauth_failed`
    )
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=no_code`
    )
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForToken(code)

    // In production, store tokens securely (encrypted in database)
    console.log('SumUp OAuth successful, tokens received')

    // Store refresh token in environment or database for future use
    // For now, we'll just redirect with success

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=sumup_connected`
    )
  } catch (err) {
    console.error('Failed to exchange OAuth code:', err)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=token_exchange_failed`
    )
  }
}
