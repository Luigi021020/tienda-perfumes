// Layout principal de la aplicación
// Envuelve todas las páginas con los proveedores necesarios

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Providers from "@/components/providers";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tienda de Perfumes",
  description: "Los mejores perfumes al mejor precio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={geist.className}>
        {/* SessionProvider permite usar sesiones en toda la app */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}