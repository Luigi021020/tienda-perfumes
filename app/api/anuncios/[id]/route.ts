// API para operaciones sobre un anuncio específico
// PUT: actualizar anuncio
// DELETE: eliminar anuncio

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
    const { text, active, order } = await req.json();

    const anuncio = await prisma.announcement.update({
      where: { id },
      data: { text, active, order },
    });

    return NextResponse.json(anuncio);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar anuncio" },
      { status: 500 }
    );
  }
}

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
    await prisma.announcement.delete({ where: { id } });

    return NextResponse.json({ message: "Anuncio eliminado" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar anuncio" },
      { status: 500 }
    );
  }
}