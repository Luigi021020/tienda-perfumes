// API de anuncios
// GET: obtener anuncios activos
// POST: crear nuevo anuncio

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const anuncios = await prisma.announcement.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(anuncios);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener anuncios" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { text, active, order } = await req.json();

    const anuncio = await prisma.announcement.create({
      data: { text, active, order: order ?? 0 },
    });

    return NextResponse.json(anuncio, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear anuncio" },
      { status: 500 }
    );
  }
}