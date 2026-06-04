// API de pedidos
// GET: obtener todos los pedidos
// POST: crear un nuevo pedido

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obtener todos los pedidos
export async function GET() {
  try {
    const pedidos = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
    });
    return NextResponse.json(pedidos);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo pedido desde el carrito
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, total } = body;

    // Verificar stock disponible antes de crear el pedido
    for (const item of items) {
      const producto = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!producto || producto.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${producto?.name ?? "producto"}` },
          { status: 400 }
        );
      }
    }

    // Generar número de pedido único: RYB-0001, RYB-0002...
    const totalPedidos = await prisma.order.count();
    const orderNumber = `RYB-${String(totalPedidos + 1).padStart(4, "0")}`;

    // Crear o encontrar el cliente
    let clienteDB = await prisma.customer.findFirst({
      where: { email: customer.email },
    });

    if (!clienteDB) {
      clienteDB = await prisma.customer.create({
        data: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
        },
      });
    }

    // Crear el pedido con sus items
    const pedido = await prisma.order.create({
      data: {
        orderNumber,
        total,
        customerId: clienteDB.id,
        status: "SOLICITADO",
        items: {
          create: items.map((item: { productId: string; quantity: number; price: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json(pedido, { status: 201 });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    return NextResponse.json(
      { error: "Error al crear pedido" },
      { status: 500 }
    );
  }
}