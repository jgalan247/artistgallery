import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Protected dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const signInUrl = new URL('/login', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Check if user is an artist
    if (!token.artistId) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protected user routes
  if (pathname.startsWith('/orders') || pathname.startsWith('/profile')) {
    if (!token) {
      const signInUrl = new URL('/login', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/orders/:path*', '/profile/:path*'],
}
