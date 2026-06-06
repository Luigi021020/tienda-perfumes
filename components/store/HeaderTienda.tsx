// Header de la tienda publica
// Incluye barra de anuncios rotativa y navegacion con categorias en cascada

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

type Categoria = {
  id: string;
  name: string;
  slug: string;
  children: {
    id: string;
    name: string;
    slug: string;
  }[];
};

export default function HeaderTienda({
  config,
  anuncios,
  categorias,
}: {
  config: Config;
  anuncios: Anuncio[];
  categorias: Categoria[];
}) {
  const cantidadTotal = useCarrito((s) => s.cantidadTotal());
  const [anuncioActivo, setAnuncioActivo] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);

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
        <div className="bg-yellow-500 text-black py-2 px-4 text-center text-xs font-bold uppercase tracking-widest">
          {anunciosActivos[anuncioActivo]?.text}
        </div>
      )}

      {/* Header principal */}
      <header className="bg-black border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
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
          <nav className="hidden md:flex items-center gap-1">

            <Link href="/" className="text-zinc-400 hover:text-white text-sm uppercase tracking-wider px-3 py-2 transition-colors">
              Inicio
            </Link>

            {/* Menu de categorias con cascada */}
            {categorias.map((cat) => (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => setCategoriaActiva(cat.id)}
                onMouseLeave={() => setCategoriaActiva(null)}
              >
                <Link
                  href={"/catalogo?categoria=" + cat.slug}
                  className="text-zinc-400 hover:text-white text-sm uppercase tracking-wider px-3 py-2 transition-colors flex items-center gap-1"
                >
                  {cat.name}
                  {cat.children.length > 0 && (
                    <span className="text-xs text-zinc-600">▾</span>
                  )}
                </Link>

                {/* Dropdown de subcategorias */}
                {cat.children.length > 0 && categoriaActiva === cat.id && (
                  <div className="absolute top-full left-0 bg-zinc-900 border border-zinc-800 min-w-48 py-2 shadow-xl z-50">
                    {cat.children.map((sub) => (
                      <Link
                        key={sub.id}
                        href={"/catalogo?categoria=" + sub.slug}
                        className="block px-4 py-2 text-sm text-zinc-400 hover:text-yellow-500 hover:bg-zinc-800 uppercase tracking-wider transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link href="/nosotros" className="text-zinc-400 hover:text-white text-sm uppercase tracking-wider px-3 py-2 transition-colors">
              Nosotros
            </Link>
            <Link href="/faq" className="text-zinc-400 hover:text-white text-sm uppercase tracking-wider px-3 py-2 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Carrito y menu movil */}
          <div className="flex items-center gap-3">
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
              className="md:hidden text-zinc-400 hover:text-white p-2 text-xl"
            >
              {menuAbierto ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Menu movil */}
        {menuAbierto && (
          <div className="md:hidden bg-zinc-950 border-t border-zinc-800 px-4 py-4">
            <Link href="/" onClick={() => setMenuAbierto(false)}
              className="block text-zinc-400 hover:text-white text-sm uppercase tracking-wider py-3 border-b border-zinc-800">
              Inicio
            </Link>

            {/* Categorias en movil */}
            {categorias.map((cat) => (
              <div key={cat.id}>
                <button
                  onClick={() => setCategoriaActiva(categoriaActiva === cat.id ? null : cat.id)}
                  className="w-full flex justify-between items-center text-zinc-400 hover:text-white text-sm uppercase tracking-wider py-3 border-b border-zinc-800"
                >
                  {cat.name}
                  <span className="text-zinc-600">{categoriaActiva === cat.id ? "▲" : "▾"}</span>
                </button>
                {categoriaActiva === cat.id && cat.children.length > 0 && (
                  <div className="pl-4 py-2 space-y-2">
                    {cat.children.map((sub) => (
                      <Link
                        key={sub.id}
                        href={"/catalogo?categoria=" + sub.slug}
                        onClick={() => setMenuAbierto(false)}
                        className="block text-zinc-500 hover:text-yellow-500 text-sm uppercase tracking-wider py-1"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link href="/nosotros" onClick={() => setMenuAbierto(false)}
              className="block text-zinc-400 hover:text-white text-sm uppercase tracking-wider py-3 border-b border-zinc-800">
              Nosotros
            </Link>
            <Link href="/faq" onClick={() => setMenuAbierto(false)}
              className="block text-zinc-400 hover:text-white text-sm uppercase tracking-wider py-3">
              FAQ
            </Link>
          </div>
        )}
      </header>
    </>
  );
}