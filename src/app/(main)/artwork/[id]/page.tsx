import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import prisma from '@/lib/db'
import ArtworkDetail from '@/components/gallery/ArtworkDetail'

interface ArtworkPageProps {
  params: { id: string }
}

export async function generateMetadata({
  params,
}: ArtworkPageProps): Promise<Metadata> {
  const artwork = await prisma.artwork.findUnique({
    where: { id: params.id },
    include: {
      artist: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
  })

  if (!artwork) {
    return { title: 'Artwork Not Found' }
  }

  return {
    title: artwork.title,
    description: artwork.description || `${artwork.title} by ${artwork.artist.user.name}`,
    openGraph: {
      title: artwork.title,
      description: artwork.description || `View ${artwork.title} on Artist Gallery`,
      images: artwork.images[0] ? [{ url: artwork.images[0] }] : [],
    },
  }
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const artwork = await prisma.artwork.findUnique({
    where: { id: params.id },
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
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          favorites: true,
          reviews: true,
        },
      },
    },
  })

  if (!artwork) {
    notFound()
  }

  // Increment views
  await prisma.artwork.update({
    where: { id: params.id },
    data: { views: { increment: 1 } },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ArtworkDetail artwork={artwork as any} />
    </div>
  )
}
