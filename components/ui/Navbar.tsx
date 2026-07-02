'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useCarrito } from '@/lib/store/carrito'
import { useWishlist } from '@/lib/store/wishlist'
import { logout } from '@/app/actions/auth'
import {
  ShoppingBag, User, Heart, LayoutDashboard,
  Search, X, Menu, ChevronRight, LogOut,
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface NavbarProps {
  user: SupabaseUser | null
  mostrarPanelAdmin?: boolean
}

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Productos', href: '/productos' },
  { label: 'Ofertas', href: '/#ofertas-flash' },
  { label: 'Nosotros', href: '/#nosotros' },
]

const BOUNCE_KF = `
  @keyframes cart-bounce {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.35); }
    60%  { transform: scale(0.90); }
    80%  { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .cart-bounce { animation: none !important; }
  }
`

export default function Navbar({ user, mostrarPanelAdmin = false }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const totalCarrito = useCarrito((s) => s.items.reduce((acc, i) => acc + i.cantidad, 0))
  const totalFavoritos = useWishlist((s) => s.items.length)

  const [mounted, setMounted] = useState(false)
  const [bouncing, setBouncing] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const prevCarrito = useRef(0)
  const searchRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setMobileOpen(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Close mobile menu on navigation
  useEffect(() => { setMobileOpen(false) }, [pathname])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchValue.trim()) return
    router.push(`/productos?q=${encodeURIComponent(searchValue.trim())}`)
    setSearchValue('')
    setSearchOpen(false)
  }

  function openSearch() {
    setSearchOpen(true)
    setMobileOpen(false)
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href.split('#')[0]) && href !== '/'

  return (
    <>
      <style>{BOUNCE_KF}</style>

      {/* ── Desktop + Mobile Navbar ─────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-[0_1px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 mr-2">
            <Image
              src="/logo.jpg"
              alt="SmartBga"
              width={120}
              height={120}
              className="h-11 w-auto"
              priority
            />
          </Link>

          {/* ── Desktop nav links (hidden when search open) ── */}
          {!searchOpen && (
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 cursor-pointer ${
                    isActive(link.href)
                      ? 'text-[#1C0A0A] bg-neutral-100 font-semibold'
                      : 'text-neutral-500 hover:text-[#1C0A0A] hover:bg-neutral-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* ── Search bar (expanded) ── */}
          {searchOpen && (
            <form onSubmit={handleSearch} className="flex-1 hidden md:flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 focus-within:border-[#6a0008] focus-within:ring-1 focus-within:ring-[#6a0008]/20 transition-all">
                <Search size={16} className="text-neutral-400 shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Buscar productos..."
                  className="flex-1 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setSearchValue('') }}
                className="p-2 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Cerrar búsqueda"
              >
                <X size={18} />
              </button>
            </form>
          )}

          {/* ── Spacer ── */}
          {!searchOpen && <div className="flex-1 hidden md:block" />}

          {/* ── Action buttons ── */}
          <div className="flex items-center gap-0.5">
            {/* Buscar */}
            <button
              onClick={searchOpen ? () => { setSearchOpen(false); setSearchValue('') } : openSearch}
              className="p-2 rounded-lg text-neutral-600 hover:text-[#1C0A0A] hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Buscar"
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

            {/* Favoritos */}
            <Link
              href="/favoritos"
              className="relative p-2 rounded-lg text-neutral-600 hover:text-[#1C0A0A] hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Favoritos"
            >
              <Heart size={20} />
              {mounted && totalFavoritos > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#8C1A1A] text-white text-[9px] font-bold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center">
                  {totalFavoritos}
                </span>
              )}
            </Link>

            {/* Carrito */}
            <Link
              href="/carrito"
              className="relative p-2 rounded-lg text-neutral-600 hover:text-[#1C0A0A] hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Carrito"
            >
              <ShoppingBag
                size={20}
                style={{ animation: bouncing ? 'cart-bounce 420ms cubic-bezier(0.36,0.07,0.19,0.97)' : 'none' }}
              />
              {mounted && totalCarrito > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#8C1A1A] text-white text-[9px] font-bold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center tabular-nums">
                  {totalCarrito}
                </span>
              )}
            </Link>

            {/* Usuario — Desktop */}
            <div className="hidden md:flex items-center gap-0.5 ml-1 pl-1 border-l border-neutral-200">
              {user ? (
                <>
                  {mostrarPanelAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-[#6a0008] hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LayoutDashboard size={15} />
                      <span>Admin</span>
                    </Link>
                  )}
                  <Link
                    href="/perfil"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:text-[#1C0A0A] hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <User size={15} />
                    <span>Mi cuenta</span>
                  </Link>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="flex items-center gap-1 px-2 py-2 rounded-md text-xs text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:text-[#1C0A0A] hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-md text-sm font-semibold bg-[#1C0A0A] text-white hover:bg-[#6a0008] transition-colors cursor-pointer"
                  >
                    Registro
                  </Link>
                </>
              )}
            </div>

            {/* Hamburger — Mobile */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-[#1C0A0A] hover:bg-neutral-100 transition-colors cursor-pointer ml-0.5"
              aria-label="Menú"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* ── Mobile search bar (below header) ── */}
        {searchOpen && (
          <div className="md:hidden border-t border-neutral-100 px-4 py-3">
            <form onSubmit={handleSearch} className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 focus-within:border-[#6a0008] focus-within:ring-1 focus-within:ring-[#6a0008]/20 transition-all">
              <Search size={16} className="text-neutral-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Buscar productos..."
                className="flex-1 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
              />
              {searchValue && (
                <button type="button" onClick={() => setSearchValue('')} className="cursor-pointer">
                  <X size={14} className="text-neutral-400" />
                </button>
              )}
            </form>
          </div>
        )}
      </header>

      {/* ── Mobile Menu Overlay ────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 flex flex-col shadow-2xl md:hidden">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <Image src="/logo.jpg" alt="SmartBga" width={90} height={90} className="h-9 w-auto" />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md text-neutral-400 hover:bg-neutral-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col px-3 py-4 gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive(link.href)
                      ? 'bg-neutral-100 text-[#1C0A0A] font-semibold'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-[#1C0A0A]'
                  }`}
                >
                  {link.label}
                  <ChevronRight size={15} className="text-neutral-300" />
                </Link>
              ))}
            </nav>

            <div className="h-px bg-neutral-100 mx-4" />

            {/* User section */}
            <div className="flex flex-col px-3 py-4 gap-1">
              {user ? (
                <>
                  {mostrarPanelAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#6a0008] hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LayoutDashboard size={17} />
                      Panel Admin
                    </Link>
                  )}
                  <Link
                    href="/perfil"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-[#1C0A0A] transition-colors cursor-pointer"
                  >
                    <User size={17} />
                    Mi cuenta
                  </Link>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700 transition-colors cursor-pointer"
                    >
                      <LogOut size={17} />
                      Cerrar sesión
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                  >
                    <User size={17} />
                    Ingresar
                  </Link>
                  <Link
                    href="/register"
                    className="mx-1 mt-2 flex items-center justify-center py-3 rounded-lg text-sm font-semibold bg-[#1C0A0A] text-white hover:bg-[#6a0008] transition-colors cursor-pointer"
                  >
                    Crear cuenta
                  </Link>
                </>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  )
}
