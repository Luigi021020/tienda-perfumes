// Página de gestión de productos del panel admin
// Permite ver, crear, editar y eliminar productos

"use client";

import { useState, useEffect } from "react";

// Tipo de datos para un producto
type Producto = {
  id: string;
  name: string;
  brand: string;
  price: number;
  cost: number;
  stock: number;
  active: boolean;
  featured: boolean;
  images: string[];
  category: { id: string; name: string };
};

// Tipo para las categorías
type Categoria = {
  id: string;
  name: string;
  parentId: string | null;
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);

  // Estado del formulario
const [form, setForm] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    comparePrice: "", // Precio de oferta opcional
    cost: "",
    stock: "",
    categoryId: "",
    active: true,
    featured: false,
    images: [] as string[],
  });

  // Cargar productos y categorías al abrir la página
  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      fetch("/api/productos"),
      fetch("/api/categorias"),
    ]);
    const prods = await prodRes.json();
    const cats = await catRes.json();
    setProductos(prods);
    setCategorias(cats);
    setLoading(false);
  }

  // Abrir modal para crear nuevo producto
  function abrirModalNuevo() {
    setProductoEditando(null);
    setForm({
      name: "", brand: "", description: "",
      price: "", cost: "", stock: "",
      categoryId: categorias[0]?.id ?? "",
      active: true, featured: false, images: [],
    });
    setModalAbierto(true);
  }

  // Abrir modal para editar producto existente
  function abrirModalEditar(producto: Producto) {
    setProductoEditando(producto);
    setForm({
      name: producto.name,
      brand: producto.brand,
      description: "",
      price: producto.price.toString(),
      cost: producto.cost.toString(),
      stock: producto.stock.toString(),
      categoryId: producto.category.id,
      active: producto.active,
      featured: producto.featured,
      images: producto.images,
      comparePrice: producto.comparePrice?.toString() ?? "",
    });
    setModalAbierto(true);
  }

  // Manejar selección de imágenes
  function manejarImagenes(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, ev.target?.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });
  }

  // Guardar producto (crear o editar)
  async function guardarProducto() {
    const url = productoEditando
      ? `/api/productos/${productoEditando.id}`
      : "/api/productos";
    const method = productoEditando ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setModalAbierto(false);
      cargarDatos();
    }
  }

  // Eliminar producto
  async function eliminarProducto(id: string) {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
    await fetch(`/api/productos/${id}`, { method: "DELETE" });
    cargarDatos();
  }

  // Activar o desactivar producto
  async function toggleActivo(producto: Producto) {
    await fetch(`/api/productos/${producto.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...producto, active: !producto.active, categoryId: producto.category.id, images: producto.images, price: producto.price.toString(), cost: producto.cost.toString(), stock: producto.stock.toString() }),
    });
    cargarDatos();
  }

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">

      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Productos</h2>
        <button
          onClick={abrirModalNuevo}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded text-sm uppercase tracking-wider transition-colors"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Lista de productos */}
      {loading ? (
        <p className="text-zinc-500">Cargando productos...</p>
      ) : productos.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-10 text-center">
          <p className="text-zinc-500 mb-4">No hay productos aun</p>
          <button onClick={abrirModalNuevo} className="text-yellow-500 hover:underline text-sm">
            Agregar el primer producto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productos.map((producto) => (
            <div key={producto.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              
              {/* Imagen del producto */}
              <div className="h-48 bg-zinc-800 relative">
                {producto.images[0] ? (
                  <img
                    src={producto.images[0]}
                    alt={producto.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    Sin imagen
                  </div>
                )}
                {/* Badge de estado */}
                <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-bold ${
                  producto.active ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"
                }`}>
                  {producto.active ? "Activo" : "Inactivo"}
                </span>
              </div>

              {/* Datos del producto */}
              <div className="p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">{producto.brand}</p>
                <h3 className="font-bold text-white mb-1">{producto.name}</h3>
                <p className="text-xs text-zinc-500 mb-3">{producto.category.name}</p>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-yellow-500 font-bold">
                    ${producto.price.toLocaleString("es-MX")}
                  </span>
                  <span className="text-zinc-400 text-sm">
                    Stock: {producto.stock}
                  </span>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button
                    onClick={() => abrirModalEditar(producto)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs py-2 rounded transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => toggleActivo(producto)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs py-2 rounded transition-colors"
                  >
                    {producto.active ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    onClick={() => eliminarProducto(producto.id)}
                    className="bg-red-900 hover:bg-red-800 text-red-400 text-xs py-2 px-3 rounded transition-colors"
                  >
                    X
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de crear/editar producto */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {productoEditando ? "Editar Producto" : "Nuevo Producto"}
              </h3>
              <button onClick={() => setModalAbierto(false)} className="text-zinc-500 hover:text-white text-xl">
                x
              </button>
            </div>

            <div className="p-6 space-y-4">

              {/* Nombre y Marca */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">Nombre</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">Marca</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              {/* Descripcion */}
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">Descripcion</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                />
              </div>

              {/* Precio, Costo y Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">Precio normal</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">
                    Precio de oferta <span className="text-zinc-600">(opcional)</span>
                  </label>
                  <input
                    type="number"
                    value={form.comparePrice}
                    onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                    placeholder="Dejar vacio si no hay oferta"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">Costo</label>
                  <input
                    type="number"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">Categoria</label>
                <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
               >
              {categorias
              .filter((cat) => cat.parentId === null)
              .map((padre) => (
              <optgroup key={padre.id} label={padre.name}>
              {categorias
              .filter((cat) => cat.parentId === padre.id)
              .map((hijo) => (
              <option key={hijo.id} value={hijo.id}>
              {hijo.name}
            </option>
            ))}
          </optgroup>
        ))}
      </select>
            </div>

              {/* Opciones */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="accent-yellow-500"
                  />
                  Activo (visible en tienda)
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="accent-yellow-500"
                  />
                  Destacado (en portada)
                </label>
              </div>

              {/* Imagenes */}
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">
                  Imagenes del producto
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={manejarImagenes}
                  className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 cursor-pointer"
                />
                {/* Preview de imagenes */}
                {form.images.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={img} alt="" className="w-16 h-16 object-cover rounded border border-zinc-700" />
                        <button
                          onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Botones del modal */}
            <div className="p-6 border-t border-zinc-800 flex gap-3 justify-end">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 text-zinc-400 hover:text-white text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarProducto}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2 rounded text-sm uppercase tracking-wider transition-colors"
              >
                {productoEditando ? "Guardar cambios" : "Crear producto"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}