// Tarjeta de producto para el catalogo
// Muestra imagen, nombre, precio y boton de agregar al carrito

"use client";

import Link from "next/link";
import { useCarrito } from "@/lib/useCarrito";
import { useState } from "react";

type Producto = {
  id: string;
  name: string;
  brand: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  images: string[];
  category: { name: string };
};

export default function TarjetaProducto({ producto }: { producto: Producto }) {
  const agregar = useCarrito((s) => s.agregar);
  const [agregado, setAgregado] = useState(false);

  function agregarAlCarrito() {
    agregar({
      id: producto.id,
      name: producto.name,
      brand: producto.brand,
      price: producto.price,
      image: producto.images[0] ?? "",
      quantity: 1,
      stock: producto.stock,
    });
    // Mostrar confirmacion por 2 segundos
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  }

  return (
    <div className="group bg-zinc-950 border border-zinc-800 hover:border-yellow-500 transition-colors overflow-hidden">

      {/* Imagen */}
      <Link href={`/producto/${producto.id}`}>
        <div className="relative h-64 bg-zinc-900 overflow-hidden">
          {producto.images[0] ? (
            <img
              src={producto.images[0]}
              alt={producto.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700">
              Sin imagen
            </div>
          )}
          {/* Badge sin stock */}
          {producto.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="text-white text-sm uppercase tracking-wider">Agotado</span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{producto.brand}</p>
        <Link href={`/producto/${producto.id}`}>
          <h3 className="text-white font-bold hover:text-yellow-500 transition-colors mb-1">
            {producto.name}
          </h3>
        </Link>
        <p className="text-xs text-zinc-600 mb-3">{producto.category.name}</p>

<div className="flex justify-between items-center">
          <div>
            {producto.comparePrice && producto.comparePrice > producto.price ? (
              <div>
                <span className="text-zinc-500 text-xs line-through block">
                  ${producto.comparePrice.toLocaleString("es-MX")}
                </span>
                <span className="text-yellow-500 font-bold text-lg">
                  ${producto.price.toLocaleString("es-MX")}
                </span>
              </div>
            ) : (
              <span className="text-yellow-500 font-bold text-lg">
                ${producto.price.toLocaleString("es-MX")}
              </span>
            )}
          </div>
          
          <button
            onClick={agregarAlCarrito}
            disabled={producto.stock === 0}
            className={`text-xs px-3 py-2 uppercase tracking-wider font-bold transition-colors ${
              agregado
                ? "bg-green-700 text-white"
                : producto.stock === 0
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-400 text-black"
            }`}
          >
            {agregado ? "Agregado" : producto.stock === 0 ? "Agotado" : "+ Carrito"}
          </button>
        </div>
      </div>

    </div>
  );
}