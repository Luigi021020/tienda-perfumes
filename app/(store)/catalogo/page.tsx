// Página del catálogo completo
// Muestra todos los productos con filtros y buscador

"use client";

import { useState, useEffect } from "react";
import TarjetaProducto from "@/components/store/TarjetaProducto";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Producto = {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  images: string[];
  category: { id: string; name: string; slug: string };
};

type Categoria = {
  id: string;
  name: string;
  slug: string;
};

function CatalogoContenido() {
  const searchParams = useSearchParams();
  const categoriaParam = searchParams.get("categoria");

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState(categoriaParam ?? "");
  const [orden, setOrden] = useState("default");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      fetch("/api/productos/publicos"),
      fetch("/api/categorias"),
    ]);
    const prods = await prodRes.json();
    const cats = await catRes.json();
    setProductos(prods);
    setCategorias(cats);
    setLoading(false);
  }

  // Filtrar y ordenar productos
  const productosFiltrados = productos
    .filter((p) => {
      const coincideBusqueda =
        p.name.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.brand.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria =
        !categoriaFiltro || p.category.slug === categoriaFiltro;
      return coincideBusqueda && coincideCategoria;
    })
    .sort((a, b) => {
      if (orden === "precio-asc") return a.price - b.price;
      if (orden === "precio-desc") return b.price - a.price;
      if (orden === "nombre") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Titulo */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-widest uppercase">Catalogo</h1>
        <div className="w-12 h-0.5 bg-yellow-500 mx-auto mt-3" />
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">

        {/* Buscador */}
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar perfume o marca..."
          className="flex-1 bg-zinc-900 border border-zinc-700 text-white rounded px-4 py-2 text-sm focus:outline-none focus:border-yellow-500"
        />

        {/* Filtro de categoria */}
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-white rounded px-4 py-2 text-sm focus:outline-none focus:border-yellow-500"
        >
          <option value="">Todas las categorias</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>

        {/* Ordenar */}
        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-white rounded px-4 py-2 text-sm focus:outline-none focus:border-yellow-500"
        >
          <option value="default">Ordenar por</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
          <option value="nombre">Nombre A-Z</option>
        </select>

      </div>

      {/* Resultados */}
      <p className="text-zinc-500 text-sm mb-6">
        {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? "s" : ""} encontrado{productosFiltrados.length !== 1 ? "s" : ""}
      </p>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-zinc-500">Cargando productos...</p>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg">No se encontraron productos</p>
          <button
            onClick={() => { setBusqueda(""); setCategoriaFiltro(""); }}
            className="text-yellow-500 text-sm mt-3 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productosFiltrados.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
          ))}
        </div>
      )}

    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-500">Cargando...</div>}>
      <CatalogoContenido />
    </Suspense>
  );
}