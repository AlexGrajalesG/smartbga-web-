import { unstable_cache } from 'next/cache'
import { createPublicClient } from './server'
import type { Producto, Categoria } from '@/types'

export type GetProductosParams = {
  categoria?: string
  busqueda?: string
  precioMin?: number
  precioMax?: number
  orden?: string
}

async function _getProductos(params: GetProductosParams = {}): Promise<Producto[]> {
  const supabase = createPublicClient()
  let query = supabase
    .from('productos')
    .select('*, categoria:categorias(*)')
    .eq('activo', true)

  if (params.categoria) {
    const { data: cat } = await supabase
      .from('categorias')
      .select('id')
      .eq('slug', params.categoria)
      .single()
    if (cat) {
      query = query.eq('categoria_id', cat.id)
    } else {
      return []
    }
  }

  if (params.busqueda?.trim()) {
    query = query.ilike('nombre', `%${params.busqueda.trim()}%`)
  }

  if (params.precioMin && params.precioMin > 0) {
    query = query.gte('precio_venta', params.precioMin)
  }
  if (params.precioMax && params.precioMax > 0) {
    query = query.lte('precio_venta', params.precioMax)
  }

  if (params.orden === 'precio_asc') {
    query = query.order('precio_venta', { ascending: true })
  } else if (params.orden === 'precio_desc') {
    query = query.order('precio_venta', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

async function _getProductoBySlug(slug: string): Promise<Producto | null> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('productos')
    .select('*, categoria:categorias(*)')
    .eq('slug', slug)
    .eq('activo', true)
    .single()
  if (error) return null
  return data
}

async function _getCategorias(): Promise<Categoria[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase.from('categorias').select('*').order('nombre')
  if (error) throw error
  return data ?? []
}

export const getProductos = unstable_cache(
  _getProductos,
  ['productos'],
  { revalidate: 60, tags: ['productos'] }
)

export const getProductoBySlug = (slug: string) =>
  unstable_cache(
    () => _getProductoBySlug(slug),
    [`producto-${slug}`],
    { revalidate: 60, tags: ['productos', `producto-${slug}`] }
  )()

export const getCategorias = unstable_cache(
  _getCategorias,
  ['categorias'],
  { revalidate: 300, tags: ['categorias'] }
)
