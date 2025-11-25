import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 -mt-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. Perhaps
          you&apos;ve mistyped the URL or the page has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button leftIcon={<Home className="w-4 h-4" />}>Go Home</Button>
          </Link>
          <Link href="/gallery">
            <Button variant="outline" leftIcon={<Search className="w-4 h-4" />}>
              Browse Gallery
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
