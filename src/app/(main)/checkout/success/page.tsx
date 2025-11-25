import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Thank you for your purchase',
}

interface SuccessPageProps {
  searchParams: { session_id?: string }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>

      <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
        Thank You for Your Order!
      </h1>

      <p className="text-gray-600 mb-8">
        Your order has been confirmed and you&apos;ll receive an email with the
        details shortly. The artist will be notified to prepare your artwork for
        shipping.
      </p>

      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-center gap-4 text-gray-600">
          <Package className="w-6 h-6" />
          <span>
            Estimated delivery: <strong>5-10 business days</strong>
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/orders">
          <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
            View My Orders
          </Button>
        </Link>
        <Link href="/gallery">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
