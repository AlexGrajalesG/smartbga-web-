import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mi cuenta' }

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/perfil')

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  const { data: ordenes } = await supabase
    .from('ordenes')
    .select('id, estado, total, created_at')
    .eq('usuario_id', perfil?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(10)

  const ESTADO_LABEL: Record<string, string> = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    en_despacho: 'En camino',
    entregada: 'Entregada',
    cancelada: 'Cancelada',
  }

  const ESTADO_COLOR: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    confirmada: 'bg-blue-100 text-blue-700',
    en_despacho: 'bg-purple-100 text-purple-700',
    entregada: 'bg-green-100 text-green-700',
    cancelada: 'bg-red-100 text-red-700',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Mi cuenta</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            Cerrar sesión
          </button>
        </form>
      </div>

      {/* Datos del perfil */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-6">
        <h2 className="font-semibold mb-4">Datos personales</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-neutral-400">Nombre</dt>
            <dd className="font-medium">{perfil?.nombre ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Email</dt>
            <dd className="font-medium">{perfil?.email ?? user.email}</dd>
          </div>
          {perfil?.celular && (
            <div>
              <dt className="text-neutral-400">Celular</dt>
              <dd className="font-medium">{perfil.celular}</dd>
            </div>
          )}
          {perfil?.ciudad && (
            <div>
              <dt className="text-neutral-400">Ciudad</dt>
              <dd className="font-medium">{perfil.ciudad}{perfil.barrio ? `, ${perfil.barrio}` : ''}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Historial de órdenes */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h2 className="font-semibold mb-4">Mis pedidos</h2>
        {!ordenes?.length ? (
          <p className="text-sm text-neutral-400">Aún no tienes pedidos.</p>
        ) : (
          <div className="flex flex-col divide-y divide-neutral-100">
            {ordenes.map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-neutral-400 font-mono">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {new Date(o.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ESTADO_COLOR[o.estado] ?? 'bg-neutral-100 text-neutral-600'}`}>
                  {ESTADO_LABEL[o.estado] ?? o.estado}
                </span>
                <p className="font-semibold text-sm">
                  ${o.total.toLocaleString('es-CO')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
