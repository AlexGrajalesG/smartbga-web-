'use client'

import { useState, useActionState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'
import {
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  type CategoriaState,
} from '@/app/(admin)/admin/categorias/actions'

interface Categoria {
  id: string
  slug: string
  nombre: string
  descripcion: string | null
}

function FormNueva({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(crearCategoria, undefined)

  useEffect(() => {
    if (state?.success) onSuccess()
  }, [state, onSuccess])

  return (
    <form action={action} className="flex flex-col gap-3 rounded-2xl border border-[#8C1A1A]/20 bg-[#8C1A1A]/5 p-4">
      <p className="text-xs font-bold tracking-widest text-[#8C1A1A] uppercase">Nueva categoría</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          name="nombre"
          type="text"
          required
          placeholder="Nombre de la categoría"
          className="input-field flex-1"
        />
        <input
          name="descripcion"
          type="text"
          placeholder="Descripción (opcional)"
          className="input-field flex-1"
        />
      </div>
      {state?.error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md">{state.error}</p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#8C1A1A] text-white text-sm font-semibold rounded-xl hover:bg-[#6B1313] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Crear
        </button>
      </div>
    </form>
  )
}

function FilaCategoria({ cat }: { cat: Categoria }) {
  const [editando, setEditando] = useState(false)
  const [editState, editAction, editPending] = useActionState(actualizarCategoria, undefined)
  const [delState, delAction, delPending] = useActionState(eliminarCategoria, undefined)

  useEffect(() => {
    if (editState?.success) setEditando(false)
  }, [editState])

  if (editando) {
    return (
      <tr className="bg-neutral-50">
        <td colSpan={4} className="px-4 py-3">
          <form action={editAction} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <input type="hidden" name="id" value={cat.id} />
            <input
              name="nombre"
              type="text"
              required
              defaultValue={cat.nombre}
              className="input-field flex-1 text-sm"
            />
            <input
              name="descripcion"
              type="text"
              defaultValue={cat.descripcion ?? ''}
              placeholder="Descripción (opcional)"
              className="input-field flex-1 text-sm"
            />
            {editState?.error && (
              <p className="text-xs text-red-600 whitespace-nowrap">{editState.error}</p>
            )}
            <div className="flex gap-1.5 shrink-0">
              <button
                type="submit"
                disabled={editPending}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#8C1A1A] text-white text-xs font-semibold rounded-lg hover:bg-[#6B1313] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {editPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-neutral-200 text-xs font-semibold rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X size={12} />
                Cancelar
              </button>
            </div>
          </form>
        </td>
      </tr>
    )
  }

  return (
    <tr className="hover:bg-neutral-50/60 transition-colors">
      <td className="px-4 py-3 font-medium text-neutral-800">{cat.nombre}</td>
      <td className="px-4 py-3 font-mono text-xs text-neutral-400">{cat.slug}</td>
      <td className="px-4 py-3 text-sm text-neutral-500 max-w-xs truncate">
        {cat.descripcion ?? <span className="text-neutral-300">—</span>}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <Pencil size={12} />
            Editar
          </button>
          <form action={delAction}>
            <input type="hidden" name="id" value={cat.id} />
            <button
              type="submit"
              disabled={delPending}
              onClick={(e) => {
                if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) e.preventDefault()
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {delPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              Eliminar
            </button>
          </form>
          {delState?.error && (
            <p className="text-xs text-red-600 ml-1">{delState.error}</p>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function CategoriasAdmin({ categorias }: { categorias: Categoria[] }) {
  const [creando, setCreando] = useState(false)

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setCreando((v) => !v)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#8C1A1A] text-white text-sm font-semibold rounded-2xl hover:bg-[#6B1313] transition-colors cursor-pointer"
        >
          {creando ? <X size={16} /> : <Plus size={16} />}
          {creando ? 'Cancelar' : 'Nueva categoría'}
        </button>
      </div>

      {creando && <FormNueva onSuccess={() => setCreando(false)} />}

      {categorias.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 px-6 py-16 text-center">
          <p className="text-neutral-500 text-sm">Aún no hay categorías. Crea la primera.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs font-bold tracking-wider text-neutral-400 uppercase">
                <th className="px-4 py-3 font-bold">Nombre</th>
                <th className="px-4 py-3 font-bold">Slug</th>
                <th className="px-4 py-3 font-bold">Descripción</th>
                <th className="px-4 py-3 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {categorias.map((cat) => (
                <FilaCategoria key={cat.id} cat={cat} />
              ))}
            </tbody>
          </table>
          <p className="px-4 py-2.5 text-xs text-neutral-400 bg-neutral-50 border-t border-neutral-100">
            {categorias.length} {categorias.length === 1 ? 'categoría' : 'categorías'}
          </p>
        </div>
      )}
    </div>
  )
}
