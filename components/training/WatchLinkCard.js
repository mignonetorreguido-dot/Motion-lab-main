'use client';

/**
 * ========================================================================
 * COMPONENTE: Reloj, recuperación y pulso en vivo (components/training/WatchLinkCard.js)
 * ========================================================================
 * 1. Sincronización real de relojes en la nube mediante Junction (ex Vital):
 *    Garmin, Polar, Fitbit, Google Health/Pixel Watch, Oura, Withings, etc.
 *    El alumno autoriza su cuenta con OAuth y Matías ve actividad, sueño y
 *    frecuencia cardíaca de los últimos 7 días.
 *
 * 2. Pulso en vivo por Bluetooth Low Energy (BLE) para bandas y relojes que
 *    exponen el servicio estándar `heart_rate`. Es una lectura real, no
 *    simulada, y no promete historial.
 *
 * Limitaciones reales:
 * - Apple Watch (HealthKit) y Samsung Health requieren una app móvil con su
 *   SDK; no se pueden vincular desde la web. La tarjeta lo informa.
 * - Garmin/Samsung/Polar pueden transmitir pulso por BLE en algunos modelos,
 *   pero el historial completo se obtiene con su API o con Junction.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Watch,
  Bluetooth,
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

const CLAVE_ULTIMO_DISPOSITIVO = 'motion_lab_ble_hr_dispositivo';

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

export default function WatchLinkCard() {
  const { isSunlight } = useTheme();

  // ---------------------------------------------------------------------
  // Sincronización en la nube (Junction)
  // ---------------------------------------------------------------------
  const [estadoNube, setEstadoNube] = useState(null);
  const [cargandoNube, setCargandoNube] = useState(true);
  const [vinculandoNube, setVinculandoNube] = useState(false);
  const [errorNube, setErrorNube] = useState('');
  const [esperandoVinculo, setEsperandoVinculo] = useState(false);
  const [linkPendiente, setLinkPendiente] = useState('');

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

  // ---------------------------------------------------------------------
  // Pulso en vivo por BLE
  // ---------------------------------------------------------------------
  const [soportado, setSoportado] = useState(null);
  const [conectado, setConectado] = useState(false);
  const [conectando, setConectando] = useState(false);
  const [bpm, setBpm] = useState(null);
  const [dispositivo, setDispositivo] = useState(null);
  const [ultimoDispositivo, setUltimoDispositivo] = useState(null);
  const [error, setError] = useState('');

  const dispositivoRef = useRef(null);
  const caracteristicaRef = useRef(null);
  const listenerRef = useRef(null);

  // Detectamos compatibilidad BLE y recuperamos el nombre de la última banda.
  useEffect(() => {
    setSoportado(
      typeof navigator !== 'undefined' && Boolean(navigator.bluetooth)
    );

    try {
      const guardado = window.localStorage.getItem(CLAVE_ULTIMO_DISPOSITIVO);
      if (guardado) setUltimoDispositivo(JSON.parse(guardado));
    } catch {
      // Sin almacenamiento disponible: el componente sigue funcionando.
    }

    return () => {
      const caracteristica = caracteristicaRef.current;
      const listener = listenerRef.current;

      if (caracteristica && listener) {
        try {
          caracteristica.removeEventListener(
            'characteristicvaluechanged',
            listener
          );
          caracteristica.stopNotifications().catch(() => {});
        } catch {
          // La conexión ya puede estar cerrada.
        }
      }

      if (dispositivoRef.current?.gatt?.connected) {
        try {
          dispositivoRef.current.gatt.disconnect();
        } catch {
          // La conexión ya puede estar cerrada.
        }
      }
    };
  }, []);

  const leerMedicion = (event) => {
    const valor = event.target.value;
    if (!valor || valor.byteLength < 2) return;

    const flags = valor.getUint8(0);
    const usa16Bits = (flags & 0x01) === 0x01;
    const frecuencia = usa16Bits
      ? valor.getUint16(1, true)
      : valor.getUint8(1);

    if (frecuencia > 0) setBpm(frecuencia);
  };

  const guardarUltimoDispositivo = (info) => {
    setUltimoDispositivo(info);
    try {
      window.localStorage.setItem(
        CLAVE_ULTIMO_DISPOSITIVO,
        JSON.stringify(info)
      );
    } catch {
      // Sin persistencia: igual mostramos el dispositivo en esta sesión.
    }
  };

  const conectarDispositivo = async (device) => {
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService('heart_rate');
    const caracteristica = await service.getCharacteristic(
      'heart_rate_measurement'
    );

    const listener = (event) => leerMedicion(event);
    caracteristica.addEventListener('characteristicvaluechanged', listener);
    await caracteristica.startNotifications();

    dispositivoRef.current = device;
    caracteristicaRef.current = caracteristica;
    listenerRef.current = listener;

    const info = {
      id: device.id,
      nombre: device.name || 'Banda de pulso',
      vinculadoEn: new Date().toISOString(),
    };

    setDispositivo(info);
    guardarUltimoDispositivo(info);
    setConectado(true);
    setError('');

    device.addEventListener('gattserverdisconnected', () => {
      setConectado(false);
      setBpm(null);
      setError(
        'La banda se desconectó. Acercala y volvé a conectarla para seguir midiendo.'
      );
    });
  };

  const conectar = async () => {
    if (!soportado) {
      setError(
        'Este navegador no soporta Bluetooth web. Probá con Chrome o Edge en Android, Windows o macOS.'
      );
      return;
    }

    setConectando(true);
    setError('');

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
      });

      await conectarDispositivo(device);
    } catch (err) {
      if (err?.name === 'NotFoundError') {
        setError('No se seleccionó ninguna banda. Podés intentarlo de nuevo.');
      } else if (err?.name === 'NetworkError') {
        setError(
          'No se pudo conectar. Verificá que la banda esté encendida, cerca y en modo de medición.'
        );
      } else if (err?.name === 'SecurityError') {
        setError(
          'El navegador bloqueó el acceso a Bluetooth. Usá HTTPS y permití la conexión.'
        );
      } else {
        setError(
          'No pudimos conectar la banda. Verificá que sea compatible con el servicio estándar de pulso BLE.'
        );
      }
    } finally {
      setConectando(false);
    }
  };

  const desconectar = async () => {
    const caracteristica = caracteristicaRef.current;
    const listener = listenerRef.current;

    if (caracteristica && listener) {
      try {
        caracteristica.removeEventListener(
          'characteristicvaluechanged',
          listener
        );
        await caracteristica.stopNotifications();
      } catch {
        // La conexión ya puede estar cerrada.
      }
    }

    if (dispositivoRef.current?.gatt?.connected) {
      try {
        dispositivoRef.current.gatt.disconnect();
      } catch {
        // La conexión ya puede estar cerrada.
      }
    }

    dispositivoRef.current = null;
    caracteristicaRef.current = null;
    listenerRef.current = null;

    setConectado(false);
    setBpm(null);
    setDispositivo(null);
    setError('');
  };

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
              Reloj y recuperación
            </h3>
            <p
              className={`text-xs sm:text-sm font-medium mt-1 leading-relaxed ${
                isSunlight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              Vinculá tu reloj para que Matías vea tu actividad, sueño y pulso.
              También podés medir tu frecuencia cardíaca en vivo.
            </p>
          </div>
        </div>

        <span
          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            estadoNube?.conectado
              ? isSunlight
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : isSunlight
                ? 'bg-slate-100 text-slate-600 border-slate-300'
                : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          {estadoNube?.conectado ? 'Sincronizado' : 'Sin sincronizar'}
        </span>
      </div>

      {/* SINCRONIZACIÓN EN LA NUBE */}
      <div
        className={`mt-5 rounded-2xl border p-4 ${
          isSunlight
            ? 'bg-sky-50/60 border-sky-200'
            : 'bg-sky-950/20 border-sky-500/25'
        }`}
      >
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
              entorno. El pulso en vivo por BLE sigue disponible abajo.
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

            <button
              type="button"
              onClick={conectarNube}
              disabled={vinculandoNube}
              className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-black underline underline-offset-2 disabled:opacity-60 ${
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
          </>
        ) : (
          <>
            <p
              className={`text-[11px] font-medium leading-relaxed ${
                isSunlight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              Conectá tu cuenta de <strong>Garmin, Polar, Fitbit, Google
              Health/Pixel Watch, Oura o Withings</strong> y autorizá el acceso.
              Matías verá actividad, sueño y pulso de la semana.
            </p>
            <p
              className={`text-[10px] font-medium leading-relaxed mt-1.5 ${
                isSunlight ? 'text-slate-500' : 'text-slate-500'
              }`}
            >
              Apple Watch (HealthKit) y Samsung Health necesitan una app móvil;
              no se pueden vincular desde la web. No mostramos una conexión
              falsa: si tu modelo no aparece, no está soportado por este flujo.
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

      {/* PULSO EN VIVO POR BLE */}
      <div
        className={`mt-6 pt-5 border-t ${
          isSunlight ? 'border-slate-200' : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Bluetooth
              className={`w-4 h-4 ${
                isSunlight ? 'text-blue-700' : 'text-sky-400'
              }`}
            />
            <h4
              className={`text-xs font-black uppercase tracking-wider ${
                isSunlight ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              Pulso en vivo (BLE)
            </h4>
          </div>
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              conectado
                ? isSunlight
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : isSunlight
                  ? 'bg-slate-100 text-slate-600 border-slate-300'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {conectado ? 'En vivo' : 'Sin conectar'}
          </span>
        </div>

        {conectado ? (
          <div className="mt-4 space-y-3">
            <div
              className={`p-4 rounded-2xl border ${
                isSunlight
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : 'bg-emerald-950/20 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center gap-2.5 flex-wrap">
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 ${
                    isSunlight ? 'text-emerald-700' : 'text-emerald-400'
                  }`}
                />
                <span
                  className={`font-black text-sm ${
                    isSunlight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {dispositivo?.nombre || 'Banda de pulso'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isSunlight
                      ? 'bg-white text-slate-600 border-slate-300'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  BLE · Heart Rate
                </span>
              </div>

              <div className="mt-3 flex items-end gap-2">
                <HeartPulse
                  className={`w-6 h-6 mb-1 ${
                    isSunlight ? 'text-red-600' : 'text-red-400'
                  }`}
                />
                <span
                  className={`text-4xl font-black tabular-nums ${
                    isSunlight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {bpm ?? '—'}
                </span>
                <span
                  className={`text-xs font-bold mb-1 ${
                    isSunlight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  BPM en vivo
                </span>
              </div>

              <p
                className={`text-[11px] font-bold mt-2 ${
                  isSunlight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Lectura real en tiempo real. No se guarda como historial.
              </p>
            </div>

            <button
              type="button"
              onClick={desconectar}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border font-black text-xs transition-all ${
                isSunlight
                  ? 'bg-white hover:bg-red-50 text-red-700 border-red-300'
                  : 'bg-slate-900 hover:bg-red-950/40 text-red-400 border-red-500/30'
              }`}
            >
              <Link2Off className="w-4 h-4" />
              <span>Desconectar</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                onClick={conectar}
                disabled={conectando || soportado !== true}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-black text-sm transition-all shadow-md active:scale-[0.98] touch-target"
              >
                {conectando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bluetooth className="w-4 h-4" />
                )}
                <span>
                  {conectando
                    ? 'Buscando dispositivos...'
                    : 'Conectar banda o reloj'}
                </span>
              </button>

              {ultimoDispositivo?.nombre && (
                <span
                  className={`text-[11px] font-bold ${
                    isSunlight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Última banda: {ultimoDispositivo.nombre}
                </span>
              )}
            </div>

            {soportado === false && (
              <div
                className={`flex items-start gap-2 rounded-xl border p-3 text-[11px] font-medium ${
                  isSunlight
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Este navegador no soporta Bluetooth web. En iPhone, Apple Watch
                  requiere HealthKit o una app nativa; para Garmin/Samsung hace
                  falta su API oficial.
                </span>
              </div>
            )}

            {error && (
              <div
                className={`flex items-start gap-2 rounded-xl border p-3 text-[11px] font-medium ${
                  isSunlight
                    ? 'bg-red-50 border-red-300 text-red-800'
                    : 'bg-red-500/10 border-red-500/30 text-red-200'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div
              className={`flex items-start gap-2 rounded-xl border p-3 text-[11px] font-medium ${
                isSunlight
                  ? 'bg-sky-50 border-sky-200 text-sky-900'
                  : 'bg-sky-500/10 border-sky-500/20 text-sky-200'
              }`}
            >
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Compatible con bandas y dispositivos que exponen el servicio
                estándar BLE de frecuencia cardíaca. Si tu reloj no aparece,
                activá el modo de transmisión de pulso o usá la vinculación en
                la nube de arriba.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
