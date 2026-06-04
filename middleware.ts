// Middleware de protección de rutas
// Se ejecuta antes de cada petición y verifica
// si el usuario tiene permiso para acceder

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = req.nextUrl.pathname === "/admin/login";

  // Si intenta entrar al admin sin estar autenticado
  // lo mandamos al login
  if (isAdminRoute && !isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Si ya está autenticado e intenta ir al login
  // lo mandamos al dashboard
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
});

// Definir en qué rutas se ejecuta el middleware
export const config = {
  matcher: ["/admin/:path*"],
};