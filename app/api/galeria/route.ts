// API de galeria de imagenes
// GET: listar imagenes subidas
// POST: subir nueva imagen a Cloudinary

import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET - Listar imagenes de la carpeta productos
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const result = await cloudinary.search
      .expression("folder:ryb-perfumes/productos")
      .sort_by("created_at", "desc")
      .max_results(100)
      .execute();

    const imagenes = result.resources.map((img: any) => ({
      publicId: img.public_id,
      url: img.secure_url,
      nombre: img.filename,
      tamanio: img.bytes,
      fecha: img.created_at,
    }));

    return NextResponse.json(imagenes);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener imagenes" },
      { status: 500 }
    );
  }
}

// POST - Subir imagen
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { imagen, nombre } = await req.json();

    // Subir a Cloudinary con nombre personalizado
    const result = await cloudinary.uploader.upload(imagen, {
      folder: "ryb-perfumes/productos",
      public_id: nombre,
      overwrite: true,
      transformation: [
        { width: 800, height: 800, crop: "fill" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      nombre: result.filename,
    });
  } catch (error) {
    console.error("Error al subir imagen:", error);
    return NextResponse.json(
      { error: "Error al subir imagen" },
      { status: 500 }
    );
  }
}