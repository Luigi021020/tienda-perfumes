// Página de checkout
// El cliente llena sus datos y genera el pedido via WhatsApp

"use client";

import { useState } from "react";
import { useCarrito } from "@/lib/useCarrito";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, total, vaciar } = useCarrito();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Si el carrito esta vacio redirigir
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">Tu carrito esta vacio</p>
        <Link href="/catalogo" className="text-yellow-500 hover:underline text-sm">
          Ir al catalogo
        </Link>
      </div>
    );
  }

  async function realizarPedido() {
    if (!form.name || !form.email || !form.phone || !form.address) {
      alert("Por favor completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      // Crear el pedido en la base de datos
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          total: total(),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error ?? "Error al crear el pedido");
        setLoading(false);
        return;
      }

      const pedido = await res.json();

      // Obtener configuracion de WhatsApp
      const configRes = await fetch("/api/configuracion");
      const config = await configRes.json();
      const whatsapp = config?.whatsapp ?? "";

      // Construir mensaje de WhatsApp
      const productosTexto = items
        .map((item) => `  • ${item.name} (${item.brand}) x${item.quantity} — $${(item.price * item.quantity).toLocaleString("es-MX")}`)
        .join("\n");

      const mensaje = encodeURIComponent(
        `*NUEVO PEDIDO - ${pedido.orderNumber}*\n\n` +
        `*Cliente:* ${form.name}\n` +
        `*Correo:* ${form.email}\n` +
        `*Telefono:* ${form.phone}\n` +
        `*Direccion:* ${form.address}\n\n` +
        `*Productos:*\n${productosTexto}\n\n` +
        `*Total: $${total().toLocaleString("es-MX")}*\n\n` +
        `Quedo a sus ordenes para acordar el pago y la entrega.`
      );

      // Enviar correo de confirmacion al cliente
      await fetch("/api/correo/confirmacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedido,
          customer: form,
          whatsapp,
        }),
      });

      // Vaciar el carrito
      vaciar();

      // Abrir WhatsApp con el mensaje prellenado
      window.open(`https://wa.me/${whatsapp}?text=${mensaje}`, "_blank");

      // Redirigir a pagina de confirmacion
      router.push(`/pedido-confirmado?numero=${pedido.orderNumber}`);

    } catch (error) {
      alert("Error al procesar el pedido");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <h1 className="text-3xl font-bold tracking-widest uppercase mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Formulario de datos */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">
              Tus datos
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">
                  Correo electronico
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                  placeholder="tu@correo.com"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">
                  Telefono (WhatsApp)
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                  placeholder="81XXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">
                  Direccion de entrega
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                  placeholder="Calle, numero, colonia, ciudad"
                />
              </div>
            </div>
          </div>

          {/* Aviso de WhatsApp */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <p className="text-sm font-bold text-white mb-1">
                  Como funciona
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Al dar clic en "Realizar pedido", se abrira WhatsApp con un mensaje prellenado con tu pedido. Envialo a nuestro asesor para acordar el pago y la entrega. Tambien recibiras un correo de confirmacion.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 sticky top-24">
            <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">
              Tu pedido
            </h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-zinc-500">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-yellow-500">
                    ${(item.price * item.quantity).toLocaleString("es-MX")}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Total</span>
                <span className="text-2xl font-bold text-yellow-500">
                  ${total().toLocaleString("es-MX")}
                </span>
              </div>
            </div>

            <button
              onClick={realizarPedido}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 uppercase tracking-widest text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                "Procesando..."
              ) : (
                <>
                  <span>💬</span>
                  Realizar pedido por WhatsApp
                </>
              )}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}