import { getServerSession } from 'next-auth'
import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Edit, Eye, Trash2 } from 'lucide-react'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { formatPrice, formatDateShort } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export const metadata: Metadata = {
  title: 'My Artworks',
  description: 'Manage your artwork collection',
}

export default async function ArtworksPage() {
  const session = await getServerSession(authOptions)
  const artistId = session?.user?.artistId

  const artworks = await prisma.artwork.findMany({
    where: { artistId },
    orderBy: { createdAt: 'desc' },
  })

  const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
    DRAFT: 'warning',
    PUBLISHED: 'success',
    SOLD: 'info' as any,
    ARCHIVED: 'default',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Artworks</h1>
          <p className="text-gray-600">{artworks.length} total artworks</p>
        </div>
        <Link href="/dashboard/artworks/new">
          <Button leftIcon={<Plus className="w-5 h-5" />}>Add Artwork</Button>
        </Link>
      </div>

      {artworks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No artworks yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start by adding your first artwork to your gallery.
          </p>
          <Link href="/dashboard/artworks/new">
            <Button>Add Your First Artwork</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artwork
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {artworks.map((artwork) => (
                <tr key={artwork.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {artwork.images[0] && (
                          <img
                            src={artwork.images[0]}
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {artwork.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {artwork.category || 'Uncategorized'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {formatPrice(artwork.price)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariants[artwork.status]}>
                      {artwork.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{artwork.views}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatDateShort(artwork.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/artwork/${artwork.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        target="_blank"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/artworks/${artwork.id}`}
                        className="p-2 text-gray-400 hover:text-gallery-accent transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
