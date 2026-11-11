'use client';

/**
 * ========================================================================
 * COMPONENTE: Resumen de Apple Health para el entrenador
 * (components/admin/AppleHealthSummary.js)
 * ========================================================================
 * Lee el resumen que el alumno importó manualmente desde la app Salud.
 * Es independiente de Junction: se muestra aunque la integración en la nube
 * no esté configurada o el alumno no tenga un reloj vinculado.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Watch,
  CheckCircle2,
  Loader2,
  RefreshCw,
  HeartPulse,
  Footprints,
  Moon,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

function formatearNumero(valor) {
  if (valor === null || valor === undefined || valor === '') return '—';
  return Number(valor).toLocaleString('es-AR');
}

function formatearDia(dia) {
  if (!dia) return '—';
  try {
    return new Date(`${String(dia).slice(0, 10)}T12:00:00`).toLocaleDateString(
      'es-AR',
      { day: '2-digit', month: 'short' }
    );
  } catch {
    return dia;
  }
}

function formatearFechaHora(fecha) {
  if (!fecha) return '—';
  try {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function Metrica({ icono: Icono, etiqueta, valor, detalle, isSunlight }) {
  return (
    <div
      className={`rounded-xl border p-2.5 ${
        isSunlight
          ? 'bg-white border-emerald-200'
          : 'bg-slate-900/70 border-emerald-500/20'
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icono
          className={`w-3.5 h-3.5 ${
            isSunlight ? 'text-emerald-700' : 'text-emerald-400'
          }`}
        />
        <span
          className={`text-[10px] font-bold uppercase tracking-wide ${
            isSunlight ? 'text-slate-600' : 'text-slate-400'
          }`}
        >
          {etiqueta}
        </span>
      </div>
      <div
        className={`text-sm font-black tabular-nums ${
          isSunlight ? 'text-slate-900' : 'text-white'
        }`}
      >
        {valor}
      </div>
      {detalle && (
        <div
          className={`text-[10px] font-medium mt-0.5 ${
            isSunlight ? 'text-slate-500' : 'text-slate-500'
          }`}
        >
          {detalle}
        </div>
      )}
    </div>
  );
}

export default function AppleHealthSummary({ alumnoId }) {
  const { isSunlight } = useTheme();
  const [importacion, setImportacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(
    async ({ silencioso = false } = {}) => {
      if (!alumnoId) return;
      if (!silencioso) setCargando(true);
      setError('');

      try {
        const respuesta = await fetch(
          `/api/reloj/apple-health?alumnoId=${encodeURIComponent(alumnoId)}`,
          { cache: 'no-store' }
        );
        const data = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok || !data?.success) {
          throw new Error(
            data?.error || 'No pudimos consultar Apple Health.'
          );
        }

        setImportacion(data.importacion || null);
      } catch (err) {
        if (!silencioso) {
          setError(
            err?.message || 'No pudimos consultar la importación de Apple Salud.'
          );
        }
      } finally {
        if (!silencioso) setCargando(false);
      }
    },
    [alumnoId]
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (!alumnoId) return null;

  if (cargando) {
    return (
      <div
        className={`mt-3 flex items-center gap-2 rounded-xl border p-3 text-[11px] font-bold ${
          isSunlight
            ? 'bg-white border-emerald-200 text-slate-600'
            : 'bg-slate-900/40 border-emerald-500/20 text-slate-400'
        }`}
      >
        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
        Consultando Apple Health...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`mt-3 flex items-start gap-2 rounded-xl border p-2.5 text-[10px] font-medium ${
          isSunlight
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
        }`}
      >
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Apple Health: {error}</span>
      </div>
    );
  }

  if (!importacion) return null;

  const resumen = importacion.resumen || {};
  const promedios = resumen.promedios || {};
  const workouts = Array.isArray(resumen.workouts) ? resumen.workouts : [];
  const advertencias = Array.isArray(resumen.advertencias)
    ? resumen.advertencias
    : [];

  return (
    <div
      className={`mt-3 rounded-xl border p-3 ${
        isSunlight
          ? 'bg-white/80 border-emerald-200'
          : 'bg-slate-900/50 border-emerald-500/20'
      }`}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Watch
            className={`w-4 h-4 ${
              isSunlight ? 'text-emerald-700' : 'text-emerald-400'
            }`}
          />
          <span
            className={`text-xs font-black ${
              isSunlight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Apple Health
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isSunlight
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            }`}
          >
            Importado por el alumno
          </span>
        </div>

        <button
          type="button"
          onClick={() => cargar({ silencioso: false })}
          disabled={cargando}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-black transition-colors disabled:opacity-60 ${
            isSunlight
              ? 'bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50'
              : 'bg-slate-900 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10'
          }`}
        >
          <RefreshCw className={`w-3 h-3 ${cargando ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
        <Metrica
          icono={Footprints}
          etiqueta="Pasos / día"
          valor={formatearNumero(promedios.pasos)}
          isSunlight={isSunlight}
        />
        <Metrica
          icono={Moon}
          etiqueta="Sueño / noche"
          valor={
            promedios.suenoHoras !== null &&
            promedios.suenoHoras !== undefined
              ? `${promedios.suenoHoras} h`
              : '—'
          }
          detalle={
            promedios.suenoEficiencia
              ? `${promedios.suenoEficiencia}% eficiencia`
              : null
          }
          isSunlight={isSunlight}
        />
        <Metrica
          icono={HeartPulse}
          etiqueta="FC promedio"
          valor={
            promedios.fcPromedio !== null &&
            promedios.fcPromedio !== undefined
              ? `${promedios.fcPromedio} bpm`
              : '—'
          }
          detalle={
            promedios.fcReposo ? `Reposo ${promedios.fcReposo} bpm` : null
          }
          isSunlight={isSunlight}
        />
        <Metrica
          icono={Activity}
          etiqueta="Entrenamientos"
          valor={formatearNumero(workouts.length)}
          detalle="últimos 30 días"
          isSunlight={isSunlight}
        />
      </div>

      <p
        className={`text-[10px] font-medium mt-2 ${
          isSunlight ? 'text-slate-500' : 'text-slate-500'
        }`}
      >
        Datos del {formatearDia(resumen.desde)} al {formatearDia(resumen.hasta)}{' '}
        · Importado el {formatearFechaHora(importacion.importadoEn)}
        {importacion.archivoNombre ? ` · ${importacion.archivoNombre}` : ''}
      </p>

      {workouts.length > 0 && (
        <div className="mt-2">
          <p
            className={`text-[10px] font-black uppercase tracking-wide ${
              isSunlight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Últimos entrenamientos
          </p>
          <div className="mt-1 space-y-1">
            {workouts.slice(0, 3).map((workout, indice) => (
              <div
                key={`${workout.inicio}-${workout.tipo}-${indice}`}
                className="flex items-center justify-between gap-2 text-[10px]"
              >
                <span
                  className={`font-bold truncate ${
                    isSunlight ? 'text-slate-800' : 'text-slate-200'
                  }`}
                >
                  {workout.tipoEtiqueta || workout.tipo}
                </span>
                <span
                  className={`shrink-0 ${
                    isSunlight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {formatearDia(workout.dia)}
                  {workout.duracionMin
                    ? ` · ${workout.duracionMin} min`
                    : ''}
                  {workout.calorias ? ` · ${workout.calorias} kcal` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {advertencias.length > 0 && (
        <p
          className={`text-[10px] font-medium mt-2 ${
            isSunlight ? 'text-slate-500' : 'text-slate-500'
          }`}
        >
          {advertencias.slice(0, 2).join(' ')}
        </p>
      )}

      <p
        className={`flex items-center gap-1.5 text-[10px] font-medium mt-2 ${
          isSunlight ? 'text-slate-500' : 'text-slate-500'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
        Importación manual: no se actualiza sola. El alumno puede repetirla
        desde su panel.
      </p>
    </div>
  );
}
