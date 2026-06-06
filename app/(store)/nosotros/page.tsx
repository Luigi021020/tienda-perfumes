// Página de Quiénes Somos
// Historia y propuesta de valor de R&B Perfumes

export default function NosotrosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-white">

      {/* Encabezado */}
      <div className="text-center mb-16">
        <p className="text-yellow-500 text-xs uppercase tracking-widest mb-4">Conocenos</p>
        <h1 className="text-4xl font-bold tracking-widest uppercase mb-4">R&B Perfumes</h1>
        <div className="w-16 h-0.5 bg-yellow-500 mx-auto mb-6" />
        <p className="text-zinc-400 text-lg italic">
          Desde 2009 acercando las mejores fragancias a mas personas
        </p>
      </div>

      {/* Historia */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mb-8">
        <h2 className="text-xl font-bold tracking-wider uppercase mb-4 text-yellow-500">
          Nuestra historia
        </h2>
        <p className="text-zinc-300 leading-relaxed mb-4">
          Bienvenidos a R&B Perfumes. Desde 2009 nos dedicamos a la venta de perfumes originales,
          ofreciendo a nuestros clientes una amplia seleccion de perfumeria de disenador y arabe.
        </p>
        <p className="text-zinc-300 leading-relaxed">
          R&B Perfumes nacio con el objetivo de acercar las mejores fragancias a mas personas,
          brindando siempre productos de calidad, precios competitivos y una atencion personalizada
          que nos distingue.
        </p>
        <div className="mt-6 flex items-center gap-2 text-zinc-400">
          <span>📍</span>
          <span>Nos encontramos en Escobedo, Nuevo Leon</span>
        </div>
      </div>

      {/* Por qué elegirnos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mb-8">
        <h2 className="text-xl font-bold tracking-wider uppercase mb-6 text-yellow-500">
          Por que elegir R&B Perfumes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Amplio catalogo de perfumes de disenador y arabes",
            "Precios altamente competitivos",
            "Atencion personalizada para ayudarte a encontrar la fragancia ideal",
            "Empaquetado rapido y seguro",
            "Envios agiles a toda la Republica Mexicana",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-zinc-800 rounded p-4">
              <span className="text-yellow-500 text-lg flex-shrink-0">✦</span>
              <p className="text-zinc-300 text-sm leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Opciones de entrega */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mb-8">
        <h2 className="text-xl font-bold tracking-wider uppercase mb-6 text-yellow-500">
          Opciones de entrega
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 border-b border-zinc-800 pb-4">
            <span className="text-2xl">🚗</span>
            <div>
              <p className="font-bold text-white mb-1">Entregas personales</p>
              <p className="text-zinc-400 text-sm">Dentro de Escobedo, Nuevo Leon</p>
            </div>
          </div>
          <div className="flex items-start gap-4 border-b border-zinc-800 pb-4">
            <span className="text-2xl">🛵</span>
            <div>
              <p className="font-bold text-white mb-1">Servicio de reparto</p>
              <p className="text-zinc-400 text-sm">
                En toda el area metropolitana de Monterrey a un costo accesible
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="text-2xl">📦</span>
            <div>
              <p className="font-bold text-white mb-1">Envios nacionales</p>
              <p className="text-zinc-400 text-sm">
                Mediante diversas paqueterias para que recibas tus productos de forma rapida y segura
                a cualquier parte de la Republica Mexicana
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-zinc-900 border border-yellow-500 rounded-lg p-8">
        <p className="text-zinc-300 text-lg mb-2 italic">
          Tu proxima fragancia favorita te esta esperando
        </p>
        <div className="w-12 h-0.5 bg-yellow-500 mx-auto my-4" />
        <a
          href="/catalogo"
          className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 uppercase tracking-widest text-sm transition-colors"
        >
          Ver catalogo
        </a>
      </div>

    </div>
  );
}