// Página de gestión de clientes
// Muestra lista de clientes y su historial de compras

"use client";

import { useState, useEffect } from "react";

type Cliente = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  orders: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarClientes();
  }, []);

  async function cargarClientes() {
    setLoading(true);
    const res = await fetch("/api/clientes");
    const data = await res.json();
    setClientes(data);
    setLoading(false);
  }

  // Filtrar clientes por búsqueda
  const clientesFiltrados = clientes.filter((c) =>
    c.name.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.phone.includes(busqueda)
  );

  // Total gastado por cliente
  function totalGastado(cliente: Cliente) {
    return cliente.orders
      .filter((o) => o.status === "COMPLETADO")
      .reduce((sum, o) => sum + o.total, 0);
  }

  function colorEstado(status: string) {
    if (status === "COMPLETADO") return "bg-green-900 text-green-400";
    if (status === "CANCELADO") return "bg-red-900 text-red-400";
    return "bg-yellow-900 text-yellow-400";
  }

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Clientes</h2>
        <span className="text-zinc-500 text-sm">{clientes.length} clientes registrados</span>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, correo o telefono..."
          className="w-full max-w-md bg-zinc-900 border border-zinc-700 text-white rounded px-4 py-2 text-sm focus:outline-none focus:border-yellow-500"
        />
      </div>

      {loading ? (
        <p className="text-zinc-500">Cargando clientes...</p>
      ) : clientesFiltrados.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-10 text-center">
          <p className="text-zinc-500">No hay clientes aun</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clientesFiltrados.map((cliente) => (
            <div
              key={cliente.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4"
            >
              <div className="flex-1">
                <p className="font-bold text-white">{cliente.name}</p>
                <p className="text-xs text-zinc-400">{cliente.email}</p>
                <p className="text-xs text-zinc-400">{cliente.phone}</p>
                <p className="text-xs text-zinc-600 mt-1">{cliente.address}</p>
              </div>

              <div className="flex flex-col items-end justify-between gap-2">
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Total gastado</p>
                  <p className="text-yellow-500 font-bold">
                    ${totalGastado(cliente).toLocaleString("es-MX")}
                  </p>
                  <p className="text-xs text-zinc-600">
                    {cliente.orders.length} pedido{cliente.orders.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setClienteSeleccionado(cliente)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-2 rounded transition-colors"
                >
                  Ver historial
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal historial del cliente */}
      {clienteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-lg max-h-screen overflow-y-auto">

            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">{clienteSeleccionado.name}</h3>
                <p className="text-xs text-zinc-500">{clienteSeleccionado.email}</p>
              </div>
              <button
                onClick={() => setClienteSeleccionado(null)}
                className="text-zinc-500 hover:text-white text-xl"
              >
                x
              </button>
            </div>

            <div className="p-6 space-y-4">

              {/* Info del cliente */}
              <div className="bg-zinc-800 rounded p-4 space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Datos de contacto</p>
                <p className="text-sm">{clienteSeleccionado.phone}</p>
                <p className="text-sm text-zinc-400">{clienteSeleccionado.address}</p>
                <p className="text-xs text-zinc-600 mt-2">
                  Cliente desde: {new Date(clienteSeleccionado.createdAt).toLocaleDateString("es-MX")}
                </p>
              </div>

              {/* Historial de pedidos */}
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Historial de pedidos</p>
                {clienteSeleccionado.orders.length === 0 ? (
                  <p className="text-zinc-600 text-sm">Sin pedidos</p>
                ) : (
                  <div className="space-y-2">
                    {clienteSeleccionado.orders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center bg-zinc-800 rounded p-3">
                        <div>
                          <p className="text-sm font-bold text-yellow-500">{order.orderNumber}</p>
                          <p className="text-xs text-zinc-500">
                            {new Date(order.createdAt).toLocaleDateString("es-MX")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">${order.total.toLocaleString("es-MX")}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${colorEstado(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumen */}
              <div className="border-t border-zinc-800 pt-4 flex justify-between">
                <span className="text-sm text-zinc-400">Total gastado</span>
                <span className="text-yellow-500 font-bold">
                  ${totalGastado(clienteSeleccionado).toLocaleString("es-MX")}
                </span>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}