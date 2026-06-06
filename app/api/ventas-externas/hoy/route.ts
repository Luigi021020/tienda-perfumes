// API para obtener ventas externas del dia actual

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const hoy = new Date();
    const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    // Obtener todas las ordenes completadas hoy
    // que tengan notes con los canales de venta externa
    const ventas = await prisma.order.findMany({
      where: {
        createdAt: { gte: inicioDelDia },
        status: "COMPLETADO",
        OR: [
          { notes: { contains: "PRESENCIAL" } },
          { notes: { contains: "WHATSAPP" } },
          { notes: { contains: "TELEFONO" } },
          { notes: { contains: "OTRO" } },
        ],
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, brand: true, images: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(ventas);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener ventas" },
      { status: 500 }
    );
  }
}