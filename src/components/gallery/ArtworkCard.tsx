'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useFavoritesStore } from '@/store/favorites'
import { formatPrice } from '@/lib/utils'
import { ArtworkWithArtist } from '@/types'
import toast from 'react-hot-toast'

interface ArtworkCardProps {
  artwork: ArtworkWithArtist
  priority?: boolean
}

export default function ArtworkCard({ artwork, priority = false }: ArtworkCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const addToCart = useCartStore((state) => state.addItem)
  const { isFavorite, toggleFavorite } = useFavoritesStore()
  const isFav = isFavorite(artwork.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(artwork)
    toast.success('Added to cart!')
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(artwork.id)
    toast.success(isFav ? 'Removed from favorites' : 'Added to favorites')
  }

  const imageUrl = artwork.images[0] || '/images/placeholder-artwork.jpg'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/artwork/${artwork.id}`}>
        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={artwork.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Actions */}
          <div
            className={`absolute top-4 right-4 flex flex-col gap-2 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}
          >
            <button
              onClick={handleToggleFavorite}
              className={`p-2.5 rounded-full transition-colors ${
                isFav
                  ? 'bg-gallery-accent text-white'
                  : 'bg-white/90 text-gray-700 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleAddToCart}
              className="p-2.5 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>

          {/* Quick View */}
          <div
            className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <button className="w-full py-2.5 bg-white rounded-lg font-medium text-gray-900 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
              <Eye className="w-4 h-4" />
              Quick View
            </button>
          </div>

          {/* Sale Badge */}
          {artwork.originalPrice && artwork.originalPrice > artwork.price && (
            <div className="absolute top-4 left-4 px-2.5 py-1 bg-gallery-accent text-white text-xs font-medium rounded-full">
              Sale
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-gray-900 line-clamp-1">
              {artwork.title}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              {artwork.views}
            </div>
          </div>

          <Link
            href={`/artist/${artwork.artist.id}`}
            className="text-sm text-gray-500 hover:text-gallery-accent transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {artwork.artist.user.name}
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              {formatPrice(artwork.price)}
            </span>
            {artwork.originalPrice && artwork.originalPrice > artwork.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(artwork.originalPrice)}
              </span>
            )}
          </div>

          {artwork.medium && (
            <p className="text-xs text-gray-400">{artwork.medium}</p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
