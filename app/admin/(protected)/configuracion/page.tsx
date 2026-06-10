// Página de configuracion de la tienda
// Administra datos generales y anuncios de la barra superior

"use client";

import { useState, useEffect } from "react";

type Config = {
  id?: string;
  storeName: string;
  logoUrl: string;
  whatsapp: string;
  email: string;
  slogan: string;
};

type Anuncio = {
  id: string;
  text: string;
  active: boolean;
  order: number;
};

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Config>({
    storeName: "R&B Perfumes",
    logoUrl: "",
    whatsapp: "",
    email: "",
    slogan: "Cada esencia cuenta una historia",
  });
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [nuevoAnuncio, setNuevoAnuncio] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    const [configRes, anunciosRes] = await Promise.all([
      fetch("/api/configuracion"),
      fetch("/api/anuncios"),
    ]);
    if (configRes.ok) {
      const data = await configRes.json();
      if (data) {
        setConfig(data);
        setLogoPreview(data.logoUrl ?? "");
      }
    }
    if (anunciosRes.ok) {
      const data = await anunciosRes.json();
      setAnuncios(data);
    }
    setLoading(false);
  }

  function manejarLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setLogoPreview(result);
      setConfig({ ...config, logoUrl: result });
    };
    reader.readAsDataURL(file);
  }

  async function guardarConfig() {
    setGuardando(true);
    setMensaje("");
    const res = await fetch("/api/configuracion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setMensaje(res.ok ? "Configuracion guardada correctamente" : "Error al guardar");
    setGuardando(false);
    setTimeout(() => setMensaje(""), 3000);
  }

  async function agregarAnuncio() {
    if (!nuevoAnuncio.trim()) return;
    const res = await fetch("/api/anuncios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: nuevoAnuncio,
        active: true,
        order: anuncios.length,
      }),
    });
    if (res.ok) {
      setNuevoAnuncio("");
      cargarDatos();
    }
  }

  async function toggleAnuncio(anuncio: Anuncio) {
    await fetch(`/api/anuncios/${anuncio.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...anuncio, active: !anuncio.active }),
    });
    cargarDatos();
  }

  async function eliminarAnuncio(id: string) {
    await fetch(`/api/anuncios/${id}`, { method: "DELETE" });
    cargarDatos();
  }

  return (
    <div className="p-6 max-w-2xl mx-auto text-white">

      <h2 className="text-2xl font-bold mb-6">Configuracion de la tienda</h2>

      {loading ? (
        <p className="text-zinc-500">Cargando...</p>
      ) : (
        <div className="space-y-6">

          {/* Logo */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Logo de la tienda</h3>
            <div className="w-32 h-32 bg-zinc-800 rounded-lg overflow-hidden mb-4 flex items-center justify-center border border-zinc-700">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-500">R&B</p>
                  <p className="text-xs text-zinc-500 tracking-widest">PERFUMES</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={manejarLogo}
              className="block text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 cursor-pointer"
            />
          </div>

          {/* Datos de la tienda */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-2">Datos de la tienda</h3>
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">Nombre</label>
              <input
                type="text"
                value={config.storeName}
                onChange={(e) => setConfig({ ...config, storeName: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">Slogan</label>
              <input
                type="text"
                value={config.slogan}
                onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">WhatsApp del vendedor</label>
              <input
                type="text"
                value={config.whatsapp}
                onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                placeholder="5218122159607"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">Correo de contacto</label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          {/* Anuncios */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">
              Barra de anuncios
            </h3>
            <p className="text-xs text-zinc-600 mb-4">
              Estos textos rotan en la barra superior de la tienda. Activa o desactiva cada uno segun necesites.
            </p>

            {/* Agregar nuevo anuncio */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={nuevoAnuncio}
                onChange={(e) => setNuevoAnuncio(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && agregarAnuncio()}
                placeholder="Ej: Envios gratis en compras mayores a $1,500"
                className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
              />
              <button
                onClick={agregarAnuncio}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded text-sm transition-colors"
              >
                + Agregar
              </button>
            </div>

            {/* Lista de anuncios */}
            {anuncios.length === 0 ? (
              <p className="text-zinc-600 text-sm">No hay anuncios. Agrega el primero.</p>
            ) : (
              <div className="space-y-2">
                {anuncios.map((anuncio) => (
                  <div
                    key={anuncio.id}
                    className="flex items-center gap-3 bg-zinc-800 rounded p-3"
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${anuncio.active ? "bg-green-400" : "bg-zinc-600"}`} />
                    <p className={`flex-1 text-sm ${anuncio.active ? "text-white" : "text-zinc-500"}`}>
                      {anuncio.text}
                    </p>
                    <button
                      onClick={() => toggleAnuncio(anuncio)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        anuncio.active
                          ? "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                          : "bg-green-900 text-green-400 hover:bg-green-800"
                      }`}
                    >
                      {anuncio.active ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => eliminarAnuncio(anuncio.id)}
                      className="text-xs bg-red-900 hover:bg-red-800 text-red-400 px-2 py-1 rounded transition-colors"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mensaje */}
          {mensaje && (
            <div className={`p-3 rounded text-sm text-center ${
              mensaje.includes("Error") ? "bg-red-900 text-red-400" : "bg-green-900 text-green-400"
            }`}>
              {mensaje}
            </div>
          )}

          {/* Boton guardar */}
          <button
            onClick={guardarConfig}
            disabled={guardando}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded text-sm uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar configuracion"}
          </button>

        </div>
      )}
    </div>
  );
}