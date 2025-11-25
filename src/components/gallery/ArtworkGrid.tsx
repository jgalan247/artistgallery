'use client'

import { ArtworkWithArtist } from '@/types'
import ArtworkCard from './ArtworkCard'
import { PageSpinner } from '@/components/ui/Spinner'

interface ArtworkGridProps {
  artworks: ArtworkWithArtist[]
  isLoading?: boolean
  emptyMessage?: string
  columns?: 2 | 3 | 4
}

export default function ArtworkGrid({
  artworks,
  isLoading = false,
  emptyMessage = 'No artworks found',
  columns = 3,
}: ArtworkGridProps) {
  if (isLoading) {
    return <PageSpinner />
  }

  if (!artworks.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    )
  }

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {artworks.map((artwork, index) => (
        <ArtworkCard
          key={artwork.id}
          artwork={artwork}
          priority={index < 6}
        />
      ))}
    </div>
  )
}
