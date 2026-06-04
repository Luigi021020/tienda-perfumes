// Layout del panel administrativo
// Envuelve todas las páginas del admin con el sidebar
// Excepto la página de login

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar autenticación
  const session = await auth();

  // Si no hay sesión y no es la página de login, redirigir
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar lateral */}
      <Sidebar />
      
      {/* Contenido principal */}
      <main className="flex-1 overflow-auto pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  );
}