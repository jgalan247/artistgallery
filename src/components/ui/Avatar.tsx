'use client'

import Image from 'next/image'
import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function Avatar({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  className,
}: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  }

  const imageSizes = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  }

  if (src) {
    return (
      <div
        className={cn(
          'relative rounded-full overflow-hidden bg-gray-200',
          sizes[size],
          className
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="object-cover w-full h-full"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-gallery-dark to-gallery-accent text-white font-semibold',
        sizes[size],
        className
      )}
    >
      {name ? getInitials(name) : '?'}
    </div>
  )
}
