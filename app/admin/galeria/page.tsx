// Galeria de imagenes del panel admin
// Permite subir y gestionar imagenes de productos
// sin necesidad de entrar a Cloudinary

"use client";

import { useState, useEffect } from "react";

type Imagen = {
  publicId: string;
  url: string;
  nombre: string;
  tamanio: number;
  fecha: string;
};

export default function GaleriaPage() {
  const [imagenes, setImagenes] = useState<Imagen[]>([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [imagenCopiada, setImagenCopiada] = useState("");

  useEffect(() => {
    cargarImagenes();
  }, []);

  async function cargarImagenes() {
    setLoading(true);
    const res = await fetch("/api/galeria");
    if (res.ok) {
      const data = await res.json();
      setImagenes(data);
    }
    setLoading(false);
  }

  // Subir imagen desde archivo
  async function manejarSubida(e: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(e.target.files ?? []);
    if (archivos.length === 0) return;

    setSubiendo(true);
    setMensaje("");

    for (const archivo of archivos) {
      // Limpiar nombre del archivo para usarlo como public_id
      const nombreLimpio = archivo.name
        .toLowerCase()
        .replace(/\.[^/.]+$/, "") // quitar extension
        .replace(/[^a-z0-9-]/g, "-") // reemplazar caracteres especiales
        .replace(/-+/g, "-"); // evitar guiones dobles

      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onload = async (ev) => {
          const base64 = ev.target?.result as string;
          const res = await fetch("/api/galeria", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imagen: base64, nombre: nombreLimpio }),
          });
          if (!res.ok) {
            setMensaje("Error al subir " + archivo.name);
          }
          resolve();
        };
        reader.readAsDataURL(archivo);
      });
    }

    setMensaje(archivos.length + " imagen(es) subida(s) exitosamente");
    await cargarImagenes();
    setSubiendo(false);
    setTimeout(() => setMensaje(""), 4000);
  }

  // Copiar URL de imagen al portapapeles
  async function copiarUrl(url: string, nombre: string) {
    await navigator.clipboard.writeText(url);
    setImagenCopiada(nombre);
    setTimeout(() => setImagenCopiada(""), 2000);
  }

  // Copiar nombre para usar en Excel
  async function copiarNombre(nombre: string) {
    await navigator.clipboard.writeText(nombre);
    setImagenCopiada("nombre-" + nombre);
    setTimeout(() => setImagenCopiada(""), 2000);
  }

  const imagenesFiltradas = imagenes.filter((img) =>
    img.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  function formatBytes(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">

      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Galeria de Imagenes</h2>
        <span className="text-zinc-500 text-sm">{imagenes.length} imagenes</span>
      </div>
      <p className="text-zinc-500 text-sm mb-6">
        Sube las fotos de tus productos aqui. El nombre del archivo se usara para relacionarlo con el Excel.
      </p>

      {/* Zona de subida */}
      <div className="bg-zinc-900 border-2 border-dashed border-zinc-700 hover:border-yellow-500 rounded-lg p-8 text-center mb-6 transition-colors">
        <p className="text-zinc-400 mb-4">
          Arrastra las fotos aqui o da clic para seleccionarlas
        </p>
        <p className="text-zinc-600 text-xs mb-4">
          Puedes subir multiples imagenes a la vez. Usa nombres descriptivos como: one-million, flower-bomb, black-orchid
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={manejarSubida}
          disabled={subiendo}
          className="block mx-auto text-sm text-zinc-400 file:mr-4 file:py-2 file:px-6 file:rounded file:border-0 file:bg-yellow-500 file:text-black file:font-bold hover:file:bg-yellow-400 cursor-pointer disabled:opacity-50"
        />
        {subiendo && (
          <p className="text-yellow-500 text-sm mt-3 animate-pulse">Subiendo imagenes...</p>
        )}
        {mensaje && (
          <p className={"text-sm mt-3 " + (mensaje.includes("Error") ? "text-red-400" : "text-green-400")}>
            {mensaje}
          </p>
        )}
      </div>

      {/* Buscador */}
      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar imagen por nombre..."
        className="w-full max-w-md bg-zinc-900 border border-zinc-700 text-white rounded px-4 py-2 text-sm focus:outline-none focus:border-yellow-500 mb-6"
      />

      {/* Instruccion importante */}
      <div className="bg-zinc-900 border border-yellow-500 border-opacity-50 rounded-lg p-4 mb-6">
        <p className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-1">
          Como usar con el Excel
        </p>
        <p className="text-zinc-400 text-sm">
          Da clic en <strong className="text-white">"Copiar nombre"</strong> de cada imagen y pegalo en la columna <strong className="text-white">imagen</strong> del Excel. El sistema buscara automaticamente la foto al importar.
        </p>
      </div>

      {/* Grid de imagenes */}
      {loading ? (
        <p className="text-zinc-500 text-center py-10">Cargando imagenes...</p>
      ) : imagenesFiltradas.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-zinc-600">
            {busqueda ? "No se encontraron imagenes" : "No hay imagenes aun. Sube la primera foto."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {imagenesFiltradas.map((img) => (
            <div key={img.publicId} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden group">

              {/* Imagen */}
              <div className="h-36 bg-zinc-800 overflow-hidden">
                <img
                  src={img.url}
                  alt={img.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-xs text-white font-medium truncate mb-1" title={img.nombre}>
                  {img.nombre}
                </p>
                <p className="text-xs text-zinc-600 mb-2">{formatBytes(img.tamanio)}</p>

                {/* Botones */}
                <div className="flex gap-1">
                  <button
                    onClick={() => copiarNombre(img.nombre)}
                    className={"flex-1 text-xs py-1 rounded transition-colors " + (
                      imagenCopiada === "nombre-" + img.nombre
                        ? "bg-green-700 text-white"
                        : "bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
                    )}
                  >
                    {imagenCopiada === "nombre-" + img.nombre ? "Copiado" : "Copiar nombre"}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}