// Header de la tienda publica
// Muestra el logo, navegacion y carrito

"use client";

import Link from "next/link";
import { useCarrito } from "@/lib/useCarrito";

type Config = {
  storeName: string;
  logoUrl?: string | null;
  whatsapp?: string | null;
} | null;

export default function HeaderTienda({ config }: { config: Config }) {
  const cantidadTotal = useCarrito((s) => s.cantidadTotal());

  return (
    <header className="bg-black border-b border-zinc-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="flex flex-col">
          {config?.logoUrl ? (
            <img src={config.logoUrl} alt={config.storeName} className="h-10 object-contain" />
          ) : (
            <div>
              <p className="text-yellow-500 font-bold text-xl tracking-widest uppercase leading-none">
                R&B
              </p>
              <p className="text-zinc-400 text-xs tracking-widest uppercase">
                Perfumes
              </p>
            </div>
          )}
        </Link>

        {/* Navegacion */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-zinc-400 hover:text-white text-sm uppercase tracking-wider transition-colors">
            Inicio
          </Link>
          <Link href="/catalogo" className="text-zinc-400 hover:text-white text-sm uppercase tracking-wider transition-colors">
            Catalogo
          </Link>
        </nav>

        {/* Carrito */}
        <Link
          href="/carrito"
          className="relative flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-4 py-2 rounded transition-colors"
        >
          <span className="text-lg">🛒</span>
          <span className="text-sm text-white hidden sm:block">Carrito</span>
          {/* Contador de items */}
          {cantidadTotal > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cantidadTotal}
            </span>
          )}
        </Link>

      </div>
    </header>
  );
}