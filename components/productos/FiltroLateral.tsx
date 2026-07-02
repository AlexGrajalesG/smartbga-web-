'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react'
import type { Categoria } from '@/types'

const ORDEN_OPTIONS = [
  { value: 'nuevo', label: 'Más recientes' },
  { value: 'precio_asc', label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full mb-3 cursor-pointer group"
      >
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider group-hover:text-neutral-600 transition-colors">
          {title}
        </span>
        {open ? <ChevronUp size={14} className="text-neutral-300" /> : <ChevronDown size={14} className="text-neutral-300" />}
      </button>
      {open && children}
    </div>
  )
}

export default function FiltroLateral({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [precioMin, setPrecioMin] = useState(searchParams.get('precio_min') || '')
  const [precioMax, setPrecioMax] = useState(searchParams.get('precio_max') || '')

  const categoriaActual = searchParams.get('categoria')
  const ordenActual = searchParams.get('orden') || 'nuevo'

  const tienesFiltros = !!(
    categoriaActual ||
    searchParams.get('precio_min') ||
    searchParams.get('precio_max') ||
    (searchParams.get('orden') && searchParams.get('orden') !== 'nuevo')
  )

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') params.delete(key)
    else params.set(key, value)
    router.push(`/productos?${params.toString()}`)
  }

  function aplicarPrecio() {
    const params = new URLSearchParams(searchParams.toString())
    if (precioMin) params.set('precio_min', precioMin)
    else params.delete('precio_min')
    if (precioMax) params.set('precio_max', precioMax)
    else params.delete('precio_max')
    router.push(`/productos?${params.toString()}`)
    setMobileOpen(false)
  }

  function limpiar() {
    setPrecioMin('')
    setPrecioMax('')
    router.push('/productos')
    setMobileOpen(false)
  }

  const panel = (
    <div className="flex flex-col gap-4">
      {tienesFiltros && (
        <button
          onClick={limpiar}
          className="flex items-center gap-1.5 text-xs text-[#6a0008] hover:text-[#8C1A1A] font-medium cursor-pointer transition-colors"
        >
          <X size={12} />
          Limpiar filtros
        </button>
      )}

      {/* Ordenar */}
      <Section title="Ordenar">
        <div className="flex flex-col gap-2">
          {ORDEN_OPTIONS.map((o) => (
            <label key={o.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="orden"
                value={o.value}
                checked={ordenActual === o.value}
                onChange={() => updateParam('orden', o.value === 'nuevo' ? null : o.value)}
                className="accent-[#6a0008] w-3.5 h-3.5 cursor-pointer"
              />
              <span className={`text-sm transition-colors ${
                ordenActual === o.value
                  ? 'text-[#1C0A0A] font-medium'
                  : 'text-neutral-500 group-hover:text-neutral-700'
              }`}>
                {o.label}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Categorías */}
      {categorias.length > 0 && (
        <Section title="Categoría">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="categoria"
                value=""
                checked={!categoriaActual}
                onChange={() => updateParam('categoria', null)}
                className="accent-[#6a0008] w-3.5 h-3.5 cursor-pointer"
              />
              <span className={`text-sm transition-colors ${!categoriaActual ? 'text-[#1C0A0A] font-medium' : 'text-neutral-500 group-hover:text-neutral-700'}`}>
                Todas
              </span>
            </label>
            {categorias.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="categoria"
                  value={cat.slug}
                  checked={categoriaActual === cat.slug}
                  onChange={() => { updateParam('categoria', cat.slug); setMobileOpen(false) }}
                  className="accent-[#6a0008] w-3.5 h-3.5 cursor-pointer"
                />
                <span className={`text-sm transition-colors ${
                  categoriaActual === cat.slug
                    ? 'text-[#1C0A0A] font-medium'
                    : 'text-neutral-500 group-hover:text-neutral-700'
                }`}>
                  {cat.nombre}
                </span>
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* Precio */}
      <Section title="Precio (COP)">
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-neutral-400 mb-1 block">Mínimo</label>
              <input
                type="number"
                placeholder="$0"
                value={precioMin}
                onChange={(e) => setPrecioMin(e.target.value)}
                className="w-full border border-neutral-200 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6a0008] focus:border-[#6a0008] transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 mb-1 block">Máximo</label>
              <input
                type="number"
                placeholder="$∞"
                value={precioMax}
                onChange={(e) => setPrecioMax(e.target.value)}
                className="w-full border border-neutral-200 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6a0008] focus:border-[#6a0008] transition-all"
              />
            </div>
          </div>
          <button
            onClick={aplicarPrecio}
            className="w-full bg-[#1C0A0A] text-white text-sm font-medium py-2 rounded-md hover:bg-[#6a0008] transition-colors cursor-pointer"
          >
            Aplicar precio
          </button>
        </div>
      </Section>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden flex items-center gap-2 px-4 py-2.5 border border-neutral-200 bg-white rounded-lg text-sm font-medium text-neutral-700 hover:border-[#1C0A0A] transition-colors cursor-pointer mb-5 shadow-sm"
      >
        <SlidersHorizontal size={15} />
        Filtrar y ordenar
        {tienesFiltros && (
          <span className="ml-1 bg-[#6a0008] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            ✓
          </span>
        )}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-48 shrink-0 self-start sticky top-24">
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-4">
          <p className="text-xs font-bold text-[#1C0A0A] uppercase tracking-widest mb-4">Filtros</p>
          {panel}
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col shadow-2xl md:hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <span className="font-semibold text-[#1C0A0A]">Filtros</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-md hover:bg-neutral-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {panel}
            </div>
          </div>
        </>
      )}
    </>
  )
}
