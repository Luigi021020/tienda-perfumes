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

type ItemVenta = {
  productId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
  imagen: string;
};

type VentaDelDia = {
  id: string;
  orderNumber: string;
  total: number;
  notes: string | null;
  items: {
    quantity: number;
    price: number;
    product: {
      name: string;
      brand: string;
      images: string[];
    };
  }[];
};

export default function VentasExternasPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [items, setItems] = useState<ItemVenta[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [ventasHoy, setVentasHoy] = useState<VentaDelDia[]>([]);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    canal: "PRESENCIAL",
    notes: "",
  });

  useEffect(() => {
    cargarProductos();
    cargarVentasHoy();
  }, []);

  async function cargarProductos() {
    setLoading(true);
    const res = await fetch("/api/productos");
    const data = await res.json();
    setProductos(data.filter((p: Producto) => p.stock > 0));
    setLoading(false);
  }

  async function cargarVentasHoy() {
    const res = await fetch("/api/ventas-externas/hoy");
    if (res.ok) {
      const data = await res.json();
      setVentasHoy(data);
    }
  }

  // Solo mostrar productos cuando hay busqueda
  const productosFiltrados = busqueda.length >= 2
    ? productos.filter(
        (p) =>
          p.name.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.brand.toLowerCase().includes(busqueda.toLowerCase())
      )
    : [];

  function agregarProducto(producto: Producto) {
    const existente = items.find((i) => i.productId === producto.id);
    if (existente) {
      setItems(items.map((i) =>
        i.productId === producto.id
          ? { ...i, cantidad: Math.min(i.cantidad + 1, i.stock) }
          : i
      ));
    } else {
      setItems([...items, {
        productId: producto.id,
        nombre: producto.name + " - " + producto.brand,
        precio: producto.price,
        cantidad: 1,
        stock: producto.stock,
        imagen: producto.images[0] ?? "",
      }]);
    }
    setBusqueda("");
  }

  function cambiarCantidad(productId: string, cantidad: number) {
    if (cantidad < 1) {
      setItems(items.filter((i) => i.productId !== productId));
      return;
    }
    setItems(items.map((i) =>
      i.productId === productId
        ? { ...i, cantidad: Math.min(cantidad, i.stock) }
        : i
    ));
  }

  const total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

  // Total de ventas externas del dia
  const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0);

  async function registrarVenta() {
    if (items.length === 0) { setMensaje("Agrega al menos un producto"); return; }
    if (!form.customerName) { setMensaje("El nombre del cliente es requerido"); return; }
    setGuardando(true);
    setMensaje("");
    const res = await fetch("/api/ventas-externas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        items: items.map((i) => ({ productId: i.productId, quantity: i.cantidad, price: i.precio })),
        total,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setMensaje("Venta registrada - " + data.orderNumber);
      setItems([]);
      setForm({ customerName: "", customerPhone: "", canal: "PRESENCIAL", notes: "" });
      cargarProductos();
      cargarVentasHoy();
    } else {
      const error = await res.json();
      setMensaje("Error: " + error.error);
    }
    setGuardando(false);
    setTimeout(() => setMensaje(""), 5000);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Ventas Externas</h2>
        <p className="text-zinc-500 text-sm mt-1">Registra ventas de WhatsApp, presenciales o cualquier canal fuera de la pagina</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Panel izquierdo */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">Buscar producto</h3>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Escribe el nombre o marca para buscar..."
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 mb-3"
            />

            {/* Solo mostrar resultados cuando hay busqueda */}
            {busqueda.length >= 2 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {productosFiltrados.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-4">No se encontraron productos</p>
                ) : (
                  productosFiltrados.map((producto) => (
                    <div key={producto.id} className="flex justify-between items-center bg-zinc-800 rounded p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-700 rounded overflow-hidden flex-shrink-0">
                          {producto.images[0] && <img src={producto.images[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{producto.name}</p>
                          <p className="text-xs text-zinc-500">{producto.brand} · Stock: {producto.stock}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500 text-sm font-bold">${producto.price.toLocaleString("es-MX")}</span>
                        <button onClick={() => agregarProducto(producto)} className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded transition-colors">
                          + Agregar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {busqueda.length === 0 && (
              <p className="text-zinc-600 text-xs text-center py-2">Escribe al menos 2 caracteres para buscar</p>
            )}
            {busqueda.length === 1 && (
              <p className="text-zinc-600 text-xs text-center py-2">Escribe un caracter mas para buscar</p>
            )}
          </div>

          {/* Datos del cliente */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h3 className="text-sm uppercase tracking-wider text-zinc-400">Datos del cliente</h3>
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">Nombre *</label>
              <input type="text" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500" placeholder="Nombre del cliente" />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">Telefono</label>
              <input type="text" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500" placeholder="Opcional" />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">Canal de venta</label>
              <select value={form.canal} onChange={(e) => setForm({ ...form, canal: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500">
                <option value="PRESENCIAL">Presencial</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="TELEFONO">Telefono</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">Notas</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500" placeholder="Opcional" />
            </div>
          </div>
        </div>

        {/* Panel derecho */}
        <div className="space-y-4">

          {/* Resumen de la venta actual */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Resumen de la venta</h3>
            {items.length === 0 ? (
              <p className="text-zinc-600 text-sm py-4 text-center">Agrega productos desde el panel izquierdo</p>
            ) : (
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center bg-zinc-800 rounded p-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-zinc-700 rounded overflow-hidden flex-shrink-0">
                        {item.imagen && <img src={item.imagen} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.nombre}</p>
                        <p className="text-xs text-zinc-500">${item.precio.toLocaleString("es-MX")} c/u</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-zinc-700">
                        <button onClick={() => cambiarCantidad(item.productId, item.cantidad - 1)} className="px-2 py-1 text-zinc-400 hover:text-white text-sm">-</button>
                        <span className="px-2 py-1 text-white text-sm border-x border-zinc-700">{item.cantidad}</span>
                        <button onClick={() => cambiarCantidad(item.productId, item.cantidad + 1)} className="px-2 py-1 text-zinc-400 hover:text-white text-sm">+</button>
                      </div>
                      <span className="text-yellow-500 font-bold text-sm w-20 text-right">${(item.precio * item.cantidad).toLocaleString("es-MX")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {items.length > 0 && (
              <>
                <div className="border-t border-zinc-800 pt-4 mb-4 flex justify-between items-center">
                  <span className="text-zinc-400 uppercase tracking-wider text-sm">Total</span>
                  <span className="text-2xl font-bold text-yellow-500">${total.toLocaleString("es-MX")}</span>
                </div>
                {mensaje && (
                  <div className={"p-3 rounded text-sm text-center mb-4 " + (mensaje.includes("Error") ? "bg-red-900 text-red-400" : "bg-green-900 text-green-400")}>
                    {mensaje}
                  </div>
                )}
                <button onClick={registrarVenta} disabled={guardando}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded text-sm uppercase tracking-wider transition-colors disabled:opacity-50">
                  {guardando ? "Registrando..." : "Registrar venta"}
                </button>
              </>
            )}
            {mensaje && items.length === 0 && (
              <div className={"p-3 rounded text-sm text-center " + (mensaje.includes("Error") ? "bg-red-900 text-red-400" : "bg-green-900 text-green-400")}>
                {mensaje}
              </div>
            )}
          </div>

          {/* Ventas externas del dia */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm uppercase tracking-wider text-zinc-400">Ventas externas de hoy</h3>
              <span className="text-yellow-500 font-bold text-sm">
                Total: ${totalVentasHoy.toLocaleString("es-MX")}
              </span>
            </div>
            {ventasHoy.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-4">Sin ventas externas hoy</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {ventasHoy.map((venta) => (
                  <div key={venta.id} className="bg-zinc-800 rounded p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-yellow-500 text-xs font-bold">{venta.orderNumber}</span>
                      <span className="text-white font-bold text-sm">${venta.total.toLocaleString("es-MX")}</span>
                    </div>
                    {venta.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 mt-1">
                        <div className="w-8 h-8 bg-zinc-700 rounded overflow-hidden flex-shrink-0">
                          {item.product.images[0] && <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-white">{item.product.name}</p>
                          <p className="text-xs text-zinc-500">{item.product.brand} · x{item.quantity}</p>
                        </div>
                        <span className="text-xs text-zinc-400">${(item.price * item.quantity).toLocaleString("es-MX")}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}