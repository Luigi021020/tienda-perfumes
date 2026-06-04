// Página de gestión de pedidos del panel admin
// Permite ver pedidos y cambiar su estado

"use client";

import { useState, useEffect } from "react";

type Pedido = {
  id: string;
  orderNumber: string;
  status: "SOLICITADO" | "COMPLETADO" | "CANCELADO";
  total: number;
  createdAt: string;
  notes: string | null;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      brand: string;
    };
  }[];
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [filtro, setFiltro] = useState<string>("TODOS");
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    cargarPedidos();
  }, []);

  async function cargarPedidos() {
    setLoading(true);
    const res = await fetch("/api/pedidos");
    const data = await res.json();
    setPedidos(data);
    setLoading(false);
  }

  // Cambiar estado del pedido
  async function cambiarEstado(pedidoId: string, nuevoEstado: string) {
    setActualizando(true);
    const res = await fetch(`/api/pedidos/${pedidoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nuevoEstado }),
    });

    if (res.ok) {
      await cargarPedidos();
      // Actualizar el pedido seleccionado si está abierto
      if (pedidoSeleccionado?.id === pedidoId) {
        const actualizado = await fetch(`/api/pedidos/${pedidoId}`);
        const data = await actualizado.json();
        setPedidoSeleccionado(data);
      }
    }
    setActualizando(false);
  }

  // Filtrar pedidos por estado
  const pedidosFiltrados = filtro === "TODOS"
    ? pedidos
    : pedidos.filter((p) => p.status === filtro);

  // Color de la etiqueta según estado
  function colorEstado(status: string) {
    if (status === "COMPLETADO") return "bg-green-900 text-green-400";
    if (status === "CANCELADO") return "bg-red-900 text-red-400";
    return "bg-yellow-900 text-yellow-400";
  }

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">

      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Pedidos</h2>
      </div>

      {/* Filtros por estado */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["TODOS", "SOLICITADO", "COMPLETADO", "CANCELADO"].map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltro(estado)}
            className={`px-4 py-2 rounded text-xs uppercase tracking-wider font-bold transition-colors ${
              filtro === estado
                ? "bg-yellow-500 text-black"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {estado}
          </button>
        ))}
      </div>

      {/* Lista de pedidos */}
      {loading ? (
        <p className="text-zinc-500">Cargando pedidos...</p>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-10 text-center">
          <p className="text-zinc-500">No hay pedidos {filtro !== "TODOS" ? `con estado ${filtro}` : "aun"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidosFiltrados.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4"
            >
              {/* Info del pedido */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-yellow-500">{pedido.orderNumber}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${colorEstado(pedido.status)}`}>
                    {pedido.status}
                  </span>
                </div>
                <p className="text-sm text-white">{pedido.customer.name}</p>
                <p className="text-xs text-zinc-500">{pedido.customer.phone} · {pedido.customer.email}</p>
                <p className="text-xs text-zinc-600 mt-1">
                  {new Date(pedido.createdAt).toLocaleDateString("es-MX", {
                    day: "2-digit", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              </div>

              {/* Total y acciones */}
              <div className="flex flex-col items-end justify-between gap-2">
                <span className="text-lg font-bold text-yellow-500">
                  ${pedido.total.toLocaleString("es-MX")}
                </span>
                <div className="flex gap-2">
                  {/* Ver detalle */}
                  <button
                    onClick={() => setPedidoSeleccionado(pedido)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-2 rounded transition-colors"
                  >
                    Ver detalle
                  </button>
                  {/* Botones de cambio de estado */}
                  {pedido.status === "SOLICITADO" && (
                    <>
                      <button
                        onClick={() => cambiarEstado(pedido.id, "COMPLETADO")}
                        disabled={actualizando}
                        className="bg-green-800 hover:bg-green-700 text-green-300 text-xs px-3 py-2 rounded transition-colors disabled:opacity-50"
                      >
                        Completar
                      </button>
                      <button
                        onClick={() => cambiarEstado(pedido.id, "CANCELADO")}
                        disabled={actualizando}
                        className="bg-red-900 hover:bg-red-800 text-red-400 text-xs px-3 py-2 rounded transition-colors disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalle del pedido */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-lg max-h-screen overflow-y-auto">

            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">{pedidoSeleccionado.orderNumber}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${colorEstado(pedidoSeleccionado.status)}`}>
                  {pedidoSeleccionado.status}
                </span>
              </div>
              <button
                onClick={() => setPedidoSeleccionado(null)}
                className="text-zinc-500 hover:text-white text-xl"
              >
                x
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Datos del cliente */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Cliente</h4>
                <p className="text-sm font-bold">{pedidoSeleccionado.customer.name}</p>
                <p className="text-xs text-zinc-400">{pedidoSeleccionado.customer.email}</p>
                <p className="text-xs text-zinc-400">{pedidoSeleccionado.customer.phone}</p>
                <p className="text-xs text-zinc-400">{pedidoSeleccionado.customer.address}</p>
              </div>

              {/* Productos del pedido */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Productos</h4>
                <div className="space-y-2">
                  {pedidoSeleccionado.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-zinc-800 rounded p-3">
                      <div>
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-zinc-500">{item.product.brand}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-yellow-500">
                          ${item.price.toLocaleString("es-MX")}
                        </p>
                        <p className="text-xs text-zinc-500">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center border-t border-zinc-800 pt-4">
                <span className="text-sm text-zinc-400 uppercase tracking-wider">Total</span>
                <span className="text-xl font-bold text-yellow-500">
                  ${pedidoSeleccionado.total.toLocaleString("es-MX")}
                </span>
              </div>

              {/* Acciones */}
              {pedidoSeleccionado.status === "SOLICITADO" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => cambiarEstado(pedidoSeleccionado.id, "COMPLETADO")}
                    disabled={actualizando}
                    className="flex-1 bg-green-800 hover:bg-green-700 text-green-300 font-bold py-3 rounded text-sm uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    Marcar como Completado
                  </button>
                  <button
                    onClick={() => cambiarEstado(pedidoSeleccionado.id, "CANCELADO")}
                    disabled={actualizando}
                    className="flex-1 bg-red-900 hover:bg-red-800 text-red-400 font-bold py-3 rounded text-sm uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    Cancelar pedido
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}