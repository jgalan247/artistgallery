import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartState, ArtworkWithArtist } from '@/types'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (artwork: ArtworkWithArtist, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.artworkId === artwork.id)

          if (existingItem) {
            // For art, typically quantity stays at 1 (unique pieces)
            return {
              items: state.items.map((item) =>
                item.artworkId === artwork.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }

          return {
            items: [...state.items, { artworkId: artwork.id, artwork, quantity }],
          }
        })
      },

      removeItem: (artworkId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.artworkId !== artworkId),
        }))
      },

      updateQuantity: (artworkId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(artworkId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.artworkId === artworkId ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.artwork.price * item.quantity, 0)
      },

      getItemCount: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'artist-gallery-cart',
    }
  )
)
