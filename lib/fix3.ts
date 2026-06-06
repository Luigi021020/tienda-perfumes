import { prisma } from "./prisma";

async function main() {
  const arabes = await prisma.category.findUnique({ where: { slug: "arabes" } });
  const disenador = await prisma.category.findUnique({ where: { slug: "disenador" } });
  const sets = await prisma.category.findUnique({ where: { slug: "sets" } });

  if (!arabes || !disenador || !sets) {
    console.log("No se encontraron categorias padre:", { arabes, disenador, sets });
    return;
  }

  console.log("IDs encontrados:", arabes.id, disenador.id, sets.id);

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

  console.log("ParentIds corregidos exitosamente");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 
