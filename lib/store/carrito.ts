import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto, ItemCarrito } from '@/types'

interface CarritoStore {
  items: ItemCarrito[]
  agregar: (producto: Producto) => void
  quitar: (productoId: string) => void
  actualizarCantidad: (productoId: string, cantidad: number) => void
  vaciar: () => void
  total: () => number
  cantidadTotal: () => number
}

export const useCarrito = create<CarritoStore>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto) => {
        set((state) => {
          const existente = state.items.find((i) => i.producto.id === producto.id)
          if (existente) {
            return {
              items: state.items.map((i) =>
                i.producto.id === producto.id
                  ? { ...i, cantidad: i.cantidad + 1 }
                  : i
              ),
            }
          }
          return { items: [...state.items, { producto, cantidad: 1 }] }
        })
      },

      quitar: (productoId) => {
        set((state) => ({
          items: state.items.filter((i) => i.producto.id !== productoId),
        }))
      },

      actualizarCantidad: (productoId, cantidad) => {
        if (cantidad <= 0) {
          get().quitar(productoId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.producto.id === productoId ? { ...i, cantidad } : i
          ),
        }))
      },

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0),

      cantidadTotal: () =>
        get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    { name: 'smartbga-carrito' }
  )
)
