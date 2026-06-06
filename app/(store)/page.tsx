// Página principal de la tienda
// Muestra banner, productos destacados y catalogo

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import TarjetaProducto from "@/components/store/TarjetaProducto";

export default async function HomePage() {

  // Obtener configuracion
  const config = await prisma.storeConfig.findFirst();

  // Obtener productos destacados
  const destacados = await prisma.product.findMany({
    where: { featured: true, active: true },
    include: { category: true },
    take: 4,
  });

  // Obtener productos mas vendidos
  const masVendidos = await prisma.product.findMany({
    where: { active: true },
    orderBy: { sold: "desc" },
    include: { category: true },
    take: 4,
  });

  // Obtener categorias
  const categorias = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    include: { children: { orderBy: { order: "asc" } } },
  });

  return (
    <div>

      {/* Banner principal */}
      <section className="relative bg-zinc-950 py-24 px-4 text-center overflow-hidden">
        {/* Decoracion de fondo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-40 h-40 border border-yellow-500 rounded-full" />
          <div className="absolute bottom-10 right-10 w-64 h-64 border border-yellow-500 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-yellow-500 rounded-full" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-yellow-500 text-xs uppercase tracking-widest mb-4">
            Bienvenido a
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-widest uppercase mb-4">
            R&B
          </h1>
          <p className="text-zinc-400 text-lg tracking-widest uppercase mb-6">
            Perfumes
          </p>
          <div className="w-16 h-0.5 bg-yellow-500 mx-auto mb-6" />
          <p className="text-zinc-400 text-lg italic mb-8">
            {config?.slogan ?? "Cada esencia cuenta una historia, y tu ahora eres parte de la nuestra"}
          </p>
          <Link
            href="/catalogo"
            className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 uppercase tracking-widest text-sm transition-colors"
          >
            Ver catalogo
          </Link>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <h2 className="text-center text-xs uppercase tracking-widest text-zinc-500 mb-6">
          Explorar por categoria
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {categorias.map((padre) => (
  <div key={padre.id} className="flex flex-col items-center gap-2">
    <span className="text-zinc-500 text-xs uppercase tracking-widest">{padre.name}</span>
    <div className="flex gap-2">
      {padre.children.map((hijo) => (
        <Link
          key={hijo.id}
          href={"/catalogo?categoria=" + hijo.slug}
          className="border border-zinc-700 hover:border-yellow-500 text-zinc-400 hover:text-yellow-500 px-4 py-2 text-xs uppercase tracking-wider transition-colors"
        >
          {hijo.name}
        </Link>
      ))}
    </div>
  </div>
))}
        </div>
      </section>

      {/* Productos destacados */}
      {destacados.length > 0 && (
        <section className="py-12 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-widest uppercase">Destacados</h2>
            <div className="w-12 h-0.5 bg-yellow-500 mx-auto mt-3" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destacados.map((producto) => (
              <TarjetaProducto key={producto.id} producto={producto} />
            ))}
          </div>
        </section>
      )}

      {/* Mas vendidos */}
      {masVendidos.length > 0 && (
        <section className="py-12 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-widest uppercase">Mas vendidos</h2>
            <div className="w-12 h-0.5 bg-yellow-500 mx-auto mt-3" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {masVendidos.map((producto) => (
              <TarjetaProducto key={producto.id} producto={producto} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/catalogo"
              className="border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black px-8 py-3 text-sm uppercase tracking-widest transition-colors"
            >
              Ver todos los productos
            </Link>
          </div>
        </section>
      )}

    </div>
  );
}