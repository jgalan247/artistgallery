import { getServerSession } from 'next-auth'
import { Metadata } from 'next'
import Link from 'next/link'
import {
  DollarSign,
  Image,
  Package,
  Eye,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your artworks and sales',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const artistId = session?.user?.artistId

  const [artist, artworks, recentOrders, stats] = await Promise.all([
    prisma.artist.findUnique({
      where: { id: artistId },
      include: { user: true },
    }),
    prisma.artwork.findMany({
      where: { artistId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.orderItem.findMany({
      where: { artwork: { artistId } },
      include: {
        order: {
          include: { user: true },
        },
        artwork: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.artwork.aggregate({
      where: { artistId },
      _sum: { views: true },
      _count: true,
    }),
  ])

  const totalViews = stats._sum.views || 0
  const totalArtworks = stats._count || 0

  const statCards = [
    {
      title: 'Total Earnings',
      value: formatPrice(artist?.totalEarnings || 0),
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Sales',
      value: artist?.totalSales || 0,
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Artworks',
      value: totalArtworks,
      icon: Image,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {artist?.user.name}
        </h1>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening with your gallery
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title} padding="md">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Artworks */}
        <Card padding="none">
          <CardHeader className="px-6 pt-6">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Artworks</CardTitle>
              <Link
                href="/dashboard/artworks"
                className="text-sm text-gallery-accent hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {artworks.length === 0 ? (
              <p className="text-gray-500 py-4">No artworks yet</p>
            ) : (
              <div className="space-y-3">
                {artworks.map((artwork) => (
                  <Link
                    key={artwork.id}
                    href={`/dashboard/artworks/${artwork.id}`}
                    className="flex items-center gap-4 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                      {artwork.images[0] && (
                        <img
                          src={artwork.images[0]}
                          alt={artwork.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {artwork.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(artwork.price)} · {artwork.status}
                      </p>
                    </div>
                    <div className="text-sm text-gray-400 flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {artwork.views}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card padding="none">
          <CardHeader className="px-6 pt-6">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Sales</CardTitle>
              <Link
                href="/dashboard/orders"
                className="text-sm text-gallery-accent hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 py-4">No sales yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-2 -mx-2 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                      {item.artwork.images[0] && (
                        <img
                          src={item.artwork.images[0]}
                          alt={item.artwork.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.artwork.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.order.user.name || 'Anonymous'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        +{formatPrice(item.price * 0.9)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
