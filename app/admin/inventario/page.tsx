// Página de gestión de inventario
// Permite ver stock, agregar entradas y ver historial de movimientos

"use client";

import { useState, useEffect } from "react";

type Producto = {
  id: string;
  name: string;
  brand: string;
  stock: number;
  images: string[];
  category: { name: string };
};

type Movimiento = {
  id: string;
  type: string;
  quantity: number;
  reason: string;
  createdAt: string;
  product: { name: string; brand: string };
};

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [tipoMovimiento, setTipoMovimiento] = useState<"ENTRADA" | "AJUSTE">("ENTRADA");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    const [prodRes, movRes] = await Promise.all([
      fetch("/api/productos"),
      fetch("/api/inventario"),
    ]);
    const prods = await prodRes.json();
    const movs = await movRes.json();
    setProductos(prods);
    setMovimientos(movs);
    setLoading(false);
  }

  // Abrir modal para ajustar stock
  function abrirModal(producto: Producto, tipo: "ENTRADA" | "AJUSTE") {
    setProductoSeleccionado(producto);
    setTipoMovimiento(tipo);
    setCantidad("");
    setMotivo("");
    setModalAbierto(true);
  }

  // Guardar movimiento de inventario
  async function guardarMovimiento() {
    if (!productoSeleccionado || !cantidad || !motivo) return;
    setGuardando(true);

    const res = await fetch("/api/inventario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: productoSeleccionado.id,
        type: tipoMovimiento,
        quantity: parseInt(cantidad),
        reason: motivo,
      }),
    });

    if (res.ok) {
      setModalAbierto(false);
      cargarDatos();
    }
    setGuardando(false);
  }

  // Color según nivel de stock
  function colorStock(stock: number) {
    if (stock === 0) return "text-red-500";
    if (stock <= 5) return "text-orange-400";
    return "text-green-400";
  }

  // Color según tipo de movimiento
  function colorMovimiento(type: string) {
    if (type === "ENTRADA") return "text-green-400";
    if (type === "VENTA") return "text-red-400";
    return "text-yellow-400";
  }

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">

      <h2 className="text-2xl font-bold mb-6">Inventario</h2>

      {loading ? (
        <p className="text-zinc-500">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Lista de productos con stock */}
          <div>
            <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">
              Stock actual
            </h3>
            <div className="space-y-2">
              {productos.map((producto) => (
                <div
                  key={producto.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    {/* Miniatura del producto */}
                    <div className="w-10 h-10 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                      {producto.images[0] ? (
                        <img
                          src={producto.images[0]}
                          alt={producto.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                          N/A
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{producto.name}</p>
                      <p className="text-xs text-zinc-500">{producto.brand}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Stock con color según nivel */}
                    <span className={`font-bold text-lg ${colorStock(producto.stock)}`}>
                      {producto.stock}
                    </span>
                    {/* Botones de ajuste */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => abrirModal(producto, "ENTRADA")}
                        className="bg-green-900 hover:bg-green-800 text-green-400 text-xs px-2 py-1 rounded transition-colors"
                        title="Agregar stock"
                      >
                        + Entrada
                      </button>
                      <button
                        onClick={() => abrirModal(producto, "AJUSTE")}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs px-2 py-1 rounded transition-colors"
                        title="Ajuste manual"
                      >
                        Ajuste
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historial de movimientos */}
          <div>
            <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">
              Historial de movimientos
            </h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              {movimientos.length === 0 ? (
                <p className="text-zinc-600 text-sm p-4">Sin movimientos aun</p>
              ) : (
                <div className="divide-y divide-zinc-800 max-h-96 overflow-y-auto">
                  {movimientos.map((mov) => (
                    <div key={mov.id} className="p-3 flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{mov.product.name}</p>
                        <p className="text-xs text-zinc-500">{mov.reason}</p>
                        <p className="text-xs text-zinc-600">
                          {new Date(mov.createdAt).toLocaleDateString("es-MX", {
                            day: "2-digit", month: "short",
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold text-sm ${colorMovimiento(mov.type)}`}>
                          {mov.quantity > 0 ? "+" : ""}{mov.quantity}
                        </span>
                        <p className="text-xs text-zinc-600">{mov.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Modal de movimiento */}
      {modalAbierto && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md">

            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {tipoMovimiento === "ENTRADA" ? "Agregar Stock" : "Ajuste Manual"}
              </h3>
              <button onClick={() => setModalAbierto(false)} className="text-zinc-500 hover:text-white">
                x
              </button>
            </div>

            <div className="p-6 space-y-4">

              {/* Producto seleccionado */}
              <div className="bg-zinc-800 rounded p-3">
                <p className="text-sm font-bold">{productoSeleccionado.name}</p>
                <p className="text-xs text-zinc-400">{productoSeleccionado.brand}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Stock actual: <span className={`font-bold ${colorStock(productoSeleccionado.stock)}`}>
                    {productoSeleccionado.stock} unidades
                  </span>
                </p>
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">
                  {tipoMovimiento === "ENTRADA" ? "Cantidad a agregar" : "Nueva cantidad total"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                  placeholder="0"
                />
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">
                  Motivo
                </label>
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                  placeholder={tipoMovimiento === "ENTRADA" ? "Compra a proveedor" : "Conteo fisico"}
                />
              </div>

            </div>

            <div className="p-6 border-t border-zinc-800 flex gap-3 justify-end">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 text-zinc-400 hover:text-white text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={guardarMovimiento}
                disabled={guardando || !cantidad || !motivo}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2 rounded text-sm uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}