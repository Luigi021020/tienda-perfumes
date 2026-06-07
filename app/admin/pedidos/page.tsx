"use client";

import { useState, useEffect } from "react";

type Producto = {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  images: string[];
};

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
      id: string;
      name: string;
      brand: string;
    };
  }[];
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [pedidoEditando, setPedidoEditando] = useState<Pedido | null>(null);
  const [filtro, setFiltro] = useState<string>("TODOS");
  const [actualizando, setActualizando] = useState(false);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [itemsEditados, setItemsEditados] = useState<{
    id: string;
    quantity: number;
    price: number;
    productId: string;
    nombre: string;
  }[]>([]);

  useEffect(() => {
    cargarPedidos();
    cargarProductos();
  }, []);

  async function cargarPedidos() {
    setLoading(true);
    const res = await fetch("/api/pedidos");
    const data = await res.json();
    setPedidos(data);
    setLoading(false);
  }

  async function cargarProductos() {
    const res = await fetch("/api/productos");
    const data = await res.json();
    setProductos(data);
  }

  async function cambiarEstado(pedidoId: string, nuevoEstado: string) {
    setActualizando(true);
    const res = await fetch("/api/pedidos/" + pedidoId, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nuevoEstado }),
    });
    if (res.ok) {
      await cargarPedidos();
      if (pedidoSeleccionado?.id === pedidoId) {
        setPedidoSeleccionado(null);
      }
    }
    setActualizando(false);
  }

  // Abrir modal de edicion
  function abrirEdicion(pedido: Pedido) {
    setPedidoEditando(pedido);
    setItemsEditados(pedido.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      productId: item.product.id,
      nombre: item.product.name + " - " + item.product.brand,
    })));
    setBusquedaProducto("");
  }

  // Agregar producto nuevo al pedido en edicion
  function agregarProductoAPedido(producto: Producto) {
    const existente = itemsEditados.find((i) => i.productId === producto.id);
    if (existente) {
      setItemsEditados(itemsEditados.map((i) =>
        i.productId === producto.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setItemsEditados([...itemsEditados, {
        id: "nuevo-" + producto.id,
        quantity: 1,
        price: producto.price,
        productId: producto.id,
        nombre: producto.name + " - " + producto.brand,
      }]);
    }
    setBusquedaProducto("");
  }

  // Cambiar cantidad de item en edicion
  function cambiarCantidadItem(productId: string, cantidad: number) {
    if (cantidad < 1) {
      setItemsEditados(itemsEditados.filter((i) => i.productId !== productId));
      return;
    }
    setItemsEditados(itemsEditados.map((i) =>
      i.productId === productId ? { ...i, quantity: cantidad } : i
    ));
  }

  // Guardar edicion del pedido
  async function guardarEdicion() {
    if (!pedidoEditando) return;
    setActualizando(true);

    const nuevoTotal = itemsEditados.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const res = await fetch("/api/pedidos/" + pedidoEditando.id + "/editar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: itemsEditados,
        total: nuevoTotal,
      }),
    });

    if (res.ok) {
      setPedidoEditando(null);
      await cargarPedidos();
    }
    setActualizando(false);
  }

  const pedidosFiltrados = filtro === "TODOS"
    ? pedidos
    : pedidos.filter((p) => p.status === filtro);

  const productosFiltrados = busquedaProducto.length >= 2
    ? productos.filter((p) =>
        p.name.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
        p.brand.toLowerCase().includes(busquedaProducto.toLowerCase())
      )
    : [];

  function colorEstado(status: string) {
    if (status === "COMPLETADO") return "bg-green-900 text-green-400";
    if (status === "CANCELADO") return "bg-red-900 text-red-400";
    return "bg-yellow-900 text-yellow-400";
  }

  const nuevoTotal = itemsEditados.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Pedidos</h2>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["TODOS", "SOLICITADO", "COMPLETADO", "CANCELADO"].map((estado) => (
          <button key={estado} onClick={() => setFiltro(estado)}
            className={"px-4 py-2 rounded text-xs uppercase tracking-wider font-bold transition-colors " + (
              filtro === estado ? "bg-yellow-500 text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}>
            {estado}
          </button>
        ))}
      </div>

      {/* Lista de pedidos */}
      {loading ? (
        <p className="text-zinc-500">Cargando pedidos...</p>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-10 text-center">
          <p className="text-zinc-500">No hay pedidos {filtro !== "TODOS" ? "con estado " + filtro : "aun"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidosFiltrados.map((pedido) => (
            <div key={pedido.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-yellow-500">{pedido.orderNumber}</span>
                  <span className={"text-xs px-2 py-0.5 rounded-full font-bold " + colorEstado(pedido.status)}>
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
              <div className="flex flex-col items-end justify-between gap-2">
                <span className="text-lg font-bold text-yellow-500">${pedido.total.toLocaleString("es-MX")}</span>
                <div className="flex gap-2 flex-wrap justify-end">
                  <button onClick={() => setPedidoSeleccionado(pedido)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-2 rounded transition-colors">
                    Ver detalle
                  </button>
                  {pedido.status === "SOLICITADO" && (
                    <>
                      <button onClick={() => abrirEdicion(pedido)}
                        className="bg-blue-900 hover:bg-blue-800 text-blue-400 text-xs px-3 py-2 rounded transition-colors">
                        Editar
                      </button>
                      <button onClick={() => cambiarEstado(pedido.id, "COMPLETADO")} disabled={actualizando}
                        className="bg-green-800 hover:bg-green-700 text-green-300 text-xs px-3 py-2 rounded transition-colors disabled:opacity-50">
                        Completar
                      </button>
                      <button onClick={() => cambiarEstado(pedido.id, "CANCELADO")} disabled={actualizando}
                        className="bg-red-900 hover:bg-red-800 text-red-400 text-xs px-3 py-2 rounded transition-colors disabled:opacity-50">
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

      {/* Modal ver detalle */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">{pedidoSeleccionado.orderNumber}</h3>
                <span className={"text-xs px-2 py-0.5 rounded-full font-bold " + colorEstado(pedidoSeleccionado.status)}>
                  {pedidoSeleccionado.status}
                </span>
              </div>
              <button onClick={() => setPedidoSeleccionado(null)} className="text-zinc-500 hover:text-white text-xl">x</button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Cliente</h4>
                <p className="text-sm font-bold">{pedidoSeleccionado.customer.name}</p>
                <p className="text-xs text-zinc-400">{pedidoSeleccionado.customer.email}</p>
                <p className="text-xs text-zinc-400">{pedidoSeleccionado.customer.phone}</p>
                <p className="text-xs text-zinc-400">{pedidoSeleccionado.customer.address}</p>
              </div>
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
                        <p className="text-sm font-bold text-yellow-500">${item.price.toLocaleString("es-MX")}</p>
                        <p className="text-xs text-zinc-500">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-zinc-800 pt-4">
                <span className="text-sm text-zinc-400 uppercase tracking-wider">Total</span>
                <span className="text-xl font-bold text-yellow-500">${pedidoSeleccionado.total.toLocaleString("es-MX")}</span>
              </div>
              {pedidoSeleccionado.status === "SOLICITADO" && (
                <div className="flex gap-3">
                  <button onClick={() => cambiarEstado(pedidoSeleccionado.id, "COMPLETADO")} disabled={actualizando}
                    className="flex-1 bg-green-800 hover:bg-green-700 text-green-300 font-bold py-3 rounded text-sm uppercase tracking-wider transition-colors disabled:opacity-50">
                    Completar
                  </button>
                  <button onClick={() => cambiarEstado(pedidoSeleccionado.id, "CANCELADO")} disabled={actualizando}
                    className="flex-1 bg-red-900 hover:bg-red-800 text-red-400 font-bold py-3 rounded text-sm uppercase tracking-wider transition-colors disabled:opacity-50">
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal editar pedido */}
      {pedidoEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Editar pedido</h3>
                <p className="text-yellow-500 text-sm">{pedidoEditando.orderNumber}</p>
              </div>
              <button onClick={() => setPedidoEditando(null)} className="text-zinc-500 hover:text-white text-xl">x</button>
            </div>

            <div className="p-6 space-y-5">

              {/* Productos actuales */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Productos en el pedido</h4>
                <div className="space-y-2">
                  {itemsEditados.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center bg-zinc-800 rounded p-3">
                      <p className="text-sm flex-1">{item.nombre}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-zinc-700">
                          <button onClick={() => cambiarCantidadItem(item.productId, item.quantity - 1)}
                            className="px-2 py-1 text-zinc-400 hover:text-white text-sm">-</button>
                          <span className="px-2 py-1 text-white text-sm border-x border-zinc-700">{item.quantity}</span>
                          <button onClick={() => cambiarCantidadItem(item.productId, item.quantity + 1)}
                            className="px-2 py-1 text-zinc-400 hover:text-white text-sm">+</button>
                        </div>
                        <span className="text-yellow-500 text-sm font-bold w-20 text-right">
                          ${(item.price * item.quantity).toLocaleString("es-MX")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agregar producto nuevo */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Agregar producto al pedido</h4>
                <input
                  type="text"
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  placeholder="Escribe nombre o marca para buscar..."
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 mb-2"
                />
                {productosFiltrados.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {productosFiltrados.map((producto) => (
                      <div key={producto.id} className="flex justify-between items-center bg-zinc-800 rounded p-2">
                        <div>
                          <p className="text-sm">{producto.name}</p>
                          <p className="text-xs text-zinc-500">{producto.brand} · ${producto.price.toLocaleString("es-MX")}</p>
                        </div>
                        <button onClick={() => agregarProductoAPedido(producto)}
                          className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                          + Agregar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nuevo total */}
              <div className="flex justify-between items-center border-t border-zinc-800 pt-4">
                <span className="text-zinc-400 uppercase tracking-wider text-sm">Nuevo total</span>
                <span className="text-2xl font-bold text-yellow-500">${nuevoTotal.toLocaleString("es-MX")}</span>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button onClick={() => setPedidoEditando(null)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded text-sm uppercase tracking-wider transition-colors">
                  Cancelar
                </button>
                <button onClick={guardarEdicion} disabled={actualizando}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded text-sm uppercase tracking-wider transition-colors disabled:opacity-50">
                  {actualizando ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}