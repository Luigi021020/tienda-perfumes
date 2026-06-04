// Script para crear el usuario administrador inicial
// Solo se ejecuta una vez para configurar el sistema

import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

async function main() {
  // Encriptar la contraseña antes de guardarla
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Crear el usuario administrador
  const admin = await prisma.user.upsert({
    where: { email: "admin@tienda.com" },
    update: {},
    create: {
      email: "admin@tienda.com",
      password: hashedPassword,
      name: "Administrador",
      role: "ADMIN",
    },
  });

  console.log("✅ Usuario administrador creado:", admin.email);

  // Crear categorías iniciales
  const categorias = [
    { name: "Damas", slug: "damas" },
    { name: "Caballeros", slug: "caballeros" },
    { name: "Set Damas", slug: "set-damas" },
    { name: "Set Caballeros", slug: "set-caballeros" },
    { name: "Arabes Damas", slug: "arabe-damas" },
    { name: "Arabes Caballeros", slug: "arabe-caballeros" },
  ];

  for (const categoria of categorias) {
    await prisma.category.upsert({
      where: { slug: categoria.slug },
      update: {},
      create: categoria,
    });
    console.log("✅ Categoría creada:", categoria.name);
  }

  console.log("🎉 Base de datos lista para usar");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });