'use client';

/**
 * ========================================================================
 * COMPONENTE: Importación manual de Apple Health
 * (components/training/AppleHealthImportCard.js)
 * ========================================================================
 * Permite que un alumno con Apple Watch suba el `export.zip` de la app Salud.
 * El ZIP se procesa en el navegador y solo se envía un resumen de 30 días.
 *
 * No promete sincronización automática: deja claro que es una importación
 * manual y que puede repetirse cuando el alumno quiera actualizar los datos.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Watch,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Footprints,
  Moon,
  HeartPulse,
  Activity,
  ChevronDown,
  ShieldCheck,
  FileText,
  X,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const LIMITE_BYTES = 2000000000; // ~1,9 GB: entra en el INTEGER de PostgreSQL.

function formatearNumero(valor) {
  if (valor === null || valor === undefined || valor === '') return '—';
  return Number(valor).toLocaleString('es-AR');
}

function formatearBytes(bytes) {
  if (!Number.isFinite(Number(bytes)) || Number(bytes) <= 0) return '0 MB';
  const mb = Number(bytes) / (1024 * 1024);
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(mb >= 100 ? 0 : 1)} MB`;
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

function Dato({ icono: Icono, etiqueta, valor, detalle, isSunlight }) {
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

export default function AppleHealthImportCard({ onEstadoChange }) {
  const { isSunlight } = useTheme();

  const [importacion, setImportacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [parseando, setParseando] = useState(false);
  const [fase, setFase] = useState('');
  const [progreso, setProgreso] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const cargar = useCallback(
    async ({ silencioso = false } = {}) => {
      if (!silencioso) setCargando(true);

      try {
        const respuesta = await fetch('/api/reloj/apple-health', {
          cache: 'no-store',
        });
        const data = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok || !data?.success) {
          throw new Error(
            data?.error || 'No pudimos consultar la importación de Apple Salud.'
          );
        }

        setImportacion(data.importacion || null);
        setErrorCarga('');
        onEstadoChange?.(Boolean(data.importacion));
      } catch (err) {
        if (!silencioso) {
          setErrorCarga(
            err?.message ||
              'No pudimos consultar si ya tenías una importación de Apple Salud.'
          );
        }
      } finally {
        if (!silencioso) setCargando(false);
      }
    },
    [onEstadoChange]
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrirSelector = () => {
    if (parseando || eliminando) return;
    setError('');
    setMensaje('');
    inputRef.current?.click();
  };

  const cancelar = () => {
    abortRef.current?.abort();
  };

  const procesarArchivo = async (archivo) => {
    if (!archivo) return;

    setError('');
    setMensaje('');
    setProgreso(null);
    setConfirmandoEliminar(false);

    if (!/\.zip$/i.test(archivo.name || '')) {
      setError(
        'Seleccioná el archivo export.zip de Apple Salud. No lo descomprimas: subí el ZIP original.'
      );
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    if (!archivo.size) {
      setError('El archivo está vacío. Volvé a exportarlo desde la app Salud.');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    if (archivo.size > LIMITE_BYTES) {
      setError(
        `El archivo pesa ${formatearBytes(
          archivo.size
        )} y el límite es ${formatearBytes(
          LIMITE_BYTES
        )}. Exportá los datos desde un iPhone con menos historial o repetí la exportación.`
      );
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    const controlador = new AbortController();
    abortRef.current = controlador;
    setParseando(true);
    setFase('leyendo');

    try {
      const { parseAppleHealthZip } = await import('@/lib/appleHealthParser');
      const resumen = await parseAppleHealthZip(archivo, {
        signal: controlador.signal,
        onProgress: (avance) => setProgreso(avance),
      });

      if (controlador.signal.aborted) {
        const cancelado = new Error('Importación cancelada.');
        cancelado.name = 'AbortError';
        throw cancelado;
      }

      setFase('guardando');

      const respuesta = await fetch('/api/reloj/apple-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumen,
          archivoNombre: archivo.name,
          archivoBytes: archivo.size,
        }),
      });
      const data = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok || !data?.success) {
        throw new Error(
          data?.error || 'No pudimos guardar el resumen de Apple Salud.'
        );
      }

      setImportacion(data.importacion || null);
      onEstadoChange?.(true);
      setMensaje(
        '¡Datos de Apple Watch importados! Matías ya puede ver el resumen en tu panel.'
      );
    } catch (err) {
      if (err?.name === 'AbortError') {
        setMensaje('Importación cancelada. Podés volver a intentarlo cuando quieras.');
      } else {
        setError(
          err?.message ||
            'No pudimos procesar el archivo. Verificá que sea el export.zip de Apple Salud.'
        );
      }
    } finally {
      setParseando(false);
      setFase('');
      setProgreso(null);
      abortRef.current = null;
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const alSeleccionar = (evento) => {
    const archivo = evento.target.files?.[0];
    procesarArchivo(archivo);
  };

  const eliminar = async () => {
    setEliminando(true);
    setError('');
    setMensaje('');

    try {
      const respuesta = await fetch('/api/reloj/apple-health', {
        method: 'DELETE',
      });
      const data = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok || !data?.success) {
        throw new Error(
          data?.error || 'No pudimos eliminar la importación de Apple Salud.'
        );
      }

      setImportacion(null);
      setConfirmandoEliminar(false);
      onEstadoChange?.(false);
      setMensaje('Importación eliminada. Podés volver a importar cuando quieras.');
    } catch (err) {
      setError(
        err?.message ||
          'No pudimos eliminar la importación. Probá de nuevo en unos segundos.'
      );
    } finally {
      setEliminando(false);
    }
  };

  const resumen = importacion?.resumen || {};
  const promedios = resumen.promedios || {};
  const workouts = Array.isArray(resumen.workouts) ? resumen.workouts : [];
  const advertencias = Array.isArray(resumen.advertencias)
    ? resumen.advertencias
    : [];
  const porcentaje = Math.max(0, Math.min(100, progreso?.porcentaje ?? 0));

  return (
    <div
      className={`mt-5 rounded-2xl border p-4 transition-colors ${
        isSunlight
          ? 'bg-emerald-50/60 border-emerald-200'
          : 'bg-emerald-950/15 border-emerald-500/25'
      }`}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isSunlight
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-emerald-500/10 text-emerald-400'
            }`}
          >
            <Watch className="w-5 h-5" />
          </div>
          <div>
            <h4
              className={`text-xs font-black uppercase tracking-wider ${
                isSunlight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Apple Watch · Importación manual
            </h4>
            <p
              className={`text-[11px] font-medium mt-1 leading-relaxed ${
                isSunlight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              El navegador lee el <strong>export.zip</strong> de la app Salud y
              solo envía un resumen. El archivo completo no se sube a MOTION LAB.
            </p>
          </div>
        </div>

        <span
          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            importacion
              ? isSunlight
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : isSunlight
                ? 'bg-white text-slate-600 border-slate-300'
                : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          {importacion ? 'Datos importados' : 'Opcional'}
        </span>
      </div>

      {cargando ? (
        <div className="flex items-center gap-2 mt-4 text-[11px] font-bold">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          <span className={isSunlight ? 'text-slate-700' : 'text-slate-300'}>
            Consultando tus datos importados...
          </span>
        </div>
      ) : (
        <>
          {errorCarga && (
            <div
              className={`mt-3 flex items-start gap-2 rounded-xl border p-2.5 text-[11px] font-medium ${
                isSunlight
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{errorCarga}</p>
                <button
                  type="button"
                  onClick={() => cargar()}
                  className="mt-1 font-black underline underline-offset-2"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {importacion ? (
            <div className="mt-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Dato
                  icono={Footprints}
                  etiqueta="Pasos / día"
                  valor={formatearNumero(promedios.pasos)}
                  isSunlight={isSunlight}
                />
                <Dato
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
                <Dato
                  icono={HeartPulse}
                  etiqueta="FC promedio"
                  valor={
                    promedios.fcPromedio !== null &&
                    promedios.fcPromedio !== undefined
                      ? `${promedios.fcPromedio} bpm`
                      : '—'
                  }
                  detalle={
                    promedios.fcReposo
                      ? `Reposo ${promedios.fcReposo} bpm`
                      : null
                  }
                  isSunlight={isSunlight}
                />
                <Dato
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
                Datos del {formatearDia(resumen.desde)} al{' '}
                {formatearDia(resumen.hasta)} · Importado el{' '}
                {formatearFechaHora(importacion.importadoEn)}
                {importacion.archivoNombre
                  ? ` · ${importacion.archivoNombre}`
                  : ''}
              </p>

              {workouts.length > 0 && (
                <div
                  className={`mt-2 rounded-xl border p-2.5 ${
                    isSunlight
                      ? 'bg-white border-emerald-200'
                      : 'bg-slate-900/60 border-emerald-500/20'
                  }`}
                >
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

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <button
                  type="button"
                  onClick={abrirSelector}
                  disabled={parseando || eliminando}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-[11px] font-black transition-all active:scale-[0.98] touch-target"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Actualizar export
                </button>

                {!confirmandoEliminar && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmandoEliminar(true);
                      setError('');
                      setMensaje('');
                    }}
                    disabled={parseando || eliminando}
                    className={`inline-flex items-center gap-1.5 text-[11px] font-black underline underline-offset-2 disabled:opacity-60 ${
                      isSunlight ? 'text-red-700' : 'text-red-300'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar importación
                  </button>
                )}
              </div>

              {confirmandoEliminar && (
                <div
                  className={`mt-3 rounded-xl border p-3 ${
                    isSunlight
                      ? 'bg-red-50 border-red-200'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <p
                    className={`text-[11px] font-bold leading-relaxed ${
                      isSunlight ? 'text-red-900' : 'text-red-100'
                    }`}
                  >
                    ¿Eliminar el resumen de Apple Salud? Matías dejará de ver
                    estos datos. Podés volver a importarlos cuando quieras.
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={eliminar}
                      disabled={eliminando}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-[11px] font-black transition-colors"
                    >
                      {eliminando ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmandoEliminar(false)}
                      disabled={eliminando}
                      className={`px-3 py-2 rounded-xl border text-[11px] font-black transition-colors ${
                        isSunlight
                          ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3">
              <p
                className={`text-[11px] font-medium leading-relaxed ${
                  isSunlight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                Si tenés <strong>Apple Watch</strong>, exportá tus datos desde la
                app <strong>Salud</strong> y subí el ZIP acá. No hace falta
                conectar nada desde la web: es una importación manual y la podés
                repetir cuando quieras actualizar.
              </p>

              <details className="mt-2.5 group">
                <summary
                  className={`inline-flex items-center gap-1.5 cursor-pointer list-none text-[11px] font-black underline underline-offset-2 ${
                    isSunlight ? 'text-emerald-800' : 'text-emerald-300'
                  }`}
                >
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                  Cómo exportar desde tu iPhone
                </summary>
                <ol
                  className={`mt-2 space-y-1.5 text-[11px] font-medium leading-relaxed list-decimal list-inside ${
                    isSunlight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  <li>
                    Abrí la app <strong>Salud</strong> en tu iPhone.
                  </li>
                  <li>
                    Tocá tu <strong>foto de perfil</strong> arriba a la derecha.
                  </li>
                  <li>
                    Tocá <strong>Exportar todos los datos de salud</strong> y
                    confirmá.
                  </li>
                  <li>
                    Guardá el archivo <strong>export.zip</strong> en Archivos o
                    iCloud Drive.
                  </li>
                  <li>
                    Volvé a esta página y seleccioná el ZIP con el botón de
                    abajo.
                  </li>
                </ol>
              </details>

              <button
                type="button"
                onClick={abrirSelector}
                disabled={parseando || eliminando}
                className="mt-3 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-black text-sm transition-all shadow-md active:scale-[0.98] touch-target"
              >
                <Upload className="w-4 h-4" />
                <span>Importar export.zip</span>
              </button>

              <p
                className={`text-[10px] font-medium leading-relaxed mt-2 ${
                  isSunlight ? 'text-slate-500' : 'text-slate-500'
                }`}
              >
                También podés importar si usás la app Salud en el iPhone. El
                archivo puede tardar varios minutos si tiene muchos años de
                historial.
              </p>
            </div>
          )}
        </>
      )}

      {parseando && (
        <div
          className={`mt-3 rounded-xl border p-3 ${
            isSunlight
              ? 'bg-white border-emerald-200'
              : 'bg-slate-900/70 border-emerald-500/20'
          }`}
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
              {fase === 'guardando'
                ? 'Guardando el resumen...'
                : 'Procesando en tu dispositivo...'}
            </span>
            <span>{porcentaje}%</span>
          </div>

          <div
            className={`mt-2 h-2 rounded-full overflow-hidden ${
              isSunlight ? 'bg-emerald-100' : 'bg-slate-800'
            }`}
          >
            <div
              className="h-full bg-emerald-500 transition-all duration-200"
              style={{ width: `${fase === 'guardando' ? 100 : porcentaje}%` }}
            />
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] font-medium">
            <span className={isSunlight ? 'text-slate-500' : 'text-slate-400'}>
              {progreso
                ? `${formatearBytes(progreso.leidos)} de ${formatearBytes(
                    progreso.total
                  )}`
                : 'Leyendo archivo...'}
            </span>
            {fase !== 'guardando' && (
              <button
                type="button"
                onClick={cancelar}
                className={`inline-flex items-center gap-1 font-black underline underline-offset-2 ${
                  isSunlight ? 'text-red-700' : 'text-red-300'
                }`}
              >
                <X className="w-3 h-3" />
                Cancelar
              </button>
            )}
          </div>

          <p
            className={`text-[10px] font-medium mt-1.5 ${
              isSunlight ? 'text-slate-500' : 'text-slate-500'
            }`}
          >
            No cierres esta pestaña. El ZIP se lee localmente; si es grande,
            puede tardar varios minutos.
          </p>
        </div>
      )}

      {error && (
        <div
          className={`mt-3 flex items-start gap-2 rounded-xl border p-2.5 text-[11px] font-medium ${
            isSunlight
              ? 'bg-red-50 border-red-300 text-red-800'
              : 'bg-red-500/10 border-red-500/30 text-red-200'
          }`}
          aria-live="polite"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {mensaje && !parseando && (
        <p
          className={`mt-3 flex items-start gap-1.5 text-[11px] font-bold ${
            isSunlight ? 'text-emerald-700' : 'text-emerald-300'
          }`}
          aria-live="polite"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{mensaje}</span>
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".zip,application/zip,application/x-zip-compressed"
        className="hidden"
        onChange={alSeleccionar}
        aria-label="Seleccionar el archivo export.zip de Apple Salud"
      />

      <p
        className={`mt-3 flex items-start gap-1.5 text-[10px] font-medium leading-relaxed ${
          isSunlight ? 'text-slate-500' : 'text-slate-500'
        }`}
      >
        <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          El ZIP se procesa en tu navegador y no se guarda en el servidor. Solo
          almacenamos un resumen de 30 días (pasos, sueño, pulso y
          entrenamientos). Podés eliminarlo cuando quieras.
        </span>
      </p>

      <p
        className={`mt-1.5 flex items-start gap-1.5 text-[10px] font-medium leading-relaxed ${
          isSunlight ? 'text-slate-500' : 'text-slate-500'
        }`}
      >
        <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Apple Watch no se sincroniza automáticamente desde la web. Esta
          importación es la alternativa manual, sin app iOS.
        </span>
      </p>
    </div>
  );
}
