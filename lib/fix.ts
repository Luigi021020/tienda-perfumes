import { prisma } from "./prisma";

async function main() {
  // Encontrar la categoria Disenador Caballero
  const disenadorCaballero = await prisma.category.findUnique({
    where: { slug: "disenador-caballero" },
  });

  if (!disenadorCaballero) {
    console.log("No se encontro la categoria");
    return;
  }

  // Reasignar todos los productos de categorias viejas
  await prisma.product.updateMany({
    where: {
      category: {
        slug: { in: ["caballeros", "damas", "set-damas", "set-caballeros", "arabes-damas", "arabes-caballeros"] }
      }
    },
    data: { categoryId: disenadorCaballero.id },
  });

  console.log("Productos reasignados a Disenador Caballero");

  // Ahora eliminar categorias viejas
  await prisma.category.deleteMany({
    where: {
      slug: { in: ["caballeros", "damas", "set-damas", "set-caballeros", "arabes-damas", "arabes-caballeros", "unisex", "edicion-limitada"] }
    },
  });

  console.log("Categorias viejas eliminadas");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());