'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useCarrito } from '@/lib/store/carrito'
import { useWishlist } from '@/lib/store/wishlist'
import { logout } from '@/app/actions/auth'
import { ShoppingBag, User, Heart, LayoutDashboard } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface NavbarProps {
  user: SupabaseUser | null
  mostrarPanelAdmin?: boolean
}

export default function Navbar({ user, mostrarPanelAdmin = false }: NavbarProps) {
  const cantidadTotal   = useCarrito((s) => s.cantidadTotal)
  const totalFavoritos  = useWishlist((s) => s.total())
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="SmartBga" width={150} height={50} className="h-10 w-auto" priority />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-500">
          <Link href="/productos" className="hover:text-[#8C1A1A] transition-colors">
            Productos
          </Link>
          <Link
            href="https://www.instagram.com/smart.bga"
            target="_blank"
            className="hover:text-[#8C1A1A] transition-colors"
          >
            Instagram
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          {user ? (
            <>
              {mostrarPanelAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-sm font-medium text-[#8C1A1A] hover:text-[#6B1313] transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
                >
                  <LayoutDashboard size={16} />
                  <span className="hidden sm:inline">Panel admin</span>
                </Link>
              )}
              <Link
                href="/perfil"
                className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-[#8C1A1A] transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
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
                className="text-sm font-medium text-neutral-600 hover:text-[#8C1A1A] transition-colors px-3 py-2"
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-[#8C1A1A] hover:bg-[#6B1313] text-white px-4 py-2 rounded-xl transition-colors"
              >
                Registro
              </Link>
            </>
          )}

          {/* Favoritos */}
          <Link href="/favoritos" className="relative p-2 ml-1 cursor-pointer" aria-label="Lista de deseos">
            <Heart size={22} className="text-neutral-700 hover:text-[#8C1A1A] transition-colors" />
            {mounted && totalFavoritos > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#8C1A1A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalFavoritos}
              </span>
            )}
          </Link>

          {/* Carrito */}
          <Link href="/carrito" className="relative p-2 cursor-pointer" aria-label="Carrito">
            <ShoppingBag size={22} className="text-neutral-700 hover:text-[#8C1A1A] transition-colors" />
            {mounted && cantidadTotal() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#8C1A1A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cantidadTotal()}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
