'use client';

/**
 * ========================================================================
 * COMPONENTE: Resultados & Áreas de Entrenamiento (GallerySection.js)
 * ========================================================================
 * Galería visual oficial de MOTION LAB. Las fotos se mantienen como
 * muestra de los entornos de entrenamiento; el mensaje central es que la
 * ciencia se aplica a cualquier contexto.
 * Cada foto se puede tocar para verla ampliada.
 */

import { useEffect, useState } from 'react';
import { Compass, Maximize2, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const FOTOS = [
  {
    src: '/images/results-runner.jpg',
    alt: 'Atleta corriendo en una pista de atletismo iluminada de azul - MOTION LAB',
    etiqueta: 'Velocidad & Pista',
    titulo: 'Control de Cronómetro',
    colorEtiqueta: 'bg-blue-700',
    gradiente: 'from-blue-600 to-cyan-500',
  },
  {
    src: '/images/results-deadlift.jpg',
    alt: 'Atleta preparando un peso muerto en un gimnasio - MOTION LAB',
    etiqueta: 'Fuerza Máxima',
    titulo: 'Peso Muerto & Potencia',
    colorEtiqueta: 'bg-sky-700',
    gradiente: 'from-sky-500 to-blue-600',
  },
  {
    src: '/images/results-soccer.jpg',
    alt: 'Futbolista conduciendo el balón en una cancha nocturna - MOTION LAB',
    etiqueta: 'Rendimiento Deportivo',
    titulo: 'Fuerza Aplicada al Deporte',
    colorEtiqueta: 'bg-cyan-700',
    gradiente: 'from-cyan-500 to-blue-600',
  },
];

export default function GallerySection() {
  const { isSunlight } = useTheme();
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  useEffect(() => {
    if (!fotoAmpliada) return undefined;

    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const cerrarConEscape = (evento) => {
      if (evento.key === 'Escape') setFotoAmpliada(null);
    };

    window.addEventListener('keydown', cerrarConEscape);

    return () => {
      document.body.style.overflow = overflowOriginal;
      window.removeEventListener('keydown', cerrarConEscape);
    };
  }, [fotoAmpliada]);

  return (
    <>
      <section id="galeria" className={`py-16 md:py-24 border-t transition-colors duration-200 ${
        isSunlight ? 'bg-slate-50 border-slate-300' : 'bg-[#05070c] border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* ENCABEZADO */}
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-3 border ${
              isSunlight ? 'bg-blue-100 text-blue-900 border-blue-300' : 'bg-blue-500/10 text-sky-400 border-blue-500/20'
            }`}>
              <Compass className="w-3.5 h-3.5" />
              Resultados MOTION LAB
            </div>
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${
              isSunlight ? 'text-[#020617]' : 'text-white'
            }`}>
              DONDE EL MOVIMIENTO SE CONVIERTE EN{' '}
              <span className={isSunlight ? 'text-blue-700' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300'}>
                RESULTADOS
              </span>
            </h2>
            <p className={`text-sm sm:text-base mt-3 font-medium ${
              isSunlight ? 'text-slate-700' : 'text-slate-300'
            }`}>
              <span className={`font-black uppercase tracking-[0.14em] ${
                isSunlight ? 'text-blue-700' : 'text-sky-300'
              }`}>
                La ciencia se aplica a tu entorno
              </span>
            </p>
          </div>

          {/* GALERÍA DE FOTOS CON DEGRADÉ PERIMETRAL EXTERIOR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FOTOS.map((foto) => (
              <div
                key={foto.src}
                role="button"
                tabIndex={0}
                aria-label={`Ampliar foto: ${foto.titulo}`}
                aria-haspopup="dialog"
                onClick={() => setFotoAmpliada(foto)}
                onKeyDown={(evento) => {
                  if (evento.key === 'Enter' || evento.key === ' ') {
                    evento.preventDefault();
                    setFotoAmpliada(foto);
                  }
                }}
                className="relative rounded-2xl group aspect-[4/5] cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                <div className={`absolute -inset-1 bg-gradient-to-r ${foto.gradiente} rounded-2xl blur-lg transition duration-500 ${
                  isSunlight ? 'opacity-60 group-hover:opacity-90' : 'opacity-30 group-hover:opacity-60'
                }`} />
                <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-lg ${
                  isSunlight ? 'border-2 border-slate-300' : 'border border-slate-800'
                }`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={foto.src}
                    alt={foto.alt}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/45 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-90 group-hover:bg-black/65 transition-colors">
                    <Maximize2 className="w-4 h-4" />
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded text-white ${foto.colorEtiqueta}`}>
                      {foto.etiqueta}
                    </span>
                    <h4 className="text-white font-black text-sm mt-1.5 drop-shadow">{foto.titulo}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* VISOR DE FOTO AMPLIADA */}
      {fotoAmpliada && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ampliada: ${fotoAmpliada.titulo}`}
          onClick={() => setFotoAmpliada(null)}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setFotoAmpliada(null)}
            aria-label="Cerrar foto ampliada"
            autoFocus
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            onClick={(evento) => evento.stopPropagation()}
            className="flex flex-col items-center justify-center max-w-full max-h-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoAmpliada.src}
              alt={fotoAmpliada.alt}
              className="max-w-full max-h-[82vh] w-auto h-auto object-contain rounded-2xl shadow-2xl"
            />
            <div className="text-center mt-4 px-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-300">
                {fotoAmpliada.etiqueta}
              </p>
              <p className="text-white font-black text-base sm:text-lg mt-1">
                {fotoAmpliada.titulo}
              </p>
              <p className="text-white/50 text-xs mt-1">
                Tocá fuera de la foto para cerrar
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
