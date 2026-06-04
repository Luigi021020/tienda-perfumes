// API publica para obtener un producto por ID
// Solo devuelve productos activos

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const producto = await prisma.product.findUnique({
      where: { id, active: true },
      include: { category: true },
    });

    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(producto);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener producto" },
      { status: 500 }
    );
  }
}