'use client';

/**
 * ========================================================================
 * COMPONENTE: Reloj y recuperación (components/training/WatchLinkCard.js)
 * ========================================================================
 * 1. Google Fit como puente universal para las apps que sincronizan ahí:
 *    Da Fit, Samsung Health, Mi Fitness, Huawei Health y otras. Lee pasos,
 *    pulso, sueño, peso y oxígeno de los últimos 7 días sin guardar nada en
 *    PostgreSQL.
 *
 * 2. Sincronización real de relojes en la nube mediante Junction (ex Vital):
 *    Garmin, Polar, Fitbit, Oura, Withings, etc. El alumno autoriza su cuenta
 *    con OAuth y Matías ve actividad, sueño y frecuencia cardíaca.
 *
 * 3. Importación manual del export.zip de Apple Salud para Apple Watch:
 *    el ZIP se procesa en el navegador y solo se guarda un resumen de 30 días.
 *
 * Limitaciones reales:
 * - Apple Watch (HealthKit) requiere una app móvil con su SDK; no se puede
 *   vincular automáticamente desde la web. La tarjeta permite importar
 *   manualmente el export.zip de la app Salud.
 * - Google Fit está deprecado y puede dejar de funcionar durante 2026.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Watch,
  HeartPulse,
  CheckCircle2,
  Link2Off,
  Loader2,
  AlertCircle,
  Info,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Footprints,
  Moon,
  Activity,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import GoogleFitTestCard from '@/components/bienestar/GoogleFitTestCard';
import AppleHealthImportCard from './AppleHealthImportCard';

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

function Dato({ icono: Icono, etiqueta, valor, detalle, isSunlight }) {
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

export default function WatchLinkCard({ googleFitTestActivo = false }) {
  const { isSunlight } = useTheme();

  // Importación manual del export.zip de Apple Salud. La tarjeta hija avisa
  // cuando hay datos guardados para reflejarlo en el estado general.
  const [appleHealthImportado, setAppleHealthImportado] = useState(false);

  // ---------------------------------------------------------------------
  // Sincronización en la nube (Junction)
  // ---------------------------------------------------------------------
  const [estadoNube, setEstadoNube] = useState(null);
  const [cargandoNube, setCargandoNube] = useState(true);
  const [vinculandoNube, setVinculandoNube] = useState(false);
  const [errorNube, setErrorNube] = useState('');
  const [esperandoVinculo, setEsperandoVinculo] = useState(false);
  const [linkPendiente, setLinkPendiente] = useState('');
  const [confirmandoDesvinculo, setConfirmandoDesvinculo] = useState(false);
  const [desvinculandoNube, setDesvinculandoNube] = useState(false);
  const [errorDesvinculo, setErrorDesvinculo] = useState('');
  const [mensajeDesvinculo, setMensajeDesvinculo] = useState('');

  // ---------------------------------------------------------------------
  // Google Fit (puente universal para Da Fit, Samsung Health y similares)
  // ---------------------------------------------------------------------
  const [estadoGoogleFit, setEstadoGoogleFit] = useState({
    disponible: false,
    conectado: false,
    cargando: true,
  });

  const cargarEstadoNube = useCallback(async ({ silencioso = false } = {}) => {
    if (!silencioso) setCargandoNube(true);

    try {
      const respuesta = await fetch('/api/reloj/estado', {
        cache: 'no-store',
      });
      const data = await respuesta.json();

      if (!respuesta.ok || !data?.success) {
        throw new Error(data?.error || 'No pudimos consultar el reloj.');
      }

      setEstadoNube(data);
      if (data.conectado) {
        setEsperandoVinculo(false);
        setLinkPendiente('');
      }
      setErrorNube('');
    } catch (err) {
      if (!silencioso) {
        setErrorNube(
          err?.message ||
            'No pudimos consultar el reloj. Probá de nuevo en unos segundos.'
        );
      }
    } finally {
      if (!silencioso) setCargandoNube(false);
    }
  }, []);

  useEffect(() => {
    cargarEstadoNube();
  }, [cargarEstadoNube]);

  useEffect(() => {
    const actualizarAlVolver = () => cargarEstadoNube({ silencioso: true });
    window.addEventListener('focus', actualizarAlVolver);
    return () => window.removeEventListener('focus', actualizarAlVolver);
  }, [cargarEstadoNube]);

  useEffect(() => {
    if (!esperandoVinculo) return undefined;

    const intervalo = setInterval(() => {
      cargarEstadoNube({ silencioso: true });
    }, 5000);

    const limite = setTimeout(() => {
      setEsperandoVinculo(false);
      setErrorNube(
        'No detectamos la vinculación todavía. Si ya terminaste, tocá "Actualizar".'
      );
    }, 180000);

    return () => {
      clearInterval(intervalo);
      clearTimeout(limite);
    };
  }, [esperandoVinculo, cargarEstadoNube]);

  const conectarNube = async () => {
    setVinculandoNube(true);
    setErrorNube('');
    setErrorDesvinculo('');
    setMensajeDesvinculo('');
    setConfirmandoDesvinculo(false);

    try {
      const respuesta = await fetch('/api/reloj/link-token', {
        method: 'POST',
      });
      const data = await respuesta.json();

      if (!respuesta.ok || !data?.success || !data?.linkWebUrl) {
        throw new Error(data?.error || 'No pudimos generar la vinculación.');
      }

      setLinkPendiente(data.linkWebUrl);
      setEsperandoVinculo(true);

      // `window.open` puede devolver null aunque la pestaña se haya abierto
      // (por ejemplo con noopener). No lo tratamos como error: el enlace
      // "Abrir vinculación" queda disponible por si el navegador lo bloqueó.
      window.open(data.linkWebUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setEsperandoVinculo(false);
      setErrorNube(
        err?.message ||
          'No pudimos abrir la vinculación. Probá de nuevo en unos segundos.'
      );
    } finally {
      setVinculandoNube(false);
    }
  };

  const desvincularNube = async () => {
    setDesvinculandoNube(true);
    setErrorDesvinculo('');
    setMensajeDesvinculo('');

    try {
      const respuesta = await fetch('/api/reloj/desvincular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await respuesta.json();

      if (!respuesta.ok || !data?.success) {
        throw new Error(data?.error || 'No pudimos desvincular el reloj.');
      }

      setConfirmandoDesvinculo(false);
      setEstadoNube((previo) => ({
        ...(previo || {}),
        conectado: false,
        proveedores: [],
        resumen: null,
        errorDatos: undefined,
      }));
      setEsperandoVinculo(false);
      setLinkPendiente('');

      const nombresDesvinculados = (data.desvinculados || [])
        .map((proveedor) => proveedor.nombre || proveedor.slug)
        .filter(Boolean);
      const nombresFallidos = (data.fallidos || [])
        .map((proveedor) => proveedor.nombre || proveedor.slug)
        .filter(Boolean);

      setMensajeDesvinculo(
        nombresDesvinculados.length > 0
          ? `Se desvinculó ${nombresDesvinculados.join(
              ' + '
            )}. Podés volver a conectarlo cuando quieras.`
          : 'No había un reloj vinculado.'
      );
      if (nombresFallidos.length > 0) {
        setErrorDesvinculo(
          `No pudimos desvincular ${nombresFallidos.join(
            ', '
          )}. Probá de nuevo en unos segundos.`
        );
      }

      await cargarEstadoNube({ silencioso: true });
    } catch (err) {
      setErrorDesvinculo(
        err?.message ||
          'No pudimos desvincular el reloj. Probá de nuevo en unos segundos.'
      );
    } finally {
      setDesvinculandoNube(false);
    }
  };

  const proveedoresConectados = (estadoNube?.proveedores || []).filter(
    (proveedor) => proveedor.estado === 'connected'
  );
  const nombresProveedores = proveedoresConectados
    .map((proveedor) => proveedor.nombre)
    .filter(Boolean)
    .join(' + ');
  const resumen = estadoNube?.resumen;
  const promedios = resumen?.promedios || {};
  const proveedoresConError = (estadoNube?.proveedores || []).filter(
    (proveedor) => proveedor.estado === 'error'
  );

  // Estado general de la tarjeta unificada. Google Fit, Junction y la
  // importación de Apple Health aportan historial.
  const fuentesConectadas = [
    estadoGoogleFit.conectado ? 'Google Fit' : null,
    estadoNube?.conectado ? 'Junction' : null,
    appleHealthImportado ? 'Apple Health' : null,
  ].filter(Boolean);
  const hayConexion = fuentesConectadas.length > 0;
  const etiquetaEstado =
    fuentesConectadas.length > 0
      ? estadoGoogleFit.conectado || estadoNube?.conectado
        ? 'Conectado'
        : 'Datos importados'
      : 'Sin conectar';

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 border-2 transition-all ${
        isSunlight
          ? 'bg-white border-slate-300 text-slate-900 shadow-md'
          : 'bg-gradient-to-br from-[#0c1424] via-[#0b1220] to-[#05070c] border-slate-800 text-white'
      }`}
    >
      {/* ENCABEZADO */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isSunlight
                ? 'bg-blue-100 text-blue-700'
                : 'bg-blue-500/10 text-sky-400'
            }`}
          >
            <Watch className="w-5 h-5" />
          </div>
          <div>
            <h3
              className={`font-black text-sm sm:text-base ${
                isSunlight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Conectar reloj
            </h3>
            <p
              className={`text-xs sm:text-sm font-medium mt-1 leading-relaxed ${
                isSunlight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              {estadoGoogleFit.disponible !== false
                ? 'Unificá tu reloj o app: Google Fit, Junction y Apple Watch (importación manual).'
                : 'Vinculá tu reloj o importá tu export de Apple Salud para que Matías vea actividad, sueño y pulso.'}
            </p>
            {fuentesConectadas.length > 0 && (
              <p
                className={`text-[10px] font-black mt-1.5 ${
                  isSunlight ? 'text-emerald-700' : 'text-emerald-300'
                }`}
              >
                Fuentes activas: {fuentesConectadas.join(' + ')}
              </p>
            )}
          </div>
        </div>

        <span
          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            hayConexion
              ? isSunlight
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : isSunlight
                ? 'bg-slate-100 text-slate-600 border-slate-300'
                : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          {etiquetaEstado}
        </span>
      </div>

      {/* GOOGLE FIT: PUENTE UNIVERSAL (solo con GOOGLE_FIT_TEST=1) */}
      {googleFitTestActivo && (
        <GoogleFitTestCard
          embedded
          returnPath="/entrenamiento"
          onEstadoChange={setEstadoGoogleFit}
        />
      )}

      {/* SINCRONIZACIÓN EN LA NUBE (JUNCTION) */}
      <div
        className={`mt-5 rounded-2xl border p-4 ${
          isSunlight
            ? 'bg-sky-50/60 border-sky-200'
            : 'bg-sky-950/20 border-sky-500/25'
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Smartphone
            className={`w-4 h-4 ${
              isSunlight ? 'text-blue-700' : 'text-sky-400'
            }`}
          />
          <h4
            className={`text-xs font-black uppercase tracking-wider ${
              isSunlight ? 'text-slate-800' : 'text-slate-200'
            }`}
          >
            Garmin, Polar, Fitbit, Oura y Withings
          </h4>
        </div>

        {cargandoNube ? (
          <div className="flex items-center gap-2 text-xs font-bold">
            <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
            <span className={isSunlight ? 'text-slate-700' : 'text-slate-300'}>
              Consultando el estado del reloj...
            </span>
          </div>
        ) : errorNube && !estadoNube ? (
          <div
            className={`flex items-start gap-2 text-[11px] font-medium ${
              isSunlight ? 'text-red-800' : 'text-red-200'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorNube}</span>
          </div>
        ) : estadoNube?.configurado === false ? (
          <div className="flex items-start gap-2">
            <Info
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                isSunlight ? 'text-sky-700' : 'text-sky-300'
              }`}
            />
            <p
              className={`text-[11px] font-medium leading-relaxed ${
                isSunlight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              La sincronización con relojes todavía no está configurada en este
              entorno. Si importaste Apple Health, el resumen aparece abajo.
            </p>
          </div>
        ) : estadoNube?.conectado ? (
          <>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-2">
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    isSunlight ? 'text-emerald-700' : 'text-emerald-400'
                  }`}
                />
                <div>
                  <p
                    className={`text-sm font-black ${
                      isSunlight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {nombresProveedores || 'Reloj conectado'}
                  </p>
                  <p
                    className={`text-[11px] font-medium mt-0.5 ${
                      isSunlight ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    Datos de los últimos 7 días disponibles para Matías.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => cargarEstadoNube()}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-black transition-colors ${
                  isSunlight
                    ? 'bg-white border-sky-300 text-sky-800 hover:bg-sky-50'
                    : 'bg-slate-900 border-sky-500/30 text-sky-300 hover:bg-sky-500/10'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Actualizar
              </button>
            </div>

            {resumen ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
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
                    etiqueta="FC reposo"
                    valor={
                      promedios.fcReposo !== null
                        ? `${promedios.fcReposo} bpm`
                        : '—'
                    }
                    isSunlight={isSunlight}
                  />
                  <Dato
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
                className={`text-[11px] font-medium mt-3 ${
                  isSunlight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                La cuenta está vinculada. Todavía no hay datos de actividad o
                sueño para estos días; puede tardar en sincronizar.
              </p>
            )}

            {estadoNube?.errorDatos && (
              <p
                className={`text-[10px] font-medium mt-2 ${
                  isSunlight ? 'text-amber-800' : 'text-amber-300'
                }`}
              >
                No pudimos leer los datos en este momento: {estadoNube.errorDatos}
              </p>
            )}

            {proveedoresConError.length > 0 && (
              <p
                className={`text-[10px] font-medium mt-2 ${
                  isSunlight ? 'text-red-700' : 'text-red-300'
                }`}
              >
                {proveedoresConError.map((p) => p.nombre).join(', ')} reportó un
                error de conexión. Podés volver a vincularlo.
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <button
                type="button"
                onClick={conectarNube}
                disabled={vinculandoNube || desvinculandoNube}
                className={`inline-flex items-center gap-1.5 text-[11px] font-black underline underline-offset-2 disabled:opacity-60 ${
                  isSunlight ? 'text-sky-800' : 'text-sky-300'
                }`}
              >
                {vinculandoNube ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Smartphone className="w-3.5 h-3.5" />
                )}
                Vincular otro dispositivo
              </button>

              {!confirmandoDesvinculo && (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmandoDesvinculo(true);
                    setErrorDesvinculo('');
                    setMensajeDesvinculo('');
                  }}
                  disabled={desvinculandoNube}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-black underline underline-offset-2 disabled:opacity-60 ${
                    isSunlight ? 'text-red-700' : 'text-red-300'
                  }`}
                >
                  <Link2Off className="w-3.5 h-3.5" />
                  Desvincular reloj
                </button>
              )}
            </div>

            {confirmandoDesvinculo && (
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
                  ¿Desvincular {nombresProveedores || 'el reloj'}? Se va a
                  revocar el acceso a los datos de esa cuenta. Podés volver a
                  conectarla cuando quieras.
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={desvincularNube}
                    disabled={desvinculandoNube}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-[11px] font-black transition-colors"
                  >
                    {desvinculandoNube ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Link2Off className="w-3.5 h-3.5" />
                    )}
                    {desvinculandoNube
                      ? 'Desvinculando...'
                      : 'Sí, desvincular'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmandoDesvinculo(false)}
                    disabled={desvinculandoNube}
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

            {errorDesvinculo && (
              <p
                className={`mt-2 flex items-start gap-1.5 text-[11px] font-medium ${
                  isSunlight ? 'text-red-800' : 'text-red-200'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorDesvinculo}</span>
              </p>
            )}

            {mensajeDesvinculo && (
              <p
                className={`mt-2 flex items-start gap-1.5 text-[11px] font-bold ${
                  isSunlight ? 'text-emerald-700' : 'text-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{mensajeDesvinculo}</span>
              </p>
            )}
          </>
        ) : (
          <>
            <p
              className={`text-[11px] font-medium leading-relaxed ${
                isSunlight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              Conectá tu cuenta de <strong>Garmin, Polar, Fitbit, Oura o
              Withings</strong> y autorizá el acceso. Matías verá actividad,
              sueño y pulso de la semana.
            </p>
            <p
              className={`text-[10px] font-medium leading-relaxed mt-1.5 ${
                isSunlight ? 'text-slate-500' : 'text-slate-500'
              }`}
            >
              Apple Watch (HealthKit) no se vincula automáticamente desde la
              web: importá tu export de Salud en la sección &quot;Apple Watch&quot;
              de abajo.
              {estadoGoogleFit.disponible
                ? ' Si usás Samsung Health, Da Fit, Mi Fitness o Huawei Health, conectá Google Fit arriba.'
                : ''}{' '}
              No mostramos una conexión falsa: si tu modelo no aparece, no está
              soportado por este flujo.
            </p>

            <button
              type="button"
              onClick={conectarNube}
              disabled={vinculandoNube}
              className="mt-3 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-black text-sm transition-all shadow-md active:scale-[0.98] touch-target"
            >
              {vinculandoNube ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Smartphone className="w-4 h-4" />
              )}
              <span>
                {vinculandoNube ? 'Generando enlace...' : 'Conectar reloj'}
              </span>
            </button>

            {mensajeDesvinculo && (
              <p
                className={`mt-3 flex items-start gap-1.5 text-[11px] font-bold ${
                  isSunlight ? 'text-emerald-700' : 'text-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{mensajeDesvinculo}</span>
              </p>
            )}

            {esperandoVinculo && (
              <div
                className={`mt-3 rounded-xl border p-3 text-[11px] font-medium ${
                  isSunlight
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-100'
                }`}
              >
                <p>
                  Terminá la vinculación en la pestaña nueva. Cuando vuelvas,
                  actualizamos el estado automáticamente.
                </p>
                {linkPendiente && (
                  <a
                    href={linkPendiente}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 font-black underline underline-offset-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir vinculación
                  </a>
                )}
              </div>
            )}

            {errorNube && (
              <div
                className={`mt-3 flex items-start gap-2 text-[11px] font-medium ${
                  isSunlight ? 'text-red-800' : 'text-red-200'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorNube}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* APPLE WATCH: IMPORTACIÓN MANUAL DEL EXPORT DE SALUD */}
      <AppleHealthImportCard onEstadoChange={setAppleHealthImportado} />
    </div>
  );
}
