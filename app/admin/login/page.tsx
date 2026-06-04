// Página de login del panel administrativo
// Solo los administradores autorizados pueden acceder

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Intentar iniciar sesión con NextAuth
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // No redirigir automáticamente
    });

    if (result?.error) {
      // Credenciales incorrectas
      setError("Correo o contraseña incorrectos");
      setLoading(false);
    } else {
      // Login exitoso — ir al dashboard
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo y título */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white tracking-widest uppercase">
            Perfumes
          </h1>
          <div className="w-16 h-0.5 bg-yellow-500 mx-auto mt-3 mb-4" />
          <p className="text-gray-400 text-sm tracking-wider uppercase">
            Panel Administrativo
          </p>
        </div>

        {/* Formulario de login */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Campo de correo */}
            <div>
              <label className="block text-gray-400 text-sm mb-2 tracking-wider uppercase">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="admin@tienda.com"
              />
            </div>

            {/* Campo de contraseña */}
            <div>
              <label className="block text-gray-400 text-sm mb-2 tracking-wider uppercase">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Mensaje de error */}
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            {/* Botón de login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded tracking-widest uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}