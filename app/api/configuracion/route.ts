// API de configuracion de la tienda
// GET: obtener configuracion
// POST: guardar configuracion

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";
import { auth } from "@/lib/auth";

// GET - Obtener configuracion
export async function GET() {
  try {
    // Buscar la configuracion existente (solo hay una)
    const config = await prisma.storeConfig.findFirst();
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener configuracion" },
      { status: 500 }
    );
  }
}

// POST - Guardar configuracion
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { storeName, logoUrl, whatsapp, email, slogan } = await req.json();

    // Si hay un logo nuevo en base64, subirlo a Cloudinary
    let logoFinal = logoUrl;
    if (logoUrl && logoUrl.startsWith("data:")) {
      logoFinal = await uploadImage(logoUrl);
    }

    // Buscar si ya existe una configuracion
    const configExistente = await prisma.storeConfig.findFirst();

    let config;
    if (configExistente) {
      // Actualizar la configuracion existente
      config = await prisma.storeConfig.update({
        where: { id: configExistente.id },
        data: { storeName, logoUrl: logoFinal, whatsapp, email, slogan },
      });
    } else {
      // Crear la primera configuracion
      config = await prisma.storeConfig.create({
        data: { storeName, logoUrl: logoFinal, whatsapp, email, slogan },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al guardar configuracion" },
      { status: 500 }
    );
  }
}