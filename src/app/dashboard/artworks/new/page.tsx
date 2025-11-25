'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { artworkCategories, artworkMediums } from '@/lib/utils'
import toast from 'react-hot-toast'

const artworkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  medium: z.string().optional(),
  dimensions: z.string().optional(),
  year: z.string().optional(),
  edition: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
})

type ArtworkFormData = z.infer<typeof artworkSchema>

export default function NewArtworkPage() {
  const router = useRouter()
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ArtworkFormData>({
    resolver: zodResolver(artworkSchema),
    defaultValues: {
      status: 'DRAFT',
    },
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // In a real app, you'd upload to Cloudinary or similar
    // For now, we'll use placeholder URLs
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ArtworkFormData) => {
    if (images.length === 0) {
      toast.error('Please add at least one image')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price),
          year: data.year ? parseInt(data.year, 10) : undefined,
          images,
          tags: data.tags
            ? data.tags.split(',').map((t) => t.trim())
            : [],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create artwork')
      }

      toast.success('Artwork created successfully!')
      router.push('/dashboard/artworks')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const categoryOptions = [
    { value: '', label: 'Select category' },
    ...artworkCategories.map((cat) => ({ value: cat, label: cat })),
  ]

  const mediumOptions = [
    { value: '', label: 'Select medium' },
    ...artworkMediums.map((med) => ({ value: med, label: med })),
  ]

  return (
    <div className="max-w-3xl">
      <Link
        href="/dashboard/artworks"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gallery-accent mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Artworks
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Artwork</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Images */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Images</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gallery-accent transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Upload</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Upload high-quality images. First image will be the cover.
          </p>
        </Card>

        {/* Basic Info */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <Input
              label="Title"
              placeholder="Enter artwork title"
              error={errors.title?.message}
              {...register('title')}
            />

            <Textarea
              label="Description"
              placeholder="Describe your artwork..."
              rows={4}
              {...register('description')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price (USD)"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.price?.message}
                {...register('price')}
              />

              <Select
                label="Category"
                options={categoryOptions}
                {...register('category')}
              />
            </div>
          </div>
        </Card>

        {/* Details */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Medium"
              options={mediumOptions}
              {...register('medium')}
            />

            <Input
              label="Dimensions"
              placeholder="e.g., 24 x 36 inches"
              {...register('dimensions')}
            />

            <Input
              label="Year"
              type="number"
              placeholder="2024"
              {...register('year')}
            />

            <Input
              label="Edition"
              placeholder="e.g., 1 of 10"
              {...register('edition')}
            />
          </div>

          <div className="mt-4">
            <Input
              label="Tags"
              placeholder="abstract, modern, colorful (comma separated)"
              helperText="Add tags to help collectors find your work"
              {...register('tags')}
            />
          </div>
        </Card>

        {/* Publishing */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Publishing</h2>
          <Select
            label="Status"
            options={[
              { value: 'DRAFT', label: 'Save as Draft' },
              { value: 'PUBLISHED', label: 'Publish Now' },
            ]}
            {...register('status')}
          />
          <p className="text-sm text-gray-500 mt-2">
            Draft artworks won&apos;t be visible to collectors until published.
          </p>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            Create Artwork
          </Button>
          <Link href="/dashboard/artworks">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
