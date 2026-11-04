'use client';

/**
 * ========================================================================
 * COMPONENTE: Sobre MOTION LAB & Metodología (AboutTrainer.js)
 * ========================================================================
 * Sección que presenta el enfoque metodológico de MOTION LAB.
 * Diseñado con alto contraste y legibilidad óptima para celulares al aire libre.
 */

import { Activity, ClipboardList, TrendingUp, Dumbbell } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function AboutTrainer() {
  const { isSunlight } = useTheme();

  return (
    <section id="sobre-mi" className={`py-12 sm:py-16 md:py-24 border-t transition-colors duration-200 relative ${
      isSunlight ? 'bg-slate-50 border-slate-300' : 'bg-[#080d1a] border-slate-800/80'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
          
          {/* COLUMNA IZQUIERDA: Fotografía del Cliente */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md group">
              
              {/* Resplandor dinámico exterior en azul atlético y cyan */}
              <div className={`absolute -inset-1.5 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-400 rounded-3xl blur-xl transition duration-500 ${
                isSunlight ? 'opacity-70 group-hover:opacity-95' : 'opacity-50 group-hover:opacity-75'
              }`} />

              <div className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all ${
                isSunlight ? 'border-2 border-slate-300 bg-white' : 'border border-slate-800 bg-slate-900'
              }`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/gym-kettlebell.jpg"
                  alt="Planificación y equipamiento en MOTION LAB"
                  decoding="async"
                  className="w-full h-[300px] min-[360px]:h-[340px] sm:h-[450px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                <div className={`absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-4 rounded-2xl sm:backdrop-blur-md transition-colors ${
                  isSunlight 
                    ? 'bg-white sm:bg-white/95 border-2 border-slate-300 text-slate-900 shadow-md' 
                    : 'bg-slate-950 sm:bg-slate-950/85 border border-slate-800 text-white'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl flex items-center justify-center font-black ${
                      isSunlight ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-sky-500/20 text-sky-400'
                    }`}>
                      ML
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-xs sm:text-sm font-black leading-snug ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                        Metodología Basada en Evidencia
                      </h4>
                      <p className={`text-[11px] sm:text-xs font-semibold leading-snug ${isSunlight ? 'text-slate-600' : 'text-slate-300'}`}>
                        Biomecánica, sobrecarga progresiva y control
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* COLUMNA DERECHA: El Método MOTION LAB */}
          <div className="lg:col-span-7 space-y-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider border ${
              isSunlight 
                ? 'bg-blue-100 text-blue-900 border-blue-300' 
                : 'bg-blue-500/10 text-sky-400 border-blue-500/20'
            }`}>
              <Activity className="w-3.5 h-3.5" />
              <span>Metodología MOTION LAB</span>
            </div>

            <h2 className={`text-[1.65rem] min-[360px]:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
              isSunlight ? 'text-[#020617]' : 'text-white'
            }`}>
              NO ES SOLO ENTRENAR, ES{' '}
              <span className={isSunlight ? 'text-blue-700' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300'}>
                PLANIFICAR TU RENDIMIENTO
              </span>
            </h2>

            <p className={`text-[15px] sm:text-base font-medium leading-relaxed ${
              isSunlight ? 'text-slate-800' : 'text-slate-200'
            }`}>
              Desarrollamos las <strong className={isSunlight ? 'text-black font-extrabold' : 'text-white'}>CAPACIDADES</strong> que realmente necesitas para <strong className={isSunlight ? 'text-black font-extrabold' : 'text-white'}>RENDIR</strong>.
            </p>

            <div className="space-y-4 pt-2">
              <div className={`flex items-start gap-3 sm:gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all ${
                isSunlight 
                  ? 'bg-white border-2 border-slate-300 shadow-sm' 
                  : 'bg-slate-900/60 border border-slate-800/80'
              }`}>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isSunlight ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/10 text-sky-400'
                }`}>
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-black text-sm sm:text-base tracking-wide ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                    EVALUAR
                  </h4>
                  <p className={`text-xs sm:text-sm font-medium mt-1 ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <strong className={isSunlight ? 'text-slate-900' : 'text-white'}>CONOCER ANTES DE INTERVENIR.</strong>{' '}
                    Conocemos tu punto de partida.
                  </p>
                </div>
              </div>

              <div className={`flex items-start gap-3 sm:gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all ${
                isSunlight 
                  ? 'bg-white border-2 border-slate-300 shadow-sm' 
                  : 'bg-slate-900/60 border border-slate-800/80'
              }`}>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isSunlight ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/10 text-sky-400'
                }`}>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-black text-sm sm:text-base tracking-wide ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                    PLANIFICAR
                  </h4>
                  <p className={`text-xs sm:text-sm font-medium mt-1 ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <strong className={isSunlight ? 'text-slate-900' : 'text-white'}>CONVERTIR OBJETIVOS EN DIRECCIÓN.</strong>{' '}
                    Diseñamos el camino.
                  </p>
                </div>
              </div>

              <div className={`flex items-start gap-3 sm:gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all ${
                isSunlight 
                  ? 'bg-white border-2 border-slate-300 shadow-sm' 
                  : 'bg-slate-900/60 border border-slate-800/80'
              }`}>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isSunlight ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/10 text-sky-400'
                }`}>
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className={`font-black text-sm sm:text-base tracking-wide ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                    ENTRENAR Y AJUSTAR
                  </h4>
                  <p className={`text-xs sm:text-sm font-medium ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <strong className={isSunlight ? 'text-slate-900' : 'text-white'}>CONVERTIR EL PLAN EN ACCIÓN.</strong>{' '}
                    Entrenamos con intención.
                  </p>
                  <p className={`text-xs sm:text-sm font-medium ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <strong className={isSunlight ? 'text-slate-900' : 'text-white'}>ADAPTAR PARA SEGUIR AVANZANDO.</strong>{' '}
                    Ajustamos según tu evolución.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
