'use client';

/**
 * ========================================================================
 * COMPONENTE: Barra de Acción Rápida para Celulares (MobileBottomBar.js)
 * ========================================================================
 * Barra fija en la parte inferior para dispositivos móviles.
 * Proporciona acceso ergonómico con una sola mano (zona del pulgar):
 * 1. Botón ☀️/🌙 para activar al instante el Modo Soleado de Alto Contraste.
 * 2. Acceso a Planes y Membresías.
 * 3. Acceso directo a Mi Entrenamiento (rutina interactiva).
 * 4. Botón vibrante de WhatsApp para chatear con el coach.
 */

import Link from 'next/link';
import { Sun, Moon, Dumbbell, UserPlus } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { useTheme } from './ThemeProvider';

export default function MobileBottomBar() {
  const { isSunlight, toggleSunlight } = useTheme();

  const numeroWhatsApp = '5493624098320';
  const mensajePredeterminado = encodeURIComponent(
    '¡Hola Coach Matías! Estuve viendo la web de Motion Lab desde el celular y quisiera consultar por los planes.'
  );
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajePredeterminado}`;

  return (
    <aside 
      aria-label="Navegación móvil ergonómica"
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-colors duration-200 border-t ${
        isSunlight 
          ? 'bg-white border-slate-300 text-slate-900 shadow-[0_-4px_20px_rgba(0,0,0,0.12)]' 
          : 'bg-[#070b14]/95 backdrop-blur-md border-slate-800 text-slate-200 shadow-[0_-4px_25px_rgba(0,0,0,0.6)]'
      }`}
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
    >
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-2">
        
        {/* 1. TOGGLE MODO SOLEADO */}
        <button
          onClick={toggleSunlight}
          type="button"
          aria-label={isSunlight ? 'Activar modo oscuro' : 'Activar modo soleado'}
          className={`flex flex-col items-center justify-center h-full rounded-xl transition-all active:scale-95 touch-target ${
            isSunlight
              ? 'text-amber-700 hover:bg-slate-100 font-bold'
              : 'text-amber-400 hover:bg-slate-800/60 font-semibold'
          }`}
        >
          {isSunlight ? (
            <>
              <Moon className="w-5 h-5 text-slate-800 fill-slate-800" />
              <span className="text-[11px] mt-0.5 font-extrabold text-slate-900">Noche</span>
            </>
          ) : (
            <>
              <Sun className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
              <span className="text-[11px] mt-0.5 font-bold text-amber-300">☀️ Sol</span>
            </>
          )}
        </button>

        {/* 2. COMENZAR / SELECCIÓN DE PERFIL */}
        <Link
          href="/comenzar"
          className={`flex flex-col items-center justify-center h-full rounded-xl transition-all active:scale-95 touch-target ${
            isSunlight
              ? 'text-blue-700 hover:bg-slate-100 font-bold'
              : 'text-sky-400 hover:bg-slate-800/60 font-semibold'
          }`}
        >
          <UserPlus className="w-5 h-5" />
          <span className="text-[11px] mt-0.5 font-bold">Comenzar</span>
        </Link>

        {/* 3. MI ENTRENAMIENTO */}
        <Link
          href="/entrenamiento"
          className={`flex flex-col items-center justify-center h-full rounded-xl transition-all active:scale-95 touch-target ${
            isSunlight
              ? 'text-slate-900 hover:bg-slate-100 font-bold'
              : 'text-slate-200 hover:bg-slate-800/60 font-semibold'
          }`}
        >
          <Dumbbell className="w-5 h-5 text-cyan-500" />
          <span className="text-[11px] mt-0.5 font-bold">Mi Rutina</span>
        </Link>

        {/* 4. WHATSAPP DIRECTO */}
        <a
          href={urlWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir WhatsApp directo con Matías"
          className="flex flex-col items-center justify-center h-full rounded-xl transition-all active:scale-95 touch-target text-emerald-600"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/30">
            <WhatsAppIcon className="w-4 h-4" />
          </div>
          <span className={`text-[10px] mt-0.5 font-black uppercase tracking-tight ${
            isSunlight ? 'text-emerald-800' : 'text-emerald-400'
          }`}>
            WhatsApp
          </span>
        </a>

      </div>
    </aside>
  );
}
