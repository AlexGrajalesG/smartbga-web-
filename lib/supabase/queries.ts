import { unstable_cache } from 'next/cache'
import { createPublicClient } from './server'
import type { Producto, Categoria } from '@/types'

async function _getProductos(categoriaSlug?: string): Promise<Producto[]> {
  const supabase = createPublicClient()
  let query = supabase
    .from('productos')
    .select('*, categoria:categorias(*)')
    .eq('activo', true)
    .order('created_at', { ascending: false })
  if (categoriaSlug) {
    const { data: cat } = await supabase
      .from('categorias')
      .select('id')
      .eq('slug', categoriaSlug)
      .single()
    if (cat) {
      query = query.eq('categoria_id', cat.id)
    } else {
      return []
    }
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

export const getProductos = (categoriaSlug?: string) =>
  unstable_cache(
    () => _getProductos(categoriaSlug),
    ['productos', categoriaSlug ?? 'all'],
    { revalidate: 60, tags: ['productos'] }
  )()

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
