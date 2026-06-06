import { prisma } from "./prisma";

async function main() {
  // Obtener las categorias padre
  const arabes = await prisma.category.findUnique({ where: { slug: "arabes" } });
  const disenador = await prisma.category.findUnique({ where: { slug: "disenador" } });
  const sets = await prisma.category.findUnique({ where: { slug: "sets" } });

  if (!arabes || !disenador || !sets) {
    console.log("No se encontraron categorias padre");
    return;
  }

  // Forzar parentId correcto en todas las subcategorias
  await prisma.category.update({
    where: { slug: "arabes-caballero" },
    data: { parentId: arabes.id },
  });

  await prisma.category.update({
    where: { slug: "arabes-dama" },
    data: { parentId: arabes.id },
  });

  await prisma.category.update({
    where: { slug: "disenador-caballero" },
    data: { parentId: disenador.id },
  });

  await prisma.category.update({
    where: { slug: "disenador-dama" },
    data: { parentId: disenador.id },
  });

  await prisma.category.update({
    where: { slug: "sets-caballero" },
    data: { parentId: sets.id },
  });

  await prisma.category.update({
    where: { slug: "sets-dama" },
    data: { parentId: sets.id },
  });

  // Eliminar cualquier categoria suelta que no deba estar
  await prisma.category.deleteMany({
    where: {
      slug: { in: ["arabes-damas", "arabes-caballeros"] },
    },
  });

  console.log("Subcategorias corregidas exitosamente");

  // Verificar resultado
  const todas = await prisma.category.findMany({
    select: { name: true, slug: true, parentId: true },
    orderBy: { order: "asc" },
  });
  console.log("Categorias actuales:", JSON.stringify(todas, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());