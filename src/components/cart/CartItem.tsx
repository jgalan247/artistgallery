'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { CartItem as CartItemType } from '@/types'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCartStore()
  const { artwork, quantity } = item

  const imageUrl = artwork.images[0] || '/images/placeholder-artwork.jpg'

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100">
      {/* Image */}
      <Link
        href={`/artwork/${artwork.id}`}
        className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
      >
        <Image
          src={imageUrl}
          alt={artwork.title}
          fill
          className="object-cover"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/artwork/${artwork.id}`}
          className="font-medium text-gray-900 hover:text-gallery-accent transition-colors line-clamp-1"
        >
          {artwork.title}
        </Link>
        <Link
          href={`/artist/${artwork.artist.id}`}
          className="text-sm text-gray-500 hover:text-gallery-accent transition-colors"
        >
          by {artwork.artist.user.name}
        </Link>

        <div className="mt-2 flex items-center gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={() => updateQuantity(artwork.id, quantity - 1)}
              className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-medium">{quantity}</span>
            <button
              onClick={() => updateQuantity(artwork.id, quantity + 1)}
              className="p-1.5 text-gray-500 hover:text-gray-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => removeItem(artwork.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="text-right">
        <p className="font-semibold text-gray-900">
          {formatPrice(artwork.price * quantity)}
        </p>
        {quantity > 1 && (
          <p className="text-sm text-gray-500">
            {formatPrice(artwork.price)} each
          </p>
        )}
      </div>
    </div>
  )
}
