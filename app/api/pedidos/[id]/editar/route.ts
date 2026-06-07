// API para editar items de un pedido existente
// Solo funciona en pedidos con estado SOLICITADO

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
    const { items, total } = await req.json();

    // Verificar que el pedido existe y esta en SOLICITADO
    const pedido = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    if (pedido.status !== "SOLICITADO") {
      return NextResponse.json(
        { error: "Solo se pueden editar pedidos en estado SOLICITADO" },
        { status: 400 }
      );
    }

    // Eliminar items existentes
    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    });

    // Crear los nuevos items
    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderId: id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        },
      });
    }

    // Actualizar el total del pedido
    const pedidoActualizado = await prisma.order.update({
      where: { id },
      data: { total },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    return NextResponse.json(pedidoActualizado);
  } catch (error) {
    console.error("Error al editar pedido:", error);
    return NextResponse.json(
      { error: "Error al editar el pedido" },
      { status: 500 }
    );
  }
}