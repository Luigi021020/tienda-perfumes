// Proveedor de sesión de NextAuth
// Envuelve toda la app para que cualquier componente
// pueda saber si el usuario está autenticado

"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}