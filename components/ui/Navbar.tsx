'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useCarrito } from '@/lib/store/carrito'
import { useWishlist } from '@/lib/store/wishlist'
import { logout } from '@/app/actions/auth'
import { ShoppingBag, User, Heart, LayoutDashboard, Search } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Categoria } from '@/types'

interface NavbarProps {
  user: SupabaseUser | null
  mostrarPanelAdmin?: boolean
  categorias?: Categoria[]
}

const BOUNCE_KF = `
  @keyframes cart-bounce {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.32); }
    60%  { transform: scale(0.92); }
    80%  { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .cart-bounce { animation: none !important; }
  }
`

export default function Navbar({ user, mostrarPanelAdmin = false, categorias = [] }: NavbarProps) {
  const totalCarrito   = useCarrito((s) => s.items.reduce((acc, i) => acc + i.cantidad, 0))
  const totalFavoritos = useWishlist((s) => s.items.length)
  const [mounted, setMounted] = useState(false)
  const [bouncing, setBouncing] = useState(false)
  const prevCarrito = useRef(0)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    if (totalCarrito > prevCarrito.current) {
      setBouncing(true)
      const t = setTimeout(() => setBouncing(false), 420)
      prevCarrito.current = totalCarrito
      return () => clearTimeout(t)
    }
    prevCarrito.current = totalCarrito
  }, [totalCarrito, mounted])

  return (
    <>
      <style>{BOUNCE_KF}</style>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="SmartBga" width={150} height={50} className="h-10 w-auto" priority />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-500">
            {categorias.slice(0, 3).map((c) => (
              <Link
                key={c.id}
                href={`/productos?categoria=${c.slug}`}
                className="hover:text-[#6a0008] transition-colors"
              >
                {c.nombre}
              </Link>
            ))}
            <Link
              href="/#ofertas-flash"
              className="text-[#6a0008] border-b-2 border-[#6a0008] pb-1 font-semibold"
            >
              Ofertas
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            {/* Buscar */}
            <Link href="/productos" className="p-2 cursor-pointer" aria-label="Buscar productos">
              <Search size={20} className="text-neutral-700 hover:text-[#6a0008] transition-colors" />
            </Link>

            {user ? (
              <>
                {mostrarPanelAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 text-sm font-medium text-[#6a0008] hover:text-[#8C1A1A] transition-colors px-3 py-2 rounded-md hover:bg-red-50"
                  >
                    <LayoutDashboard size={16} />
                    <span className="hidden sm:inline">Panel admin</span>
                  </Link>
                )}
                <Link
                  href="/perfil"
                  className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-[#6a0008] transition-colors px-3 py-2 rounded-md hover:bg-red-50"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">Mi cuenta</span>
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors px-2 py-2 cursor-pointer"
                  >
                    Salir
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-neutral-600 hover:text-[#6a0008] transition-colors px-3 py-2"
                >
                  Ingresar
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold bg-[#6a0008] hover:bg-[#8C1A1A] text-white px-4 py-2 rounded-md transition-colors"
                >
                  Registro
                </Link>
              </>
            )}

            {/* Favoritos */}
            <Link href="/favoritos" className="relative p-2 ml-1 cursor-pointer" aria-label="Lista de deseos">
              <Heart size={22} className="text-neutral-700 hover:text-[#6a0008] transition-colors" />
              {mounted && totalFavoritos > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#6a0008] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalFavoritos}
                </span>
              )}
            </Link>

            {/* Carrito */}
            <Link href="/carrito" className="relative p-2 cursor-pointer" aria-label="Carrito">
              <ShoppingBag
                size={22}
                className={`text-neutral-700 hover:text-[#6a0008] transition-colors ${bouncing ? 'cart-bounce' : ''}`}
                style={{ animation: bouncing ? 'cart-bounce 420ms cubic-bezier(0.36,0.07,0.19,0.97)' : 'none' }}
              />
              {mounted && totalCarrito > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#6a0008] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                  {totalCarrito}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}
