'use client';

/**
 * ========================================================================
 * COMPONENTE: Sección Hero MOTION LAB (Hero.js)
 * ========================================================================
 * Presentación principal de alto rendimiento.
 * Optimizado para máxima visibilidad en pantallas de teléfonos bajo sol directo.
 */

import { ArrowRight, Sparkles, Timer } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import WhatsAppIcon from './WhatsAppIcon';

export default function Hero() {
  const { isSunlight } = useTheme();

  return (
    <section className={`relative pt-[calc(5.5rem+env(safe-area-inset-top,0px))] pb-12 sm:pt-28 md:pt-40 md:pb-28 overflow-hidden transition-colors duration-200 ${
      isSunlight ? 'bg-white' : 'hero-gradient'
    }`}>
      {/* Luces difuminadas de fondo solo en modo oscuro */}
      {!isSunlight && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] min-[360px]:w-[520px] sm:w-[600px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-8 lg:gap-12 items-center">
          
          {/* COLUMNA IZQUIERDA: Titular de alto impacto y llamada a la acción */}
          <div className="lg:col-span-7 text-left">
            
            {/* BADGE DE RENDIMIENTO */}
            <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] min-[360px]:text-xs sm:text-sm font-black uppercase tracking-wide sm:tracking-wider mb-4 sm:mb-5 transition-colors ${
              isSunlight
                ? 'bg-blue-100 text-blue-900 border-2 border-blue-300 shadow-sm'
                : 'bg-slate-900 border border-sky-500/30 text-sky-300 shadow-inner'
            }`}>
              <Sparkles className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isSunlight ? 'text-blue-700' : 'text-cyan-400'}`} />
              <span>Preparación Física & Rendimiento</span>
            </div>

            {/* TÍTULO PRINCIPAL CON MÁXIMO CONTRASTE PARA EXTERIORES */}
            <h1 className={`text-[1.9rem] min-[360px]:text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.06] mb-4 sm:mb-5 transition-colors ${
              isSunlight ? 'text-[#020617]' : 'text-white'
            }`}>
              <span className="sr-only">MOTION LAB – Preparación Física y Rendimiento: </span>
              ENTRENA CON <br />
              <span className={isSunlight 
                ? 'text-blue-700' 
                : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300'
              }>
                PRECISIÓN TOTAL.
              </span>
            </h1>

            {/* SUBTÍTULO DESCRIPTIVO - ALTO CONTRASTE */}
            <p className={`text-[15px] sm:text-lg font-medium mb-6 sm:mb-8 leading-relaxed max-w-xl transition-colors ${
              isSunlight ? 'text-slate-800' : 'text-slate-200'
            }`}>
              <span className={`block text-[10px] sm:text-xs font-black uppercase tracking-[0.16em] sm:tracking-[0.18em] mb-2 ${
                isSunlight ? 'text-blue-700' : 'text-sky-300'
              }`}>
                Ciencia aplicada a tu entrenamiento
              </span>
              <strong className={isSunlight ? 'text-black font-extrabold' : 'text-white font-bold'}>MOTION LAB</strong> es un enfoque donde la ciencia, la experiencia y el entrenamiento se encuentran para construir <strong className={isSunlight ? 'text-black font-extrabold' : 'text-white font-bold'}>RENDIMIENTO</strong>.
              <span className="block mt-2">
                Cada persona tiene un <strong className={isSunlight ? 'text-black font-extrabold' : 'text-white font-bold'}>OBJETIVO</strong>, cada proceso necesita un <strong className={isSunlight ? 'text-black font-extrabold' : 'text-white font-bold'}>MÉTODO</strong>.
              </span>
            </p>

            {/* BOTONES DE ACCIÓN (TOUCH-TARGET MÓVIL ÓPTIMO) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Link
                href="/comenzar"
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 text-[15px] sm:text-base font-black text-white bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 hover:from-blue-600 hover:to-sky-400 rounded-full transition-all shadow-xl shadow-blue-600/30 active:scale-95 touch-target"
              >
                <span>Comenzar</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="https://wa.me/5493624098320?text=¡Hola%20Coach%20Matías!%20Quisiera%20consultar%20por%20la%20planificación%20de%20Motion%20Lab."
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 text-[15px] sm:text-base font-black rounded-full transition-all border touch-target ${
                  isSunlight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
                }`}
              >
                <WhatsAppIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>

            {/* MÉTRICAS ATLÉTICAS CLARAS EN CELULAR */}
            <div className={`grid grid-cols-3 gap-2 sm:gap-4 pt-5 sm:pt-6 border-t transition-colors ${
              isSunlight ? 'border-slate-300' : 'border-slate-800/80'
            }`}>
              <div className={`p-2.5 sm:p-3 rounded-2xl ${isSunlight ? 'bg-slate-100 border border-slate-200' : ''}`}>
                <div className={`text-xl min-[360px]:text-2xl sm:text-3xl font-black ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                  100%
                </div>
                <div className={`text-[10px] sm:text-xs font-bold mt-0.5 leading-snug ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Individualizado
                </div>
              </div>
              <div className={`p-2.5 sm:p-3 rounded-2xl ${isSunlight ? 'bg-blue-50 border border-blue-200' : ''}`}>
                <div className={`text-xl min-[360px]:text-2xl sm:text-3xl font-black ${isSunlight ? 'text-blue-700' : 'text-sky-400'}`}>
                  +150
                </div>
                <div className={`text-[10px] sm:text-xs font-bold mt-0.5 leading-snug ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Alumnos evaluados
                </div>
              </div>
              <div className={`p-2.5 sm:p-3 rounded-2xl ${isSunlight ? 'bg-slate-100 border border-slate-200' : ''}`}>
                <div className={`text-xl min-[360px]:text-2xl sm:text-3xl font-black ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                  24/7
                </div>
                <div className={`text-[10px] sm:text-xs font-bold mt-0.5 leading-snug ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Monitoreo 1:1
                </div>
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: Fotografía Oficial con tarjeta de alto contraste */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md group">
              
              {/* Resplandor dinámico en azul eléctrico y cyan */}
              <div className={`absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 rounded-3xl blur-xl transition duration-500 ${
                isSunlight ? 'opacity-70 group-hover:opacity-95' : 'opacity-40 group-hover:opacity-60'
              }`} />
              
              {/* Marco de la imagen oficial con estilo de tarjeta atlética */}
              <div className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all ${
                isSunlight ? 'border-2 border-slate-300 bg-white' : 'border border-slate-800 bg-slate-900'
              }`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/motion-lab-field.jpg"
                  alt="Planificación y entrenamiento deportivo MOTION LAB"
                  loading="eager"
                  decoding="async"
                  className="w-full h-[320px] min-[360px]:h-[360px] sm:h-[480px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />

                {/* Capa de gradiente inferior para legibilidad del texto flotante */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Badge flotante inferior con datos del método */}
                <div className={`absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-4 rounded-2xl sm:backdrop-blur-md transition-colors ${
                  isSunlight 
                    ? 'bg-white sm:bg-white/95 border-2 border-slate-300 text-slate-900 shadow-lg' 
                    : 'bg-slate-950 sm:bg-slate-950/85 border border-slate-800/80 text-white'
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl flex items-center justify-center font-bold ${
                        isSunlight 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-blue-500/20 text-sky-400 border border-blue-500/30'
                      }`}>
                        <Timer className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className={`text-xs sm:text-sm font-black leading-tight ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                          Planificación al Segundo
                        </h4>
                        <p className={`text-[11px] sm:text-xs font-medium leading-snug ${isSunlight ? 'text-slate-600' : 'text-slate-300'}`}>
                          Tiempos de recuperación y cargas exactas
                        </p>
                      </div>
                    </div>
                    <span className={`hidden min-[380px]:inline-block shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${
                      isSunlight 
                        ? 'bg-blue-700 text-white' 
                        : 'bg-blue-500/20 text-sky-400 border border-blue-500/30'
                    }`}>
                      LAB
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
