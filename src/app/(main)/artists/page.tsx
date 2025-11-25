import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ExternalLink } from 'lucide-react'
import prisma from '@/lib/db'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'

export const metadata: Metadata = {
  title: 'Artists',
  description: 'Discover talented artists from around the world',
}

export default async function ArtistsPage() {
  const artists = await prisma.artist.findMany({
    where: {
      artworks: {
        some: {
          status: 'PUBLISHED',
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          artworks: {
            where: { status: 'PUBLISHED' },
          },
        },
      },
      artworks: {
        where: { status: 'PUBLISHED' },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          images: true,
        },
      },
    },
    orderBy: { totalSales: 'desc' },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
          Featured Artists
        </h1>
        <p className="text-gray-600">
          Discover talented artists from around the world
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((artist) => (
          <Link
            key={artist.id}
            href={`/artist/${artist.id}`}
            className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Artwork Preview */}
            <div className="grid grid-cols-3 h-32">
              {artist.artworks.slice(0, 3).map((artwork, i) => (
                <div key={artwork.id} className="relative bg-gray-100">
                  {artwork.images[0] && (
                    <Image
                      src={artwork.images[0]}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
              ))}
              {artist.artworks.length < 3 &&
                [...Array(3 - artist.artworks.length)].map((_, i) => (
                  <div key={i} className="bg-gray-100" />
                ))}
            </div>

            {/* Artist Info */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar
                  src={artist.user.image}
                  name={artist.user.name || 'Artist'}
                  size="lg"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-gallery-accent transition-colors">
                    {artist.user.name}
                  </h3>
                  {artist.location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {artist.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="text-sm text-gray-600">
                    {artist._count.artworks} artworks
                  </span>
                  {artist.verified && (
                    <Badge variant="success" size="sm">
                      Verified
                    </Badge>
                  )}
                </div>
                {artist.totalSales > 0 && (
                  <span className="text-sm text-gray-500">
                    {artist.totalSales} sales
                  </span>
                )}
              </div>

              {artist.bio && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {artist.bio}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {artists.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">No artists found</p>
        </div>
      )}
    </div>
  )
}
