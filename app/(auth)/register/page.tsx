'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { register } from '@/app/actions/auth'

const GENEROS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
  { value: 'prefiero_no_decir', label: 'Prefiero no decir' },
]

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined)

  if (state?.message) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-lg shadow-ambient p-8 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-xl">✓</span>
          </div>
          <h2 className="font-display text-xl font-semibold text-[#1C0A0A] mb-2">Cuenta creada</h2>
          <p className="text-sm text-[#6B5B52]">{state.message}</p>
          <Link href="/login" className="mt-5 inline-block text-sm font-semibold text-[#6a0008] hover:underline">
            Ir al login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C9A84C]/15 text-[#8C1A1A] text-[11px] font-semibold tracking-[0.15em] uppercase mb-4">
        Acceso exclusivo
      </span>
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#1C0A0A]">Crear cuenta</h1>
      <p className="text-sm text-[#6B5B52] mt-1.5 mb-6">Únete a SmartBga</p>

      <div className="bg-white rounded-lg shadow-ambient p-6 md:p-8">
        <form action={action} className="flex flex-col gap-4">
          {/* Datos obligatorios */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nombre" className="text-sm font-medium">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre" name="nombre" type="text"
              autoComplete="name" required
              className="input-field" placeholder="Tu nombre"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email" name="email" type="email"
              autoComplete="email" required
              className="input-field" placeholder="tu@email.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              id="password" name="password" type="password"
              autoComplete="new-password" required
              className="input-field" placeholder="Mínimo 6 caracteres"
            />
          </div>

          {/* Separador */}
          <div className="border-t border-neutral-100 pt-2 mt-1">
            <p className="text-xs text-neutral-400 mb-3">Opcional: nos ayuda a mostrarte lo que más te gusta</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="celular" className="text-sm font-medium">Celular</label>
                <input
                  id="celular" name="celular" type="tel"
                  autoComplete="tel"
                  className="input-field" placeholder="300 000 0000"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="edad" className="text-sm font-medium">Edad</label>
                <input
                  id="edad" name="edad" type="number"
                  min="1" max="120"
                  className="input-field" placeholder="25"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-3">
              <label htmlFor="genero" className="text-sm font-medium">Género</label>
              <select id="genero" name="genero" className="input-field text-neutral-600">
                <option value="">Seleccionar</option>
                {GENEROS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ciudad" className="text-sm font-medium">Ciudad</label>
                <input
                  id="ciudad" name="ciudad" type="text"
                  className="input-field" placeholder="Bucaramanga"
                  defaultValue="Bucaramanga"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="barrio" className="text-sm font-medium">Barrio</label>
                <input
                  id="barrio" name="barrio" type="text"
                  className="input-field" placeholder="Tu barrio"
                />
              </div>
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 bg-[#6a0008] text-white text-sm font-semibold rounded-md hover:bg-[#8C1A1A] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 mt-1"
          >
            {pending ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      </div>

      <p className="text-sm text-[#6B5B52] text-center mt-5">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-[#6a0008] font-semibold hover:underline">
          Ingresar
        </Link>
      </p>
    </div>
  )
}
