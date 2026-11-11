'use client';

/**
 * ========================================================================
 * CONTENEDOR VISUAL DE LA PANTALLA "COMENZAR"
 * ========================================================================
 * Aplica el fondo y los colores del Modo Noche / Modo Soleado, igual que el
 * resto de la web, y deja el contenido principal en StartRoleSelector.
 */

import Navbar from '@/components/Navbar';
import StartRoleSelector from './StartRoleSelector';
import { useTheme } from '@/components/ThemeProvider';

export default function StartShell({ rolInicial = null }) {
  const { isSunlight } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-200 ${
        isSunlight ? 'bg-slate-50 text-slate-900' : 'bg-[#05070c] text-white'
      }`}
    >
      <Navbar />

      {/* Luces decorativas sólo en modo noche */}
      {!isSunlight && (
        <>
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[520px] max-w-[90vw] h-[420px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 right-0 w-[320px] h-[320px] bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />
        </>
      )}

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-14 relative z-10">
        <StartRoleSelector rolInicial={rolInicial} />
      </main>

      
    </div>
  );
}
