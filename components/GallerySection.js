'use client';

/**
 * ========================================================================
 * COMPONENTE: Resultados & Áreas de Entrenamiento (GallerySection.js)
 * ========================================================================
 * Galería visual oficial de MOTION LAB. Las fotos se mantienen como
 * muestra de los entornos de entrenamiento; el mensaje central es que la
 * ciencia se aplica a cualquier contexto.
 * Con resplandor exterior dinámico visible tanto en modo soleado como noche.
 */

import { Compass } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function GallerySection() {
  const { isSunlight } = useTheme();

  return (
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
          
          {/* Foto 1: Pista de Atletismo Día */}
          <div className="relative rounded-2xl group h-64 sm:h-72">
            <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur-lg transition duration-500 ${
              isSunlight ? 'opacity-60 group-hover:opacity-90' : 'opacity-30 group-hover:opacity-60'
            }`} />
            <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-lg ${
              isSunlight ? 'border-2 border-slate-300' : 'border border-slate-800'
            }`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/track-day.jpg"
                alt="Entrenamiento en pista de atletismo - MOTION LAB"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-blue-700 text-white">
                  Velocidad & Pista
                </span>
                <h4 className="text-white font-black text-sm mt-1.5 drop-shadow">Control de Cronómetro</h4>
              </div>
            </div>
          </div>

          {/* Foto 2: Pista Noche con Calzado */}
          <div className="relative rounded-2xl group h-64 sm:h-72">
            <div className={`absolute -inset-1 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl blur-lg transition duration-500 ${
              isSunlight ? 'opacity-60 group-hover:opacity-90' : 'opacity-30 group-hover:opacity-60'
            }`} />
            <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-lg ${
              isSunlight ? 'border-2 border-slate-300' : 'border border-slate-800'
            }`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/track-night.jpg"
                alt="Planificación nocturna en pista - MOTION LAB"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-sky-700 text-white">
                  Capacidad Atlética
                </span>
                <h4 className="text-white font-black text-sm mt-1.5 drop-shadow">Periodización Continua</h4>
              </div>
            </div>
          </div>

          {/* Foto 3: Cancha con Balón */}
          <div className="relative rounded-2xl group h-64 sm:h-72">
            <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-lg transition duration-500 ${
              isSunlight ? 'opacity-60 group-hover:opacity-90' : 'opacity-30 group-hover:opacity-60'
            }`} />
            <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-lg ${
              isSunlight ? 'border-2 border-slate-300' : 'border border-slate-800'
            }`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/soccer-turf.jpg"
                alt="Preparación física deportiva de campo - MOTION LAB"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-cyan-700 text-white">
                  Rendimiento Deportivo
                </span>
                <h4 className="text-white font-black text-sm mt-1.5 drop-shadow">Fuerza Aplicada al Deporte</h4>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
