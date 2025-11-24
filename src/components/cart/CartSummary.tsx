'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/store/cart'
import { formatPrice, calculateTax } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function CartSummary() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, getTotal } = useCartStore()
  const [promoCode, setPromoCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const subtotal = getTotal()
  const tax = calculateTax(subtotal)
  const shipping = subtotal > 500 ? 0 : 15
  const total = subtotal + tax + shipping

  const handleCheckout = async () => {
    if (!session) {
      toast.error('Please sign in to continue')
      router.push('/login?callbackUrl=/cart')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            artworkId: item.artworkId,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      toast.error('Failed to proceed to checkout')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyPromo = () => {
    if (promoCode) {
      toast.error('Invalid promo code')
      setPromoCode('')
    }
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

      {/* Promo Code */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Promo code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          className="flex-1"
        />
        <Button variant="outline" onClick={handleApplyPromo}>
          Apply
        </Button>
      </div>

      {/* Totals */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Estimated Tax</span>
          <span className="text-gray-900">{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-gray-500">
            Free shipping on orders over $500
          </p>
        )}
      </div>

      <div className="border-t border-gray-200 mt-4 pt-4">
        <div className="flex justify-between text-base font-semibold">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">{formatPrice(total)}</span>
        </div>
      </div>

      <Button
        className="w-full mt-6"
        size="lg"
        onClick={handleCheckout}
        isLoading={isLoading}
        disabled={items.length === 0}
      >
        Proceed to Checkout
      </Button>

      {/* Trust Badges */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        Secure SSL Encrypted Payment
      </div>
    </div>
  )
}
