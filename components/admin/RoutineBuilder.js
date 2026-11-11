'use client';

/**
 * ========================================================================
 * COMPONENTE: Constructor de Rutinas (components/admin/RoutineBuilder.js)
 * ========================================================================
 * Módulo táctico de planificación de entrenamiento para Motion Lab.
 * Implementa un flujo desacoplado en dos vistas con navegación fluida y
 * diseño 100% responsive en móvil, tablet y desktop:
 *
 * 1. Vista Cuadrícula ('grid' - Dashboard de Días):
 *    - Pseudo-calendario responsive: móvil (1 col), tablet (3 cols),
 *      desktop grande (5 columnas fijas horizontales: lg:grid-cols-5).
 *    - Flujo multilínea automático al superar 5 días con espaciado constante.
 *    - Tarjeta "+ AÑADIR DÍA" como última posición del grid, con borde
 *      punteado y botón circular con icono "+".
 *    - Tarjetas de día con badge "DÍA X", indicador "✨ ACTIVO", drag grip,
 *      duplicación, eliminación, título, enfoque, contador de ejercicios e
 *      indicador de 3 puntos de bloques activos.
 *    - Al hacer click en cualquier día, conmuta el estado a 'editDay'.
 *
 * 2. Vista Edición de Día ('editDay' - Detalle del Día):
 *    - Header de navegación con botón prominente:
 *      `← Volver a la cuadrícula de días` (estilo cyan outline).
 *    - Formulario del día: Nombre y Enfoque/Descripción en 2 cols (desktop) y 1 col (móvil).
 *    - Listado de los 3 bloques metodológicos de Motion Lab:
 *      * Bloque 1: MOVILIDAD (Sky blue)
 *      * Bloque 2: ACTIVACIÓN (Cyan)
 *      * Bloque 3: FUERZA / DESARROLLO (Amber)
 *    - Cabecera limpia de bloque con título, contador y botón `+ Añadir Vacío`.
 *      (Sin referencias a inyección ni librerías laterales).
 *    - Input "Nombre del Ejercicio" con ExerciseCombobox (Autocomplete Creatable)
 *      con filtrado reactivo letra por letra, resaltado en cyan, sugerencias frecuentes
 *      y creación libre de nuevos ejercicios persistidos en memoria.
 *    - Fila de ejercicio fluida y adaptable en móvil (`flex flex-wrap sm:flex-nowrap`).
 */

import { useState, useMemo, useCallback } from 'react';
import { 
  Calendar, Plus, Trash2, Copy, GripVertical, ArrowLeft, 
  Dumbbell, Sparkles, Video, PlayCircle, Save
} from 'lucide-react';
import { LIBRERIA_EJERCICIOS } from '@/lib/exercisesLibrary';
import ExerciseCombobox from './ExerciseCombobox';

// ========================================================================
// CATÁLOGO DE RESPALDO (Por si la biblioteca externa no cargara)
// ========================================================================
const CATALOGO_FALLBACK = [
  {
    id: 'fb-mov-1',
    nombre: '90/90 Hip Flow & Movilidad Articular',
    tipoBloque: 'MOVILIDAD',
    categoria: 'Cadera & Tobillo',
    seriesDefault: 2,
    repsDefault: 8,
    indicacionDefault: '2 series x 8 transiciones controladas con torso erguido.',
    videoUrl: '',
    videoRecomendacion: 'Foco en rotación interna y externa progresiva de cadera.',
  },
  {
    id: 'fb-act-1',
    nombre: 'Plancha Copenhague + Core Antirrotacional',
    tipoBloque: 'ACTIVACION',
    categoria: 'Core & Estabilidad',
    seriesDefault: 3,
    repsDefault: 20,
    indicacionDefault: '3 series x 20 segundos por lado. Pelvis alineada con hombros.',
    videoUrl: '',
    videoRecomendacion: 'Evitar compensar con la columna lumbar.',
  },
  {
    id: 'fb-des-1',
    nombre: 'Sentadilla Trasera con Barra (Back Squat)',
    tipoBloque: 'DESARROLLO',
    categoria: 'Tren Inferior',
    seriesDefault: 4,
    repsDefault: 6,
    indicacionDefault: '4 series x 6 reps | RIR Objetivo: 2 | Tempo 3010 | 2.5 min descanso.',
    videoUrl: '',
    videoRecomendacion: 'Presión constante en trípode plantar y descenso controlado.',
  }
];

export default function RoutineBuilder({ 
  alumno = { nombre: 'Alumno' }, 
  initialDias = null, 
  onCancel = () => {}, 
  onSave = () => {} 
}) {
  // ------------------------------------------------------------------------
  // 1. SELECTOR DE VISTA CON ESTADO LOCAL ('grid' | 'editDay')
  // ------------------------------------------------------------------------
  const [currentView, setCurrentView] = useState('grid');
  const [diaActivoIndex, setDiaActivoIndex] = useState(0);

  // ------------------------------------------------------------------------
  // 2. ESTADO PRINCIPAL DE LOS DÍAS Y SUS 3 BLOQUES METODOLÓGICOS
  // ------------------------------------------------------------------------
  const [dias, setDias] = useState(() => {
    if (initialDias && Array.isArray(initialDias) && initialDias.length > 0) {
      return initialDias.map((d, idx) => ({
        id: d.id || crypto.randomUUID(),
        nombre: d.nombre || `Día ${idx + 1}: Entrenamiento`,
        descripcion: d.descripcion || d.enfoque || '',
        bloques: d.bloques && d.bloques.length === 3 ? d.bloques : [
          { tipo: 'MOVILIDAD', orden: 1, ejercicios: [] },
          { tipo: 'ACTIVACION', orden: 2, ejercicios: [] },
          { tipo: 'DESARROLLO', orden: 3, ejercicios: [] },
        ]
      }));
    }

    return [
      {
        id: crypto.randomUUID(),
        nombre: 'Día 1: Entrenamiento',
        descripcion: '',
        bloques: [
          { tipo: 'MOVILIDAD', orden: 1, ejercicios: [] },
          { tipo: 'ACTIVACION', orden: 2, ejercicios: [] },
          { tipo: 'DESARROLLO', orden: 3, ejercicios: [] },
        ]
      },
      {
        id: crypto.randomUUID(),
        nombre: 'Día 2: Entrenamiento',
        descripcion: '',
        bloques: [
          { tipo: 'MOVILIDAD', orden: 1, ejercicios: [] },
          { tipo: 'ACTIVACION', orden: 2, ejercicios: [] },
          { tipo: 'DESARROLLO', orden: 3, ejercicios: [] },
        ]
      },
      {
        id: crypto.randomUUID(),
        nombre: 'Día 3: Entrenamiento',
        descripcion: '',
        bloques: [
          { tipo: 'MOVILIDAD', orden: 1, ejercicios: [] },
          { tipo: 'ACTIVACION', orden: 2, ejercicios: [] },
          { tipo: 'DESARROLLO', orden: 3, ejercicios: [] },
        ]
      }
    ];
  });

  // ------------------------------------------------------------------------
  // 3. HISTORIAL DE EJERCICIOS PERSONALIZADOS EN MEMORIA (CREATABLE COMBOBOX)
  // ------------------------------------------------------------------------
  const [historialCustom, setHistorialCustom] = useState([]);

  // ------------------------------------------------------------------------
  // 4. ESTADOS DE ARRASTRE Y GUARDADO
  // ------------------------------------------------------------------------
  const [draggedDayIndex, setDraggedDayIndex] = useState(null);
  const [draggedExercise, setDraggedExercise] = useState(null); // { bIdx, eIdx }
  const [guardando, setGuardando] = useState(false);

  // Día activo seleccionado actualmente
  const diaActivo = dias[diaActivoIndex] || dias[0] || {
    nombre: 'Día 1: Entrenamiento',
    descripcion: '',
    bloques: [
      { tipo: 'MOVILIDAD', orden: 1, ejercicios: [] },
      { tipo: 'ACTIVACION', orden: 2, ejercicios: [] },
      { tipo: 'DESARROLLO', orden: 3, ejercicios: [] },
    ]
  };

  // Catálogo completo de ejercicios unificado
  const catalogoEjercicios = useMemo(() => {
    if (Array.isArray(LIBRERIA_EJERCICIOS) && LIBRERIA_EJERCICIOS.length > 0) {
      return LIBRERIA_EJERCICIOS;
    }
    return CATALOGO_FALLBACK;
  }, []);

  // Historial global unificado para el Combobox: ejercicios predefinidos + personalizados creados en sesión
  const historialEjerciciosTotal = useMemo(() => {
    const nombresUnicos = new Set();
    const resultado = [];

    // Priorizar los ejercicios personalizados creados en esta sesión
    for (const item of historialCustom) {
      const nombreNorm = (item.nombre || '').toLowerCase().trim();
      if (nombreNorm && !nombresUnicos.has(nombreNorm)) {
        nombresUnicos.add(nombreNorm);
        resultado.push(item);
      }
    }

    // Agregar también los ejercicios que ya estén escritos en los días actuales
    for (const d of dias) {
      for (const b of d.bloques || []) {
        for (const ej of b.ejercicios || []) {
          const nombreNorm = (ej.nombre || '').toLowerCase().trim();
          if (nombreNorm && !nombresUnicos.has(nombreNorm)) {
            nombresUnicos.add(nombreNorm);
            resultado.push({
              id: ej.id || crypto.randomUUID(),
              nombre: ej.nombre,
              tipoBloque: b.tipo,
              categoria: 'En Rutina',
              seriesDefault: ej.seriesCount || 3,
              repsDefault: ej.repsCount || 10,
              indicacionDefault: ej.indicacionProfe || '',
              videoUrl: ej.videoUrl || '',
              videoRecomendacion: ej.videoRecomendacion || '',
            });
          }
        }
      }
    }

    // Añadir el catálogo oficial
    for (const item of catalogoEjercicios) {
      const nombreNorm = (item.nombre || '').toLowerCase().trim();
      if (nombreNorm && !nombresUnicos.has(nombreNorm)) {
        nombresUnicos.add(nombreNorm);
        resultado.push(item);
      }
    }

    return resultado;
  }, [historialCustom, dias, catalogoEjercicios]);

  // Metadatos y colores temáticos por bloque
  const getBloqueEstilo = (tipo) => {
    switch (tipo) {
      case 'MOVILIDAD':
        return {
          titulo: 'BLOQUE 1: MOVILIDAD',
          color: 'text-sky-400',
          badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
          border: 'border-sky-500/30',
        };
      case 'ACTIVACION':
        return {
          titulo: 'BLOQUE 2: ACTIVACIÓN',
          color: 'text-cyan-400',
          badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
          border: 'border-cyan-500/30',
        };
      case 'DESARROLLO':
      default:
        return {
          titulo: 'BLOQUE 3: FUERZA / DESARROLLO',
          color: 'text-amber-400',
          badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
          border: 'border-amber-500/30',
        };
    }
  };

  // ------------------------------------------------------------------------
  // ACCIONES SOBRE DÍAS
  // ------------------------------------------------------------------------
  const agregarDia = () => {
    const nuevoNumero = dias.length + 1;
    const nuevoDia = {
      id: crypto.randomUUID(),
      nombre: `Día ${nuevoNumero}: Entrenamiento`,
      descripcion: '',
      bloques: [
        { tipo: 'MOVILIDAD', orden: 1, ejercicios: [] },
        { tipo: 'ACTIVACION', orden: 2, ejercicios: [] },
        { tipo: 'DESARROLLO', orden: 3, ejercicios: [] },
      ]
    };
    setDias((prev) => [...prev, nuevoDia]);
    setDiaActivoIndex(dias.length);
    setCurrentView('editDay');
  };

  const eliminarDia = (e, index) => {
    e.stopPropagation();
    if (dias.length <= 1) return;
    setDias((prev) => {
      const nuevoArr = prev.filter((_, idx) => idx !== index);
      return nuevoArr;
    });
    if (diaActivoIndex >= dias.length - 1) {
      setDiaActivoIndex(Math.max(0, dias.length - 2));
    }
  };

  const duplicarDia = (e, index) => {
    e.stopPropagation();
    const diaOriginal = dias[index];
    const diaClonado = {
      ...JSON.parse(JSON.stringify(diaOriginal)),
      id: crypto.randomUUID(),
      nombre: `${diaOriginal.nombre} (Copia)`,
    };
    setDias((prev) => {
      const copia = [...prev];
      copia.splice(index + 1, 0, diaClonado);
      return copia;
    });
  };

  const updateDiaCampo = (campo, valor) => {
    setDias((prev) => {
      const copia = [...prev];
      copia[diaActivoIndex][campo] = valor;
      return copia;
    });
  };

  const seleccionarDiaYEditar = (index) => {
    setDiaActivoIndex(index);
    setCurrentView('editDay');
  };

  // ------------------------------------------------------------------------
  // DRAG AND DROP NATIVO PARA REORDENAR DÍAS EN LA CUADRÍCULA
  // ------------------------------------------------------------------------
  const handleDragStartDay = (e, index) => {
    setDraggedDayIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverDay = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropDay = (e, targetIndex) => {
    e.preventDefault();
    if (draggedDayIndex === null || draggedDayIndex === targetIndex) return;

    setDias((prev) => {
      const copia = [...prev];
      const [diaMovido] = copia.splice(draggedDayIndex, 1);
      copia.splice(targetIndex, 0, diaMovido);
      return copia;
    });

    setDiaActivoIndex(targetIndex);
    setDraggedDayIndex(null);
  };

  // ------------------------------------------------------------------------
  // ACCIONES SOBRE EJERCICIOS Y BLOQUES
  // ------------------------------------------------------------------------
  const agregarEjercicioVacio = (bloqueIndex) => {
    setDias((prev) => {
      const copia = [...prev];
      copia[diaActivoIndex].bloques[bloqueIndex].ejercicios.push({
        id: crypto.randomUUID(),
        nombre: '',
        seriesCount: bloqueIndex === 2 ? 3 : 2,
        repsCount: 10,
        indicacionProfe: '',
        videoUrl: '',
        videoRecomendacion: '',
        mostrarVideoInput: false,
      });
      return copia;
    });
  };

  const eliminarEjercicio = (bloqueIndex, ejIndex) => {
    setDias((prev) => {
      const copia = [...prev];
      copia[diaActivoIndex].bloques[bloqueIndex].ejercicios.splice(ejIndex, 1);
      return copia;
    });
  };

  const duplicarEjercicio = (bloqueIndex, ejIndex) => {
    setDias((prev) => {
      const copia = [...prev];
      const ejOriginal = copia[diaActivoIndex].bloques[bloqueIndex].ejercicios[ejIndex];
      const clon = {
        ...ejOriginal,
        id: crypto.randomUUID(),
        nombre: `${ejOriginal.nombre || 'Ejercicio'} (Copia)`,
      };
      copia[diaActivoIndex].bloques[bloqueIndex].ejercicios.splice(ejIndex + 1, 0, clon);
      return copia;
    });
  };

  const updateEjercicio = (bloqueIndex, ejIndex, campo, valor) => {
    setDias((prev) => {
      const copia = [...prev];
      copia[diaActivoIndex].bloques[bloqueIndex].ejercicios[ejIndex][campo] = valor;
      return copia;
    });
  };

  // Drag and drop para reordenar ejercicios dentro de un bloque
  const handleDragStartExercise = (e, bIdx, eIdx) => {
    setDraggedExercise({ bIdx, eIdx });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropExercise = (e, targetBIdx, targetEIdx) => {
    e.preventDefault();
    if (!draggedExercise || draggedExercise.bIdx !== targetBIdx || draggedExercise.eIdx === targetEIdx) {
      return;
    }

    setDias((prev) => {
      const copia = [...prev];
      const listaEjercicios = copia[diaActivoIndex].bloques[targetBIdx].ejercicios;
      const [ejMovido] = listaEjercicios.splice(draggedExercise.eIdx, 1);
      listaEjercicios.splice(targetEIdx, 0, ejMovido);
      return copia;
    });

    setDraggedExercise(null);
  };

  // ------------------------------------------------------------------------
  // GUARDAR PLANIFICACIÓN COMPLETA
  // ------------------------------------------------------------------------
  const handleGuardarFinal = async () => {
    setGuardando(true);
    try {
      const diasFormateados = dias.map((dia) => {
        const bloquesFormateados = dia.bloques.map((bloque) => ({
          tipo: bloque.tipo,
          orden: bloque.orden,
          ejercicios: (bloque.ejercicios || []).map((ej) => {
            const seriesArr = [];
            if (bloque.tipo === 'DESARROLLO') {
              for (let i = 1; i <= (Number(ej.seriesCount) || 1); i++) {
                seriesArr.push({
                  numero: i,
                  reps: Number(ej.repsCount) || 10,
                  peso: 0,
                  rir: 2,
                });
              }
            }

            return {
              nombre: ej.nombre?.trim() || 'Ejercicio General',
              series: seriesArr,
              indicacionProfe: ej.indicacionProfe || '',
              videoUrl: ej.videoUrl || '',
              videoRecomendacion: ej.videoRecomendacion || '',
            };
          }),
        }));

        return {
          nombre: dia.nombre?.trim() || 'Día de Entrenamiento',
          descripcion: dia.descripcion?.trim() || '',
          bloques: bloquesFormateados,
        };
      });

      await onSave({ dias: diasFormateados });
    } catch (err) {
      console.error('Error al guardar la rutina armada:', err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="w-full text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 relative">

      {/* ==================================================================== */}
      {/* VISTA 1: VISTA CUADRÍCULA (DASHBOARD DE DÍAS / PSEUDO-CALENDARIO)    */}
      {/* ==================================================================== */}
      {currentView === 'grid' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* HEADER DEL PSEUDO-CALENDARIO */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400 shrink-0" />
                <h2 className="text-base sm:text-lg font-black tracking-tight uppercase text-white flex items-center gap-2">
                  <span>PSEUDO-CALENDARIO DE DÍAS (ARRASTRA PARA REORDENAR)</span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Haz click en cualquier tarjeta para abrir la edición exclusiva de sus bloques y ejercicios.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              <span className="text-xs font-bold text-slate-400 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                {dias.length} {dias.length === 1 ? 'día planificado' : 'días planificados'}
              </span>
            </div>
          </div>

          {/* CUADRÍCULA RESPONSIVE DE DÍAS (1 MÓVIL, 3 TABLET, 5 COLUMNAS FIJAS EN DESKTOP) */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5"
            style={{ minHeight: '220px' }}
          >
            {dias.map((dia, idx) => {
              const esActivo = diaActivoIndex === idx;
              const totalEjsDia = (dia.bloques || []).reduce(
                (acc, b) => acc + (b.ejercicios?.length || 0), 
                0
              );
              
              // Estado de llenado de cada uno de los 3 bloques
              const tieneMovilidad = (dia.bloques?.[0]?.ejercicios?.length || 0) > 0;
              const tieneActivacion = (dia.bloques?.[1]?.ejercicios?.length || 0) > 0;
              const tieneDesarrollo = (dia.bloques?.[2]?.ejercicios?.length || 0) > 0;

              return (
                <div
                  key={dia.id}
                  draggable
                  onDragStart={(e) => handleDragStartDay(e, idx)}
                  onDragOver={handleDragOverDay}
                  onDrop={(e) => handleDropDay(e, idx)}
                  onClick={() => seleccionarDiaYEditar(idx)}
                  className={`relative group rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-[210px] sm:min-h-[230px] transition-all duration-200 cursor-pointer border select-none ${
                    esActivo
                      ? 'bg-[#121a2d] border-cyan-400 shadow-xl shadow-cyan-500/15 ring-1 ring-cyan-400'
                      : 'bg-[#121a2d] hover:bg-[#18223a] border-slate-800 hover:border-cyan-500/50 hover:-translate-y-1 shadow-lg'
                  }`}
                >
                  {/* BADGE SUPERIOR FLOTANTE DE ACTIVO */}
                  {esActivo && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md shadow-cyan-400/30">
                      <Sparkles className="w-3 h-3 fill-slate-950 text-slate-950" />
                      <span>ACTIVO</span>
                    </div>
                  )}

                  {/* PARTE SUPERIOR DE LA TARJETA */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-3">
                      {/* Grip icon + Badge DÍA X */}
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing transition-colors"
                          title="Arrastra para reordenar"
                        >
                          <GripVertical className="w-4 h-4" />
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700/80 text-[11px] font-black text-cyan-300 tracking-wider uppercase">
                          DÍA {idx + 1}
                        </span>
                      </div>

                      {/* Botones de duplicar y eliminar */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => duplicarDia(e, idx)}
                          className="p-1 rounded-md text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                          title="Duplicar este día completo"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {dias.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => eliminarDia(e, idx)}
                            className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                            title="Eliminar este día"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* TÍTULO Y ENFOQUE */}
                    <h3 className="font-black text-sm text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                      {dia.nombre || `Día ${idx + 1}: Entrenamiento`}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {dia.descripcion || 'Sin enfoque definido'}
                    </p>
                  </div>

                  {/* PARTE INFERIOR: INDICADORES DE BLOQUE Y CONTEO */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-4">
                    {/* Indicador de 3 puntos (Movilidad, Activación, Desarrollo) */}
                    <div className="flex items-center gap-1.5" title="Bloque 1: Movilidad (Azul), Bloque 2: Activación (Cian), Bloque 3: Desarrollo (Ámbar)">
                      <span className={`w-2 h-2 rounded-full transition-all ${tieneMovilidad ? 'bg-sky-400 ring-2 ring-sky-400/30' : 'bg-slate-700'}`} />
                      <span className={`w-2 h-2 rounded-full transition-all ${tieneActivacion ? 'bg-cyan-400 ring-2 ring-cyan-400/30' : 'bg-slate-700'}`} />
                      <span className={`w-2 h-2 rounded-full transition-all ${tieneDesarrollo ? 'bg-amber-400 ring-2 ring-amber-400/30' : 'bg-slate-700'}`} />
                    </div>

                    {/* Contador de ejercicios */}
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                      <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{totalEjsDia} {totalEjsDia === 1 ? 'ej' : 'ejs'}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* BOTÓN / TARJETA "+ AÑADIR DÍA": ÚLTIMA POSICIÓN DENTRO DEL MISMO GRID */}
            <div
              onClick={agregarDia}
              className="rounded-2xl border-2 border-dashed border-slate-700/80 hover:border-cyan-400 bg-slate-900/30 hover:bg-cyan-500/5 min-h-[210px] sm:min-h-[230px] p-5 flex flex-col items-center justify-center transition-all duration-200 group cursor-pointer select-none"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800/90 group-hover:bg-cyan-400 group-hover:text-slate-950 text-cyan-400 flex items-center justify-center transition-all shadow-md group-hover:scale-110">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 group-hover:text-cyan-300 mt-3 transition-colors">
                + AÑADIR DÍA
              </span>
            </div>

          </div>

          {/* BOTONERA INFERIOR EN VISTA CUADRÍCULA */}
          <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={guardando}
              onClick={handleGuardarFinal}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {guardando ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Guardando Planificación...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar {dias.length} Días y Asignar a {alumno?.nombre || 'Alumno'}</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* VISTA 2: EDICIÓN DE DÍA (DETALLE EXCLUSIVO DEL DÍA SELECCIONADO)      */}
      {/* ==================================================================== */}
      {currentView === 'editDay' && (
        <div className="space-y-6 animate-fadeIn">

          {/* HEADER DE NAVEGACIÓN OBLIGATORIO */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            
            {/* BOTÓN PROMINENTE: ← VOLVER A LA CUADRÍCULA DE DÍAS */}
            <button
              type="button"
              onClick={() => setCurrentView('grid')}
              className="hover:bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-xl px-4 py-2 font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-all shadow-sm shadow-cyan-500/10 self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la cuadrícula de días</span>
            </button>

            {/* SELECTOR RÁPIDO ENTRE DÍAS */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start sm:self-center">
              {dias.map((d, i) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDiaActivoIndex(i)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    diaActivoIndex === i
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Día {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* FORMULARIO DEL DÍA (2 COLUMNAS EN DESKTOP, 1 EN MÓVIL) */}
          <div className="bg-[#0d1527] border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* NOMBRE DEL DÍA */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  NOMBRE DEL DÍA ({diaActivoIndex + 1})
                </label>
                <input
                  type="text"
                  value={diaActivo.nombre}
                  onChange={(e) => updateDiaCampo('nombre', e.target.value)}
                  placeholder="Ej: Día 1: Entrenamiento"
                  className="w-full bg-[#080d19] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white font-bold placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>

              {/* ENFOQUE / DESCRIPCIÓN DEL DÍA */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  ENFOQUE / DESCRIPCIÓN DEL DÍA
                </label>
                <input
                  type="text"
                  value={diaActivo.descripcion}
                  onChange={(e) => updateDiaCampo('descripcion', e.target.value)}
                  placeholder="Ej: Dominante de rodilla y activación neural"
                  className="w-full bg-[#080d19] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>

            </div>
          </div>

          {/* LISTADO DE LOS 3 BLOQUES DE ENTRENAMIENTO */}
          <div className="space-y-6">
            {diaActivo.bloques.map((bloque, bIdx) => {
              const estilo = getBloqueEstilo(bloque.tipo);

              return (
                <div 
                  key={bloque.tipo}
                  className="rounded-2xl p-5 border border-slate-800 bg-[#0d1527] transition-all duration-200"
                >
                  
                  {/* CABECERA DEL BLOQUE LIMPIA: Título con contador a la izquierda, botón único a la derecha */}
                  <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800/80">
                    
                    {/* Badge y nombre del bloque con contador */}
                    <div className="flex items-center gap-2.5">
                      <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${estilo.badgeBg}`}>
                        {estilo.titulo}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        ({bloque.ejercicios.length} {bloque.ejercicios.length === 1 ? 'ejercicio' : 'ejercicios'})
                      </span>
                    </div>

                    {/* Botón único a la derecha: + Añadir Vacío */}
                    <button
                      type="button"
                      onClick={() => agregarEjercicioVacio(bIdx)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#121c32] hover:bg-slate-800 text-cyan-300 border border-slate-700/80 hover:border-cyan-500/50 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />
                      <span>+ Añadir Vacío</span>
                    </button>

                  </div>

                  {/* CONTENIDO DEL BLOQUE */}
                  <div>
                    {bloque.ejercicios.length === 0 ? (
                      /* ESTADO VACÍO ESTILIZADO CON BORDE PUNTEADO */
                      <div className="border-2 border-dashed border-slate-700/60 rounded-xl p-8 text-center bg-[#090f1e]/40 space-y-3">
                        <p className="text-xs sm:text-sm font-semibold text-slate-400">
                          No hay ejercicios en este bloque.
                        </p>
                        <button
                          type="button"
                          onClick={() => agregarEjercicioVacio(bIdx)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#121c32] hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />
                          <span>+ Añadir Vacío</span>
                        </button>
                      </div>
                    ) : (
                      /* LISTADO DE EJERCICIOS DEL BLOQUE CON EXERCISE COMBOBOX */
                      <div className="space-y-3">
                        {bloque.ejercicios.map((ej, eIdx) => (
                          <div 
                            key={ej.id || eIdx}
                            draggable
                            onDragStart={(e) => handleDragStartExercise(e, bIdx, eIdx)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDropExercise(e, bIdx, eIdx)}
                            className="bg-[#090f1f] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-colors relative group"
                          >
                            <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
                              
                              {/* Drag handle + Número de ejercicio */}
                              <div className="flex items-center gap-2 shrink-0">
                                <span 
                                  className="text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing p-1"
                                  title="Arrastra para reordenar ejercicios"
                                >
                                  <GripVertical className="w-4 h-4" />
                                </span>
                                <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                                  {eIdx + 1}
                                </span>
                              </div>

                              {/* Nombre del ejercicio con COMBOBOX (Autocomplete Creatable) */}
                              <div className="flex-1 min-w-[220px] w-full sm:w-auto">
                                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                                  Nombre del ejercicio
                                </label>
                                <ExerciseCombobox
                                  value={ej.nombre}
                                  bloqueTipo={bloque.tipo}
                                  historialEjercicios={historialEjerciciosTotal}
                                  placeholder="Pre..."
                                  onChange={(nuevoNombre, datosExtra) => {
                                    updateEjercicio(bIdx, eIdx, 'nombre', nuevoNombre);
                                    if (datosExtra) {
                                      if (!ej.indicacionProfe && datosExtra.indicacionDefault) {
                                        updateEjercicio(bIdx, eIdx, 'indicacionProfe', datosExtra.indicacionDefault);
                                      }
                                      if (!ej.videoUrl && datosExtra.videoUrl) {
                                        updateEjercicio(bIdx, eIdx, 'videoUrl', datosExtra.videoUrl);
                                        updateEjercicio(bIdx, eIdx, 'mostrarVideoInput', true);
                                      }
                                      if (!ej.videoRecomendacion && datosExtra.videoRecomendacion) {
                                        updateEjercicio(bIdx, eIdx, 'videoRecomendacion', datosExtra.videoRecomendacion);
                                      }
                                      if (datosExtra.seriesDefault && (!ej.seriesCount || ej.seriesCount === 3)) {
                                        updateEjercicio(bIdx, eIdx, 'seriesCount', datosExtra.seriesDefault);
                                      }
                                      if (datosExtra.repsDefault && (!ej.repsCount || ej.repsCount === 10)) {
                                        updateEjercicio(bIdx, eIdx, 'repsCount', datosExtra.repsDefault);
                                      }
                                    }
                                  }}
                                  onRegistrarNuevo={(nuevoItem) => {
                                    setHistorialCustom((prev) => [nuevoItem, ...prev]);
                                  }}
                                />
                              </div>

                              {/* Parámetros: Series, Reps, Video y Acciones */}
                              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                                
                                {/* SERIES */}
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-extrabold uppercase text-slate-400">SERIES:</span>
                                  <input
                                    type="number"
                                    min="1"
                                    value={ej.seriesCount}
                                    onChange={(e) => updateEjercicio(bIdx, eIdx, 'seriesCount', e.target.value)}
                                    className="w-14 bg-[#0a101d] border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs font-bold text-center text-cyan-300 focus:outline-none focus:border-cyan-400"
                                  />
                                </div>

                                {/* REPS */}
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-extrabold uppercase text-slate-400">REPS:</span>
                                  <input
                                    type="number"
                                    min="1"
                                    value={ej.repsCount}
                                    onChange={(e) => updateEjercicio(bIdx, eIdx, 'repsCount', e.target.value)}
                                    className="w-14 bg-[#0a101d] border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs font-bold text-center text-white focus:outline-none focus:border-cyan-400"
                                  />
                                </div>

                                {/* BOTÓN VIDEO */}
                                <button
                                  type="button"
                                  onClick={() => updateEjercicio(bIdx, eIdx, 'mostrarVideoInput', !ej.mostrarVideoInput)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    ej.videoUrl
                                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                                      : 'bg-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                  title="Añadir enlace de video explicativo y notas técnicas"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  <span>{ej.videoUrl ? 'Video ✓' : 'Video'}</span>
                                </button>

                                {/* DUPLICAR */}
                                <button
                                  type="button"
                                  onClick={() => duplicarEjercicio(bIdx, eIdx)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                                  title="Duplicar ejercicio"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                {/* ELIMINAR */}
                                <button
                                  type="button"
                                  onClick={() => eliminarEjercicio(bIdx, eIdx)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                                  title="Eliminar ejercicio"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                            </div>

                            {/* Campo de indicación técnica rápida */}
                            <div className="mt-2.5 pl-0 sm:pl-8">
                              <input
                                type="text"
                                value={ej.indicacionProfe}
                                onChange={(e) => updateEjercicio(bIdx, eIdx, 'indicacionProfe', e.target.value)}
                                placeholder="Indicación del entrenador (Ej: RIR 2, Tempo 3010, Pausa 2 min...)"
                                className="w-full bg-transparent border-b border-slate-800 pb-1 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
                              />
                            </div>

                            {/* Panel desplegable de Video */}
                            {ej.mostrarVideoInput && (
                              <div className="mt-3 pl-0 sm:pl-8 space-y-2 p-3 rounded-xl bg-[#060b16] border border-slate-800 animate-fadeIn">
                                <div className="flex items-center gap-2">
                                  <PlayCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                                  <input
                                    type="url"
                                    value={ej.videoUrl}
                                    onChange={(e) => updateEjercicio(bIdx, eIdx, 'videoUrl', e.target.value)}
                                    placeholder="Enlace de video (YouTube o MP4: https://youtube.com/watch?v=...)"
                                    className="w-full bg-[#0a101f] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                                  />
                                </div>
                                <textarea
                                  value={ej.videoRecomendacion}
                                  onChange={(e) => updateEjercicio(bIdx, eIdx, 'videoRecomendacion', e.target.value)}
                                  placeholder="Recomendaciones clave a tener en cuenta al ejecutar o ver el video..."
                                  rows={2}
                                  className="w-full bg-[#0a101f] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 resize-none"
                                />
                              </div>
                            )}

                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* BOTONERA INFERIOR EN VISTA EDICIÓN DE DÍA */}
          <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentView('grid')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Cuadrícula</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={guardando}
                onClick={handleGuardarFinal}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {guardando ? (
                  <span>Guardando...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar y Asignar</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
