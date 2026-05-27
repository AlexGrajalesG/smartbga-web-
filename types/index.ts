export interface Categoria {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  created_at: string
}

export interface Producto {
  id: string
  nombre: string
  slug: string
  precio: number
  precio_anterior: number | null
  descripcion: string
  categoria_id: string
  imagenes: string[]
  video_url: string | null
  stock: number
  activo: boolean
  created_at: string
  categoria?: Categoria
}

export interface ItemCarrito {
  producto: Producto
  cantidad: number
}
