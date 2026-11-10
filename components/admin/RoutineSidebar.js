'use client';

/**
 * ========================================================================
 * COMPONENTE: Sidebar de Historial y Librería Global (RoutineSidebar.js)
 * ========================================================================
 * Panel lateral retráctil para Matías:
 * 1. Pestaña "Librería Global": Ejercicios clasificados con búsqueda en vivo.
 * 2. Pestaña "Historial del Atleta": Rutinas previas y archivadas de este atleta.
 * Cada ítem cuenta con un botón "+" para inyectarlo instantáneamente en el bloque
 * activo (Movilidad, Activación o Desarrollo) del día que se está editando.
 */

import { useState, useMemo } from 'react';
import { 
  BookOpen, History, Search, Plus, Check, ChevronRight, ChevronLeft, 
  Dumbbell, Sparkles, Video, Filter, Calendar, X 
} from 'lucide-react';
import { LIBRERIA_EJERCICIOS, CATEGORIAS_EJERCICIOS } from '@/lib/exercisesLibrary';

export default function RoutineSidebar({
  isOpen,
  onToggle,
  bloqueActivoTipo,
  onCambiarBloqueActivo,
  diaActivoIndex,
  diaActivoNombre,
  historialRutinas = [],
  onInyectarEjercicio,
  onImportarDiaCompleto,
}) {
  const [tab, setTab] = useState('libreria'); // 'libreria' | 'historial'
  const [busqueda, setBusqueda] = useState('');
  const [filtroBloque, setFiltroBloque] = useState('TODOS');
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS');
  const [ultimoInyectadoId, setUltimoInyectadoId] = useState(null);

  // Filtrar la librería global
  const ejerciciosFiltrados = useMemo(() => {
    return LIBRERIA_EJERCICIOS.filter((ej) => {
      const coincideBusqueda =
        !busqueda ||
        ej.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        ej.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
        (ej.indicacionDefault && ej.indicacionDefault.toLowerCase().includes(busqueda.toLowerCase()));

      const coincideBloque =
        filtroBloque === 'TODOS' || ej.tipoBloque === filtroBloque;

      const coincideCategoria =
        filtroCategoria === 'TODAS' || ej.categoria === filtroCategoria;

      return coincideBusqueda && coincideBloque && coincideCategoria;
    });
  }, [busqueda, filtroBloque, filtroCategoria]);

  const handleInyectar = (ejercicio, tipoBloqueDestino) => {
    const destino = tipoBloqueDestino || bloqueActivoTipo || ejercicio.tipoBloque || 'DESARROLLO';
    onInyectarEjercicio(ejercicio, destino);
    setUltimoInyectadoId(ejercicio.id || ejercicio.nombre);
    setTimeout(() => {
      setUltimoInyectadoId(null);
    }, 1600);
  };

  const getBloqueBadge = (tipo) => {
    switch (tipo) {
      case 'MOVILIDAD':
        return { label: 'Movilidad', bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
      case 'ACTIVACION':
        return { label: 'Activación', bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
      case 'DESARROLLO':
        return { label: 'Desarrollo', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      default:
        return { label: tipo, bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <aside
      className={`transition-all duration-300 ease-in-out border-l border-slate-800 flex flex-col bg-[#070d19] z-20 ${
        isOpen ? 'w-full lg:w-96' : 'w-0 overflow-hidden border-none'
      }`}
    >
      {/* CABECERA DEL SIDEBAR */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-[#050912]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('libreria')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              tab === 'libreria'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Librería Global</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('historial')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              tab === 'historial'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial ({historialRutinas?.length || 0})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Colapsar panel lateral"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* INDICADOR DE DESTINO ACTIVO */}
      <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] flex items-center justify-between">
        <span className="text-slate-400">
          Inyectando en: <strong className="text-white">Día {diaActivoIndex + 1}</strong>
        </span>
        <div className="flex items-center gap-1">
          <span className="text-slate-400">Bloque:</span>
          <select
            value={bloqueActivoTipo}
            onChange={(e) => onCambiarBloqueActivo(e.target.value)}
            className="bg-[#050912] border border-slate-700 text-white rounded-md px-1.5 py-0.5 text-[10px] font-bold focus:outline-none focus:border-sky-400"
          >
            <option value="MOVILIDAD">1. Movilidad</option>
            <option value="ACTIVACION">2. Activación</option>
            <option value="DESARROLLO">3. Desarrollo</option>
          </select>
        </div>
      </div>

      {/* CONTENIDO DEL PANEL */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* ========================================================= */}
        {/* PESTAÑA 1: LIBRERÍA GLOBAL DE EJERCICIOS */}
        {/* ========================================================= */}
        {tab === 'libreria' && (
          <div className="space-y-3">
            {/* Buscador */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por ejercicio o categoría..."
                className="w-full bg-[#050912] border border-slate-800 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filtros rápidos por bloque */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {['TODOS', 'MOVILIDAD', 'ACTIVACION', 'DESARROLLO'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setFiltroBloque(b)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase whitespace-nowrap border transition-all ${
                    filtroBloque === b
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-[#050912] text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {b === 'TODOS' ? 'Todos' : b.substring(0, 3)}
                </button>
              ))}
            </div>

            {/* Listado de ejercicios */}
            <div className="space-y-2">
              {ejerciciosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No se encontraron ejercicios con ese filtro.
                </div>
              ) : (
                ejerciciosFiltrados.map((ej) => {
                  const badge = getBloqueBadge(ej.tipoBloque);
                  const fueInyectado = ultimoInyectadoId === ej.id;

                  return (
                    <div
                      key={ej.id}
                      className="p-2.5 rounded-xl border border-slate-800 bg-[#0c1527] hover:border-slate-700 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${badge.bg}`}>
                              {badge.label}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {ej.categoria}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-white mt-1 leading-snug">
                            {ej.nombre}
                          </h5>
                          <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                            {ej.indicacionDefault}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-500">
                            <span>Sugerido: <strong>{ej.seriesDefault} series x {ej.repsDefault} reps</strong></span>
                            {ej.videoUrl && (
                              <span className="flex items-center gap-0.5 text-sky-400">
                                <Video className="w-2.5 h-2.5" />
                                <span>Video</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botón de Inyección Rápida */}
                        <button
                          type="button"
                          onClick={() => handleInyectar(ej, ej.tipoBloque)}
                          className={`shrink-0 p-2 rounded-xl text-xs font-black transition-all flex items-center justify-center ${
                            fueInyectado
                              ? 'bg-emerald-500 text-slate-950 scale-105'
                              : 'bg-sky-500/15 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-500/30'
                          }`}
                          title={`Inyectar en ${badge.label} del Día ${diaActivoIndex + 1}`}
                        >
                          {fueInyectado ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PESTAÑA 2: HISTORIAL DE RUTINAS PREVIAS DEL ATLETA */}
        {/* ========================================================= */}
        {tab === 'historial' && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
              <strong>Historial de este atleta:</strong> Consultá sesiones anteriores y reutilizá ejercicios o planificaciones completas.
            </div>

            {historialRutinas.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                Este atleta aún no tiene rutinas completadas o archivadas en su historial.
              </div>
            ) : (
              historialRutinas.map((sesion, sIdx) => {
                const ejerciciosSesion = (sesion.bloques || []).flatMap((b) =>
                  (b.ejercicios || []).map((ej) => ({
                    ...ej,
                    tipoBloque: b.tipo,
                  }))
                );

                const fechaStr = sesion.fechaCompletada || sesion.fechaAsignada || sesion.createdAt;
                const fechaFormateada = fechaStr
                  ? new Date(fechaStr).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Fecha previa';

                return (
                  <div
                    key={sesion.id || sIdx}
                    className="rounded-xl border border-slate-800 bg-[#0c1527] overflow-hidden"
                  >
                    <div className="p-3 bg-[#080e1b] border-b border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-400 block">
                          {fechaFormateada}
                        </span>
                        <h5 className="text-xs font-black text-white truncate max-w-[200px]">
                          {sesion.nombre || `Sesión Histórica ${sIdx + 1}`}
                        </h5>
                      </div>

                      {onImportarDiaCompleto && (
                        <button
                          type="button"
                          onClick={() => onImportarDiaCompleto(sesion)}
                          className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-[10px] font-bold border border-amber-500/30 transition-all"
                          title="Importar este día completo como nuevo cuadrado en el calendario"
                        >
                          + Añadir Día
                        </button>
                      )}
                    </div>

                    <div className="p-2.5 space-y-1.5">
                      {ejerciciosSesion.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic">Sin ejercicios registrados.</p>
                      ) : (
                        ejerciciosSesion.map((ej, ejIdx) => {
                          const badge = getBloqueBadge(ej.tipoBloque);
                          const fueInyectado = ultimoInyectadoId === (ej.id || `${ej.nombre}-${ejIdx}`);

                          return (
                            <div
                              key={ej.id || ejIdx}
                              className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-[#050912] border border-slate-800/60 hover:border-slate-700"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[8px] font-bold uppercase px-1 rounded ${badge.bg}`}>
                                    {badge.label}
                                  </span>
                                  <span className="text-xs font-semibold text-white truncate">
                                    {ej.nombre}
                                  </span>
                                </div>
                                {ej.indicacionProfe && (
                                  <p className="text-[9px] text-slate-400 truncate mt-0.5">
                                    {ej.indicacionProfe}
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleInyectar(ej, ej.tipoBloque)}
                                className={`p-1.5 rounded-lg text-xs font-black transition-all ${
                                  fueInyectado
                                    ? 'bg-emerald-500 text-slate-950'
                                    : 'bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950'
                                }`}
                                title={`Inyectar ${ej.nombre} en Día ${diaActivoIndex + 1}`}
                              >
                                {fueInyectado ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <Plus className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </aside>
  );
}
