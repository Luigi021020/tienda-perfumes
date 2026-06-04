// API para operaciones sobre un pedido específico
// GET: obtener un pedido
// PUT: actualizar estado del pedido

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Obtener un pedido específico
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pedido = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });
    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }
    return NextResponse.json(pedido);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener pedido" },
      { status: 500 }
    );
  }
}

// PUT - Cambiar estado del pedido
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
    const { status } = await req.json();

    // Obtener el pedido actual
    const pedidoActual = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!pedidoActual) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // Si se marca como COMPLETADO: descontar stock
    if (status === "COMPLETADO" && pedidoActual.status === "SOLICITADO") {
      for (const item of pedidoActual.items) {
        // Verificar que haya stock suficiente
        const producto = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!producto || producto.stock < item.quantity) {
          return NextResponse.json(
            { error: "Stock insuficiente para completar el pedido" },
            { status: 400 }
          );
        }

        // Descontar stock del producto
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            sold: { increment: item.quantity },
          },
        });

        // Registrar movimiento de inventario
        await prisma.inventoryMovement.create({
          data: {
            type: "VENTA",
            quantity: -item.quantity,
            reason: `Venta completada - Pedido ${pedidoActual.orderNumber}`,
            productId: item.productId,
            orderId: id,
          },
        });
      }
    }

    // Actualizar el estado del pedido
    const pedidoActualizado = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    return NextResponse.json(pedidoActualizado);
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    return NextResponse.json(
      { error: "Error al actualizar pedido" },
      { status: 500 }
    );
  }
}