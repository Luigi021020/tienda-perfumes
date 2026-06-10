// API para descargar la plantilla Excel de importacion

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Crear plantilla con datos de ejemplo
    const datos = [
      {
        nombre: "One Million",
        marca: "Paco Rabanne",
        descripcion: "Fragancia masculina amaderada con notas de mandarina",
        precio: 1200,
        precio_oferta: "",
        costo: 700,
        stock: 10,
        categoria: "Disenador",
        subcategoria: "Caballero",
        imagen: "one-million",
        destacado: "SI",
      },
      {
        nombre: "Flower Bomb",
        marca: "Viktor & Rolf",
        descripcion: "Fragancia floral femenina con notas de jazmin",
        precio: 1500,
        precio_oferta: 1200,
        costo: 900,
        stock: 5,
        categoria: "Arabes",
        subcategoria: "Dama",
        imagen: "flower-bomb",
        destacado: "NO",
      },
    ];

    const workbook = XLSX.utils.book_new();
    const hoja = XLSX.utils.json_to_sheet(datos);

    // Ajustar ancho de columnas
    hoja["!cols"] = [
      { wch: 25 }, // nombre
      { wch: 20 }, // marca
      { wch: 60 }, // descripcion
      { wch: 10 }, // precio
      { wch: 12 }, // precio_oferta
      { wch: 10 }, // costo
      { wch: 8 },  // stock
      { wch: 15 }, // categoria
      { wch: 15 }, // subcategoria
      { wch: 25 }, // imagen
      { wch: 10 }, // destacado
    ];

    XLSX.utils.book_append_sheet(workbook, hoja, "Productos");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=plantilla-productos-ryb.xlsx",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al generar plantilla" },
      { status: 500 }
    );
  }
}