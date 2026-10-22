'use client';

/**
 * ========================================================================
 * COMPONENTE: Resumen de reloj para el entrenador (components/admin/WatchSummary.js)
 * ========================================================================
 * Lee el estado real de Junction para un alumno y muestra actividad, sueño
 * y frecuencia cardíaca de los últimos 7 días. No inventa datos: si el
 * alumno no vinculó un reloj, lo informa.
 */

import { useEffect, useState } from 'react';
import {
  Watch,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  HeartPulse,
  Footprints,
  Moon,
  Activity,
  Flame,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

function formatearNumero(valor) {
  if (valor === null || valor === undefined || valor === '') return '—';
  return Number(valor).toLocaleString('es-AR');
}

function formatearFecha(fecha) {
  if (!fecha) return '—';
  try {
    return new Date(`${String(fecha).slice(0, 10)}T12:00:00`).toLocaleDateString(
      'es-AR',
      { day: '2-digit', month: 'short' }
    );
  } catch {
    return fecha;
  }
}

function Metrica({ icono: Icono, etiqueta, valor, detalle, isSunlight }) {
  return (
    <div
      className={`rounded-xl border p-2.5 ${
        isSunlight
          ? 'bg-white border-slate-200'
          : 'bg-slate-900/70 border-slate-800'
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icono
          className={`w-3.5 h-3.5 ${
            isSunlight ? 'text-blue-700' : 'text-sky-400'
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

export default function WatchSummary({ alumnoId }) {
  const { isSunlight } = useTheme();
  const [estado, setEstado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = async ({ silencioso = false } = {}) => {
    if (!alumnoId) return;
    if (!silencioso) setCargando(true);
    setError('');

    try {
      const respuesta = await fetch(
        `/api/reloj/estado?alumnoId=${encodeURIComponent(alumnoId)}`,
        { cache: 'no-store' }
      );
      const data = await respuesta.json();

      if (!respuesta.ok || !data?.success) {
        throw new Error(data?.error || 'No pudimos consultar el reloj.');
      }

      setEstado(data);
    } catch (err) {
      if (!silencioso) {
        setError(
          err?.message ||
            'No pudimos consultar el reloj de este alumno en este momento.'
        );
      }
    } finally {
      if (!silencioso) setCargando(false);
    }
  };

  useEffect(() => {
    let activo = true;
    if (!alumnoId) {
      setCargando(false);
      return undefined;
    }

    setCargando(true);
    setError('');

    fetch(`/api/reloj/estado?alumnoId=${encodeURIComponent(alumnoId)}`, {
      cache: 'no-store',
    })
      .then((respuesta) => respuesta.json().then((data) => ({ respuesta, data })))
      .then(({ respuesta, data }) => {
        if (!activo) return;
        if (!respuesta.ok || !data?.success) {
          throw new Error(data?.error || 'No pudimos consultar el reloj.');
        }
        setEstado(data);
      })
      .catch((err) => {
        if (!activo) return;
        setError(
          err?.message ||
            'No pudimos consultar el reloj de este alumno en este momento.'
        );
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [alumnoId]);

  if (!alumnoId) return null;

  const proveedoresConectados = (estado?.proveedores || []).filter(
    (proveedor) => proveedor.estado === 'connected'
  );
  const nombres = proveedoresConectados
    .map((proveedor) => proveedor.nombre)
    .filter(Boolean)
    .join(' + ');
  const resumen = estado?.resumen;
  const promedios = resumen?.promedios || {};
  const proveedoresConError = (estado?.proveedores || []).filter(
    (proveedor) => proveedor.estado === 'error'
  );

  return (
    <div
      className={`mb-6 p-5 rounded-2xl border shadow-lg transition-colors ${
        isSunlight ? 'bg-blue-50/60 border-blue-300' : 'bg-[#070d19] border-blue-500/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap pb-3 border-b border-slate-300/40">
        <div className="flex items-start gap-2">
          <Watch
            className={`w-5 h-5 mt-0.5 shrink-0 ${
              isSunlight ? 'text-blue-700' : 'text-sky-300'
            }`}
          />
          <div>
            <h3
              className={`text-sm font-black uppercase tracking-wider leading-snug ${
                isSunlight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Reloj y recuperación
            </h3>
            <p
              className={`text-[11px] mt-1 ${
                isSunlight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Actividad, sueño y pulso de los últimos 7 días.
            </p>
          </div>
        </div>

        {estado?.conectado && (
          <button
            type="button"
            onClick={() => cargar({ silencioso: false })}
            disabled={cargando}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black transition-colors disabled:opacity-60 ${
              isSunlight
                ? 'bg-white border-blue-300 text-blue-800 hover:bg-blue-50'
                : 'bg-slate-900 border-blue-500/30 text-sky-300 hover:bg-blue-500/10'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        )}
      </div>

      {cargando ? (
        <div className="flex items-center gap-2 py-4 text-xs font-bold">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span className={isSunlight ? 'text-slate-600' : 'text-slate-400'}>
            Consultando el reloj del alumno...
          </span>
        </div>
      ) : error ? (
        <div
          className={`flex items-start gap-2 mt-3 text-[11px] font-medium ${
            isSunlight ? 'text-red-800' : 'text-red-200'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : estado?.configurado === false ? (
        <p
          className={`text-xs mt-3 p-3 rounded-xl border ${
            isSunlight
              ? 'text-slate-600 bg-white border-slate-200'
              : 'text-slate-400 bg-slate-900/40 border-slate-800'
          }`}
        >
          La integración con relojes no está configurada en este entorno.
        </p>
      ) : estado?.conectado ? (
        <>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <CheckCircle2
              className={`w-4 h-4 ${
                isSunlight ? 'text-emerald-700' : 'text-emerald-400'
              }`}
            />
            <span
              className={`text-xs font-black ${
                isSunlight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {nombres || 'Reloj conectado'}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isSunlight
                  ? 'bg-white text-slate-600 border-slate-300'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Lectura real
            </span>
          </div>

          {resumen ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                <Metrica
                  icono={Footprints}
                  etiqueta="Pasos / día"
                  valor={formatearNumero(promedios.pasos)}
                  isSunlight={isSunlight}
                />
                <Metrica
                  icono={Flame}
                  etiqueta="Calorías"
                  valor={formatearNumero(promedios.caloriasActivas)}
                  detalle="activas / día"
                  isSunlight={isSunlight}
                />
                <Metrica
                  icono={Moon}
                  etiqueta="Sueño"
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
                  etiqueta="FC reposo"
                  valor={
                    promedios.fcReposo !== null
                      ? `${promedios.fcReposo} bpm`
                      : '—'
                  }
                  isSunlight={isSunlight}
                />
                <Metrica
                  icono={Activity}
                  etiqueta="FC promedio"
                  valor={
                    promedios.fcPromedio !== null
                      ? `${promedios.fcPromedio} bpm`
                      : '—'
                  }
                  isSunlight={isSunlight}
                />
              </div>

              <p
                className={`text-[10px] font-medium mt-2 ${
                  isSunlight ? 'text-slate-500' : 'text-slate-500'
                }`}
              >
                {resumen.dias?.length || 0} días con datos ·{' '}
                {formatearFecha(resumen.desde)} a {formatearFecha(resumen.hasta)}
                {resumen.fuentes?.length
                  ? ` · ${resumen.fuentes.join(', ')}`
                  : ''}
              </p>
            </>
          ) : (
            <p
              className={`text-xs mt-3 p-3 rounded-xl border ${
                isSunlight
                  ? 'text-slate-600 bg-white border-slate-200'
                  : 'text-slate-400 bg-slate-900/40 border-slate-800'
              }`}
            >
              El reloj está vinculado, pero todavía no hay datos de actividad o
              sueño para estos días. Puede tardar en sincronizar.
            </p>
          )}

          {estado?.errorDatos && (
            <p
              className={`text-[10px] font-medium mt-2 ${
                isSunlight ? 'text-amber-800' : 'text-amber-300'
              }`}
            >
              No pudimos leer los datos en este momento: {estado.errorDatos}
            </p>
          )}

          {proveedoresConError.length > 0 && (
            <p
              className={`text-[10px] font-medium mt-2 ${
                isSunlight ? 'text-red-700' : 'text-red-300'
              }`}
            >
              {proveedoresConError.map((p) => p.nombre).join(', ')} reportó un
              error de conexión.
            </p>
          )}
        </>
      ) : (
        <p
          className={`text-xs mt-3 p-3 rounded-xl border ${
            isSunlight
              ? 'text-slate-600 bg-white border-slate-200'
              : 'text-slate-400 bg-slate-900/40 border-slate-800'
          }`}
        >
          Este alumno todavía no vinculó un reloj. Puede hacerlo desde su panel
          de entrenamiento con Garmin, Polar, Fitbit, Google Health/Pixel,
          Oura o Withings.
        </p>
      )}
    </div>
  );
}
