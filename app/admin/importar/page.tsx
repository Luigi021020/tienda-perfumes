// Pagina de importacion masiva de productos desde Excel

"use client";

import { useState } from "react";
import Link from "next/link";

type Resultado = {
  exitosos: number;
  errores: string[];
};

export default function ImportarPage() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [mensaje, setMensaje] = useState("");

  function manejarArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setArchivo(file);
      setResultado(null);
      setMensaje("");
    }
  }

  async function importarProductos() {
    if (!archivo) return;
    setImportando(true);
    setMensaje("");
    setResultado(null);

    // Leer archivo como base64
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result.split(",")[1]); // quitar prefijo data:...;base64,
      };
      reader.readAsDataURL(archivo);
    });

    const res = await fetch("/api/importar-productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archivo: base64 }),
    });

    if (res.ok) {
      const data = await res.json();
      setResultado(data);
    } else {
      setMensaje("Error al procesar el archivo");
    }
    setImportando(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-white">

      <div className="mb-6">
        <h2 className="text-2xl font-bold">Importar Productos desde Excel</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Carga multiples productos de una sola vez usando un archivo Excel
        </p>
      </div>

      {/* Pasos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">
          Pasos para importar correctamente
        </h3>
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <span className="bg-yellow-500 text-black font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
            <div>
              <p className="text-sm font-medium">Sube las fotos de tus productos</p>
              <p className="text-xs text-zinc-500">Ve a la seccion de Galeria y sube todas las imagenes con nombres descriptivos</p>
              <Link href="/admin/galeria" className="text-yellow-500 text-xs hover:underline">
                Ir a Galeria
              </Link>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="bg-yellow-500 text-black font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
            <div>
              <p className="text-sm font-medium">Descarga la plantilla Excel</p>
              <p className="text-xs text-zinc-500 mb-1">Usa la plantilla para llenar los datos correctamente</p>
              <a href="/api/importar-productos/plantilla"
                className="inline-block bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-1 rounded transition-colors">
                Descargar plantilla
              </a>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="bg-yellow-500 text-black font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
            <div>
              <p className="text-sm font-medium">Llena el Excel con tus productos</p>
              <p className="text-xs text-zinc-500">En la columna "imagen" pon el nombre exacto de la foto que subiste a la Galeria (sin extension)</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="bg-yellow-500 text-black font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">4</span>
            <div>
              <p className="text-sm font-medium">Sube el Excel aqui y da clic en Importar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categorias disponibles */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
        <p className="text-xs uppercase tracking-wider text-zinc-400 mb-3">
          Valores validos para categoria y subcategoria en el Excel
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { cat: "Arabes", subs: ["Caballero", "Dama"] },
            { cat: "Disenador", subs: ["Caballero", "Dama"] },
            { cat: "Sets", subs: ["Caballero", "Dama"] },
          ].map((grupo) => (
            <div key={grupo.cat} className="bg-zinc-800 rounded p-3">
              <p className="text-yellow-500 text-xs font-bold mb-2">{grupo.cat}</p>
              {grupo.subs.map((sub) => (
                <p key={sub} className="text-zinc-400 text-xs">• {sub}</p>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Subir archivo */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">
          Subir archivo Excel
        </h3>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={manejarArchivo}
          className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 cursor-pointer mb-4"
        />

        {archivo && (
          <div className="flex items-center gap-2 bg-zinc-800 rounded p-3 mb-4">
            <span className="text-green-400">✓</span>
            <p className="text-sm text-white">{archivo.name}</p>
            <p className="text-xs text-zinc-500">({(archivo.size / 1024).toFixed(1)} KB)</p>
          </div>
        )}

        {mensaje && (
          <p className="text-red-400 text-sm mb-4">{mensaje}</p>
        )}

        <button
          onClick={importarProductos}
          disabled={!archivo || importando}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded text-sm uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importando ? "Importando productos..." : "Importar productos"}
        </button>
      </div>

      {/* Resultados */}
      {resultado && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">
            Resultado de la importacion
          </h3>

          <div className="flex gap-4 mb-4">
            <div className="bg-green-900 border border-green-800 rounded p-4 flex-1 text-center">
              <p className="text-3xl font-bold text-green-400">{resultado.exitosos}</p>
              <p className="text-xs text-green-600 uppercase tracking-wider mt-1">Productos creados</p>
            </div>
            <div className="bg-red-900 border border-red-800 rounded p-4 flex-1 text-center">
              <p className="text-3xl font-bold text-red-400">{resultado.errores.length}</p>
              <p className="text-xs text-red-600 uppercase tracking-wider mt-1">Con errores</p>
            </div>
          </div>

          {resultado.errores.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Detalle de errores:</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {resultado.errores.map((err, i) => (
                  <p key={i} className="text-xs text-red-400 bg-zinc-800 rounded p-2">{err}</p>
                ))}
              </div>
            </div>
          )}

          {resultado.exitosos > 0 && (
            <div className="mt-4 text-center">
              <Link href="/admin/productos"
                className="text-yellow-500 hover:underline text-sm">
                Ver productos importados
              </Link>
            </div>
          )}
        </div>
      )}

    </div>
  );
}