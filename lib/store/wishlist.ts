import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto } from '@/types'

interface WishlistStore {
  items: Producto[]
  agregar: (producto: Producto) => void
  quitar: (productoId: string) => void
  toggle: (producto: Producto) => void
  esFavorito: (productoId: string) => boolean
  total: () => number
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto) => {
        if (get().esFavorito(producto.id)) return
        set((s) => ({ items: [...s.items, producto] }))
      },

      quitar: (productoId) => {
        set((s) => ({ items: s.items.filter((p) => p.id !== productoId) }))
      },

      toggle: (producto) => {
        get().esFavorito(producto.id)
          ? get().quitar(producto.id)
          : get().agregar(producto)
      },

      esFavorito: (productoId) => get().items.some((p) => p.id === productoId),

      total: () => get().items.length,
    }),
    { name: 'smartbga-wishlist' }
  )
)
