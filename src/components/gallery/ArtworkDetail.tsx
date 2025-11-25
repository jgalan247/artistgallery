'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  ShoppingCart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  Truck,
  Shield,
  RotateCcw,
} from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useFavoritesStore } from '@/store/favorites'
import { formatPrice, formatDate } from '@/lib/utils'
import { ArtworkWithDetails } from '@/types'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import toast from 'react-hot-toast'

interface ArtworkDetailProps {
  artwork: ArtworkWithDetails
}

export default function ArtworkDetail({ artwork }: ArtworkDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const addToCart = useCartStore((state) => state.addItem)
  const { isFavorite, toggleFavorite } = useFavoritesStore()
  const isFav = isFavorite(artwork.id)

  const images = artwork.images.length > 0 ? artwork.images : ['/images/placeholder-artwork.jpg']

  const handleAddToCart = () => {
    addToCart(artwork as any)
    toast.success('Added to cart!')
  }

  const handleToggleFavorite = () => {
    toggleFavorite(artwork.id)
    toast.success(isFav ? 'Removed from favorites' : 'Added to favorites')
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: artwork.title,
        text: `Check out "${artwork.title}" by ${artwork.artist.user.name}`,
        url: window.location.href,
      })
    } catch {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full"
            >
              <Image
                src={images[currentImageIndex]}
                alt={artwork.title}
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                  index === currentImageIndex
                    ? 'border-gallery-accent'
                    : 'border-transparent'
                }`}
              >
                <Image
                  src={image}
                  alt={`${artwork.title} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-6">
        {/* Category & Status */}
        <div className="flex items-center gap-2">
          {artwork.category && <Badge>{artwork.category}</Badge>}
          {artwork.status === 'SOLD' && <Badge variant="danger">Sold</Badge>}
          {artwork.featured && <Badge variant="success">Featured</Badge>}
        </div>

        {/* Title & Artist */}
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            {artwork.title}
          </h1>
          <Link
            href={`/artist/${artwork.artist.id}`}
            className="flex items-center gap-3 group"
          >
            <Avatar
              src={artwork.artist.user.image}
              name={artwork.artist.user.name || 'Artist'}
              size="md"
            />
            <div>
              <p className="font-medium text-gray-900 group-hover:text-gallery-accent transition-colors">
                {artwork.artist.user.name}
              </p>
              {artwork.artist.location && (
                <p className="text-sm text-gray-500">{artwork.artist.location}</p>
              )}
            </div>
          </Link>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(artwork.price)}
          </span>
          {artwork.originalPrice && artwork.originalPrice > artwork.price && (
            <span className="text-xl text-gray-400 line-through">
              {formatPrice(artwork.originalPrice)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            leftIcon={<ShoppingCart className="w-5 h-5" />}
            onClick={handleAddToCart}
            disabled={artwork.status === 'SOLD'}
            className="flex-1"
          >
            {artwork.status === 'SOLD' ? 'Sold Out' : 'Add to Cart'}
          </Button>
          <Button
            variant={isFav ? 'primary' : 'outline'}
            size="lg"
            onClick={handleToggleFavorite}
          >
            <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
          </Button>
          <Button variant="outline" size="lg" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100">
          <div className="flex flex-col items-center text-center">
            <Truck className="w-6 h-6 text-gallery-accent mb-2" />
            <span className="text-xs text-gray-600">Free Shipping</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Shield className="w-6 h-6 text-gallery-accent mb-2" />
            <span className="text-xs text-gray-600">Secure Payment</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <RotateCcw className="w-6 h-6 text-gallery-accent mb-2" />
            <span className="text-xs text-gray-600">14-Day Returns</span>
          </div>
        </div>

        {/* Description */}
        {artwork.description && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-line">{artwork.description}</p>
          </div>
        )}

        {/* Details */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {artwork.medium && (
              <>
                <dt className="text-gray-500">Medium</dt>
                <dd className="text-gray-900">{artwork.medium}</dd>
              </>
            )}
            {artwork.dimensions && (
              <>
                <dt className="text-gray-500">Dimensions</dt>
                <dd className="text-gray-900">{artwork.dimensions}</dd>
              </>
            )}
            {artwork.year && (
              <>
                <dt className="text-gray-500">Year</dt>
                <dd className="text-gray-900">{artwork.year}</dd>
              </>
            )}
            {artwork.edition && (
              <>
                <dt className="text-gray-500">Edition</dt>
                <dd className="text-gray-900">{artwork.edition}</dd>
              </>
            )}
          </dl>
        </div>

        {/* Tags */}
        {artwork.tags.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {artwork.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/gallery?search=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
