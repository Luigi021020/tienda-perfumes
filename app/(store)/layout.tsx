// Layout de la tienda publica
// Incluye header con anuncios, contenido y footer

import { prisma } from "@/lib/prisma";
import HeaderTienda from "@/components/store/HeaderTienda";
import BotonWhatsApp from "@/components/store/BotonWhatsApp";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtener configuracion y anuncios
  const [config, anuncios] = await Promise.all([
    prisma.storeConfig.findFirst(),
    prisma.announcement.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-black text-white">
      <HeaderTienda config={config} anuncios={anuncios} />
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

            {/* Logo y slogan */}
            <div className="text-center md:text-left">
              {config?.logoUrl ? (
                <img src={config.logoUrl} alt={config.storeName} className="h-12 object-contain mb-3 mx-auto md:mx-0" />
              ) : (
                <div className="mb-3">
                  <p className="text-yellow-500 font-bold text-xl tracking-widest uppercase">R&B</p>
                  <p className="text-zinc-400 text-xs tracking-widest uppercase">Perfumes</p>
                </div>
              )}
              <div className="w-12 h-0.5 bg-yellow-500 mb-3 mx-auto md:mx-0" />
              <p className="text-zinc-500 text-sm italic">
                {config?.slogan ?? "Cada esencia cuenta una historia"}
              </p>
            </div>

            {/* Links */}
            <div className="text-center">
              <p className="text-zinc-400 text-xs uppercase tracking-widest mb-4">Navegacion</p>
              <div className="space-y-2">
                <a href="/" className="block text-zinc-500 hover:text-yellow-500 text-sm transition-colors">Inicio</a>
                <a href="/catalogo" className="block text-zinc-500 hover:text-yellow-500 text-sm transition-colors">Catalogo</a>
                <a href="/nosotros" className="block text-zinc-500 hover:text-yellow-500 text-sm transition-colors">Nosotros</a>
                <a href="/faq" className="block text-zinc-500 hover:text-yellow-500 text-sm transition-colors">Preguntas frecuentes</a>
              </div>
            </div>

            {/* Contacto */}
            <div className="text-center md:text-right">
              <p className="text-zinc-400 text-xs uppercase tracking-widest mb-4">Contacto</p>
              <div className="space-y-2">
                {config?.email && (
                  <p className="text-zinc-500 text-sm">{config.email}</p>
                )}
                {config?.whatsapp && (
                  
                    <a href={"https://wa.me/" + config.whatsapp}
                    className="block text-zinc-500 hover:text-yellow-500 text-sm transition-colors">
                    WhastsApp: {config.whatsapp}
                  </a>
                )}
              </div>
            </div>

          </div>

          <div className="border-t border-zinc-800 pt-6 text-center">
            <p className="text-zinc-700 text-xs">
              2024 R&B Perfumes. Todos los derechos reservados.
            </p>
          </div>

        </div>
      </footer>
      {/* Boton flotante de WhatsApp */}
      {config?.whatsapp && (
        <BotonWhatsApp whatsapp={config.whatsapp} />
      )}
    </div>
  );
}