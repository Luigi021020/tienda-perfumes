// API de productos
// GET: obtener todos los productos
// POST: crear un nuevo producto

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";
import { auth } from "@/lib/auth";

// GET - Obtener todos los productos
export async function GET() {
  try {
    const productos = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(productos);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo producto
export async function POST(req: NextRequest) {
  try {
    // Verificar que sea un administrador
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, brand, description, price, cost, stock, categoryId, active, featured, images } = body;

    // Subir imágenes a Cloudinary
    const imageUrls: string[] = [];
    for (const image of images) {
      // Solo subir si es base64 (imagen nueva)
      if (image.startsWith("data:")) {
        const url = await uploadImage(image);
        imageUrls.push(url);
      } else {
        // Si ya es URL, usarla directamente
        imageUrls.push(image);
      }
    }

    // Crear el producto en la base de datos
    const producto = await prisma.product.create({
      data: {
        name,
        brand,
        description,
        price: parseFloat(price),
        cost: parseFloat(cost),
        stock: parseInt(stock),
        categoryId,
        active,
        featured,
        images: imageUrls,
      },
      include: { category: true },
    });

    // Registrar entrada de inventario inicial
    await prisma.inventoryMovement.create({
      data: {
        type: "ENTRADA",
        quantity: parseInt(stock),
        reason: "Stock inicial del producto",
        productId: producto.id,
      },
    });

    return NextResponse.json(producto, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 }
    );
  }
}