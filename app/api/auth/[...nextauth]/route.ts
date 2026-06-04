// Este archivo conecta NextAuth con las rutas de Next.js
// Maneja automáticamente /api/auth/signin, /api/auth/signout, etc.

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;