'use client';

/**
 * ========================================================================
 * COMPONENTE: Página legal reutilizable (components/LegalPage.js)
 * ========================================================================
 * Se usa para /privacidad y /terminos. Mantiene el mismo navbar, footer y
 * modo soleado que el resto de MOTION LAB. El contenido llega desde páginas
 * del servidor para no duplicar estilos.
 */

import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from './ThemeProvider';

export default function LegalPage({ titulo, actualizado, intro, secciones = [] }) {
  const { isSunlight } = useTheme();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className={`flex-grow transition-colors duration-200 ${
        isSunlight ? 'bg-slate-50' : 'bg-[#05070c]'
      }`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider mb-8 transition-colors ${
              isSunlight ? 'text-blue-700 hover:text-blue-900' : 'text-sky-400 hover:text-sky-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a MOTION LAB
          </Link>

          <div className="flex items-start gap-3 mb-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isSunlight ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/10 text-sky-400'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight ${
                isSunlight ? 'text-slate-950' : 'text-white'
              }`}>
                {titulo}
              </h1>
              <p className={`text-[11px] font-bold mt-1 ${
                isSunlight ? 'text-slate-500' : 'text-slate-500'
              }`}>
                Última actualización: {actualizado}
              </p>
            </div>
          </div>

          <p className={`text-sm sm:text-base leading-relaxed font-medium mb-10 ${
            isSunlight ? 'text-slate-700' : 'text-slate-300'
          }`}>
            {intro}
          </p>

          <div className="space-y-8">
            {secciones.map((seccion, indice) => (
              <section key={seccion.titulo}>
                <h2 className={`text-sm sm:text-base font-black uppercase tracking-wider mb-2.5 ${
                  isSunlight ? 'text-slate-950' : 'text-white'
                }`}>
                  {indice + 1}. {seccion.titulo}
                </h2>

                {(seccion.parrafos || []).map((parrafo) => (
                  <p
                    key={parrafo}
                    className={`text-sm leading-relaxed font-medium mb-2 ${
                      isSunlight ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    {parrafo}
                  </p>
                ))}

                {Array.isArray(seccion.items) && seccion.items.length > 0 && (
                  <ul className={`list-disc pl-5 space-y-1.5 text-sm leading-relaxed font-medium ${
                    isSunlight ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    {seccion.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className={`mt-12 rounded-2xl border p-4 text-xs leading-relaxed font-medium ${
            isSunlight
              ? 'bg-blue-50 border-blue-200 text-slate-700'
              : 'bg-blue-500/10 border-blue-500/25 text-slate-300'
          }`}>
            Contacto: <a href="mailto:contacto@motionlab.fit" className="font-black underline underline-offset-2">contacto@motionlab.fit</a>
            {' '}· WhatsApp: <a href="https://wa.me/5493624654911" target="_blank" rel="noopener noreferrer" className="font-black underline underline-offset-2">+54 9 362 465-4911</a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
