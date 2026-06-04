// API para operaciones sobre un producto específico
// PUT: actualizar producto
// DELETE: eliminar producto

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { auth } from "@/lib/auth";

// PUT - Actualizar producto
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, brand, description, price, cost, stock, categoryId, active, featured, images } = body;

    // Procesar imágenes nuevas
    const imageUrls: string[] = [];
    for (const image of images) {
      if (image.startsWith("data:")) {
        const url = await uploadImage(image);
        imageUrls.push(url);
      } else {
        imageUrls.push(image);
      }
    }

    // Actualizar el producto
    const producto = await prisma.product.update({
      where: { id },
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

    return NextResponse.json(producto);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Obtener el producto para borrar sus imágenes
    const producto = await prisma.product.findUnique({
      where: { id },
    });

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Primero eliminar registros relacionados
    await prisma.inventoryMovement.deleteMany({
      where: { productId: id },
    });

    // Eliminar imágenes de Cloudinary
    for (const imageUrl of producto.images) {
      await deleteImage(imageUrl);
    }

    // Eliminar el producto
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Error al eliminar:", error);
    return NextResponse.json(
      { error: "Error al eliminar producto" },
      { status: 500 }
    );
  }
}