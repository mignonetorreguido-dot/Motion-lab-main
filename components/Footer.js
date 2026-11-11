'use client';

/**
 * ========================================================================
 * COMPONENTE: Footer Global Institucional (components/Footer.js)
 * ========================================================================
 * Footer institucional de Motion Lab desarrollado por FLEG TECH.
 * Integrado globalmente en todas las vistas y rutas de la aplicación:
 * - Izquierda: © 2026 FLEG TECH. Todos los derechos reservados. · Privacidad · Términos
 * - Derecha: Aviso médico de consulta con profesional de la salud.
 * - Estilo: bg-[#080c14], borde sutil border-slate-800/80, 100% responsive.
 */

import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export default function Footer({ className = '' }) {
  const anioActual = new Date().getFullYear();
  const { isSunlight } = useTheme();

  return (
    <footer
      role="contentinfo"
      aria-label="Información institucional y aviso médico"
      className={`w-full border-t transition-colors duration-200 select-none ${
        isSunlight
          ? 'bg-slate-100 border-slate-300 text-slate-600'
          : 'bg-[#080c14] border-slate-800/80 text-slate-500'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-2 text-center text-xs py-6 px-4 md:flex-row md:justify-between md:items-center md:text-left md:px-8">
        
        {/* IZQUIERDA: DERECHOS RESERVADOS Y ENLACES LEGALES */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1">
          <span>
            &copy; {anioActual}{' '}
            <a
              href="https://flegtech.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-400 hover:text-cyan-400 hover:underline transition-colors"
            >
              FLEG TECH
            </a>
            . Todos los derechos reservados.
          </span>
          <span className="text-slate-600 select-none">&middot;</span>
          <Link
            href="/privacidad"
            className="hover:text-cyan-400 hover:underline transition-colors"
          >
            Privacidad
          </Link>
          <span className="text-slate-600 select-none">&middot;</span>
          <Link
            href="/terminos"
            className="hover:text-cyan-400 hover:underline transition-colors"
          >
            Términos
          </Link>
        </div>

        {/* DERECHA: AVISO MÉDICO OFICIAL */}
        <p className="text-[11px] sm:text-xs font-normal text-slate-500 max-w-md md:text-right leading-relaxed">
          Aviso médico: Consulta con un profesional de la salud antes de iniciar planes de entrenamiento de alta exigencia.
        </p>

      </div>
    </footer>
  );
}
