'use client';

/**
 * ========================================================================
 * COMPONENTE: Hub / Panel Principal de Entrenamiento del Alumno (components/training/StudentHub.js)
 * ========================================================================
 * - Muestra de forma dinámica el "Entrenamiento de Hoy" sugerido por Matías.
 * - Los días completados quedan marcados con tilde verde y botón de "✏️ Editar Día X".
 * - Vinculación real de relojes en la nube (Junction) y pulso en vivo por BLE.
 * - Soporte de Modo Soleado de Alto Contraste para entrenar al aire libre bajo el sol.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, Clock, ArrowRight, CheckCircle2, 
  RotateCcw, Sparkles, Flame, PlayCircle, Edit3, Trophy, ChevronRight,
  HeartPulse
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { esChequeoDeEstaSemana } from '@/lib/bienestar';
import WatchLinkCard from './WatchLinkCard';

export default function StudentHub({ 
  planSemanal = [], 
  diaHoyId = 'dia-1', 
  onSeleccionarDia,
  onReiniciarProgreso = null
}) {
  const { isSunlight } = useTheme();
  const [chequeoSemana, setChequeoSemana] = useState(null);

  // Recordatorio semanal: consultamos si el alumno ya completó el chequeo
  // de bienestar de la semana en curso.
  useEffect(() => {
    let activo = true;

    fetch('/api/bienestar')
      .then((res) => res.json())
      .then((data) => {
        if (!activo || !data?.success) return;
        const encontrado =
          data.chequeoEstaSemana ||
          (data.chequeos || []).find((item) => esChequeoDeEstaSemana(item.fecha)) ||
          null;
        setChequeoSemana(encontrado);
      })
      .catch(() => {
        // El recordatorio es complementario: si falla, el hub sigue funcionando.
      });

    return () => {
      activo = false;
    };
  }, []);

  const fechaChequeoSemana = chequeoSemana?.fecha
    ? new Date(chequeoSemana.fecha).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
      })
    : null;

  // Encontrar el día sugerido para hoy
  const primerNoCompletado = planSemanal.find((d) => d.estado !== 'COMPLETADO');
  
  const diaHoy = (planSemanal.find((d) => d.id === diaHoyId && d.estado !== 'COMPLETADO')) 
                 || primerNoCompletado 
                 || planSemanal[0];

  const todosCompletados = planSemanal.length > 0 && planSemanal.every((d) => d.estado === 'COMPLETADO');
  const diasCompletadosCount = planSemanal.filter((d) => d.estado === 'COMPLETADO').length;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn font-sans">
      
      {/* SALUDO Y RESUMEN GENERAL */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border transition-all ${
        isSunlight
          ? 'bg-white border-2 border-slate-300 shadow-md text-slate-900'
          : 'bg-gradient-to-r from-[#0b1220] via-slate-900 to-[#070b14] border-slate-800 shadow-xl text-white'
      }`}>
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 border ${
            isSunlight ? 'bg-blue-100 text-blue-900 border-blue-300' : 'bg-blue-500/10 text-sky-400 border-blue-500/20'
          }`}>
            <Sparkles className={`w-3.5 h-3.5 ${isSunlight ? 'text-blue-700' : 'text-cyan-400'}`} />
            <span>Motion Lab • Coach Matías</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isSunlight ? 'text-[#020617]' : 'text-white'}`}>
            Panel de Entrenamiento
          </h1>
          <p className={`text-xs sm:text-sm font-medium mt-1 ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
            Gestiona tu semana, realiza la sesión sugerida o edita días finalizados.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className={`px-4 py-2.5 rounded-2xl text-center border ${
            isSunlight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <span className={`text-[10px] uppercase font-bold block ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Progreso Semanal</span>
            <span className={`text-xs font-black ${isSunlight ? 'text-blue-700' : 'text-blue-400'}`}>
              {diasCompletadosCount} de {planSemanal.length} Días
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================
          CHEQUEO DE BIENESTAR: DESCANSO, ESTRÉS, ÁNIMO, ENERGÍA Y MOTIVACIÓN
         ================================================================ */}
      <Link
        href="/bienestar"
        className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border transition-all hover:-translate-y-0.5 ${
          isSunlight
            ? 'bg-sky-50 border-sky-300 shadow-sm hover:shadow-md'
            : 'bg-gradient-to-r from-sky-950/40 via-[#0c1424] to-[#05070c] border-sky-500/30 shadow-lg hover:shadow-sky-500/10'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <span className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isSunlight ? 'bg-sky-100 text-sky-700' : 'bg-sky-500/15 text-sky-300'
          }`}>
            <HeartPulse className="w-6 h-6" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={`text-base sm:text-lg font-black ${isSunlight ? 'text-slate-950' : 'text-white'}`}>
                Chequeo de Bienestar
              </h2>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                chequeoSemana
                  ? isSunlight
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : isSunlight
                    ? 'bg-white text-sky-700 border-sky-300'
                    : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
              }`}>
                {chequeoSemana ? 'Semana completada' : 'Chequeo semanal'}
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
              {chequeoSemana
                ? `Ya registraste cómo venís esta semana${fechaChequeoSemana ? ` (${fechaChequeoSemana})` : ''}. Matías puede verlo en tu ficha.`
                : 'Una vez por semana: descanso, estrés, ánimo, energía y motivación. Son 2 minutos y Matías lo usa para ajustar tu plan.'}
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 text-xs font-black shrink-0 self-end sm:self-center ${
          isSunlight ? 'text-sky-700' : 'text-sky-300'
        }`}>
          {chequeoSemana ? 'Ver mi chequeo' : 'Hacer el chequeo'}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>

      {/* ================================================================
          TARJETA HERO: SUGERIDO PARA HOY (O SEMANA CUMPLIDA)
         ================================================================ */}
      {planSemanal.length === 0 ? (
        <div className={`rounded-3xl p-6 sm:p-7 border ${
          isSunlight ? 'bg-white border-2 border-slate-300 text-slate-900 shadow-md' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            No tienes rutinas activas
          </h2>
          <p className="text-xs sm:text-sm font-medium leading-relaxed">
            Actualmente no tienes un plan de entrenamiento asignado. Por favor, contacta con tu entrenador Matías para que te asigne tus próximos días.
          </p>
        </div>
      ) : todosCompletados ? (
        <div className={`rounded-3xl p-6 sm:p-7 border-2 transition-all ${
          isSunlight
            ? 'bg-emerald-50 border-emerald-400 text-slate-950 shadow-md'
            : 'bg-gradient-to-br from-emerald-950/40 via-[#0a1818] to-[#05070c] border-emerald-500/40 text-white shadow-2xl'
        }`}>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider w-max mb-4">
            <Trophy className="w-4 h-4 fill-current" />
            <span>¡Objetivo Semanal Cumplido!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            ¡Felicitaciones! Completaste todos los entrenamientos
          </h2>
          <p className="text-xs sm:text-sm font-medium leading-relaxed mb-6">
            Has finalizado las {planSemanal.length} sesiones planificadas por Matías para esta semana. Puedes editar o revisar cualquiera de ellas abajo.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => onSeleccionarDia(planSemanal[0]?.id)}
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 touch-target"
            >
              <Edit3 className="w-4 h-4" />
              <span>Revisar Día 1</span>
            </button>
            {onReiniciarProgreso && (
              <button
                type="button"
                onClick={onReiniciarProgreso}
                className={`w-full sm:w-auto py-3.5 px-4 rounded-2xl text-xs font-bold border transition-all touch-target ${
                  isSunlight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                Reiniciar semana de prueba
              </button>
            )}
          </div>
        </div>
      ) : diaHoy && (
        <div className={`rounded-3xl p-6 sm:p-7 border-2 relative overflow-hidden transition-all ${
          isSunlight
            ? 'bg-blue-50/80 border-blue-400 text-slate-950 shadow-lg'
            : 'bg-gradient-to-br from-blue-950/40 via-[#0c1424] to-[#05070c] border-blue-500/40 text-white shadow-2xl card-glow'
        }`}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-md">
              <Flame className="w-3.5 h-3.5 fill-current" />
              Sugerido para Hoy
            </span>

            <span className={`text-xs font-bold flex items-center gap-1.5 ${isSunlight ? 'text-slate-800' : 'text-slate-300'}`}>
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              {diaHoy.duracionMin || 60} min aprox.
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            {diaHoy.nombre}
          </h2>
          
          <p className={`text-xs sm:text-sm font-semibold leading-relaxed mb-6 ${isSunlight ? 'text-slate-800' : 'text-slate-200'}`}>
            🎯 {diaHoy.enfoque}
          </p>

          <div className={`grid grid-cols-3 gap-3 mb-6 pt-4 border-t text-center ${
            isSunlight ? 'border-blue-200' : 'border-slate-800/80'
          }`}>
            <div className={`p-2.5 rounded-xl border ${
              isSunlight ? 'bg-white border-blue-200' : 'bg-slate-900/60 border-slate-800/80'
            }`}>
              <span className={`text-[10px] uppercase font-bold block ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Bloques</span>
              <span className={`text-xs font-black ${isSunlight ? 'text-slate-900' : 'text-white'}`}>3 (M • A • D)</span>
            </div>
            <div className={`p-2.5 rounded-xl border ${
              isSunlight ? 'bg-white border-blue-200' : 'bg-slate-900/60 border-slate-800/80'
            }`}>
              <span className={`text-[10px] uppercase font-bold block ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Ejercicios</span>
              <span className={`text-xs font-black ${isSunlight ? 'text-blue-700' : 'text-sky-400'}`}>{diaHoy.ejerciciosCount || 8} Clave</span>
            </div>
            <div className={`p-2.5 rounded-xl border ${
              isSunlight ? 'bg-white border-blue-200' : 'bg-slate-900/60 border-slate-800/80'
            }`}>
              <span className={`text-[10px] uppercase font-bold block ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Intensidad</span>
              <span className={`text-xs font-black ${isSunlight ? 'text-blue-800' : 'text-cyan-300'}`}>RIR 1 - 2</span>
            </div>
          </div>

          {/* Botón Principal para entrar al entrenamiento sugerido de hoy */}
          <button
            type="button"
            onClick={() => onSeleccionarDia(diaHoy.id)}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 hover:from-blue-600 hover:to-sky-400 text-white font-black text-base shadow-xl shadow-blue-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 touch-target"
          >
            <PlayCircle className="w-5 h-5" />
            <span>Comenzar Entrenamiento de Hoy</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ================================================================
          CRONOGRAMA SEMANAL (LISTA COMPLETA DE DÍAS)
         ================================================================ */}
      {planSemanal.length > 0 && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className={`text-lg font-black flex items-center gap-2 ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                <Calendar className={`w-5 h-5 ${isSunlight ? 'text-blue-700' : 'text-sky-400'}`} />
                <span>Cronograma Semanal de Entrenamientos</span>
              </h3>
              <p className={`text-xs font-medium mt-0.5 ${isSunlight ? 'text-slate-700' : 'text-slate-400'}`}>
                Puedes saltar al día que quieras, editar los días completados o recuperar los pendientes:
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {planSemanal.map((dia) => {
              const isCompletado = dia.estado === 'COMPLETADO';
              const isSugeridoHoy = !todosCompletados && dia.id === diaHoy?.id;

              return (
                <div
                  key={dia.id}
                  className={`rounded-2xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
                    isSunlight
                      ? isSugeridoHoy
                        ? 'bg-blue-50/70 border-2 border-blue-400 shadow-md'
                        : isCompletado
                          ? 'bg-emerald-50/60 border-2 border-emerald-400'
                          : 'bg-white border-2 border-slate-300 shadow-sm'
                      : isSugeridoHoy 
                        ? 'border-blue-500/50 bg-blue-950/10' 
                        : isCompletado
                          ? 'border-emerald-500/30 bg-emerald-950/5'
                          : 'border-slate-800 hover:border-slate-700 bg-[#0c1322]'
                  }`}
                >
                  
                  {/* Información del Día */}
                  <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-black text-xs border ${
                      isCompletado 
                        ? 'bg-emerald-500 text-slate-950 border-emerald-600'
                        : isSugeridoHoy 
                          ? 'bg-blue-600 text-white border-blue-700' 
                          : isSunlight
                            ? 'bg-slate-200 text-slate-800 border-slate-300'
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}>
                      {isCompletado ? (
                        <CheckCircle2 className="w-5 h-5 text-slate-950 stroke-[3]" />
                      ) : (
                        <span>D{dia.numeroDia}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-base font-black ${isSunlight ? 'text-slate-950' : 'text-white'}`}>
                          {dia.nombre}
                        </h4>
                        
                        {isCompletado && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-slate-950 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 stroke-[3]" /> Finalizado
                          </span>
                        )}

                        {isCompletado && dia.esfuerzoFinal && (
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                            isSunlight 
                              ? 'bg-blue-100 text-blue-900 border-blue-300' 
                              : 'bg-blue-500/20 text-sky-400 border-blue-500/30'
                          }`}>
                            RPE {dia.esfuerzoFinal}/10
                          </span>
                        )}

                        {isCompletado && dia.energiaInicial && (
                          <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${
                            isSunlight 
                              ? 'bg-sky-100 text-sky-900 border-sky-300' 
                              : 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                          }`}>
                            🔋 {dia.energiaInicial}/5
                          </span>
                        )}

                        {isCompletado && dia.animoFinal && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            isSunlight 
                              ? 'bg-slate-200 text-slate-800 border-slate-300' 
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}>
                            {dia.animoFinal === 1 ? '📉 Peor' : dia.animoFinal === 2 ? '➖ Igual' : '📈 Renovado'}
                          </span>
                        )}

                        {isSugeridoHoy && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-600 text-white">
                            Sugerido Hoy
                          </span>
                        )}
                      </div>

                      <p className={`text-xs font-semibold mt-1 line-clamp-1 ${isSunlight ? 'text-slate-800' : 'text-slate-300'}`}>
                        {dia.enfoque}
                      </p>

                      <div className={`flex items-center gap-3 mt-2 text-[11px] font-bold ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {dia.duracionMin} min
                        </span>
                        <span>•</span>
                        <span>{dia.ejerciciosCount} ejercicios</span>
                        <span>•</span>
                        <span className={isSunlight ? 'text-blue-700' : 'text-sky-400'}>3 Bloques</span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de Acción según el estado */}
                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    {isCompletado ? (
                      <button
                        type="button"
                        onClick={() => onSeleccionarDia(dia.id)}
                        className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm touch-target ${
                          isSunlight
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-slate-900 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>✏️ Editar Día {dia.numeroDia}</span>
                      </button>
                    ) : isSugeridoHoy ? (
                      <button
                        type="button"
                        onClick={() => onSeleccionarDia(dia.id)}
                        className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 touch-target"
                      >
                        <span>Entrenar Hoy</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : dia.numeroDia < (diaHoy?.numeroDia || 99) ? (
                      <button
                        type="button"
                        onClick={() => onSeleccionarDia(dia.id)}
                        className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 touch-target ${
                          isSunlight
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        <span>Recuperar día que faltó</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSeleccionarDia(dia.id)}
                        className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 touch-target ${
                          isSunlight
                            ? 'bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200'
                            : 'bg-slate-900 text-slate-200 border border-slate-800'
                        }`}
                      >
                        <span>Saltar a este día</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================
          VINCULACIÓN DE RELOJ DEPORTIVO PARA MEDICIONES
         ================================================================ */}
      <WatchLinkCard />

    </div>
  );
}
