import { User, Artist, Artwork, Order, OrderItem, Review, Collection } from '@prisma/client'

// Extended types with relations
export type UserWithArtist = User & {
  artist?: Artist | null
}

export type ArtistWithUser = Artist & {
  user: User
}

export type ArtworkWithArtist = Artwork & {
  artist: ArtistWithUser
}

export type ArtworkWithDetails = Artwork & {
  artist: ArtistWithUser
  reviews: ReviewWithUser[]
  _count?: {
    favorites: number
    reviews: number
  }
}

export type ReviewWithUser = Review & {
  user: Pick<User, 'id' | 'name' | 'image'>
}

export type OrderWithItems = Order & {
  items: (OrderItem & {
    artwork: Artwork
  })[]
}

export type CollectionWithArtworks = Collection & {
  artworks: {
    artwork: Artwork
  }[]
}

// Cart types
export interface CartItem {
  artworkId: string
  artwork: ArtworkWithArtist
  quantity: number
}

export interface CartState {
  items: CartItem[]
  addItem: (artwork: ArtworkWithArtist, quantity?: number) => void
  removeItem: (artworkId: string) => void
  updateQuantity: (artworkId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Filter types
export interface ArtworkFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  medium?: string
  artistId?: string
  search?: string
  sortBy?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'popular'
}

// Form types
export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  isArtist?: boolean
}

export interface LoginFormData {
  email: string
  password: string
}

export interface ArtworkFormData {
  title: string
  description?: string
  price: number
  images: string[]
  medium?: string
  dimensions?: string
  year?: number
  edition?: string
  category?: string
  tags: string[]
  status: 'DRAFT' | 'PUBLISHED'
}

export interface ArtistProfileFormData {
  bio?: string
  statement?: string
  website?: string
  instagram?: string
  twitter?: string
  location?: string
}

export interface ShippingFormData {
  name: string
  email: string
  phone?: string
  address: string
  city: string
  state: string
  zip: string
  country: string
}

// Session types (extends NextAuth)
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
      artistId?: string
    }
  }

  interface User {
    role: string
    artistId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    artistId?: string
  }
}
