// Menú lateral del panel administrativo
// Aparece en todas las páginas del admin
// Permite navegar entre las secciones

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

// Definición de las secciones del menú
const menuItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/productos", label: "Productos", icon: "🧴" },
  { href: "/admin/galeria", label: "Galeria", icon: "🖼️" },
  { href: "/admin/importar", label: "Importar", icon: "📥" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "📦" },
  { href: "/admin/ventas", label: "Ventas Externas", icon: "💰" },
  { href: "/admin/inventario", label: "Inventario", icon: "📋" },
  { href: "/admin/clientes", label: "Clientes", icon: "👥" },
  { href: "/admin/configuracion", label: "Configuracion", icon: "⚙️" },
];

export default function Sidebar() {
  // Obtener la ruta actual para resaltar el elemento activo
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar para escritorio */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-zinc-900 border-r border-zinc-800">
        
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold tracking-widest uppercase text-yellow-500">
            R&B
          </h1>
          <p className="text-zinc-500 text-xs tracking-widest uppercase">
            Perfumes
          </p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            // Verificar si este elemento es la página actual
           const isActive = item.href === "/admin" 
  ? pathname === "/admin"
  : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                  isActive
                    ? "bg-yellow-500 text-black font-bold"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Botón cerrar sesión */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-sm"
          >
            <span>🚪</span>
            <span>Cerrar sesion</span>
          </button>
        </div>
      </aside>

      {/* Barra de navegación para móvil */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50">
        <nav className="flex justify-around py-2">
          {menuItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? "text-yellow-500" : "text-zinc-500"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}