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
      <section className="relative bg-zinc-950 py-20 px-4 text-center overflow-hidden">

        {/* Fondo con gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black opacity-80" />

        {/* Lineas decorativas laterales */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-yellow-500 to-transparent opacity-30" />
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-yellow-500 to-transparent opacity-30" />

        <div className="relative z-10 max-w-3xl mx-auto">

          {/* Logo reducido y limpio */}
          <div className="animate-fade-in mb-6">
            <img
              src="https://res.cloudinary.com/dptktoiev/image/upload/w_1024,h_1024,q_100,f_png/v1780790440/ryb-perfumes/productos/lokju68rlcqf4xwyxtqu.png"
              alt="R&B Perfumes"
              width={160}
              height={160}
              className="h-28 md:h-36 w-auto object-contain mx-auto mix-blend-screen"
            />
          </div>

          {/* Linea dorada */}
          <div className="w-16 h-0.5 bg-yellow-500 mx-auto mb-6" />

          {/* Titulo principal */}
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-wider mb-3 animate-fade-in">
            Perfumes Arabes y de Disenador
          </h1>

          {/* Subtitulo */}
          <p className="text-zinc-400 text-base md:text-lg mb-8 animate-fade-in">
            Fragancias exclusivas para hombres y mujeres
          </p>

          {/* CTA */}
          
            <a href="/catalogo"
            className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-10 py-3 uppercase tracking-widest text-sm transition-all hover:scale-105"
          >
            Ver catalogo
          </a>

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