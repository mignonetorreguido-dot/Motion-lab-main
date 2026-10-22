'use client';

/**
 * ========================================================================
 * COMPONENTE: Barra de Navegación MOTION LAB (Navbar.js)
 * ========================================================================
 * Barra de menú superior fija con soporte dinámico para Modo Soleado de Alto Contraste.
 * Permite cambiar entre el modo nocturno y el modo exterior con sol directo con un solo clic.
 */

import { useEffect, useState } from 'react';
import { Menu, X, Dumbbell, LogIn, LogOut, LayoutDashboard, Sun, Moon, HeartPulse } from 'lucide-react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import MotionLabLogo from './MotionLabLogo';
import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [sesion, setSesion] = useState(null);
  const [sesionCargada, setSesionCargada] = useState(false);
  const { isSunlight, toggleSunlight } = useTheme();

  // La barra pública también refleja la sesión activa. Así, al volver desde
  // el panel con el botón "atrás", no parece que la cuenta se hubiera cerrado.
  useEffect(() => {
    let activo = true;

    const consultarSesion = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        const data = await res.json();
        if (activo) setSesion(data?.user ? data : null);
      } catch {
        if (activo) setSesion(null);
      } finally {
        if (activo) setSesionCargada(true);
      }
    };

    consultarSesion();

    const alMostrar = (evento) => {
      if (evento.persisted) consultarSesion();
    };

    window.addEventListener('pageshow', alMostrar);

    return () => {
      activo = false;
      window.removeEventListener('pageshow', alMostrar);
    };
  }, []);

  const esEntrenador = sesion?.user?.rol === 'ENTRENADOR';
  const nombreCorto =
    sesion?.user?.name?.trim().split(/\s+/)[0] ||
    sesion?.user?.email?.split('@')[0] ||
    'Cuenta';

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-colors duration-200 border-b ${
      isSunlight
        ? 'bg-white/95 backdrop-blur-md border-slate-300 text-slate-900 shadow-md'
        : 'bg-[#05070c]/90 backdrop-blur-md border-slate-800/80 text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGOTIPO OFICIAL DE MOTION LAB */}
          <Link href="/" className="flex items-center group">
            <MotionLabLogo className="group-hover:scale-105 transition-transform" />
          </Link>

          {/* ENLACES DE NAVEGACIÓN EN ESCRITORIO */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-semibold">
            <Link 
              href="/entrenamiento" 
              className={`transition-colors flex items-center gap-1.5 font-semibold ${
                isSunlight ? 'text-slate-800 hover:text-blue-700' : 'text-slate-200 hover:text-sky-400'
              }`}
            >
              <Dumbbell className={`w-4 h-4 ${isSunlight ? 'text-blue-600' : 'text-cyan-400'}`} />
              Mi Entrenamiento
            </Link>
            <a 
              href="/#sobre-mi" 
              className={`transition-colors font-semibold ${
                isSunlight ? 'text-slate-800 hover:text-blue-700' : 'text-slate-200 hover:text-sky-400'
              }`}
            >
              Metodología
            </a>
            <a 
              href="/#galeria" 
              className={`transition-colors font-semibold ${
                isSunlight ? 'text-slate-800 hover:text-blue-700' : 'text-slate-200 hover:text-sky-400'
              }`}
            >
              Resultados
            </a>
            <Link
              href="/bienestar"
              className={`transition-colors flex items-center gap-1.5 font-semibold ${
                isSunlight ? 'text-sky-700 hover:text-sky-800' : 'text-sky-300 hover:text-sky-200'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              Bienestar
            </Link>
          </div>

          {/* BOTONES DE ACCIÓN + TOGGLE MODO SOLEADO */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* BOTÓN TOGGLE MODO SOLEADO / ALTO CONTRASTE */}
            <button
              onClick={toggleSunlight}
              type="button"
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-full transition-all border ${
                isSunlight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300 shadow-sm'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-amber-500/30 shadow-inner'
              }`}
              title={isSunlight ? 'Cambiar a modo noche' : 'Cambiar a modo soleado (alto contraste para celular/exterior)'}
            >
              {isSunlight ? (
                <>
                  <Moon className="w-4 h-4 text-slate-800 fill-slate-800" />
                  <span>Modo Noche</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Modo Soleado</span>
                </>
              )}
            </button>

            {!sesionCargada ? (
              <span className="text-sm font-bold opacity-0 select-none" aria-hidden="true">
                Cuenta
              </span>
            ) : sesion ? (
              <div className="flex items-center gap-3">
                {esEntrenador ? (
                  <Link
                    href="/admin"
                    className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${
                      isSunlight ? 'text-blue-700 hover:text-blue-900' : 'text-sky-300 hover:text-sky-200'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Panel de Matías
                  </Link>
                ) : (
                  <span className={`text-sm font-bold ${isSunlight ? 'text-slate-800' : 'text-slate-200'}`}>
                    Hola, {nombreCorto}
                  </span>
                )}
                <LogoutButton
                  className={`text-xs font-bold transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-full border ${
                    isSunlight
                      ? 'text-slate-600 border-slate-300 hover:text-red-700 hover:border-red-300 hover:bg-red-50'
                      : 'text-slate-400 border-slate-700 hover:text-red-300 hover:border-red-500/40 hover:bg-red-500/10'
                  }`}
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </LogoutButton>
              </div>
            ) : (
              <Link
                href="/login"
                className={`text-sm font-bold transition-colors flex items-center gap-1 px-2.5 py-1.5 ${
                  isSunlight ? 'text-slate-800 hover:text-blue-700' : 'text-slate-200 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </Link>
            )}

          </div>

          {/* BOTÓN MÓVIL (TOGGLE RÁPIDO Y MENÚ HAMBURGUESA) */}
          <div className="lg:hidden flex items-center gap-2">
            
            <button
              onClick={toggleSunlight}
              type="button"
              className={`sm:hidden p-2.5 rounded-xl border transition-colors touch-target ${
                isSunlight
                  ? 'bg-slate-100 border-slate-300 text-slate-900'
                  : 'bg-slate-900 border-slate-800 text-amber-400'
              }`}
              aria-label={isSunlight ? 'Activar modo oscuro' : 'Activar modo soleado'}
            >
              {isSunlight ? (
                <Moon className="w-5 h-5 text-slate-800 fill-slate-800" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400 fill-amber-400" />
              )}
            </button>

            <button
              onClick={toggleMenu}
              type="button"
              className={`p-2.5 rounded-xl border transition-colors touch-target ${
                isSunlight
                  ? 'text-slate-900 border-slate-300 hover:bg-slate-100'
                  : 'text-slate-200 border-slate-800 hover:text-white hover:bg-slate-900'
              }`}
              aria-label="Abrir menú"
            >
              {menuAbierto ? (
                <X className={`w-6 h-6 ${isSunlight ? 'text-blue-700' : 'text-sky-400'}`} />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {menuAbierto && (
        <div className={`lg:hidden px-4 pt-3 pb-6 space-y-3 shadow-2xl border-b-2 transition-colors ${
          isSunlight
            ? 'bg-white border-slate-300 text-slate-900'
            : 'bg-[#0a0f1d] border-slate-800 text-slate-100'
        }`}>
          {!sesionCargada ? null : sesion ? (
            <div className={`rounded-2xl border p-3.5 space-y-2 ${
              isSunlight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900/70 border-slate-800'
            }`}>
              <p className={`text-xs font-black uppercase tracking-wide ${isSunlight ? 'text-sky-800' : 'text-sky-300'}`}>
                Sesión activa
              </p>
              <p className={`text-sm font-bold ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                Hola, {nombreCorto}
              </p>
              {esEntrenador && (
                <Link
                  href="/admin"
                  onClick={() => setMenuAbierto(false)}
                  className={`flex items-center gap-2 py-2 text-sm font-bold ${
                    isSunlight ? 'text-blue-700' : 'text-sky-300'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Panel de Matías
                </Link>
              )}
              <LogoutButton
                className={`flex items-center gap-2 py-2 text-sm font-bold ${
                  isSunlight ? 'text-red-700' : 'text-red-300'
                }`}
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </LogoutButton>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuAbierto(false)}
              className={`block text-base font-bold py-2.5 flex items-center gap-2.5 touch-target ${
                isSunlight ? 'text-blue-700' : 'text-sky-400'
              }`}
            >
              <LogIn className="w-5 h-5" />
              <span>Iniciar Sesión</span>
            </Link>
          )}
          <Link
            href="/entrenamiento"
            onClick={() => setMenuAbierto(false)}
            className={`block text-base font-semibold py-2.5 flex items-center gap-2.5 touch-target ${
              isSunlight ? 'text-slate-900 hover:text-blue-700' : 'text-slate-200 hover:text-sky-400'
            }`}
          >
            <Dumbbell className="w-5 h-5 text-cyan-500" />
            <span>Mi Planilla de Entrenamiento</span>
          </Link>
          <a
            href="/#sobre-mi"
            onClick={() => setMenuAbierto(false)}
            className={`block text-base font-semibold py-2.5 touch-target ${
              isSunlight ? 'text-slate-900 hover:text-blue-700' : 'text-slate-200 hover:text-sky-400'
            }`}
          >
            Metodología & Enfoque
          </a>
          <a
            href="/#galeria"
            onClick={() => setMenuAbierto(false)}
            className={`block text-base font-semibold py-2.5 touch-target ${
              isSunlight ? 'text-slate-900 hover:text-blue-700' : 'text-slate-200 hover:text-sky-400'
            }`}
          >
            Resultados MOTION LAB
          </a>
          <Link
            href="/bienestar"
            onClick={() => setMenuAbierto(false)}
            className={`block text-base font-semibold py-2.5 flex items-center gap-2.5 touch-target ${
              isSunlight ? 'text-sky-700 hover:text-sky-800' : 'text-sky-300 hover:text-sky-200'
            }`}
          >
            <HeartPulse className="w-5 h-5" />
            <span>Chequeo de Bienestar</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
