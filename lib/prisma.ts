// Este archivo crea una sola instancia de Prisma Client
// que se reutiliza en todo el proyecto.
// Sin esto, en desarrollo se crearían demasiadas conexiones
// y la base de datos se saturaria.

import { PrismaClient } from "@prisma/client";

// Declaramos una variable global para guardar la instancia
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Si ya existe una instancia la reutilizamos, si no creamos una nueva
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

// En desarrollo guardamos la instancia para no crear nuevas
// cada vez que se recarga el código
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}