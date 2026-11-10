'use client';

/**
 * ========================================================================
 * COMPONENTE: Constructor y Editor de Rutinas (RoutineBuilder.js)
 * ========================================================================
 * Refactorización de alto rendimiento para el Coach Matías:
 * 1. Hidratación automática de la rutina actual desde Supabase/API (Bug Fix).
 * 2. Pseudo-Calendario con Drag-and-Drop (@dnd-kit) para reordenar días.
 * 3. Sidebar retráctil de Historial del Atleta y Librería Global de Ejercicios.
 * 4. Clonación avanzada de días en 1 solo clic.
 * 5. Gestión del estado mediante useReducer para máxima fluidez y cero pérdida de datos.
 */

import { useReducer, useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  Plus,
  Trash2,
  Video,
  X,
  Save,
  PlayCircle,
  Copy,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import SortableDayCard from './SortableDayCard';
import RoutineSidebar from './RoutineSidebar';
import { useTheme } from '@/components/ThemeProvider';

// Helper para crear un día vacío con la metodología de 3 bloques
function crearDiaVacio(numero = 1) {
  return {
    id: crypto.randomUUID(),
    nombre: `Día ${numero}: Entrenamiento`,
    descripcion: '',
    bloques: [
      { tipo: 'MOVILIDAD', orden: 1, ejercicios: [] },
      { tipo: 'ACTIVACION', orden: 2, ejercicios: [] },
      { tipo: 'DESARROLLO', orden: 3, ejercicios: [] },
    ],
  };
}

// Helper para normalizar la respuesta de la base de datos a la estructura editable
function normalizarPlanDeBaseDeDatos(planSemanal) {
  if (!planSemanal || !Array.isArray(planSemanal) || planSemanal.length === 0) {
    return null;
  }

  return planSemanal.map((dia, idx) => {
    // Asegurar los 3 bloques metodológicos
    const bloquesTipos = ['MOVILIDAD', 'ACTIVACION', 'DESARROLLO'];
    const bloquesNormalizados = bloquesTipos.map((tipo, bIdx) => {
      const bloqueExistente = (dia.bloques || []).find((b) => b.tipo === tipo);
      const ejerciciosExistentes = (bloqueExistente?.ejercicios || []).map((ej) => {
        const seriesCount = ej.series?.length > 0 ? ej.series.length : (tipo === 'DESARROLLO' ? 3 : 1);
        const repsCount = ej.series?.[0]?.repsRealizadas || (tipo === 'DESARROLLO' ? 10 : 8);

        return {
          id: ej.id || crypto.randomUUID(),
          nombre: ej.nombre || '',
          seriesCount,
          repsCount,
          indicacionProfe: ej.indicacionProfe || '',
          videoUrl: ej.videoUrl || '',
          videoRecomendacion: ej.videoRecomendacion || '',
          mostrarVideoInput: Boolean(ej.videoUrl || ej.videoRecomendacion),
        };
      });

      return {
        tipo,
        orden: bIdx + 1,
        ejercicios: ejerciciosExistentes,
      };
    });

    return {
      id: dia.id || crypto.randomUUID(),
      nombre: dia.nombre || `Día ${idx + 1}: Sesión`,
      descripcion: dia.enfoque || dia.descripcion || '',
      bloques: bloquesNormalizados,
    };
  });
}

// ------------------------------------------------------------------------
// REDUCER PARA GESTIÓN DE ESTADO ROBUSTO Y FLUIDO
// ------------------------------------------------------------------------
const initialState = {
  dias: [crearDiaVacio(1)],
  diaActivoIndex: 0,
  bloqueActivoTipo: 'DESARROLLO', // 'MOVILIDAD' | 'ACTIVACION' | 'DESARROLLO'
  sidebarAbierto: true,
  historialRutinas: [],
  cargandoHidratacion: true,
  guardando: false,
  notificacion: null,
};

function routineReducer(state, action) {
  switch (action.type) {
    case 'INICIAR_CARGA':
      return { ...state, cargandoHidratacion: true };

    case 'HIDRATAR_RUTINA': {
      const diasHydrated = action.payload.dias?.length > 0 ? action.payload.dias : [crearDiaVacio(1)];
      return {
        ...state,
        dias: diasHydrated,
        diaActivoIndex: 0,
        historialRutinas: action.payload.historial || state.historialRutinas,
        cargandoHidratacion: false,
      };
    }

    case 'SELECCIONAR_DIA':
      return {
        ...state,
        diaActivoIndex: Math.max(0, Math.min(action.payload, state.dias.length - 1)),
      };

    case 'REORDENAR_DIAS': {
      const { oldIndex, newIndex } = action.payload;
      if (oldIndex === newIndex) return state;
      const reordenados = arrayMove(state.dias, oldIndex, newIndex);
      return {
        ...state,
        dias: reordenados,
        diaActivoIndex: newIndex,
      };
    }

    case 'AGREGAR_DIA': {
      const nuevoDia = crearDiaVacio(state.dias.length + 1);
      return {
        ...state,
        dias: [...state.dias, nuevoDia],
        diaActivoIndex: state.dias.length,
        notificacion: `¡Día ${state.dias.length + 1} añadido al pseudo-calendario!`,
      };
    }

    case 'CLONAR_DIA': {
      const indexAClonar = action.payload ?? state.diaActivoIndex;
      const diaBase = state.dias[indexAClonar];
      if (!diaBase) return state;

      // Clonación profunda generando nuevos UUIDs para prevenir colisión de IDs
      const diaClonado = {
        id: crypto.randomUUID(),
        nombre: `${diaBase.nombre} (Copia)`,
        descripcion: diaBase.descripcion || '',
        bloques: diaBase.bloques.map((b) => ({
          tipo: b.tipo,
          orden: b.orden,
          ejercicios: b.ejercicios.map((ej) => ({
            ...ej,
            id: crypto.randomUUID(),
          })),
        })),
      };

      const nuevosDias = [...state.dias, diaClonado];
      return {
        ...state,
        dias: nuevosDias,
        diaActivoIndex: nuevosDias.length - 1,
        notificacion: `¡${diaBase.nombre} clonado con éxito!`,
      };
    }

    case 'ELIMINAR_DIA': {
      const indexAEliminar = action.payload;
      if (state.dias.length <= 1) return state;
      const nuevosDias = state.dias.filter((_, i) => i !== indexAEliminar);
      const nuevoIndex = Math.min(state.diaActivoIndex, nuevosDias.length - 1);
      return {
        ...state,
        dias: nuevosDias,
        diaActivoIndex: nuevoIndex,
        notificacion: 'Día eliminado de la rutina.',
      };
    }

    case 'ACTUALIZAR_DATOS_DIA': {
      const { campo, valor } = action.payload;
      const nuevosDias = [...state.dias];
      nuevosDias[state.diaActivoIndex] = {
        ...nuevosDias[state.diaActivoIndex],
        [campo]: valor,
      };
      return { ...state, dias: nuevosDias };
    }

    case 'ESTABLECER_BLOQUE_ACTIVO':
      return { ...state, bloqueActivoTipo: action.payload };

    case 'AGREGAR_EJERCICIO_VACIO': {
      const bloqueIndex = action.payload;
      const nuevosDias = [...state.dias];
      const dia = { ...nuevosDias[state.diaActivoIndex] };
      const bloques = [...dia.bloques];
      const bloque = { ...bloques[bloqueIndex] };
      
      const nuevoEj = {
        id: crypto.randomUUID(),
        nombre: '',
        seriesCount: bloque.tipo === 'DESARROLLO' ? 3 : 2,
        repsCount: bloque.tipo === 'DESARROLLO' ? 10 : 8,
        indicacionProfe: '',
        videoUrl: '',
        videoRecomendacion: '',
        mostrarVideoInput: false,
      };

      bloque.ejercicios = [...bloque.ejercicios, nuevoEj];
      bloques[bloqueIndex] = bloque;
      dia.bloques = bloques;
      nuevosDias[state.diaActivoIndex] = dia;

      return {
        ...state,
        dias: nuevosDias,
        bloqueActivoTipo: bloque.tipo,
      };
    }

    case 'INYECTAR_EJERCICIO': {
      const { ejercicio, tipoBloqueDestino } = action.payload;
      const nuevosDias = [...state.dias];
      const dia = { ...nuevosDias[state.diaActivoIndex] };
      const bloques = [...dia.bloques];
      
      const bIndex = bloques.findIndex((b) => b.tipo === tipoBloqueDestino);
      if (bIndex === -1) return state;

      const bloque = { ...bloques[bIndex] };
      const nuevoEj = {
        id: crypto.randomUUID(),
        nombre: ejercicio.nombre || 'Nuevo ejercicio',
        seriesCount: ejercicio.seriesDefault || (tipoBloqueDestino === 'DESARROLLO' ? 3 : 2),
        repsCount: ejercicio.repsDefault || (tipoBloqueDestino === 'DESARROLLO' ? 10 : 8),
        indicacionProfe: ejercicio.indicacionDefault || ejercicio.indicacionProfe || '',
        videoUrl: ejercicio.videoUrl || '',
        videoRecomendacion: ejercicio.videoRecomendacion || '',
        mostrarVideoInput: Boolean(ejercicio.videoUrl),
      };

      bloque.ejercicios = [...bloque.ejercicios, nuevoEj];
      bloques[bIndex] = bloque;
      dia.bloques = bloques;
      nuevosDias[state.diaActivoIndex] = dia;

      return {
        ...state,
        dias: nuevosDias,
        bloqueActivoTipo: tipoBloqueDestino,
        notificacion: `"${nuevoEj.nombre}" inyectado en ${tipoBloqueDestino} (Día ${state.diaActivoIndex + 1})`,
      };
    }

    case 'ELIMINAR_EJERCICIO': {
      const { bloqueIndex, ejercicioIndex } = action.payload;
      const nuevosDias = [...state.dias];
      const dia = { ...nuevosDias[state.diaActivoIndex] };
      const bloques = [...dia.bloques];
      const bloque = { ...bloques[bloqueIndex] };

      bloque.ejercicios = bloque.ejercicios.filter((_, i) => i !== ejercicioIndex);
      bloques[bloqueIndex] = bloque;
      dia.bloques = bloques;
      nuevosDias[state.diaActivoIndex] = dia;

      return { ...state, dias: nuevosDias };
    }

    case 'ACTUALIZAR_EJERCICIO': {
      const { bloqueIndex, ejercicioIndex, campo, valor } = action.payload;
      const nuevosDias = [...state.dias];
      const dia = { ...nuevosDias[state.diaActivoIndex] };
      const bloques = [...dia.bloques];
      const bloque = { ...bloques[bloqueIndex] };
      const ejercicios = [...bloque.ejercicios];

      ejercicios[ejercicioIndex] = {
        ...ejercicios[ejercicioIndex],
        [campo]: valor,
      };

      bloque.ejercicios = ejercicios;
      bloques[bloqueIndex] = bloque;
      dia.bloques = bloques;
      nuevosDias[state.diaActivoIndex] = dia;

      return { ...state, dias: nuevosDias };
    }

    case 'MOVER_EJERCICIO': {
      const { bloqueIndex, deIndex, aIndex } = action.payload;
      const nuevosDias = [...state.dias];
      const dia = { ...nuevosDias[state.diaActivoIndex] };
      const bloques = [...dia.bloques];
      const bloque = { ...bloques[bloqueIndex] };

      if (aIndex < 0 || aIndex >= bloque.ejercicios.length) return state;

      bloque.ejercicios = arrayMove(bloque.ejercicios, deIndex, aIndex);
      bloques[bloqueIndex] = bloque;
      dia.bloques = bloques;
      nuevosDias[state.diaActivoIndex] = dia;

      return { ...state, dias: nuevosDias };
    }

    case 'IMPORTAR_DIA_COMPLETO': {
      const sesionFuente = action.payload;
      const nuevoDia = {
        id: crypto.randomUUID(),
        nombre: `Día ${state.dias.length + 1}: ${sesionFuente.nombre || 'Importado'}`,
        descripcion: sesionFuente.descripcion || sesionFuente.enfoque || '',
        bloques: ['MOVILIDAD', 'ACTIVACION', 'DESARROLLO'].map((tipo, idx) => {
          const bloqueExistente = sesionFuente.bloques?.find((b) => b.tipo === tipo);
          return {
            tipo,
            orden: idx + 1,
            ejercicios: (bloqueExistente?.ejercicios || []).map((ej) => ({
              id: crypto.randomUUID(),
              nombre: ej.nombre,
              seriesCount: ej.series?.length || ej.seriesCount || (tipo === 'DESARROLLO' ? 3 : 2),
              repsCount: ej.series?.[0]?.repsRealizadas || ej.repsCount || 10,
              indicacionProfe: ej.indicacionProfe || '',
              videoUrl: ej.videoUrl || '',
              videoRecomendacion: ej.videoRecomendacion || '',
              mostrarVideoInput: Boolean(ej.videoUrl),
            })),
          };
        }),
      };

      const nuevosDias = [...state.dias, nuevoDia];
      return {
        ...state,
        dias: nuevosDias,
        diaActivoIndex: nuevosDias.length - 1,
        notificacion: `¡Sesión completa "${sesionFuente.nombre}" importada como nuevo día!`,
      };
    }

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarAbierto: !state.sidebarAbierto };

    case 'SET_GUARDANDO':
      return { ...state, guardando: action.payload };

    case 'LIMPIAR_NOTIFICACION':
      return { ...state, notificacion: null };

    default:
      return state;
  }
}

export default function RoutineBuilder({
  alumno,
  initialDias = null,
  onCancel,
  onSave,
}) {
  const { isSunlight } = useTheme();
  const [state, dispatch] = useReducer(routineReducer, initialState);

  // Sensores DnD con restricción de distancia para no interferir con clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requiere mover 8px para activar arrastre
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ------------------------------------------------------------------------
  // REQUISITO 1: HIDRATACIÓN DEL ESTADO AL EDITAR (BUG FIX)
  // ------------------------------------------------------------------------
  useEffect(() => {
    let activo = true;

    async function hidratarRutinaActual() {
      dispatch({ type: 'INICIAR_CARGA' });

      // Si el componente padre ya suministró días válidos, hidratar inmediatamente
      if (initialDias && Array.isArray(initialDias) && initialDias.length > 0) {
        dispatch({
          type: 'HIDRATAR_RUTINA',
          payload: { dias: initialDias, historial: [] },
        });
        return;
      }

      // Si no vienen initialDias, consultar Supabase / API para precargar la rutina existente
      try {
        const url = `/api/rutinas?alumnoId=${alumno.id}&incluirCompletadas=true`;
        const res = await fetch(url);
        const data = await res.json();

        if (!activo) return;

        if (data.success && data.planSemanal && data.planSemanal.length > 0) {
          const diasNormalizados = normalizarPlanDeBaseDeDatos(data.planSemanal);
          dispatch({
            type: 'HIDRATAR_RUTINA',
            payload: {
              dias: diasNormalizados,
              historial: data.rutinasEnDesuso || [],
            },
          });
        } else {
          // Si realmente no tiene rutina asignada, iniciar con Día 1 limpio
          dispatch({
            type: 'HIDRATAR_RUTINA',
            payload: {
              dias: [crearDiaVacio(1)],
              historial: data.rutinasEnDesuso || [],
            },
          });
        }
      } catch (err) {
        console.error('Error al hidratar la rutina actual desde Supabase/API:', err);
        if (activo) {
          dispatch({
            type: 'HIDRATAR_RUTINA',
            payload: { dias: [crearDiaVacio(1)], historial: [] },
          });
        }
      }
    }

    hidratarRutinaActual();

    return () => {
      activo = false;
    };
  }, [alumno.id, initialDias]);

  // Limpiar notificaciones temporales
  useEffect(() => {
    if (state.notificacion) {
      const timer = setTimeout(() => {
        dispatch({ type: 'LIMPIAR_NOTIFICACION' });
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [state.notificacion]);

  // Drag-and-Drop Handler
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = state.dias.findIndex((d) => d.id === active.id);
    const newIndex = state.dias.findIndex((d) => d.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      dispatch({
        type: 'REORDENAR_DIAS',
        payload: { oldIndex, newIndex },
      });
    }
  };

  // Guardar y formatear la rutina para la API
  const handleGuardarRutina = async () => {
    dispatch({ type: 'SET_GUARDANDO', payload: true });

    const diasFormateados = state.dias.map((dia, diaIdx) => {
      const bloquesFormateados = dia.bloques.map((bloque) => ({
        tipo: bloque.tipo,
        orden: bloque.orden,
        ejercicios: bloque.ejercicios.map((ej) => {
          const seriesArr = [];
          if (bloque.tipo === 'DESARROLLO') {
            const count = Number(ej.seriesCount) || 3;
            const reps = Number(ej.repsCount) || 10;
            for (let i = 1; i <= count; i++) {
              seriesArr.push({
                numeroSerie: i,
                repsRealizadas: reps,
              });
            }
          }

          let indicacion = ej.indicacionProfe?.trim();
          if (!indicacion && ej.seriesCount && ej.repsCount) {
            indicacion = `${ej.seriesCount} series de ${ej.repsCount} repeticiones.`;
          }

          return {
            nombre: ej.nombre?.trim() || 'Ejercicio sin nombre',
            indicacionProfe: indicacion,
            videoUrl: ej.videoUrl?.trim() || null,
            videoRecomendacion: ej.videoRecomendacion?.trim() || null,
            series: seriesArr,
          };
        }),
      }));

      return {
        nombre: dia.nombre?.trim() || `Día ${diaIdx + 1}: Sesión`,
        descripcion: dia.descripcion?.trim() || '',
        bloques: bloquesFormateados,
      };
    });

    try {
      await onSave({ dias: diasFormateados });
    } finally {
      dispatch({ type: 'SET_GUARDANDO', payload: false });
    }
  };

  const diaActivo = state.dias[state.diaActivoIndex] || state.dias[0];

  const getBloqueTitulo = (tipo) => {
    switch (tipo) {
      case 'MOVILIDAD':
        return {
          titulo: 'Bloque 1: MOVILIDAD',
          color: 'text-sky-400',
          bg: 'bg-sky-500/10',
          border: 'border-sky-500/30',
          badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        };
      case 'ACTIVACION':
        return {
          titulo: 'Bloque 2: ACTIVACIÓN',
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/30',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        };
      case 'DESARROLLO':
        return {
          titulo: 'Bloque 3: DESARROLLO',
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      default:
        return { titulo: tipo, color: 'text-white' };
    }
  };

  // PANTALLA DE CARGA DURANTE LA HIDRATACIÓN
  if (state.cargandoHidratacion) {
    return (
      <div className="py-16 text-center space-y-4 animate-fadeIn">
        <Loader2 className="w-10 h-10 animate-spin text-sky-400 mx-auto" />
        <div>
          <h3 className="text-base font-black text-white">
            Hidratando rutina actual de {alumno.nombre}...
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Consultando Supabase para pre-cargar todos los ejercicios, bloques y series existentes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* AVISO TOAST FLOTANTE */}
      {state.notificacion && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-sky-500 text-slate-950 px-4 py-2.5 rounded-2xl font-black text-xs shadow-2xl shadow-sky-500/40 animate-slideUp">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{state.notificacion}</span>
        </div>
      )}

      {/* CABECERA SUPERIOR DEL CONSTRUCTOR: ACCIONES RÁPIDAS Y TOGGLE DE SIDEBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Modo Editor
            </span>
            <span className="text-xs text-slate-400">
              Atleta: <strong className="text-white">{alumno.nombre} {alumno.apellido || ''}</strong>
            </span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            Editor de Rutina Semanal en 3 Bloques
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organiza los días en el pseudo-calendario, arrastra para reordenar o inyecta ejercicios desde la librería.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Botón Clonar Activo */}
          <button
            type="button"
            onClick={() => dispatch({ type: 'CLONAR_DIA' })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all"
            title="Duplica el día activo actual y añade un nuevo cuadrado al calendario"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Clonar Día Activo</span>
          </button>

          {/* Botón Toggle Sidebar */}
          <button
            type="button"
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              state.sidebarAbierto
                ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{state.sidebarAbierto ? 'Ocultar Librería' : 'Abrir Librería & Historial'}</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* REQUISITO 2: INTERFAZ TIPO "PSEUDO-CALENDARIO" (DRAG AND DROP) */}
      {/* ==================================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>Pseudo-Calendario de Días (Arrastra para reordenar)</span>
          </label>
          <span className="text-[11px] text-slate-500">
            {state.dias.length} {state.dias.length === 1 ? 'día planificado' : 'días planificados'}
          </span>
        </div>

        {/* CONTENEDOR CON DND-KIT */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-800">
            <SortableContext
              items={state.dias.map((d) => d.id)}
              strategy={horizontalListSortingStrategy}
            >
              {state.dias.map((dia, idx) => (
                <SortableDayCard
                  key={dia.id}
                  id={dia.id}
                  dia={dia}
                  index={idx}
                  isActive={state.diaActivoIndex === idx}
                  totalDias={state.dias.length}
                  onSelect={(selectedIdx) =>
                    dispatch({ type: 'SELECCIONAR_DIA', payload: selectedIdx })
                  }
                  onClone={(cloneIdx) =>
                    dispatch({ type: 'CLONAR_DIA', payload: cloneIdx })
                  }
                  onDelete={(deleteIdx) =>
                    dispatch({ type: 'ELIMINAR_DIA', payload: deleteIdx })
                  }
                />
              ))}
            </SortableContext>

            {/* BOTÓN CUADRADO PARA AÑADIR DÍA */}
            <button
              type="button"
              onClick={() => dispatch({ type: 'AGREGAR_DIA' })}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl p-4 border-2 border-dashed border-slate-700 hover:border-sky-500/60 bg-slate-900/30 hover:bg-slate-900/60 text-slate-400 hover:text-sky-400 transition-all aspect-square min-w-[130px] max-w-[160px] group"
              title="Añadir nuevo día al calendario"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-sky-500/20 flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-center">
                + Añadir Día
              </span>
            </button>
          </div>
        </DndContext>
      </div>

      {/* ==================================================================== */}
      {/* CUERPO PRINCIPAL: EDITOR DEL DÍA ACTIVO + SIDEBAR RETRÁCTIL */}
      {/* ==================================================================== */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO DEL DÍA ACTIVO */}
        <div className="flex-1 w-full space-y-6">
          
          {/* DETALLES DEL DÍA ACTIVO */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-300 mb-1 uppercase tracking-wider">
                  Nombre del Día ({state.diaActivoIndex + 1})
                </label>
                <input
                  type="text"
                  value={diaActivo.nombre}
                  onChange={(e) =>
                    dispatch({
                      type: 'ACTUALIZAR_DATOS_DIA',
                      payload: { campo: 'nombre', valor: e.target.value },
                    })
                  }
                  className="w-full bg-[#050912] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400"
                  placeholder="Ej: Día 1: Piernas & Fuerza Máxima"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 mb-1 uppercase tracking-wider">
                  Enfoque / Descripción del Día
                </label>
                <input
                  type="text"
                  value={diaActivo.descripcion}
                  onChange={(e) =>
                    dispatch({
                      type: 'ACTUALIZAR_DATOS_DIA',
                      payload: { campo: 'descripcion', valor: e.target.value },
                    })
                  }
                  className="w-full bg-[#050912] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400"
                  placeholder="Ej: Dominante de rodilla y activación neural"
                />
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* LOS 3 BLOQUES METODOLÓGICOS (MOVILIDAD, ACTIVACIÓN, DESARROLLO) */}
          {/* ============================================================== */}
          <div className="space-y-6">
            {diaActivo.bloques.map((bloque, bIdx) => {
              const estilo = getBloqueTitulo(bloque.tipo);
              const esBloqueActivo = state.bloqueActivoTipo === bloque.tipo;

              return (
                <div
                  key={bloque.tipo}
                  className={`rounded-2xl p-5 border transition-all ${
                    esBloqueActivo
                      ? `${estilo.border} ring-1 ${estilo.border} bg-[#081020]`
                      : 'border-slate-800/90 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  {/* CABECERA DEL BLOQUE */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${estilo.badge}`}>
                        {estilo.titulo}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        ({bloque.ejercicios.length} {bloque.ejercicios.length === 1 ? 'ejercicio' : 'ejercicios'})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Botón para fijar este bloque como destino de inyección */}
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: 'ESTABLECER_BLOQUE_ACTIVO',
                            payload: bloque.tipo,
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                          esBloqueActivo
                            ? 'bg-sky-500 text-slate-950 border-sky-400'
                            : 'bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                        }`}
                        title="Selecciona este bloque como destino al presionar + en la librería"
                      >
                        {esBloqueActivo ? '📍 Bloque de Inyección Activo' : 'Fijar para Inyección'}
                      </button>

                      {/* Botón para agregar ejercicio vacío */}
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: 'AGREGAR_EJERCICIO_VACIO',
                            payload: bIdx,
                          })
                        }
                        className="flex items-center gap-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir Vacío</span>
                      </button>
                    </div>
                  </div>

                  {/* LISTADO DE EJERCICIOS DEL BLOQUE */}
                  <div className="space-y-3">
                    {bloque.ejercicios.length === 0 ? (
                      <div className="p-6 text-center rounded-xl border border-dashed border-slate-800/80 text-xs text-slate-500 space-y-1">
                        <p>No hay ejercicios en este bloque.</p>
                        <p className="text-[11px] text-slate-600">
                          Añade uno en blanco con el botón superior o inyéctalo desde la <strong>Librería Global</strong>.
                        </p>
                      </div>
                    ) : (
                      bloque.ejercicios.map((ej, eIdx) => (
                        <div
                          key={ej.id || eIdx}
                          className="bg-[#050912] border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 relative group transition-all"
                        >
                          {/* BOTONES DE CONTROL DE FILA */}
                          <div className="absolute top-3 right-3 flex items-center gap-1">
                            {/* Mover Arriba / Abajo */}
                            {eIdx > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  dispatch({
                                    type: 'MOVER_EJERCICIO',
                                    payload: {
                                      bloqueIndex: bIdx,
                                      deIndex: eIdx,
                                      aIndex: eIdx - 1,
                                    },
                                  })
                                }
                                className="p-1 text-slate-500 hover:text-sky-400 rounded transition-colors"
                                title="Mover arriba"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {eIdx < bloque.ejercicios.length - 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  dispatch({
                                    type: 'MOVER_EJERCICIO',
                                    payload: {
                                      bloqueIndex: bIdx,
                                      deIndex: eIdx,
                                      aIndex: eIdx + 1,
                                    },
                                  })
                                }
                                className="p-1 text-slate-500 hover:text-sky-400 rounded transition-colors"
                                title="Mover abajo"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Eliminar Ejercicio */}
                            <button
                              type="button"
                              onClick={() =>
                                dispatch({
                                  type: 'ELIMINAR_EJERCICIO',
                                  payload: {
                                    bloqueIndex: bIdx,
                                    ejercicioIndex: eIdx,
                                  },
                                })
                              }
                              className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors ml-1"
                              title="Eliminar este ejercicio"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* CAMPOS DEL EJERCICIO */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pr-20">
                            {/* Nombre del Ejercicio */}
                            <div className="col-span-12 sm:col-span-6">
                              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                                Ejercicio #{eIdx + 1}
                              </label>
                              <input
                                type="text"
                                value={ej.nombre}
                                onChange={(e) =>
                                  dispatch({
                                    type: 'ACTUALIZAR_EJERCICIO',
                                    payload: {
                                      bloqueIndex: bIdx,
                                      ejercicioIndex: eIdx,
                                      campo: 'nombre',
                                      valor: e.target.value,
                                    },
                                  })
                                }
                                className="w-full bg-[#0c1527] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                                placeholder="Ej: Sentadilla Trasera con Barra"
                              />
                            </div>

                            {/* Series (relevante para Desarrollo) */}
                            <div className="col-span-6 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                                Series
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="15"
                                value={ej.seriesCount}
                                onChange={(e) =>
                                  dispatch({
                                    type: 'ACTUALIZAR_EJERCICIO',
                                    payload: {
                                      bloqueIndex: bIdx,
                                      ejercicioIndex: eIdx,
                                      campo: 'seriesCount',
                                      valor: e.target.value,
                                    },
                                  })
                                }
                                className="w-full bg-[#0c1527] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none text-center font-bold"
                              />
                            </div>

                            {/* Repeticiones */}
                            <div className="col-span-6 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                                Reps / Tiempo
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={ej.repsCount}
                                onChange={(e) =>
                                  dispatch({
                                    type: 'ACTUALIZAR_EJERCICIO',
                                    payload: {
                                      bloqueIndex: bIdx,
                                      ejercicioIndex: eIdx,
                                      campo: 'repsCount',
                                      valor: e.target.value,
                                    },
                                  })
                                }
                                className="w-full bg-[#0c1527] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none text-center font-bold"
                              />
                            </div>

                            {/* Botón Video */}
                            <div className="col-span-12 sm:col-span-2 flex items-end">
                              <button
                                type="button"
                                onClick={() =>
                                  dispatch({
                                    type: 'ACTUALIZAR_EJERCICIO',
                                    payload: {
                                      bloqueIndex: bIdx,
                                      ejercicioIndex: eIdx,
                                      campo: 'mostrarVideoInput',
                                      valor: !ej.mostrarVideoInput,
                                    },
                                  })
                                }
                                className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all border ${
                                  ej.videoUrl
                                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>{ej.videoUrl ? 'Video OK' : 'Añadir Video'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Indicaciones del Entrenador */}
                          <div className="mt-2.5">
                            <input
                              type="text"
                              value={ej.indicacionProfe}
                              onChange={(e) =>
                                dispatch({
                                  type: 'ACTUALIZAR_EJERCICIO',
                                  payload: {
                                    bloqueIndex: bIdx,
                                    ejercicioIndex: eIdx,
                                    campo: 'indicacionProfe',
                                    valor: e.target.value,
                                  },
                                })
                              }
                              className="w-full bg-transparent border-b border-slate-800 pb-1 text-xs text-slate-300 focus:outline-none focus:border-sky-400 placeholder-slate-600 transition-colors"
                              placeholder="Indicaciones técnicas (Ej: 3 series x 8 reps | RIR: 2 | Tempo 3010 | 2 min descanso)"
                            />
                          </div>

                          {/* Desplegable de Video y Recomendaciones */}
                          {ej.mostrarVideoInput && (
                            <div className="mt-3 p-3 rounded-xl bg-[#091222] border border-slate-700/60 space-y-2.5 animate-fadeIn">
                              <div className="flex items-center gap-2">
                                <PlayCircle className="w-4 h-4 text-sky-400 shrink-0" />
                                <input
                                  type="url"
                                  value={ej.videoUrl}
                                  onChange={(e) =>
                                    dispatch({
                                      type: 'ACTUALIZAR_EJERCICIO',
                                      payload: {
                                        bloqueIndex: bIdx,
                                        ejercicioIndex: eIdx,
                                        campo: 'videoUrl',
                                        valor: e.target.value,
                                      },
                                    })
                                  }
                                  className="w-full bg-[#050912] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-sky-400 focus:outline-none"
                                  placeholder="Enlace de video (YouTube, Drive o MP4): https://youtube.com/watch?v=..."
                                />
                              </div>

                              <textarea
                                value={ej.videoRecomendacion}
                                onChange={(e) =>
                                  dispatch({
                                    type: 'ACTUALIZAR_EJERCICIO',
                                    payload: {
                                      bloqueIndex: bIdx,
                                      ejercicioIndex: eIdx,
                                      campo: 'videoRecomendacion',
                                      valor: e.target.value,
                                    },
                                  })
                                }
                                className="w-full bg-[#050912] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none min-h-[55px]"
                                placeholder="Consejos técnicos que el alumno debe ver al mirar el video..."
                              />
                            </div>
                          )}

                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* BARRA INFERIOR DE GUARDADO Y CANCELAR */}
          <div className="pt-6 flex items-center justify-between gap-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="py-2.5 px-5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={state.guardando}
              onClick={handleGuardarRutina}
              className="py-3 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs shadow-xl shadow-sky-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {state.guardando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sincronizando con Supabase...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar {state.dias.length} Días y Asignar a {alumno.nombre}</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* ============================================================== */}
        {/* REQUISITO 3: SIDEBAR RETRÁCTIL DE HISTORIAL Y LIBRERÍA */}
        {/* ============================================================== */}
        <RoutineSidebar
          isOpen={state.sidebarAbierto}
          onToggle={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          bloqueActivoTipo={state.bloqueActivoTipo}
          onCambiarBloqueActivo={(nuevoBloque) =>
            dispatch({
              type: 'ESTABLECER_BLOQUE_ACTIVO',
              payload: nuevoBloque,
            })
          }
          diaActivoIndex={state.diaActivoIndex}
          diaActivoNombre={diaActivo.nombre}
          historialRutinas={state.historialRutinas}
          onInyectarEjercicio={(ejercicio, tipoBloqueDestino) =>
            dispatch({
              type: 'INYECTAR_EJERCICIO',
              payload: { ejercicio, tipoBloqueDestino },
            })
          }
          onImportarDiaCompleto={(sesion) =>
            dispatch({
              type: 'IMPORTAR_DIA_COMPLETO',
              payload: sesion,
            })
          }
        />

      </div>
    </div>
  );
}
