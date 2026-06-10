// API para importar productos masivamente desde Excel
// Lee el archivo, busca las imagenes en Cloudinary y crea los productos

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import * as XLSX from "xlsx";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { archivo } = await req.json();

    // Decodificar el archivo Excel desde base64
    const buffer = Buffer.from(archivo, "base64");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const filas = XLSX.utils.sheet_to_json(hoja) as any[];

    const resultados = {
      exitosos: 0,
      errores: [] as string[],
    };

    for (const fila of filas) {
      try {
        // Validar campos requeridos
        if (!fila.nombre || !fila.marca || !fila.precio || !fila.stock || !fila.categoria) {
          resultados.errores.push("Fila incompleta: " + JSON.stringify(fila));
          continue;
        }

        // Buscar la categoria padre primero, luego la subcategoria
        let categoria;

        if (fila.subcategoria) {
          // Buscar el padre por nombre
          const padre = await prisma.category.findFirst({
            where: {
              name: { contains: fila.categoria.toString().trim(), mode: "insensitive" },
              parentId: null,
            },
          });

          if (padre) {
            // Buscar la subcategoria dentro del padre
            categoria = await prisma.category.findFirst({
              where: {
                name: { contains: fila.subcategoria.toString().trim(), mode: "insensitive" },
                parentId: padre.id,
              },
            });
          }
        } else {
          // Busqueda simple por nombre de subcategoria
          categoria = await prisma.category.findFirst({
            where: {
              name: { contains: fila.categoria.toString().trim(), mode: "insensitive" },
              parentId: { not: null },
            },
          });
        }

        if (!categoria) {
          resultados.errores.push("Categoria no encontrada: " + fila.categoria);
          continue;
        }

        // Buscar imagen en Cloudinary si se especifico
        let imageUrl = "";
        if (fila.imagen) {
          const nombreImagen = fila.imagen.toString().trim();
          try {
            const result = await cloudinary.api.resource(
              "ryb-perfumes/productos/" + nombreImagen
            );
            imageUrl = result.secure_url;
          } catch {
            // Si no encuentra la imagen continua sin ella
            resultados.errores.push("Imagen no encontrada en galeria: " + nombreImagen + " (producto creado sin imagen)");
          }
        }

        // Crear el producto
        const producto = await prisma.product.create({
          data: {
            name: fila.nombre.toString().trim(),
            brand: fila.marca.toString().trim(),
            description: fila.descripcion?.toString().trim() ?? "",
            price: parseFloat(fila.precio.toString()),
            comparePrice: fila.precio_oferta ? parseFloat(fila.precio_oferta.toString()) : null,
            cost: fila.costo ? parseFloat(fila.costo.toString()) : 0,
            stock: parseInt(fila.stock.toString()),
            categoryId: categoria.id,
            active: true,
            featured: fila.destacado?.toString().toUpperCase() === "SI",
            images: imageUrl ? [imageUrl] : [],
          },
        });

        // Registrar entrada de inventario
        await prisma.inventoryMovement.create({
          data: {
            type: "ENTRADA",
            quantity: parseInt(fila.stock.toString()),
            reason: "Stock inicial - importacion masiva",
            productId: producto.id,
          },
        });

        resultados.exitosos++;
      } catch (error) {
        resultados.errores.push("Error en fila " + (fila.nombre ?? "sin nombre") + ": " + error);
      }
    }

    return NextResponse.json(resultados);
  } catch (error) {
    console.error("Error al importar:", error);
    return NextResponse.json(
      { error: "Error al procesar el archivo Excel" },
      { status: 500 }
    );
  }
}