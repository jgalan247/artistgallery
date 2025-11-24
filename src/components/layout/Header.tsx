'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useCartStore } from '@/store/cart'
import { useFavoritesStore } from '@/store/favorites'
import {
  Menu,
  X,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  LayoutDashboard,
  Search,
  Palette,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

export default function Header() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const cartItemCount = useCartStore((state) => state.getItemCount())
  const favoriteCount = useFavoritesStore((state) => state.favoriteIds.length)

  const navigation = [
    { name: 'Gallery', href: '/gallery' },
    { name: 'Artists', href: '/artists' },
    { name: 'Collections', href: '/collections' },
    { name: 'About', href: '/about' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Palette className="w-8 h-8 text-gallery-accent" />
            <span className="font-display text-xl font-semibold text-gallery-dark">
              Artist Gallery
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-gallery-accent transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <Link
              href="/search"
              className="p-2 text-gray-600 hover:text-gallery-accent transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Favorites */}
            <Link
              href="/favorites"
              className="relative p-2 text-gray-600 hover:text-gallery-accent transition-colors"
            >
              <Heart className="w-5 h-5" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gallery-accent text-white text-xs rounded-full flex items-center justify-center">
                  {favoriteCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-gallery-accent transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gallery-accent text-white text-xs rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2"
                >
                  <Avatar
                    src={session.user.image}
                    name={session.user.name || 'User'}
                    size="sm"
                  />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-20">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-medium text-gray-900">
                          {session.user.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {session.user.email}
                        </p>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>

                      {session.user.artistId && (
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Artist Dashboard
                        </Link>
                      )}

                      <Link
                        href="/orders"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        My Orders
                      </Link>

                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Join</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden border-t border-gray-100 bg-white',
          isMenuOpen ? 'block' : 'hidden'
        )}
      >
        <div className="px-4 py-4 space-y-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block py-2 text-gray-600 hover:text-gallery-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          {!session && (
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full">Join</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
