// API de inventario
// GET: obtener historial de movimientos
// POST: registrar un nuevo movimiento

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Obtener historial de movimientos
export async function GET() {
  try {
    const movimientos = await prisma.inventoryMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 50, // Ultimos 50 movimientos
      include: {
        product: {
          select: { name: true, brand: true },
        },
      },
    });
    return NextResponse.json(movimientos);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener inventario" },
      { status: 500 }
    );
  }
}

// POST - Registrar movimiento de inventario
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { productId, type, quantity, reason } = await req.json();

    // Obtener stock actual del producto
    const producto = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    let nuevoStock = producto.stock;
    let cantidadMovimiento = quantity;

    if (type === "ENTRADA") {
      // Sumar al stock actual
      nuevoStock = producto.stock + quantity;
    } else if (type === "AJUSTE") {
      // Reemplazar el stock con la nueva cantidad
      cantidadMovimiento = quantity - producto.stock;
      nuevoStock = quantity;
    }

    // No permitir stock negativo
    if (nuevoStock < 0) {
      return NextResponse.json(
        { error: "El stock no puede ser negativo" },
        { status: 400 }
      );
    }

    // Actualizar el stock del producto
    await prisma.product.update({
      where: { id: productId },
      data: { stock: nuevoStock },
    });

    // Registrar el movimiento en el historial
    const movimiento = await prisma.inventoryMovement.create({
      data: {
        type,
        quantity: cantidadMovimiento,
        reason,
        productId,
      },
    });

    return NextResponse.json(movimiento, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al registrar movimiento" },
      { status: 500 }
    );
  }
}