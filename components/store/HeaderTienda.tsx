// Header de la tienda publica
// Incluye barra de anuncios rotativa y navegacion principal

"use client";

import Link from "next/link";
import { useCarrito } from "@/lib/useCarrito";
import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";

type Config = {
  storeName: string;
  logoUrl?: string | null;
  whatsapp?: string | null;
} | null;

type Anuncio = {
  id: string;
  text: string;
  active: boolean;
};

export default function HeaderTienda({ config, anuncios }: { config: Config; anuncios: Anuncio[] }) {
  const cantidadTotal = useCarrito((s) => s.cantidadTotal());
  const [anuncioActivo, setAnuncioActivo] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Anuncios activos unicamente
  const anunciosActivos = anuncios.filter((a) => a.active);

  // Rotar anuncios cada 3 segundos
  useEffect(() => {
    if (anunciosActivos.length <= 1) return;
    const interval = setInterval(() => {
      setAnuncioActivo((prev) => (prev + 1) % anunciosActivos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [anunciosActivos.length]);

  return (
    <>
      {/* Barra de anuncios */}
      {anunciosActivos.length > 0 && (
        <div className="bg-yellow-500 text-black py-2 px-4 text-center text-xs font-bold uppercase tracking-widest overflow-hidden">
          <div className="transition-all duration-500">
            {anunciosActivos[anuncioActivo]?.text}
          </div>
        </div>
      )}

      {/* Header principal */}
      <header className="bg-black border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

          {/* Logo */}
          <Link href="/" className="flex flex-col">
            {config?.logoUrl ? (
              <img
                src={config.logoUrl}
                alt={config?.storeName ?? "R&B Perfumes"}
                className="h-10 object-contain"
              />
            ) : (
              <div>
                <p className="text-yellow-500 font-bold text-xl tracking-widest uppercase leading-none">R&B</p>
                <p className="text-zinc-400 text-xs tracking-widest uppercase">Perfumes</p>
              </div>
            )}
          </Link>

          {/* Navegacion escritorio */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-zinc-400 hover:text-white text-sm uppercase tracking-wider transition-colors">
              Inicio
            </Link>
            <Link href="/catalogo" className="text-zinc-400 hover:text-white text-sm uppercase tracking-wider transition-colors">
              Catalogo
            </Link>
            <Link href="/nosotros" className="text-zinc-400 hover:text-white text-sm uppercase tracking-wider transition-colors">
              Nosotros
            </Link>
            <Link href="/faq" className="text-zinc-400 hover:text-white text-sm uppercase tracking-wider transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Carrito y menu movil */}
          <div className="flex items-center gap-3">

            {/* Carrito */}
           <Link
              href="/carrito"
              className="relative flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-4 py-2 rounded transition-colors"
            >
              <ShoppingBag size={18} className="text-white" />
              <span className="text-sm text-white hidden sm:block">Carrito</span>
              {cantidadTotal > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cantidadTotal}
                </span>
              )}
            </Link>

            {/* Boton menu movil */}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="md:hidden text-zinc-400 hover:text-white p-2"
            >
              {menuAbierto ? "✕" : "☰"}
            </button>

          </div>
        </div>

        {/* Menu movil desplegable */}
        {menuAbierto && (
          <div className="md:hidden bg-zinc-950 border-t border-zinc-800 px-4 py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setMenuAbierto(false)}
              className="block text-zinc-400 hover:text-white text-sm uppercase tracking-wider py-2 border-b border-zinc-800"
            >
              Inicio
            </Link>
            <Link
              href="/catalogo"
              onClick={() => setMenuAbierto(false)}
              className="block text-zinc-400 hover:text-white text-sm uppercase tracking-wider py-2 border-b border-zinc-800"
            >
              Catalogo
            </Link>
            <Link
              href="/nosotros"
              onClick={() => setMenuAbierto(false)}
              className="block text-zinc-400 hover:text-white text-sm uppercase tracking-wider py-2 border-b border-zinc-800"
            >
              Nosotros
            </Link>
            <Link
              href="/faq"
              onClick={() => setMenuAbierto(false)}
              className="block text-zinc-400 hover:text-white text-sm uppercase tracking-wider py-2"
            >
              FAQ
            </Link>
          </div>
        )}

      </header>
    </>
  );
}