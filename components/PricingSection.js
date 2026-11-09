'use client';

/**
 * ========================================================================
 * COMPONENTE: Planes de Entrenamiento MOTION LAB (PricingSection.js)
 * ========================================================================
 * Presentación de las opciones de planificación:
 * 1. Plan Base: Autonomía, planificación y seguimiento.
 * 2. Plan Performance: Preparación física, especificidad y seguimiento.
 * Optimizado para alto contraste exterior y legibilidad en pantallas móviles al sol.
 */

import { Check, Zap, Crown, ArrowRight } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function PricingSection() {
  const { isSunlight } = useTheme();
  const whatsappTrainer = '5493624098320';

  const getLinkPlan = (planNombre) => {
    const texto = `¡Hola Equipo de MOTION LAB! Me gustaría consultar por el *${planNombre}*. ¿Cuáles son los métodos de pago y pasos para comenzar?`;
    return `https://wa.me/${whatsappTrainer}?text=${encodeURIComponent(texto)}`;
  };

  const planBase = {
    nombre: 'Plan Base',
    etiqueta: 'Autónomo',
    claim: 'Autonomía + planificación + seguimiento.',
    descripcion:
      'Entrená por tu cuenta con una planificación personalizada, objetivos claros y seguimiento profesional para acompañar tu evolución.',
    precio: '$75.000',
    incluye: [
      'Evaluación inicial',
      'Planificación individualizada',
      '3 a 5 sesiones semanales',
      'Control de cargas y evolución',
      'Correcciones y ajustes de manera asincrónica',
    ],
    nota: 'Entrenamiento independiente con seguimiento profesional.',
  };

  const planPerformance = {
    nombre: 'Plan Performance',
    etiqueta: 'Recomendado',
    claim: 'Preparación física + especificidad + seguimiento.',
    descripcion:
      'Un proceso integral que combina gimnasio y campo, adaptado a tus objetivos, necesidades y deporte.',
    precio: '$180.000',
    incluye: [
      'Evaluación y planificación individualizada',
      '2 a 3 sesiones de gimnasio',
      '2 a 3 sesiones de campo',
      'Fuerza, velocidad y potencia',
      'Control de cargas y seguimiento',
    ],
    nota: 'Acompañamiento presencial o virtual según modalidad de trabajo.',
  };

  return (
    <section id="planes" className={`py-16 md:py-24 border-t transition-colors duration-200 ${
      isSunlight ? 'bg-white border-slate-300' : 'bg-[#080d1a] border-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ENCABEZADO */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-3 border ${
            isSunlight
              ? 'bg-blue-100 text-blue-900 border-blue-300'
              : 'bg-blue-500/10 text-sky-400 border-blue-500/20'
          }`}>
            Programas de Entrenamiento
          </div>
          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${
            isSunlight ? 'text-[#020617]' : 'text-white'
          }`}>
            PLANES DE{' '}
            <span className={isSunlight ? 'text-blue-700' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300'}>
              ENTRENAMIENTO
            </span>
          </h2>
          <p className={`text-sm sm:text-base mt-3 font-medium ${
            isSunlight ? 'text-slate-700' : 'text-slate-300'
          }`}>
            Planificación basada en ciencia y biomecánica adaptada a tus objetivos y nivel.
          </p>
        </div>

        {/* COMPARATIVA DE PLANES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* ================================================================
              TARJETA 1: PLAN BASE
             ================================================================ */}
          <div className={`rounded-3xl p-6 sm:p-10 flex flex-col justify-between transition-all ${
            isSunlight
              ? 'bg-slate-50 border-2 border-slate-300 shadow-md text-slate-900'
              : 'bg-[#0b1220] border border-slate-800 hover:border-slate-700 text-white'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isSunlight ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-blue-500/10 text-sky-400 border border-blue-500/20'
                }`}>
                  <Zap className="w-6 h-6" />
                </div>
                <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                  isSunlight ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}>
                  {planBase.etiqueta}
                </span>
              </div>

              <h3 className={`text-2xl sm:text-3xl font-black ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                {planBase.nombre}
              </h3>
              <span className={`text-xs sm:text-sm font-black uppercase tracking-wide block mt-2 ${
                isSunlight ? 'text-blue-700' : 'text-sky-400'
              }`}>
                {planBase.claim}
              </span>
              <p className={`text-xs sm:text-sm mt-3 leading-relaxed font-medium ${
                isSunlight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                {planBase.descripcion}
              </p>

              {/* PRECIO */}
              <div className={`mt-6 pb-6 border-b ${
                isSunlight ? 'border-slate-300' : 'border-slate-800'
              }`}>
                <div className="flex items-end gap-1.5">
                  <span className={`text-3xl sm:text-4xl font-black tracking-tight ${
                    isSunlight ? 'text-slate-950' : 'text-white'
                  }`}>
                    {planBase.precio}
                  </span>
                  <span className={`text-sm font-bold mb-1 ${
                    isSunlight ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    /mes
                  </span>
                </div>
                <p className={`text-[11px] sm:text-xs mt-2 font-medium ${
                  isSunlight ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  Los métodos de pago se coordinan por WhatsApp.
                </p>
              </div>

              {/* BENEFICIOS */}
              <div className="space-y-3.5 mb-8 mt-6">
                <span className={`text-xs font-black uppercase tracking-wider block ${
                  isSunlight ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  Incluye:
                </span>

                {planBase.incluye.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isSunlight ? 'bg-blue-600 text-white' : 'bg-blue-500/20 text-sky-400'
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className={`text-sm font-medium ${isSunlight ? 'text-slate-800' : 'text-slate-200'}`}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className={`text-[11px] sm:text-xs font-semibold leading-snug mb-4 ${
                isSunlight ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {planBase.nota}
              </p>
              <a
                href={getLinkPlan(planBase.nombre)}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-4 rounded-full font-black text-sm text-center transition-all block touch-target shadow-md active:scale-95 ${
                  isSunlight
                    ? 'bg-blue-700 hover:bg-blue-800 text-white shadow-blue-900/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700'
                }`}
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>

          {/* ================================================================
              TARJETA 2: PLAN PERFORMANCE (DESTACADO)
             ================================================================ */}
          <div className={`rounded-3xl p-6 sm:p-10 flex flex-col justify-between relative transition-all ${
            isSunlight
              ? 'bg-amber-50/70 border-3 border-amber-500 shadow-xl text-slate-900'
              : 'bg-gradient-to-b from-[#0e172a] to-[#080d1a] border-2 border-amber-500/60 premium-glow text-white'
          }`}>
            
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>100% Individualizado • Recomendado</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isSunlight ? 'bg-amber-200 text-amber-900 border border-amber-400' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  <Crown className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-amber-900 bg-amber-400/90 px-3 py-1 rounded-full uppercase tracking-wider">
                  {planPerformance.etiqueta}
                </span>
              </div>

              <h3 className={`text-2xl sm:text-3xl font-black ${isSunlight ? 'text-slate-950' : 'text-white'}`}>
                {planPerformance.nombre}
              </h3>
              <span className={`text-xs sm:text-sm font-black uppercase tracking-wide block mt-2 ${
                isSunlight ? 'text-amber-800' : 'text-amber-400'
              }`}>
                {planPerformance.claim}
              </span>
              <p className={`text-xs sm:text-sm mt-3 leading-relaxed font-medium ${
                isSunlight ? 'text-slate-800' : 'text-slate-200'
              }`}>
                {planPerformance.descripcion}
              </p>

              {/* PRECIO */}
              <div className={`mt-6 pb-6 border-b ${
                isSunlight ? 'border-amber-300' : 'border-slate-800'
              }`}>
                <div className="flex items-end gap-1.5">
                  <span className={`text-3xl sm:text-4xl font-black tracking-tight ${
                    isSunlight ? 'text-slate-950' : 'text-white'
                  }`}>
                    {planPerformance.precio}
                  </span>
                  <span className={`text-sm font-bold mb-1 ${
                    isSunlight ? 'text-amber-800' : 'text-amber-400'
                  }`}>
                    /mes
                  </span>
                </div>
                <p className={`text-[11px] sm:text-xs mt-2 font-medium ${
                  isSunlight ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  Los métodos de pago se coordinan por WhatsApp.
                </p>
              </div>

              {/* BENEFICIOS */}
              <div className="space-y-3.5 mb-8 mt-6">
                <span className={`text-xs font-black uppercase tracking-wider block ${
                  isSunlight ? 'text-slate-900' : 'text-amber-400'
                }`}>
                  Incluye:
                </span>

                {planPerformance.incluye.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isSunlight ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className={`text-sm font-semibold ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className={`text-[11px] sm:text-xs font-semibold leading-snug mb-4 ${
                isSunlight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                {planPerformance.nota}
              </p>
              <a
                href={getLinkPlan(planPerformance.nombre)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-sm text-center shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 touch-target active:scale-95"
              >
                <span>Consultar por WhatsApp</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
