'use client';

/**
 * ========================================================================
 * COMPONENTE: Logotipo Oficial MOTION LAB (MotionLabLogo.js)
 * ========================================================================
 * Recreación vectorial del imagotipo de "MOTION LAB": dos barras
 * diagonales con sus puntos, wordmark y bajada "Preparación Física &
 * Rendimiento". Se adapta al Modo Noche y al Modo Soleado.
 */

import { useTheme } from './ThemeProvider';

export default function MotionLabLogo({
  className = '',
  iconOnly = false,
  size = 'default',
  compact = false,
}) {
  const isLarge = size === 'large';
  const { isSunlight } = useTheme();

  // El azul y el navy son los del logo original. En fondo oscuro se
  // aclaran un poco para que ambas barras sigan siendo legibles.
  const azul = isSunlight ? '#0B5CFF' : '#2F7BFF';
  const marino = isSunlight ? '#071A45' : '#1E3A8A';

  return (
    <div
      role="img"
      aria-label="MOTION LAB — Preparación Física y Rendimiento"
      className={`flex items-center gap-2 min-[360px]:gap-2.5 select-none transition-colors ${className}`}
    >
      {/* ISOTIPO: dos trazos diagonales y dos círculos, como el logo oficial */}
      <svg
        viewBox="0 0 120 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={`${isLarge ? 'w-12' : 'w-8 min-[360px]:w-9'} h-auto shrink-0`}
      >
        {/* Barra azul */}
        <path d="M18 8Q18 4 22 4H36L62 76H44Z" fill={azul} />
        {/* Barra navy */}
        <path d="M48 8Q48 4 52 4H66L92 76H74Z" fill={marino} />
        {/* Punto navy inferior izquierdo */}
        <circle cx="20" cy="68" r="12" fill={marino} />
        {/* Punto azul superior derecho */}
        <circle cx="90" cy="14" r="12" fill={azul} />
      </svg>

      {/* WORDMARK + BAJADA */}
      {!iconOnly && (
        <div className={`${compact ? 'hidden sm:flex' : 'flex'} flex-col justify-center leading-none`}>
          <span
            className={`font-black uppercase transition-colors ${
              isLarge ? 'text-2xl sm:text-3xl' : 'text-[17px] min-[360px]:text-lg sm:text-xl'
            } ${isSunlight ? 'text-[#071A45]' : 'text-white'}`}
            style={{ letterSpacing: '0.14em' }}
          >
            MOTION{' '}
            <span className="relative inline-block" style={{ color: azul }}>
              LAB
              <span
                className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full"
                style={{ backgroundColor: azul }}
                aria-hidden="true"
              />
            </span>
          </span>
          <span
            className={`mt-1.5 font-bold uppercase transition-colors ${
              isLarge
                ? 'text-[9px] sm:text-[10px] tracking-[0.16em]'
                : 'text-[6.5px] min-[360px]:text-[7px] sm:text-[8px] tracking-[0.14em] min-[360px]:tracking-[0.16em]'
            } ${isSunlight ? 'text-[#071A45]' : 'text-slate-300'} whitespace-nowrap`}
          >
            Preparación Física &amp; Rendimiento
          </span>
        </div>
      )}
    </div>
  );
}
