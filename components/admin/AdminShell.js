'use client';

/**
 * ========================================================================
 * COMPONENTE: Estructura del Panel Admin (components/admin/AdminShell.js)
 * ========================================================================
 * Envuelve el panel del entrenador Matías con:
 * 1. Cabecera con regreso a la web, logotipo y toggle Modo Soleado / Noche.
 * 2. Fondo y tipografía adaptables al tema activo (noche / sol).
 * 3. Pie de página discreto.
 */

import Link from 'next/link';
import { ArrowLeft, LogOut } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import MotionLabLogo from '@/components/MotionLabLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/components/ThemeProvider';

export default function AdminShell({ children }) {
  const { isSunlight } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${
      isSunlight ? 'bg-slate-50 text-slate-900' : 'bg-[#05070c] text-slate-100'
    }`}>

      {/* CABECERA SUPERIOR */}
      <header className={`max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b mb-8 transition-colors ${
        isSunlight ? 'border-slate-300' : 'border-slate-800/80'
      }`}>
        <Link
          href="/"
          className={`inline-flex items-center gap-2 text-xs font-bold transition-colors touch-target ${
            isSunlight ? 'text-slate-700 hover:text-blue-700' : 'text-slate-400 hover:text-sky-400'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Web Principal</span>
        </Link>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {/* TOGGLE MODO SOLEADO / NOCHE EN EL PANEL DEL ENTRENADOR */}
          <ThemeToggle />
          <LogoutButton
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full border transition-colors ${
              isSunlight
                ? 'text-slate-600 border-slate-300 hover:text-red-700 hover:border-red-300 hover:bg-red-50'
                : 'text-slate-400 border-slate-700 hover:text-red-300 hover:border-red-500/40 hover:bg-red-500/10'
            }`}
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </LogoutButton>
          <Link href="/" className="group">
            <MotionLabLogo className="group-hover:scale-105 transition-transform" />
          </Link>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* PIE DISCRETO */}
      <footer className={`max-w-7xl mx-auto w-full text-center pt-12 text-xs ${
        isSunlight ? 'text-slate-500' : 'text-slate-600'
      }`}>
        © {new Date().getFullYear()} MOTION LAB • Panel de Administración para Matías.
      </footer>

    </div>
  );
}
