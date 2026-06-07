import { prisma } from "@/lib/prisma";
import HeaderTienda from "@/components/store/HeaderTienda";
import BotonWhatsApp from "@/components/store/BotonWhatsApp";
import FooterTienda from "@/components/store/FooterTienda";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, anuncios, categorias] = await Promise.all([
    prisma.storeConfig.findFirst(),
    prisma.announcement.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      include: {
        children: { orderBy: { order: "asc" } },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-black text-white">
      <HeaderTienda config={config} anuncios={anuncios} categorias={categorias} />
      <main>{children}</main>
      <FooterTienda config={config} />
      {config?.whatsapp && (
        <BotonWhatsApp whatsapp={config.whatsapp} />
      )}
    </div>
  );
}