// Script para actualizar las categorías con estructura jerárquica
// Categorías padre → subcategorías hijo

import { prisma } from "./prisma";
async function main() {

// Eliminar categorias viejas que no tienen la estructura correcta
  const categoriasViejas = ["damas", "caballeros", "set-damas", "set-caballeros", "arabes-damas", "arabes-caballeros", "unisex", "edicion-limitada"];
  
  for (const slug of categoriasViejas) {
    try {
      await prisma.category.deleteMany({
        where: { slug },
      });
    } catch (e) {
      console.log("No se pudo eliminar:", slug);
    }
  }
  console.log("Categorias viejas eliminadas");

  // Primero eliminamos las categorías existentes
  // (primero productos deben estar sin categoría o usar la nueva)
  console.log("Actualizando categorias...");

  // Crear categorías padre
  const arabes = await prisma.category.upsert({
    where: { slug: "arabes" },
    update: { name: "Arabes", order: 1, parentId: null },
    create: { name: "Arabes", slug: "arabes", order: 1, parentId: null },
  });

  const disenador = await prisma.category.upsert({
    where: { slug: "disenador" },
    update: { name: "Disenador", order: 2, parentId: null },
    create: { name: "Disenador", slug: "disenador", order: 2, parentId: null },
  });

  const sets = await prisma.category.upsert({
    where: { slug: "sets" },
    update: { name: "Sets", order: 3, parentId: null },
    create: { name: "Sets", slug: "sets", order: 3, parentId: null },
  });

  console.log("Categorias padre creadas");

  // Crear subcategorías
  await prisma.category.upsert({
    where: { slug: "arabes-caballero" },
    update: { name: "Arabes Caballero", order: 1, parentId: arabes.id },
    create: { name: "Arabes Caballero", slug: "arabes-caballero", order: 1, parentId: arabes.id },
  });

  await prisma.category.upsert({
    where: { slug: "arabes-dama" },
    update: { name: "Arabes Dama", order: 2, parentId: arabes.id },
    create: { name: "Arabes Dama", slug: "arabes-dama", order: 2, parentId: arabes.id },
  });

  await prisma.category.upsert({
    where: { slug: "disenador-caballero" },
    update: { name: "Disenador Caballero", order: 1, parentId: disenador.id },
    create: { name: "Disenador Caballero", slug: "disenador-caballero", order: 1, parentId: disenador.id },
  });

  await prisma.category.upsert({
    where: { slug: "disenador-dama" },
    update: { name: "Disenador Dama", order: 2, parentId: disenador.id },
    create: { name: "Disenador Dama", slug: "disenador-dama", order: 2, parentId: disenador.id },
  });

  await prisma.category.upsert({
    where: { slug: "sets-caballero" },
    update: { name: "Sets Caballero", order: 1, parentId: sets.id },
    create: { name: "Sets Caballero", slug: "sets-caballero", order: 1, parentId: sets.id },
  });

  await prisma.category.upsert({
    where: { slug: "sets-dama" },
    update: { name: "Sets Dama", order: 2, parentId: sets.id },
    create: { name: "Sets Dama", slug: "sets-dama", order: 2, parentId: sets.id },
  });

  console.log("Subcategorias creadas");
  console.log("Categorias actualizadas exitosamente");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });