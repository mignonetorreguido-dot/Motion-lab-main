'use client';

/**
 * ========================================================================
 * COMPONENTE: Prueba local de Google Fit (components/bienestar/GoogleFitTestCard.js)
 * ========================================================================
 * Tarjeta visible solo cuando GOOGLE_FIT_TEST=1. Sirve para comprobar qué
 * datos reales de Da Fit llegan a Google Fit: pasos, pulso, sueño, peso y
 * oxígeno en sangre.
 *
 * - No inventa datos: si Google Fit no devuelve una métrica, muestra "—".
 * - No guarda nada en PostgreSQL.
 * - La vinculación no cambia la sesión de MOTION LAB: el callback de
 *   NextAuth corta el flujo y guarda el token en una cookie HttpOnly.
 */

import { useCallback, useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FlaskConical,
  Footprints,
  HeartPulse,
  Info,
  Loader2,
  Moon,
  RefreshCw,
  Scale,
  ShieldCheck,
  Unplug,
  Wind,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import {
  GOOGLE_FIT_INTENT_COOKIE,
  GOOGLE_FIT_INTENT_MAX_AGE,
  GOOGLE_FIT_SCOPE_STRING,
} from '@/lib/googleFitScopes';

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
            isSunlight ? 'text-sky-700' : 'text-sky-400'
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

function Banner({ tipo = 'info', children, isSunlight }) {
  const estilos = {
    info: isSunlight
      ? 'bg-sky-50 border-sky-200 text-sky-900'
      : 'bg-sky-500/10 border-sky-500/30 text-sky-100',
    success: isSunlight
      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
    warning: isSunlight
      ? 'bg-amber-50 border-amber-300 text-amber-900'
      : 'bg-amber-500/10 border-amber-500/30 text-amber-200',
    error: isSunlight
      ? 'bg-red-50 border-red-300 text-red-800'
      : 'bg-red-500/10 border-red-500/30 text-red-200',
  };

  const Icono =
    tipo === 'error' || tipo === 'warning'
      ? AlertCircle
      : tipo === 'success'
        ? CheckCircle2
        : Info;

  return (
    <div
      className={`mt-3 flex items-start gap-2 rounded-xl border p-3 text-[11px] font-medium leading-relaxed ${estilos[tipo]}`}
    >
      <Icono className="w-4 h-4 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

export default function GoogleFitTestCard({
  embedded = false,
  returnPath = '/entrenamiento',
  onEstadoChange = null,
}) {
  const { isSunlight } = useTheme();

  const [estado, setEstado] = useState(null);
  const [disponible, setDisponible] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensajeConexion, setMensajeConexion] = useState(null);
  const [conectando, setConectando] = useState(false);
  const [desconectando, setDesconectando] = useState(false);
  const [mostrarFuentes, setMostrarFuentes] = useState(false);

  const cargarEstado = useCallback(async ({ silencioso = false } = {}) => {
    if (!silencioso) setCargando(true);

    try {
      const respuesta = await fetch('/api/google-fit/estado', {
        cache: 'no-store',
      });

      // Si la prueba no está habilitada en este entorno, la sección no se
      // muestra. En producción (sin GOOGLE_FIT_TEST=1) la API responde 404.
      if (respuesta.status === 404) {
        setDisponible(false);
        setEstado(null);
        setError('');
        return;
      }

      const data = await respuesta.json();

      if (!respuesta.ok || !data?.success) {
        throw new Error(
          data?.error || 'No pudimos consultar Google Fit en este momento.'
        );
      }

      setDisponible(true);
      setEstado(data);
      setError('');
    } catch (err) {
      setDisponible((actual) => (actual === null ? true : actual));

      if (!silencioso) {
        setError(
          err?.message ||
            'No pudimos consultar Google Fit. Probá de nuevo en unos segundos.'
        );
      }
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resultado = params.get('googlefit');

    if (resultado === 'conectado') {
      setMensajeConexion({
        tipo: 'success',
        texto:
          'Google Fit conectado. Buscando los datos reales de los últimos 7 días...',
      });
    } else if (resultado === 'sinpermiso') {
      setMensajeConexion({
        tipo: 'warning',
        texto:
          'No se otorgaron los permisos de actividad, pulso y sueño. Volvé a conectar y aceptá todos los permisos para poder leer los datos.',
      });
    } else if (resultado === 'error') {
      setMensajeConexion({
        tipo: 'error',
        texto:
          'No pudimos guardar el permiso de Google Fit. Probá de nuevo desde el botón.',
      });
    }

    if (resultado) {
      params.delete('googlefit');
      const query = params.toString();
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}${query ? `?${query}` : ''}`
      );
    }

    cargarEstado();
  }, [cargarEstado]);

  // Informa al contenedor si Google Fit está disponible y conectado para
  // que la tarjeta unificada pueda mostrar un estado general correcto.
  useEffect(() => {
    if (typeof onEstadoChange !== 'function') return;

    onEstadoChange({
      disponible: disponible === true,
      conectado: Boolean(estado?.conectado),
      cargando,
    });
  }, [disponible, estado?.conectado, cargando, onEstadoChange]);

  const conectar = async () => {
    setConectando(true);
    setError('');
    setMensajeConexion(null);

    try {
      // Marca breve para que el callback de NextAuth sepa que este login
      // es solo para vincular Google Fit y no para crear una sesión nueva.
      const secure = window.location.protocol === 'https:' ? '; secure' : '';
      document.cookie = `${GOOGLE_FIT_INTENT_COOKIE}=1; path=/; max-age=${GOOGLE_FIT_INTENT_MAX_AGE}; samesite=lax${secure}`;

      const destino =
        typeof returnPath === 'string' && returnPath.startsWith('/')
          ? returnPath
          : '/entrenamiento';

      await signIn('google', undefined, {
        scope: GOOGLE_FIT_SCOPE_STRING,
        access_type: 'offline',
        prompt: 'consent select_account',
        include_granted_scopes: 'true',
        callbackUrl: `${destino}?googlefit=conectado`,
      });
    } catch {
      setError(
        'No pudimos abrir la autorización de Google. Revisá la configuración de Google OAuth.'
      );
      setConectando(false);
    }
  };

  const desconectar = async () => {
    setDesconectando(true);
    setError('');
    setMensajeConexion(null);

    try {
      const respuesta = await fetch('/api/google-fit/desconectar', {
        method: 'POST',
      });
      const data = await respuesta.json();

      if (!respuesta.ok || !data?.success) {
        throw new Error(data?.error || 'No pudimos desconectar Google Fit.');
      }

      setEstado({
        success: true,
        configurado: true,
        conectado: false,
        motivo: 'sin_conectar',
      });
      setMensajeConexion({
        tipo: 'info',
        texto:
          'Google Fit se desconectó de este navegador. No se modificó tu sesión de MOTION LAB.',
      });
    } catch (err) {
      setError(
        err?.message ||
          'No pudimos desconectar Google Fit. Probá de nuevo en unos segundos.'
      );
    } finally {
      setDesconectando(false);
    }
  };

  // Sin GOOGLE_FIT_TEST=1 la sección no se renderiza dentro de la tarjeta
  // unificada. Tampoco mostramos nada mientras se consulta la API.
  if (disponible !== true) {
    return null;
  }

  const metricas = estado?.metricas || {};
  const dias = Array.isArray(estado?.dias) ? estado.dias : [];
  const fuentes = Array.isArray(estado?.fuentes) ? estado.fuentes : [];
  const errores = Array.isArray(estado?.errores) ? estado.errores : [];

  const hayDatos = dias.some((dia) =>
    [dia.pasos, dia.fcPromedio, dia.suenoHoras, dia.peso, dia.spo2].some(
      (valor) => valor !== null && valor !== undefined
    )
  );

  const errorApiNoHabilitada = errores.find(
    (item) => item.codigo === 'accessNotConfigured'
  );
  const errorPermisos = errores.find(
    (item) => item.codigo === 'insufficientPermissions'
  );
  const errorToken =
    estado?.motivo === 'refresh_fallido' ||
    estado?.motivo === 'token_rechazado' ||
    estado?.motivo === 'cookie_invalida';

  const tarjeta = isSunlight
    ? 'bg-white border-slate-300 text-slate-900 shadow-md'
    : 'bg-gradient-to-br from-[#0c1424] via-[#0b1220] to-[#05070c] border-slate-800 text-white';
  const fondoSuave = isSunlight
    ? 'bg-sky-50/70 border-sky-200'
    : 'bg-sky-950/20 border-sky-500/25';
  const textoPrincipal = isSunlight ? 'text-slate-900' : 'text-white';
  const textoSuave = isSunlight ? 'text-slate-600' : 'text-slate-300';
  const textoMuted = isSunlight ? 'text-slate-500' : 'text-slate-400';

  const Wrapper = embedded ? 'div' : 'section';
  const wrapperClass = embedded
    ? `mt-5 rounded-2xl border p-4 ${fondoSuave}`
    : `rounded-3xl border-2 p-5 sm:p-6 ${tarjeta}`;

  return (
    <Wrapper className={wrapperClass}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3.5">
          <div
            className={`${
              embedded ? 'w-8 h-8 rounded-xl' : 'w-10 h-10 rounded-2xl'
            } flex items-center justify-center shrink-0 ${
              isSunlight
                ? 'bg-sky-100 text-sky-700'
                : 'bg-sky-500/10 text-sky-400'
            }`}
          >
            <Activity className={embedded ? 'w-4 h-4' : 'w-5 h-5'} />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={`font-black ${embedded ? 'text-sm' : 'text-sm sm:text-base'} ${textoPrincipal}`}>
                Google Fit
              </h2>
              <span
                className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isSunlight
                    ? 'bg-sky-100 text-sky-800 border-sky-300'
                    : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                }`}
              >
                <FlaskConical className="w-3 h-3" />
                Universal
              </span>
            </div>

            <p
              className={`text-xs sm:text-sm font-medium mt-1 leading-relaxed ${textoSuave}`}
            >
              Lee los datos que tu reloj o app sincroniza con Google Fit:{' '}
              <strong>Da Fit, Samsung Health, Mi Fitness, Huawei Health</strong>{' '}
              y más. Pasos, pulso, sueño, peso y oxígeno. Solo lectura.
            </p>
          </div>
        </div>

        <span
          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            estado?.conectado
              ? isSunlight
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : isSunlight
                ? 'bg-slate-100 text-slate-600 border-slate-300'
                : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          {estado?.conectado ? 'Conectado' : 'Sin conectar'}
        </span>
      </div>

      {cargando ? (
        <div className="mt-5 flex items-center gap-2 text-xs font-bold">
          <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
          <span className={textoSuave}>Consultando Google Fit...</span>
        </div>
      ) : (
        <>
          {mensajeConexion && (
            <Banner tipo={mensajeConexion.tipo} isSunlight={isSunlight}>
              {mensajeConexion.texto}
            </Banner>
          )}

          {error && (
            <Banner tipo="error" isSunlight={isSunlight}>
              {error}
            </Banner>
          )}

          {!estado?.conectado ? (
            <div className={`mt-5 rounded-2xl border p-4 ${fondoSuave}`}>
              <div className="flex items-start gap-2.5">
                <ShieldCheck
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    isSunlight ? 'text-sky-700' : 'text-sky-400'
                  }`}
                />
                <div>
                  <p className={`text-sm font-black ${textoPrincipal}`}>
                    Conectá tu cuenta de Google
                  </p>
                  <p
                    className={`text-[11px] sm:text-xs font-medium mt-1 leading-relaxed ${textoSuave}`}
                  >
                    Autorizá la lectura de Google Fit. No cambia tu sesión de
                    MOTION LAB ni crea un usuario nuevo: el permiso queda en una
                    cookie segura de este navegador.
                  </p>
                  <p className={`text-[10px] font-medium mt-1.5 ${textoMuted}`}>
                    Google Fit está en retiro durante 2026. Esto es solo una
                    prueba para ver qué datos entrega tu reloj o app.
                  </p>

                  {errorToken && (
                    <p
                      className={`text-[11px] font-bold mt-2 ${
                        isSunlight ? 'text-amber-800' : 'text-amber-300'
                      }`}
                    >
                      El permiso anterior venció o fue revocado. Volvé a
                      conectar para renovarlo.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={conectar}
                    disabled={conectando}
                    className="mt-3 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-black text-sm transition-all shadow-md active:scale-[0.98] touch-target"
                  >
                    {conectando ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Activity className="w-4 h-4" />
                    )}
                    {conectando
                      ? 'Abriendo Google...'
                      : 'Conectar Google Fit'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
                <p className={`text-[11px] font-bold ${textoSuave}`}>
                  {estado.cuenta
                    ? `Cuenta: ${estado.cuenta}`
                    : 'Cuenta de Google conectada'}
                  {estado.desde && estado.hasta
                    ? ` · ${formatearFecha(estado.desde)} a ${formatearFecha(
                        estado.hasta
                      )}`
                    : ''}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cargarEstado()}
                    disabled={cargando}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-black transition-colors disabled:opacity-60 ${
                      isSunlight
                        ? 'bg-white border-sky-300 text-sky-800 hover:bg-sky-50'
                        : 'bg-slate-900 border-sky-500/30 text-sky-300 hover:bg-sky-500/10'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Actualizar
                  </button>

                  <button
                    type="button"
                    onClick={desconectar}
                    disabled={desconectando}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-black transition-colors disabled:opacity-60 ${
                      isSunlight
                        ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {desconectando ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Unplug className="w-3.5 h-3.5" />
                    )}
                    Desconectar
                  </button>
                </div>
              </div>

              {estado.sinRefreshToken && (
                <Banner tipo="warning" isSunlight={isSunlight}>
                  Google no entregó un refresh token. El permiso puede vencer en
                  una hora; si pasa, volvé a conectar.
                </Banner>
              )}

              {estado.error && (
                <Banner tipo="error" isSunlight={isSunlight}>
                  {estado.error}
                </Banner>
              )}

              {errorApiNoHabilitada && (
                <Banner tipo="warning" isSunlight={isSunlight}>
                  La API de Google Fit no está habilitada en el proyecto de
                  Google Cloud. Habilitala en{' '}
                  <a
                    href="https://console.cloud.google.com/apis/library/fitness.googleapis.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-black underline underline-offset-2"
                  >
                    Fitness API
                    <ExternalLink className="w-3 h-3 inline-block ml-0.5" />
                  </a>{' '}
                  y volvé a intentar.
                </Banner>
              )}

              {errorPermisos && (
                <Banner tipo="warning" isSunlight={isSunlight}>
                  Faltan permisos de lectura. Desconectá y volvé a conectar
                  Google Fit aceptando todos los permisos.
                </Banner>
              )}

              {errores.length > 0 &&
                !errorApiNoHabilitada &&
                !errorPermisos && (
                  <Banner tipo="warning" isSunlight={isSunlight}>
                    Algunas métricas no se pudieron leer:{' '}
                    {errores.map((item) => item.metrica).join(', ')}. El resto
                    se muestra igual.
                  </Banner>
                )}

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
                <Dato
                  icono={Footprints}
                  etiqueta="Pasos / día"
                  valor={formatearNumero(metricas.pasos?.promedio)}
                  detalle={
                    metricas.pasos?.total
                      ? `${formatearNumero(metricas.pasos.total)} en 7 días`
                      : null
                  }
                  isSunlight={isSunlight}
                />
                <Dato
                  icono={HeartPulse}
                  etiqueta="FC promedio"
                  valor={
                    metricas.fc?.promedio !== null &&
                    metricas.fc?.promedio !== undefined
                      ? `${metricas.fc.promedio} bpm`
                      : '—'
                  }
                  detalle={
                    metricas.fc?.dias
                      ? `${metricas.fc.dias} días con datos`
                      : null
                  }
                  isSunlight={isSunlight}
                />
                <Dato
                  icono={Moon}
                  etiqueta="Sueño / noche"
                  valor={
                    metricas.sueno?.promedioHoras !== null &&
                    metricas.sueno?.promedioHoras !== undefined
                      ? `${metricas.sueno.promedioHoras} h`
                      : '—'
                  }
                  detalle={
                    metricas.sueno?.noches
                      ? `${metricas.sueno.noches} noches`
                      : null
                  }
                  isSunlight={isSunlight}
                />
                <Dato
                  icono={Scale}
                  etiqueta="Peso"
                  valor={
                    metricas.peso?.ultimo !== null &&
                    metricas.peso?.ultimo !== undefined
                      ? `${metricas.peso.ultimo} kg`
                      : '—'
                  }
                  detalle={
                    metricas.peso?.fecha
                      ? formatearFecha(metricas.peso.fecha)
                      : null
                  }
                  isSunlight={isSunlight}
                />
                <Dato
                  icono={Wind}
                  etiqueta="Oxígeno"
                  valor={
                    metricas.spo2?.promedio !== null &&
                    metricas.spo2?.promedio !== undefined
                      ? `${metricas.spo2.promedio}%`
                      : '—'
                  }
                  detalle={
                    metricas.spo2?.dias
                      ? `${metricas.spo2.dias} días con datos`
                      : null
                  }
                  isSunlight={isSunlight}
                />
              </div>

              {hayDatos ? (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays
                      className={`w-4 h-4 ${
                        isSunlight ? 'text-sky-700' : 'text-sky-400'
                      }`}
                    />
                    <h3
                      className={`text-xs font-black uppercase tracking-wider ${textoPrincipal}`}
                    >
                      Últimos 7 días
                    </h3>
                  </div>

                  <div
                    className={`rounded-2xl border overflow-hidden ${
                      isSunlight ? 'border-slate-200' : 'border-slate-800'
                    }`}
                  >
                    <div
                      className={`grid grid-cols-[1.1fr_repeat(3,minmax(0,1fr))] gap-1 px-3 py-2 text-[9px] font-black uppercase tracking-wide ${
                        isSunlight
                          ? 'bg-slate-50 text-slate-500'
                          : 'bg-slate-900/70 text-slate-400'
                      }`}
                    >
                      <span>Día</span>
                      <span className="text-right">Pasos</span>
                      <span className="text-right">FC</span>
                      <span className="text-right">Sueño</span>
                    </div>

                    {dias.map((dia) => (
                      <div
                        key={dia.fecha}
                        className={`grid grid-cols-[1.1fr_repeat(3,minmax(0,1fr))] gap-1 px-3 py-2 text-[11px] font-bold border-t ${
                          isSunlight
                            ? 'border-slate-100 text-slate-700'
                            : 'border-slate-800/70 text-slate-300'
                        }`}
                      >
                        <span>{formatearFecha(dia.fecha)}</span>
                        <span className="text-right tabular-nums">
                          {formatearNumero(dia.pasos)}
                        </span>
                        <span className="text-right tabular-nums">
                          {dia.fcPromedio !== null &&
                          dia.fcPromedio !== undefined
                            ? dia.fcPromedio
                            : '—'}
                        </span>
                        <span className="text-right tabular-nums">
                          {dia.suenoHoras !== null &&
                          dia.suenoHoras !== undefined
                            ? `${dia.suenoHoras} h`
                            : '—'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className={`text-[10px] font-medium mt-1.5 ${textoMuted}`}>
                    La FC es un promedio diario. El sueño se agrupa por la fecha
                    en que terminó la sesión.
                  </p>
                </div>
              ) : (
                <div className={`mt-4 rounded-2xl border p-4 ${fondoSuave}`}>
                  <div className="flex items-start gap-2">
                    <Info
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isSunlight ? 'text-sky-700' : 'text-sky-400'
                      }`}
                    />
                    <div>
                      <p className={`text-sm font-black ${textoPrincipal}`}>
                        La cuenta está conectada, pero no hay datos.
                      </p>
                      <p
                        className={`text-[11px] font-medium mt-1 leading-relaxed ${textoSuave}`}
                      >
                        Google Fit no devolvió pasos, pulso ni sueño para los
                        últimos 7 días. Puede tardar en sincronizar o tu reloj
                        o app no está escribiendo esos datos. Revisá “Fuentes
                        detectadas”.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setMostrarFuentes((valor) => !valor)}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-black ${
                    isSunlight ? 'text-sky-800' : 'text-sky-300'
                  }`}
                >
                  {mostrarFuentes ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  Fuentes detectadas en Google Fit ({fuentes.length})
                </button>

                {mostrarFuentes && (
                  <div className={`mt-2 rounded-2xl border p-3 ${fondoSuave}`}>
                    {fuentes.length === 0 ? (
                      <p
                        className={`text-[11px] font-medium leading-relaxed ${textoSuave}`}
                      >
                        No encontramos fuentes de pasos, pulso, sueño, peso u
                        oxígeno. Si tu app no aparece acá, no está escribiendo
                        esos datos en Google Fit.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {fuentes.map((fuente, indice) => (
                          <li
                            key={`${fuente.tipo}-${fuente.paquete || 'sin-app'}-${indice}`}
                            className="flex items-start justify-between gap-2"
                          >
                            <div>
                              <p
                                className={`text-[11px] font-black ${textoPrincipal}`}
                              >
                                {fuente.etiqueta}
                              </p>
                              <p
                                className={`text-[10px] font-medium ${textoMuted}`}
                              >
                                {fuente.app || 'App desconocida'}
                                {fuente.paquete ? ` · ${fuente.paquete}` : ''}
                              </p>
                            </div>

                            {fuente.esDafit && (
                              <span
                                className={`text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${
                                  isSunlight
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                }`}
                              >
                                Da Fit
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {estado.totalFuentesGoogleFit > fuentes.length && (
                      <p className={`text-[10px] font-medium mt-2 ${textoMuted}`}>
                        Google Fit tiene {estado.totalFuentesGoogleFit} fuentes
                        en total; mostramos las relevantes para salud y
                        actividad.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          <p className={`text-[10px] font-medium mt-3 ${textoMuted}`}>
            Datos leídos en vivo desde la API de Google Fit. No se guardan en
            PostgreSQL. Google Fit está deprecado y puede dejar de funcionar
            durante 2026.
          </p>
        </>
      )}
    </Wrapper>
  );
}
