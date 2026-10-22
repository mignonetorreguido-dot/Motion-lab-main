'use client';

/**
 * ========================================================================
 * COMPONENTE: Chequeo de Bienestar (components/bienestar/BienestarTest.js)
 * ========================================================================
 * Test corto de 10 preguntas sobre descanso, estrés, estado de ánimo,
 * energía y motivación. Muestra un resultado general, el detalle por
 * dimensión y recomendaciones personalizadas.
 *
 * Si el alumno está autenticado, el resultado se guarda en PostgreSQL y
 * queda visible en la ficha del entrenador Matías.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  HeartHandshake,
  Leaf,
  Lightbulb,
  Loader2,
  LockKeyhole,
  Moon,
  RotateCcw,
  Smile,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import {
  DIMENSIONES,
  PREGUNTAS,
  calcularResultado,
  esChequeoDeEstaSemana,
  obtenerNivelGeneral,
  respuestasCompletas,
} from '@/lib/bienestar';

const ICONOS = {
  Moon,
  Zap,
  Smile,
  BatteryCharging,
  Target,
};

const COLORES_NIVEL = {
  EQUILIBRIO: '#38bdf8',
  ATENCION: '#fbbf24',
  ALERTA: '#fb7185',
};

function formatearFecha(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function IconoDimension({ nombre, className = 'w-5 h-5' }) {
  const Icono = ICONOS[nombre] || Leaf;
  return <Icono className={className} />;
}

function MedidorGeneral({ puntaje, nivel, isSunlight }) {
  const radio = 52;
  const circunferencia = 2 * Math.PI * radio;
  const color = COLORES_NIVEL[nivel?.clave] || '#38bdf8';
  const avance = (Math.min(100, Math.max(0, puntaje)) / 100) * circunferencia;

  return (
    <div className="relative w-44 h-44 sm:w-52 sm:h-52 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radio}
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          className={isSunlight ? 'text-slate-300' : 'text-slate-700/40'}
        />
        <circle
          cx="60"
          cy="60"
          r={radio}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${avance} ${circunferencia}`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <Leaf className="w-5 h-5 mb-1" style={{ color }} />
        <span className={`text-[10px] uppercase tracking-widest font-bold ${isSunlight ? 'text-slate-500' : 'text-slate-400'}`}>
          Bienestar general
        </span>
        <span className="text-3xl font-black leading-none mt-1" style={{ color }}>
          {puntaje}
        </span>
        <span className={`text-[11px] font-bold mt-1 ${isSunlight ? 'text-slate-600' : 'text-slate-300'}`}>
          {nivel?.etiqueta}
        </span>
      </div>
    </div>
  );
}

function TarjetaDimension({ dimension, index, isSunlight }) {
  const Icono = ICONOS[dimension.icono] || Leaf;

  return (
    <div
      className={`rounded-2xl border p-4 transition-all hover:-translate-y-0.5 ${
        isSunlight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-700/80'
      }`}
      style={{ borderTopColor: dimension.color, borderTopWidth: 3 }}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${dimension.color}1f`, color: dimension.color }}
        >
          <Icono className="w-5 h-5" />
        </div>
        <span className={`text-[10px] font-bold ${isSunlight ? 'text-slate-400' : 'text-slate-500'}`}>Área {index + 1}</span>
      </div>

      <h3 className={`text-sm font-black leading-tight ${isSunlight ? 'text-slate-900' : 'text-white'}`}>{dimension.nombre}</h3>
      <div className="flex items-center gap-1.5 mt-1 mb-3">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dimension.color }} />
        <span className="text-xs font-bold" style={{ color: dimension.color }}>
          {dimension.nivel}
        </span>
        <span className={`text-[10px] ml-auto ${isSunlight ? 'text-slate-400' : 'text-slate-500'}`}>{dimension.puntaje}/100</span>
      </div>

      <div className={`h-1.5 rounded-full overflow-hidden mb-3 ${isSunlight ? 'bg-slate-200' : 'bg-slate-800'}`}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${dimension.puntaje}%`, backgroundColor: dimension.color }}
        />
      </div>

      <p className={`text-[11px] leading-relaxed ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>{dimension.descripcion}</p>
    </div>
  );
}

function HistorialBienestar({ historial, isSunlight }) {
  if (!historial?.length) return null;

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isSunlight ? 'bg-white border-slate-300' : 'bg-[#0b1220] border-slate-800'
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className={`w-4 h-4 ${isSunlight ? 'text-sky-700' : 'text-sky-400'}`} />
        <h3 className={`text-sm font-black ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
          Tus últimos chequeos
        </h3>
      </div>

      <div className="space-y-2.5">
        {historial.slice(0, 4).map((item) => {
          const nivel = item.resultado?.nivelGeneral || obtenerNivelGeneral(item.puntajeGeneral);
          const color = COLORES_NIVEL[nivel.clave] || '#38bdf8';

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 ${
                isSunlight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className={`text-xs font-bold ${isSunlight ? 'text-slate-800' : 'text-slate-200'}`}>
                    {formatearFecha(item.fecha)}
                  </p>
                  {esChequeoDeEstaSemana(item.fecha) && (
                    <span className={`text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded border ${
                      isSunlight
                        ? 'bg-sky-100 text-sky-800 border-sky-300'
                        : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                    }`}>
                      Esta semana
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 truncate">
                  {item.nivelGeneral === 'ALERTA'
                    ? 'Varias áreas necesitan atención'
                    : item.nivelGeneral === 'ATENCION'
                      ? 'Hay áreas para reforzar'
                      : 'Buen equilibrio general'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-lg font-black" style={{ color }}>
                  {item.puntajeGeneral}
                </span>
                <span
                  className="text-[10px] font-black px-2 py-1 rounded-full"
                  style={{ backgroundColor: `${color}1a`, color }}
                >
                  {nivel.etiqueta}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BienestarTest({
  alumnoId = null,
  alumnoNombre = '',
  logueado = false,
}) {
  const { isSunlight } = useTheme();
  const [etapa, setEtapa] = useState('intro');
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [comentario, setComentario] = useState('');
  const [resultado, setResultado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState('');
  const [error, setError] = useState('');
  const [historial, setHistorial] = useState([]);

  const preguntaActual = PREGUNTAS[indice];
  const respuestaActual = preguntaActual ? respuestas[preguntaActual.id] : undefined;
  const progreso = Math.round(((indice + 1) / PREGUNTAS.length) * 100);
  const respuestasListas = useMemo(() => respuestasCompletas(respuestas), [respuestas]);
  const chequeoEstaSemana = useMemo(
    () => historial.find((item) => esChequeoDeEstaSemana(item.fecha)) || null,
    [historial]
  );

  const textoPrincipal = isSunlight ? 'text-slate-950' : 'text-white';
  const textoSuave = isSunlight ? 'text-slate-700' : 'text-slate-300';
  const textoMuted = isSunlight ? 'text-slate-500' : 'text-slate-400';
  const tarjeta = isSunlight
    ? 'bg-white border-slate-300 shadow-md'
    : 'bg-[#0b1220] border-slate-800 shadow-2xl';
  const fondoSuave = isSunlight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800';

  useEffect(() => {
    if (!logueado) return;

    let activo = true;
    const consulta = alumnoId ? `?alumnoId=${encodeURIComponent(alumnoId)}` : '';
    fetch(`/api/bienestar${consulta}`)
      .then((res) => res.json())
      .then((data) => {
        if (activo && data?.success) setHistorial(data.chequeos || []);
      })
      .catch(() => {
        // El historial es complementario: si falla, el test sigue funcionando.
      });

    return () => {
      activo = false;
    };
  }, [alumnoId, logueado]);

  const seleccionarOpcion = (valor) => {
    setRespuestas((prev) => ({ ...prev, [preguntaActual.id]: valor }));
    setError('');
  };

  const irAnterior = () => {
    if (indice > 0) setIndice((prev) => prev - 1);
  };

  const irSiguiente = () => {
    if (respuestaActual === undefined) {
      setError('Elegí una opción para continuar.');
      return;
    }

    setError('');
    if (indice < PREGUNTAS.length - 1) {
      setIndice((prev) => prev + 1);
    } else {
      finalizarChequeo();
    }
  };

  const finalizarChequeo = async () => {
    if (!respuestasListas) {
      setError('Respondé todas las preguntas antes de ver el resultado.');
      return;
    }

    const resultadoLocal = calcularResultado(respuestas);
    setResultado(resultadoLocal);
    setEtapa('resultado');
    setMensajeGuardado('');
    setError('');

    if (!logueado) return;

    setGuardando(true);
    try {
      const res = await fetch('/api/bienestar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respuestas,
          comentario,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No pudimos guardar el chequeo.');
      }

      if (data.yaRealizado) {
        setMensajeGuardado(
          data.mensaje ||
            'Ya completaste tu chequeo de esta semana. Podés volver la próxima.'
        );
        if (data.chequeo?.resultado) setResultado(data.chequeo.resultado);
        if (data.chequeo) {
          setHistorial((prev) => {
            const sinDuplicado = prev.filter((item) => item.id !== data.chequeo.id);
            return [data.chequeo, ...sinDuplicado];
          });
        }
        return;
      }

      setMensajeGuardado(
        data.persistido
          ? 'Chequeo semanal guardado. Matías ya puede ver tus resultados.'
          : 'Chequeo semanal guardado temporalmente. Matías podrá verlo en esta sesión.'
      );

      if (data.chequeo) {
        if (data.chequeo.resultado) setResultado(data.chequeo.resultado);
        setHistorial((prev) => {
          const sinDuplicado = prev.filter((item) => item.id !== data.chequeo.id);
          return [data.chequeo, ...sinDuplicado];
        });
      }
    } catch (err) {
      setError(err.message || 'No pudimos guardar el chequeo, pero tus resultados están listos.');
    } finally {
      setGuardando(false);
    }
  };

  const reiniciar = () => {
    setRespuestas({});
    setComentario('');
    setResultado(null);
    setIndice(0);
    setEtapa('intro');
    setMensajeGuardado('');
    setError('');
  };

  const irAPreguntas = () => {
    setIndice(0);
    setEtapa('preguntas');
    setError('');
  };

  const verChequeoSemanal = () => {
    if (!chequeoEstaSemana) return;

    const resultadoSemanal =
      chequeoEstaSemana.resultado ||
      (chequeoEstaSemana.respuestas &&
      respuestasCompletas(chequeoEstaSemana.respuestas)
        ? calcularResultado(chequeoEstaSemana.respuestas)
        : null);

    if (!resultadoSemanal) return;

    setResultado(resultadoSemanal);
    setEtapa('resultado');
    setError('');
    setMensajeGuardado('');
  };

  // ================================================================
  // ETAPA 1: PRESENTACIÓN
  // ================================================================
  if (etapa === 'intro') {
    const ultimoChequeo = historial[0];
    const nivelUltimo = ultimoChequeo
      ? ultimoChequeo.resultado?.nivelGeneral || obtenerNivelGeneral(ultimoChequeo.puntajeGeneral)
      : null;
    const ultimoEsDeEstaSemana = Boolean(
      ultimoChequeo && esChequeoDeEstaSemana(ultimoChequeo.fecha)
    );

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className={`rounded-3xl border p-6 sm:p-10 overflow-hidden relative ${tarjeta}`}>
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center relative">
            <div>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  isSunlight
                    ? 'bg-sky-100 text-sky-800 border-sky-300'
                    : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                Chequeo semanal de bienestar
              </span>

              <h1 className={`mt-5 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] ${textoPrincipal}`}>
                Tu bienestar
                <br />
                <span className={isSunlight ? 'text-sky-700' : 'text-sky-400'}>en un vistazo</span>
              </h1>

              <p className={`mt-4 text-sm sm:text-base leading-relaxed max-w-xl ${textoSuave}`}>
                {alumnoNombre ? `Hola, ${alumnoNombre.split(' ')[0]}. ` : ''}
                Respondé 10 preguntas cortas sobre cómo estás descansando, tu nivel de estrés,
                tu estado de ánimo, tu energía y tu motivación. Al terminar vas a ver tus
                resultados y algunas recomendaciones para acompañar tu entrenamiento.
              </p>

              <p className={`mt-2 text-xs font-bold leading-relaxed max-w-xl ${isSunlight ? 'text-sky-700' : 'text-sky-300'}`}>
                Se completa una vez por semana. Si ya lo hiciste, podés ver tu resultado y volver la próxima.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-6 max-w-md">
                {[
                  { valor: '1', label: 'por semana' },
                  { valor: '10', label: 'preguntas' },
                  { valor: '2', label: 'minutos' },
                ].map((item) => (
                  <div key={item.label} className={`rounded-2xl border px-3 py-3 text-center ${fondoSuave}`}>
                    <span className={`block text-lg font-black ${isSunlight ? 'text-sky-700' : 'text-sky-300'}`}>
                      {item.valor}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${textoMuted}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-7">
                <button
                  type="button"
                  onClick={chequeoEstaSemana ? verChequeoSemanal : irAPreguntas}
                  className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98]"
                >
                  {chequeoEstaSemana ? 'Ver chequeo de esta semana' : 'Empezar chequeo semanal'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                {ultimoChequeo?.resultado && !chequeoEstaSemana && (
                  <button
                    type="button"
                    onClick={() => {
                      setResultado(ultimoChequeo.resultado);
                      setEtapa('resultado');
                    }}
                    className={`inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl text-sm font-bold border transition-all ${
                      isSunlight
                        ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Ver último resultado
                  </button>
                )}
              </div>

              {!logueado && (
                <div className={`mt-5 flex items-start gap-2.5 rounded-2xl border p-3.5 text-xs ${fondoSuave}`}>
                  <LockKeyhole className={`w-4 h-4 shrink-0 mt-0.5 ${isSunlight ? 'text-amber-600' : 'text-amber-400'}`} />
                  <p className={textoSuave}>
                    Podés hacer el test sin cuenta. Si querés que Matías vea tus resultados,
                    <Link href="/login?callbackUrl=/bienestar" className="font-black text-blue-600 hover:underline ml-1">
                      iniciá sesión
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>

            <div className={`rounded-3xl border p-5 ${fondoSuave}`}>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className={`w-4 h-4 ${isSunlight ? 'text-sky-700' : 'text-sky-400'}`} />
                <h2 className={`text-sm font-black ${textoPrincipal}`}>Las 5 áreas que vamos a mirar</h2>
              </div>
              <div className="space-y-2.5">
                {DIMENSIONES.map((dimension) => {
                  const Icono = ICONOS[dimension.icono] || Leaf;
                  return (
                    <div key={dimension.id} className="flex items-center gap-3">
                      <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${dimension.color}1f`, color: dimension.color }}
                      >
                        <Icono className="w-4 h-4" />
                      </span>
                      <div>
                        <p className={`text-xs font-bold ${textoPrincipal}`}>{dimension.nombre}</p>
                        <p className={`text-[10px] ${textoMuted}`}>{dimension.recomendacionTitulo}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {ultimoChequeo && (
          <div className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${fondoSuave}`}>
            <div className="flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${COLORES_NIVEL[nivelUltimo?.clave] || '#38bdf8'}1f`,
                  color: COLORES_NIVEL[nivelUltimo?.clave] || '#38bdf8',
                }}
              >
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div>
                <p className={`text-xs font-black ${textoPrincipal}`}>
                  {ultimoEsDeEstaSemana ? 'Chequeo de esta semana' : 'Último chequeo'}: {formatearFecha(ultimoChequeo.fecha)}
                </p>
                <p className={`text-[11px] ${textoMuted}`}>
                  Bienestar general {ultimoChequeo.puntajeGeneral}/100 · {nivelUltimo?.etiqueta}
                </p>
              </div>
            </div>
            {ultimoChequeo.resultado && (
              <button
                type="button"
                onClick={ultimoEsDeEstaSemana ? verChequeoSemanal : () => {
                  setResultado(ultimoChequeo.resultado);
                  setEtapa('resultado');
                }}
                className={`text-xs font-black inline-flex items-center gap-1 ${isSunlight ? 'text-sky-700' : 'text-sky-300'}`}
              >
                Ver detalle
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ================================================================
  // ETAPA 2: PREGUNTAS
  // ================================================================
  if (etapa === 'preguntas' && preguntaActual) {
    const dimension = DIMENSIONES.find((item) => item.id === preguntaActual.dimension);
    const Icono = ICONOS[dimension?.icono] || Leaf;

    return (
      <div className="max-w-3xl mx-auto">
        <div className={`rounded-3xl border p-6 sm:p-8 ${tarjeta}`}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className={`text-[11px] font-black uppercase tracking-widest ${isSunlight ? 'text-sky-700' : 'text-sky-300'}`}>
              Pregunta {indice + 1} de {PREGUNTAS.length}
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black"
              style={{ backgroundColor: `${dimension?.color}1f`, color: dimension?.color }}
            >
              <Icono className="w-3 h-3" />
              {dimension?.nombre}
            </span>
          </div>

          <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-7">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-500"
              style={{ width: `${progreso}%` }}
            />
          </div>

          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight ${textoPrincipal}`}>
            {preguntaActual.titulo}
          </h2>
          <p className={`text-xs sm:text-sm mt-2 mb-6 ${textoMuted}`}>{preguntaActual.ayuda}</p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {preguntaActual.opciones.map((opcion) => {
              const seleccionada = respuestaActual === opcion.valor;
              return (
                <button
                  key={opcion.valor}
                  type="button"
                  onClick={() => seleccionarOpcion(opcion.valor)}
                  className={`relative flex sm:flex-col items-center sm:justify-center gap-3 sm:gap-1.5 rounded-2xl border-2 px-4 py-3.5 text-left sm:text-center transition-all ${
                    seleccionada
                      ? 'border-sky-400 bg-sky-500/10 shadow-lg shadow-sky-500/10'
                      : isSunlight
                        ? 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/50'
                        : 'border-slate-700 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-800/70'
                  }`}
                >
                  <span className="text-2xl leading-none">{opcion.emoji}</span>
                  <span className={`text-xs font-bold ${seleccionada ? (isSunlight ? 'text-sky-800' : 'text-sky-200') : textoSuave}`}>
                    {opcion.etiqueta}
                  </span>
                  {seleccionada && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {indice === PREGUNTAS.length - 1 && (
            <div className="mt-5">
              <label htmlFor="comentario-bienestar" className={`block text-xs font-black mb-2 ${textoPrincipal}`}>
                ¿Querés contarle algo a Matías? <span className={`font-medium ${textoMuted}`}>(opcional)</span>
              </label>
              <textarea
                id="comentario-bienestar"
                value={comentario}
                onChange={(evento) => setComentario(evento.target.value.slice(0, 1000))}
                rows={3}
                placeholder="Por ejemplo: esta semana dormí poco por el trabajo, me costó entrenar..."
                className={`w-full resize-none rounded-2xl border p-3.5 text-xs leading-relaxed focus:outline-none focus:border-sky-400 ${
                  isSunlight
                    ? 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                    : 'bg-slate-900/70 border-slate-700 text-slate-200 placeholder-slate-500'
                }`}
              />
              <p className={`text-[10px] text-right mt-1 ${textoMuted}`}>{comentario.length}/1000</p>
            </div>
          )}

          {error && (
            <p className="mt-4 text-xs font-bold text-rose-500" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 mt-7">
            <button
              type="button"
              onClick={irAnterior}
              disabled={indice === 0}
              className={`inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                isSunlight
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>

            <button
              type="button"
              onClick={irSiguiente}
              disabled={respuestaActual === undefined}
              className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {indice === PREGUNTAS.length - 1 ? 'Ver mis resultados' : 'Siguiente'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className={`text-center text-[11px] mt-4 ${textoMuted}`}>
          Tus respuestas son confidenciales. Sólo vos y tu entrenador pueden ver el resultado.
        </p>
      </div>
    );
  }

  // ================================================================
  // ETAPA 3: RESULTADOS
  // ================================================================
  if (etapa === 'resultado' && resultado) {
    const colorGeneral = COLORES_NIVEL[resultado.nivelGeneral?.clave] || '#38bdf8';

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className={`rounded-3xl border p-6 sm:p-8 overflow-hidden relative ${tarjeta}`}>
          <div
            className="absolute -top-24 -right-16 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: colorGeneral }}
          />

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center relative">
            <div>
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
                style={{
                  backgroundColor: `${colorGeneral}1a`,
                  borderColor: `${colorGeneral}55`,
                  color: colorGeneral,
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Chequeo completado
              </span>

              <h1 className={`mt-4 text-3xl sm:text-4xl font-black tracking-tight leading-tight ${textoPrincipal}`}>
                Tu bienestar
                <br />
                <span style={{ color: colorGeneral }}>en un vistazo</span>
              </h1>
              <p className={`text-sm leading-relaxed mt-3 max-w-xl ${textoSuave}`}>
                Gracias por completar el test. Este es un resumen de cómo venís en cada área
                y algunas ideas para acompañar tu entrenamiento y tu bienestar general.
              </p>

              <div className={`mt-5 rounded-2xl border p-4 ${fondoSuave}`}>
                <div className="flex items-center gap-2 mb-1">
                  <HeartHandshake className={`w-4 h-4 ${isSunlight ? 'text-sky-700' : 'text-sky-300'}`} />
                  <span className={`text-xs font-black ${textoPrincipal}`}>
                    {resultado.nivelGeneral?.etiqueta}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${textoSuave}`}>{resultado.nivelGeneral?.descripcion}</p>
              </div>

              {guardando && (
                <p className={`mt-4 flex items-center gap-2 text-xs font-bold ${textoMuted}`}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando tu chequeo...
                </p>
              )}
              {!guardando && mensajeGuardado && (
                <p className={`mt-4 flex items-start gap-2 text-xs font-bold ${isSunlight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  {mensajeGuardado}
                </p>
              )}
              {!guardando && error && (
                <p className={`mt-4 text-xs font-bold ${isSunlight ? 'text-rose-600' : 'text-rose-400'}`}>{error}</p>
              )}
              {!logueado && (
                <Link
                  href="/login?callbackUrl=/bienestar"
                  className="mt-4 inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all"
                >
                  <LockKeyhole className="w-3.5 h-3.5" />
                  Iniciar sesión para guardarlo
                </Link>
              )}
            </div>

            <div className="flex justify-center">
              <div className={`rounded-full p-4 ${isSunlight ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
                <MedidorGeneral puntaje={resultado.puntajeGeneral} nivel={resultado.nivelGeneral} isSunlight={isSunlight} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${textoPrincipal}`}>Tus resultados</h2>
              <p className={`text-xs sm:text-sm ${textoMuted}`}>Así fue tu respuesta en cada área:</p>
            </div>
            <span className={`text-[11px] font-bold ${textoMuted}`}>
              Puntaje general: <strong className={isSunlight ? 'text-sky-700' : 'text-sky-300'}>{resultado.puntajeGeneral}/100</strong>
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {resultado.dimensiones.map((dimension, index) => (
              <TarjetaDimension key={dimension.id} dimension={dimension} index={index} isSunlight={isSunlight} />
            ))}
          </div>
        </div>

        <div className={`rounded-3xl border p-5 sm:p-7 ${tarjeta}`}>
          <div className="flex items-start gap-3 mb-5">
            <span className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${isSunlight ? 'bg-sky-100 text-sky-700' : 'bg-sky-500/15 text-sky-300'}`}>
              <Lightbulb className="w-5 h-5" />
            </span>
            <div>
              <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${textoPrincipal}`}>
                Recomendaciones para vos
              </h2>
              <p className={`text-xs sm:text-sm ${textoMuted}`}>
                Pequeños cambios pueden hacer una gran diferencia. Estas son las áreas donde más te conviene poner el foco.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {resultado.recomendaciones.map((recomendacion) => {
              const Icono = ICONOS[DIMENSIONES.find((d) => d.id === recomendacion.id)?.icono] || Leaf;
              return (
                <div key={recomendacion.id} className={`rounded-2xl border p-4 flex items-start gap-3 ${fondoSuave}`}>
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${recomendacion.color}1f`, color: recomendacion.color }}
                  >
                    <Icono className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className={`text-sm font-black ${textoPrincipal}`}>{recomendacion.titulo}</h3>
                    <p className={`text-xs leading-relaxed mt-1 ${textoSuave}`}>{recomendacion.texto}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`mt-5 rounded-2xl border p-4 flex items-start gap-3 ${fondoSuave}`}>
            <HeartHandshake className={`w-5 h-5 shrink-0 mt-0.5 ${isSunlight ? 'text-sky-700' : 'text-sky-300'}`} />
            <div>
              <p className={`text-xs font-black ${textoPrincipal}`}>Recordá que este test es sólo una guía orientativa.</p>
              <p className={`text-[11px] leading-relaxed mt-1 ${textoMuted}`}>
                No reemplaza la opinión de un profesional de la salud mental ni constituye un
                diagnóstico clínico. Si sentís que necesitás ayuda, hablá con Matías o con un
                profesional de confianza.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {chequeoEstaSemana ? (
            <span className={`inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border ${
              isSunlight
                ? 'bg-sky-50 border-sky-300 text-sky-800'
                : 'bg-sky-500/10 border-sky-500/30 text-sky-300'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Ya completaste el chequeo de esta semana. Volvé la próxima.
            </span>
          ) : (
            <button
              type="button"
              onClick={reiniciar}
              className={`inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                isSunlight
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Hacer chequeo de esta semana
            </button>
          )}

          <Link
            href="/entrenamiento"
            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all"
          >
            Ir a mi entrenamiento
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {resultado && <HistorialBienestar historial={historial} isSunlight={isSunlight} />}
      </div>
    );
  }

  return null;
}
