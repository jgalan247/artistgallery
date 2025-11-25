import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  favoriteIds: string[]
  addFavorite: (artworkId: string) => void
  removeFavorite: (artworkId: string) => void
  toggleFavorite: (artworkId: string) => void
  isFavorite: (artworkId: string) => boolean
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      addFavorite: (artworkId: string) => {
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(artworkId)
            ? state.favoriteIds
            : [...state.favoriteIds, artworkId],
        }))
      },

      removeFavorite: (artworkId: string) => {
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((id) => id !== artworkId),
        }))
      },

      toggleFavorite: (artworkId: string) => {
        const { favoriteIds, addFavorite, removeFavorite } = get()
        if (favoriteIds.includes(artworkId)) {
          removeFavorite(artworkId)
        } else {
          addFavorite(artworkId)
        }
      },

      isFavorite: (artworkId: string) => {
        return get().favoriteIds.includes(artworkId)
      },

      clearFavorites: () => {
        set({ favoriteIds: [] })
      },
    }),
    {
      name: 'artist-gallery-favorites',
    }
  )
)
