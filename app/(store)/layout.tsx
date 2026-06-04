// Layout de la tienda publica
// Incluye el header y footer en todas las páginas

import { prisma } from "@/lib/prisma";
import HeaderTienda from "@/components/store/HeaderTienda";

export default async function StorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtener configuracion de la tienda para el header
  const config = await prisma.storeConfig.findFirst();

  return (
    <div className="min-h-screen bg-black text-white">
      <HeaderTienda config={config} />
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-yellow-500 font-bold text-xl tracking-widest uppercase mb-2">
            {config?.storeName ?? "R&B Perfumes"}
          </p>
          <div className="w-12 h-0.5 bg-yellow-500 mx-auto mb-4" />
          <p className="text-zinc-500 text-sm italic mb-4">
            {config?.slogan ?? "Cada esencia cuenta una historia"}
          </p>
          <p className="text-zinc-600 text-xs">
            {config?.email} · WhatsApp: {config?.whatsapp}
          </p>
          <p className="text-zinc-700 text-xs mt-4">
            2024 R&B Perfumes. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}