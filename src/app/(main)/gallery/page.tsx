import { Suspense } from 'react'
import { Metadata } from 'next'
import prisma from '@/lib/db'
import ArtworkGrid from '@/components/gallery/ArtworkGrid'
import ArtworkFilters from '@/components/gallery/ArtworkFilters'
import { PageSpinner } from '@/components/ui/Spinner'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Browse our curated collection of artworks from talented artists worldwide.',
}

interface GalleryPageProps {
  searchParams: {
    category?: string
    medium?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    search?: string
    page?: string
  }
}

async function getArtworks(searchParams: GalleryPageProps['searchParams']) {
  const { category, medium, minPrice, maxPrice, sort, search, page = '1' } = searchParams
  const pageSize = 12
  const currentPage = parseInt(page, 10)

  const where: any = {
    status: 'PUBLISHED',
  }

  if (category) where.category = category
  if (medium) where.medium = medium
  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = parseFloat(minPrice)
    if (maxPrice) where.price.lte = parseFloat(maxPrice)
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
    ]
  }

  const orderBy: any = {}
  switch (sort) {
    case 'oldest':
      orderBy.createdAt = 'asc'
      break
    case 'price_low':
      orderBy.price = 'asc'
      break
    case 'price_high':
      orderBy.price = 'desc'
      break
    case 'popular':
      orderBy.views = 'desc'
      break
    default:
      orderBy.createdAt = 'desc'
  }

  const [artworks, total] = await Promise.all([
    prisma.artwork.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
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
    }),
    prisma.artwork.count({ where }),
  ])

  return {
    artworks,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage,
  }
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const { artworks, total, totalPages, currentPage } = await getArtworks(searchParams)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
          Art Gallery
        </h1>
        <p className="text-gray-600">
          {total.toLocaleString()} artworks available
        </p>
      </div>

      {/* Filters */}
      <Suspense fallback={null}>
        <ArtworkFilters />
      </Suspense>

      {/* Grid */}
      <ArtworkGrid artworks={artworks as any} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1
            return (
              <a
                key={page}
                href={`?${new URLSearchParams({
                  ...searchParams,
                  page: page.toString(),
                }).toString()}`}
                className={`px-4 py-2 rounded-lg ${
                  page === currentPage
                    ? 'bg-gallery-accent text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
