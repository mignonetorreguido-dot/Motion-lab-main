'use client';

/**
 * ========================================================================
 * COMPONENTE: Pie de Página MOTION LAB (Footer.js)
 * ========================================================================
 * Incluye logotipo oficial, enlaces rápidos, canales de contacto y
 * aviso de responsabilidad médica deportiva.
 * Optimizado para alto contraste en modo soleado y móvil.
 */

import { Instagram, Mail, MessageCircle } from 'lucide-react';
import MotionLabLogo from './MotionLabLogo';
import { useTheme } from './ThemeProvider';

export default function Footer() {
  const anioActual = new Date().getFullYear();
  const { isSunlight } = useTheme();

  return (
    <footer className={`border-t py-12 transition-colors duration-200 ${
      isSunlight 
        ? 'bg-slate-100 border-slate-300 text-slate-700' 
        : 'bg-[#030509] border-slate-800 text-slate-300'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* COLUMNA 1: Marca y Misión */}
          <div className="md:col-span-2 space-y-4">
            <MotionLabLogo />
            <p className={`text-xs sm:text-sm max-w-md leading-relaxed font-medium ${
              isSunlight ? 'text-slate-800' : 'text-slate-300'
            }`}>
              Centro de rendimiento deportivo y planificación física individualizada. Ciencia, biomecánica y sobrecarga progresiva aplicadas a tu objetivo.
            </p>
          </div>

          {/* COLUMNA 2: Enlaces Rápidos */}
          <div>
            <h4 className={`text-xs font-black uppercase tracking-wider mb-4 ${
              isSunlight ? 'text-slate-950' : 'text-white'
            }`}>
              Navegación
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm font-semibold">
              <li>
                <a href="/#sobre-mi" className={`transition-colors ${isSunlight ? 'hover:text-blue-700' : 'hover:text-sky-400'}`}>
                  Metodología MOTION LAB
                </a>
              </li>
              <li>
                <a href="/#galeria" className={`transition-colors ${isSunlight ? 'hover:text-blue-700' : 'hover:text-sky-400'}`}>
                  Resultados & Pista
                </a>
              </li>
              <li>
                <a href="/onboarding" className={`transition-colors ${isSunlight ? 'hover:text-blue-700' : 'hover:text-sky-400'}`}>
                  Comenzar ahora
                </a>
              </li>

            </ul>
          </div>

          {/* COLUMNA 3: Canales de Contacto */}
          <div>
            <h4 className={`text-xs font-black uppercase tracking-wider mb-4 ${
              isSunlight ? 'text-slate-950' : 'text-white'
            }`}>
              Canales Oficiales
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm font-semibold">
              <li className="flex items-center gap-2">
                <MessageCircle className={`w-4 h-4 ${isSunlight ? 'text-emerald-700' : 'text-emerald-400'}`} />
                <a 
                  href="https://wa.me/5493624654911" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`transition-colors ${isSunlight ? 'hover:text-blue-700 text-slate-800' : 'hover:text-white'}`}
                >
                  WhatsApp: +54 9 362 465-4911
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className={`w-4 h-4 ${isSunlight ? 'text-blue-700' : 'text-sky-400'}`} />
                <span className={isSunlight ? 'text-slate-800' : ''}>contacto@motionlab.fit</span>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className={`w-4 h-4 ${isSunlight ? 'text-blue-700' : 'text-sky-400'}`} />
                <a
                  href="https://www.instagram.com/motionlab_pf/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-colors ${isSunlight ? 'text-slate-800 hover:text-blue-700' : 'hover:text-white'}`}
                >
                  @motionlab_pf
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* LÍNEA FINAL */}
        <div className={`pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium ${
          isSunlight ? 'border-slate-300 text-slate-600' : 'border-slate-800/80 text-slate-400'
        }`}>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <p>
              © {anioActual} MOTION LAB. Todos los derechos reservados.
            </p>
            <span className={isSunlight ? 'text-slate-400' : 'text-slate-600'}>·</span>
            <a href="/privacidad" className={`font-bold underline underline-offset-2 ${isSunlight ? 'hover:text-blue-700' : 'hover:text-sky-400'}`}>
              Privacidad
            </a>
            <span className={isSunlight ? 'text-slate-400' : 'text-slate-600'}>·</span>
            <a href="/terminos" className={`font-bold underline underline-offset-2 ${isSunlight ? 'hover:text-blue-700' : 'hover:text-sky-400'}`}>
              Términos
            </a>
          </div>
          <p className="text-[11px] max-w-sm text-center sm:text-right font-medium">
            Aviso médico: Consulta con un profesional de la salud antes de iniciar planes de entrenamiento de alta exigencia.
          </p>
        </div>

      </div>
    </footer>
  );
}
