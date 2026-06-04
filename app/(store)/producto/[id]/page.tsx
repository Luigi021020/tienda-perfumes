// Página de detalle de un producto
// Muestra toda la información y permite agregar al carrito

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCarrito } from "@/lib/useCarrito";
import Link from "next/link";

type Producto = {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: { name: string; slug: string };
};

export default function ProductoPage() {
  const { id } = useParams();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const agregar = useCarrito((s) => s.agregar);

  useEffect(() => {
    async function cargarProducto() {
      const res = await fetch(`/api/productos/${id}/publico`);
      if (res.ok) {
        const data = await res.json();
        setProducto(data);
      }
      setLoading(false);
    }
    if (id) cargarProducto();
  }, [id]);

  function agregarAlCarrito() {
    if (!producto) return;
    agregar({
      id: producto.id,
      name: producto.name,
      brand: producto.brand,
      price: producto.price,
      image: producto.images[0] ?? "",
      quantity: cantidad,
      stock: producto.stock,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">Cargando...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">Producto no encontrado</p>
        <Link href="/catalogo" className="text-yellow-500 hover:underline text-sm">
          Volver al catalogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Migas de pan */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-8 uppercase tracking-wider">
        <Link href="/" className="hover:text-yellow-500 transition-colors">Inicio</Link>
        <span>/</span>
        <Link href="/catalogo" className="hover:text-yellow-500 transition-colors">Catalogo</Link>
        <span>/</span>
        <span className="text-zinc-400">{producto.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Galeria de imagenes */}
        <div>
          {/* Imagen principal */}
          <div className="bg-zinc-900 border border-zinc-800 h-96 overflow-hidden mb-3">
            {producto.images[imagenActiva] ? (
              <img
                src={producto.images[imagenActiva]}
                alt={producto.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-700">
                Sin imagen
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {producto.images.length > 1 && (
            <div className="flex gap-2">
              {producto.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImagenActiva(i)}
                  className={`w-16 h-16 border overflow-hidden transition-colors ${
                    imagenActiva === i ? "border-yellow-500" : "border-zinc-700"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info del producto */}
        <div className="flex flex-col justify-center">

          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
            {producto.brand}
          </p>
          <h1 className="text-3xl font-bold text-white mb-2">{producto.name}</h1>
          <p className="text-zinc-500 text-sm mb-4">{producto.category.name}</p>

          <div className="w-12 h-0.5 bg-yellow-500 mb-6" />

          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            {producto.description}
          </p>

          <p className="text-3xl font-bold text-yellow-500 mb-6">
            ${producto.price.toLocaleString("es-MX")}
          </p>

          {/* Stock */}
          <p className={`text-sm mb-6 ${
            producto.stock === 0 ? "text-red-400" :
            producto.stock <= 5 ? "text-orange-400" : "text-green-400"
          }`}>
            {producto.stock === 0
              ? "Agotado"
              : producto.stock <= 5
              ? `Ultimas ${producto.stock} unidades`
              : "En stock"}
          </p>

          {producto.stock > 0 && (
            <>
              {/* Selector de cantidad */}
              <div className="flex items-center gap-4 mb-6">
                <p className="text-zinc-400 text-sm uppercase tracking-wider">Cantidad</p>
                <div className="flex items-center border border-zinc-700">
                  <button
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-white border-x border-zinc-700 min-w-12 text-center">
                    {cantidad}
                  </span>
                  <button
                    onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                    className="px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botones de accion */}
              <div className="flex gap-3">
                <button
                  onClick={agregarAlCarrito}
                  className={`flex-1 py-3 font-bold uppercase tracking-wider text-sm transition-colors ${
                    agregado
                      ? "bg-green-700 text-white"
                      : "bg-yellow-500 hover:bg-yellow-400 text-black"
                  }`}
                >
                  {agregado ? "Agregado al carrito" : "Agregar al carrito"}
                </button>
                <Link
                  href="/carrito"
                  className="border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black px-4 py-3 text-sm uppercase tracking-wider transition-colors"
                >
                  Ver carrito
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}