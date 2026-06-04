// Página del carrito de compras
// Muestra los productos agregados y permite proceder al checkout

"use client";

import { useCarrito } from "@/lib/useCarrito";
import Link from "next/link";
import Image from "next/image";

export default function CarritoPage() {
  const { items, eliminar, cambiarCantidad, total } = useCarrito();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center">
          <p className="text-6xl mb-6">🛒</p>
          <h1 className="text-2xl font-bold text-white mb-2">Tu carrito esta vacio</h1>
          <p className="text-zinc-500 mb-8">Agrega productos para continuar</p>
          <Link
            href="/catalogo"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 uppercase tracking-widest text-sm transition-colors"
          >
            Ver catalogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <h1 className="text-3xl font-bold tracking-widest uppercase mb-8">Carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex gap-4"
            >
              {/* Imagen */}
              <div className="w-20 h-20 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                    N/A
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">{item.brand}</p>
                <p className="font-bold text-white">{item.name}</p>
                <p className="text-yellow-500 font-bold mt-1">
                  ${item.price.toLocaleString("es-MX")}
                </p>
              </div>

              {/* Controles de cantidad */}
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => eliminar(item.id)}
                  className="text-zinc-600 hover:text-red-400 text-xs transition-colors uppercase tracking-wider"
                >
                  Eliminar
                </button>
                <div className="flex items-center border border-zinc-700">
                  <button
                    onClick={() => cambiarCantidad(item.id, item.quantity - 1)}
                    className="px-3 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-white border-x border-zinc-700 min-w-10 text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => cambiarCantidad(item.id, item.quantity + 1)}
                    className="px-3 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-zinc-400">
                  Subtotal: <span className="text-white font-bold">
                    ${(item.price * item.quantity).toLocaleString("es-MX")}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 sticky top-24">
            <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">
              Resumen del pedido
            </h2>

            {/* Items */}
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-zinc-400">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="text-white">
                    ${(item.price * item.quantity).toLocaleString("es-MX")}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-zinc-800 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 uppercase tracking-wider text-sm">Total</span>
                <span className="text-2xl font-bold text-yellow-500">
                  ${total().toLocaleString("es-MX")}
                </span>
              </div>
            </div>

            {/* Boton de checkout */}
            <Link
              href="/checkout"
              className="block w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 text-center uppercase tracking-widest text-sm transition-colors"
            >
              Proceder al pago
            </Link>

            <Link
              href="/catalogo"
              className="block w-full text-center text-zinc-500 hover:text-white text-sm mt-4 transition-colors"
            >
              Seguir comprando
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}