'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X, ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { artworkCategories, artworkMediums } from '@/lib/utils'

interface ArtworkFiltersProps {
  showFilters?: boolean
}

export default function ArtworkFilters({ showFilters = true }: ArtworkFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const currentCategory = searchParams.get('category') || ''
  const currentMedium = searchParams.get('medium') || ''
  const currentMinPrice = searchParams.get('minPrice') || ''
  const currentMaxPrice = searchParams.get('maxPrice') || ''
  const currentSort = searchParams.get('sort') || 'newest'

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push(window.location.pathname)
  }

  const hasActiveFilters =
    currentCategory || currentMedium || currentMinPrice || currentMaxPrice

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
  ]

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...artworkCategories.map((cat) => ({ value: cat, label: cat })),
  ]

  const mediumOptions = [
    { value: '', label: 'All Mediums' },
    ...artworkMediums.map((med) => ({ value: med, label: med })),
  ]

  return (
    <div className="mb-8">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setIsOpen(!isOpen)}
            >
              Filters
              {hasActiveFilters && (
                <span className="ml-1 w-5 h-5 bg-gallery-accent text-white text-xs rounded-full flex items-center justify-center">
                  {[currentCategory, currentMedium, currentMinPrice, currentMaxPrice].filter(Boolean).length}
                </span>
              )}
            </Button>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gallery-accent flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <Select
            options={sortOptions}
            value={currentSort}
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      {/* Expanded Filters */}
      {isOpen && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Category"
              options={categoryOptions}
              value={currentCategory}
              onChange={(e) => updateFilters('category', e.target.value)}
            />

            <Select
              label="Medium"
              options={mediumOptions}
              value={currentMedium}
              onChange={(e) => updateFilters('medium', e.target.value)}
            />

            <Input
              label="Min Price ($)"
              type="number"
              placeholder="0"
              value={currentMinPrice}
              onChange={(e) => updateFilters('minPrice', e.target.value)}
            />

            <Input
              label="Max Price ($)"
              type="number"
              placeholder="10000"
              value={currentMaxPrice}
              onChange={(e) => updateFilters('maxPrice', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4">
          {currentCategory && (
            <FilterTag
              label={`Category: ${currentCategory}`}
              onRemove={() => updateFilters('category', '')}
            />
          )}
          {currentMedium && (
            <FilterTag
              label={`Medium: ${currentMedium}`}
              onRemove={() => updateFilters('medium', '')}
            />
          )}
          {(currentMinPrice || currentMaxPrice) && (
            <FilterTag
              label={`Price: $${currentMinPrice || '0'} - $${currentMaxPrice || '∞'}`}
              onRemove={() => {
                updateFilters('minPrice', '')
                updateFilters('maxPrice', '')
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}

function FilterTag({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gallery-dark text-white text-sm rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="ml-1 hover:text-gallery-accent transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  )
}
