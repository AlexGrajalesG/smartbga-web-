import { unstable_cache } from 'next/cache'
import { createClient } from './server'
import type { Producto, Categoria } from '@/types'

async function _getProductos(categoriaSlug?: string): Promise<Producto[]> {
  const supabase = await createClient()
  let query = supabase
    .from('productos')
    .select('*, categoria:categorias(*)')
    .eq('activo', true)
    .order('created_at', { ascending: false })
  if (categoriaSlug) {
    query = query.eq('categorias.slug', categoriaSlug)
  }
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

async function _getProductoBySlug(slug: string): Promise<Producto | null> {
  const supabase = await createClient()
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
  const supabase = await createClient()
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
