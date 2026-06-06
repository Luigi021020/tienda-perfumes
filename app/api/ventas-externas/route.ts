import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { customerName, customerPhone, canal, notes, items, total } = await req.json();

    for (const item of items) {
      const producto = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!producto || producto.stock < item.quantity) {
        return NextResponse.json(
          { error: "Stock insuficiente para " + (producto?.name ?? "producto") },
          { status: 400 }
        );
      }
    }

    const totalPedidos = await prisma.order.count();
    const orderNumber = "RYB-" + String(totalPedidos + 1).padStart(4, "0");

    let cliente = await prisma.customer.findFirst({
      where: { phone: customerPhone || "sin-telefono" },
    });

    if (!cliente) {
      cliente = await prisma.customer.create({
        data: {
          name: customerName,
          email: canal.toLowerCase() + "@venta-externa.com",
          phone: customerPhone || "sin-telefono",
          address: "Venta " + canal,
        },
      });
    }

    const orden = await prisma.order.create({
      data: {
        orderNumber,
        total,
        status: "COMPLETADO",
        notes: canal + (notes ? " - " + notes : ""),
        customerId: cliente.id,
        items: {
          create: items.map((item: { productId: string; quantity: number; price: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          sold: { increment: item.quantity },
        },
      });

      await prisma.inventoryMovement.create({
        data: {
          type: "VENTA",
          quantity: -item.quantity,
          reason: "Venta externa - " + canal + " - " + orderNumber,
          productId: item.productId,
          orderId: orden.id,
        },
      });
    }

    return NextResponse.json(orden, { status: 201 });
  } catch (error) {
    console.error("Error al registrar venta externa:", error);
    return NextResponse.json({ error: "Error al registrar la venta" }, { status: 500 });
  }
}