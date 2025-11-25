import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import Providers from './providers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Artist Gallery - Discover & Collect Extraordinary Art',
    template: '%s | Artist Gallery',
  },
  description:
    'Discover and collect extraordinary art from talented artists around the world. Browse paintings, sculptures, photography, and more.',
  keywords: [
    'art',
    'gallery',
    'paintings',
    'artwork',
    'artists',
    'buy art',
    'contemporary art',
    'art marketplace',
  ],
  authors: [{ name: 'Artist Gallery' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://artistgallery.com',
    siteName: 'Artist Gallery',
    title: 'Artist Gallery - Discover & Collect Extraordinary Art',
    description:
      'Discover and collect extraordinary art from talented artists around the world.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Artist Gallery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artist Gallery',
    description: 'Discover and collect extraordinary art from talented artists.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a2e',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#e94560',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
