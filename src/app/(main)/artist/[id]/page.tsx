import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { Instagram, Twitter, Globe, MapPin } from 'lucide-react'
import prisma from '@/lib/db'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import ArtworkGrid from '@/components/gallery/ArtworkGrid'

interface ArtistPageProps {
  params: { id: string }
}

export async function generateMetadata({
  params,
}: ArtistPageProps): Promise<Metadata> {
  const artist = await prisma.artist.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true } } },
  })

  if (!artist) {
    return { title: 'Artist Not Found' }
  }

  return {
    title: artist.user.name,
    description: artist.bio || `View artworks by ${artist.user.name}`,
  }
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const artist = await prisma.artist.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      artworks: {
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        include: {
          artist: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          artworks: {
            where: { status: 'PUBLISHED' },
          },
        },
      },
    },
  })

  if (!artist) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Artist Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar
            src={artist.user.image}
            name={artist.user.name || 'Artist'}
            size="xl"
            className="w-24 h-24 md:w-32 md:h-32"
          />

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
                    {artist.user.name}
                  </h1>
                  {artist.verified && (
                    <Badge variant="success">Verified</Badge>
                  )}
                </div>
                {artist.location && (
                  <p className="text-gray-500 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {artist.location}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {artist.website && (
                  <a
                    href={artist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gallery-accent transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                )}
                {artist.instagram && (
                  <a
                    href={`https://instagram.com/${artist.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-pink-500 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {artist.twitter && (
                  <a
                    href={`https://twitter.com/${artist.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {artist.bio && (
              <p className="text-gray-600 mb-4">{artist.bio}</p>
            )}

            {artist.statement && (
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Artist Statement</h3>
                <p className="text-gray-600 text-sm">{artist.statement}</p>
              </div>
            )}

            <div className="flex gap-6 mt-4 text-sm">
              <div>
                <span className="font-semibold text-gray-900">
                  {artist._count.artworks}
                </span>{' '}
                <span className="text-gray-500">Artworks</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">
                  {artist.totalSales}
                </span>{' '}
                <span className="text-gray-500">Sales</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artist's Artworks */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Artworks by {artist.user.name}
        </h2>
        <ArtworkGrid
          artworks={artist.artworks as any}
          emptyMessage="No artworks available"
        />
      </div>
    </div>
  )
}
