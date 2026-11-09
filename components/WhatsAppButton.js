'use client';

/**
 * ========================================================================
 * COMPONENTE: Botón Flotante de WhatsApp para Escritorio (WhatsAppButton.js)
 * ========================================================================
 * Permite que los visitantes en computadoras y tablets hagan clic en cualquier momento
 * para chatear directamente con el entrenador.
 * Visible únicamente en pantallas de escritorio.
 */

import { MessageCircle } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function WhatsAppButton() {
  const { isSunlight } = useTheme();
  const numeroWhatsApp = '5493624098320';
  const mensajePredeterminado = encodeURIComponent(
    '¡Hola Coach Matías! Estuve viendo la web de Motion Lab y quisiera consultar por los planes de entrenamiento.'
  );

  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajePredeterminado}`;

  return (
    <aside aria-label="Contacto directo por WhatsApp" className="hidden lg:block fixed bottom-6 right-6 z-40">
      <a
        href={urlWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2.5 px-5 py-3 font-extrabold text-sm rounded-full shadow-2xl hover:scale-105 transition-all group touch-target ${
          isSunlight
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/30'
            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/40'
        }`}
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span>¿Hablamos por WhatsApp?</span>
      </a>
    </aside>
  );
}
