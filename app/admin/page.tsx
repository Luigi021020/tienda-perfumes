// Dashboard principal del panel administrativo
// Muestra resumen de ventas, pedidos y alertas de inventario

import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {

  // Obtener datos para el dashboard
  const hoy = new Date();
  const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const inicioDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  // Pedidos completados hoy
  const pedidosHoy = await prisma.order.count({
    where: {
      createdAt: { gte: inicioDelDia },
      status: "COMPLETADO",
    },
  });

  // Total ventas del mes
  const ventasMes = await prisma.order.aggregate({
    where: {
      createdAt: { gte: inicioDelMes },
      status: "COMPLETADO",
    },
    _sum: { total: true },
  });

  // Pedidos pendientes de atender
  const pedidosPendientes = await prisma.order.count({
    where: { status: "SOLICITADO" },
  });

  // Productos con stock bajo (menos de 5 unidades)
  const stockBajo = await prisma.product.findMany({
    where: { stock: { lte: 5 }, active: true },
    select: { name: true, brand: true, stock: true },
    orderBy: { stock: "asc" },
    take: 5,
  });

  // Ultimos 5 pedidos
  const ultimosPedidos = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">

      <h2 className="text-2xl font-bold mb-6 tracking-wide">Dashboard</h2>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Ventas del mes</p>
          <p className="text-3xl font-bold text-yellow-500">
            ${(ventasMes._sum.total ?? 0).toLocaleString("es-MX")}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Completados hoy</p>
          <p className="text-3xl font-bold text-white">{pedidosHoy}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Pedidos pendientes</p>
          <p className="text-3xl font-bold text-white">{pedidosPendientes}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Stock bajo</p>
          <p className="text-3xl font-bold text-red-400">{stockBajo.length}</p>
        </div>

      </div>

      {/* Ultimos pedidos y stock bajo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Ultimos pedidos</h3>
          {ultimosPedidos.length === 0 ? (
            <p className="text-zinc-600 text-sm">No hay pedidos aun</p>
          ) : (
            <div className="space-y-3">
              {ultimosPedidos.map((pedido) => (
                <div key={pedido.id} className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <div>
                    <p className="text-sm font-medium">{pedido.orderNumber}</p>
                    <p className="text-xs text-zinc-500">{pedido.customer.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-yellow-500">
                      ${pedido.total.toLocaleString("es-MX")}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      pedido.status === "COMPLETADO" ? "bg-green-900 text-green-400" :
                      pedido.status === "CANCELADO" ? "bg-red-900 text-red-400" :
                      "bg-yellow-900 text-yellow-400"
                    }`}>
                      {pedido.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Alertas de stock bajo</h3>
          {stockBajo.length === 0 ? (
            <p className="text-zinc-600 text-sm">Todo el inventario esta bien</p>
          ) : (
            <div className="space-y-3">
              {stockBajo.map((producto, i) => (
                <div key={i} className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <div>
                    <p className="text-sm font-medium">{producto.name}</p>
                    <p className="text-xs text-zinc-500">{producto.brand}</p>
                  </div>
                  <span className="text-red-400 font-bold text-sm">{producto.stock} uds</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}