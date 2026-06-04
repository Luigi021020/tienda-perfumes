// Página de configuración de la tienda
// El administrador puede cambiar nombre, logo, WhatsApp y correo

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

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Config>({
    storeName: "R&B Perfumes",
    logoUrl: "",
    whatsapp: "",
    email: "",
    slogan: "Cada esencia cuenta una historia",
  });
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [logoPreview, setLogoPreview] = useState("");

  useEffect(() => {
    cargarConfig();
  }, []);

  async function cargarConfig() {
    setLoading(true);
    const res = await fetch("/api/configuracion");
    if (res.ok) {
      const data = await res.json();
      if (data) {
        setConfig(data);
        setLogoPreview(data.logoUrl ?? "");
      }
    }
    setLoading(false);
  }

  // Manejar selección de logo
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

  // Guardar configuración
  async function guardarConfig() {
    setGuardando(true);
    setMensaje("");

    const res = await fetch("/api/configuracion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    if (res.ok) {
      setMensaje("Configuracion guardada correctamente");
    } else {
      setMensaje("Error al guardar la configuracion");
    }
    setGuardando(false);

    // Ocultar mensaje después de 3 segundos
    setTimeout(() => setMensaje(""), 3000);
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

            {/* Preview del logo */}
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
            <p className="text-xs text-zinc-600 mt-2">
              Recomendado: PNG con fondo transparente, minimo 200x200px
            </p>
          </div>

          {/* Datos de la tienda */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-2">Datos de la tienda</h3>

            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">
                Nombre de la tienda
              </label>
              <input
                type="text"
                value={config.storeName}
                onChange={(e) => setConfig({ ...config, storeName: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">
                Slogan
              </label>
              <input
                type="text"
                value={config.slogan}
                onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-2">Contacto</h3>

            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">
                Numero de WhatsApp del vendedor
              </label>
              <input
                type="text"
                value={config.whatsapp}
                onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                placeholder="521XXXXXXXXXX"
              />
              <p className="text-xs text-zinc-600 mt-1">
                Con codigo de pais, sin espacios ni simbolos. Ejemplo: 5218122159607
              </p>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">
                Correo de contacto
              </label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                placeholder="contacto@ryb-perfumes.com"
              />
            </div>
          </div>

          {/* Mensaje de confirmacion */}
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