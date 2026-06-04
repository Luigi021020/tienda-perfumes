// Página de confirmacion de pedido
// Se muestra después de que el cliente realiza el pedido

"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ConfirmacionContenido() {
  const searchParams = useSearchParams();
  const numero = searchParams.get("numero");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        <div className="text-6xl mb-6">✅</div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Pedido enviado
        </h1>

        {numero && (
          <p className="text-yellow-500 font-bold text-lg mb-4">
            {numero}
          </p>
        )}

        <div className="w-12 h-0.5 bg-yellow-500 mx-auto mb-6" />

        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
          Tu pedido fue registrado exitosamente. Revisa WhatsApp para continuar la conversacion con nuestro asesor y acordar el pago y la entrega.
        </p>

        <p className="text-zinc-500 text-xs mb-8">
          Tambien te enviamos un correo de confirmacion con los detalles de tu pedido y el enlace de WhatsApp por si lo necesitas despues.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/catalogo"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 uppercase tracking-widest text-sm transition-colors"
          >
            Seguir comprando
          </Link>
          <Link
            href="/"
            className="text-zinc-500 hover:text-white text-sm transition-colors"
          >
            Ir al inicio
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function PedidoConfirmadoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-zinc-500">Cargando...</div>}>
      <ConfirmacionContenido />
    </Suspense>
  );
}