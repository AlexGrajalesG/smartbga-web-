"use client";

import Link from "next/link";
import { useCarrito } from "@/lib/store/carrito";
import { ShoppingBag } from "lucide-react";

export default function Navbar() {
  const cantidadTotal = useCarrito((s) => s.cantidadTotal);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Smart<span className="text-[#e5c87a]">Bga</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <Link href="/productos" className="hover:text-neutral-900 transition-colors">
            Productos
          </Link>
          <Link
            href="https://www.instagram.com/smart.bga"
            target="_blank"
            className="hover:text-neutral-900 transition-colors"
          >
            Instagram
          </Link>
        </nav>

        <Link href="/carrito" className="relative p-2">
          <ShoppingBag size={22} className="text-neutral-800" />
          {cantidadTotal() > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-[#e5c87a] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cantidadTotal()}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
