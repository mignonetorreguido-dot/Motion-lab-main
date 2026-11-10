'use client';

/**
 * ========================================================================
 * COMPONENTE: Tarjeta Cuadrada de Día (SortableDayCard.js)
 * ========================================================================
 * Interfaz tipo "Pseudo-Calendario" con soporte de Drag-and-Drop (@dnd-kit).
 * Los días son independientes de los días de la semana (Día 1, Día 2, etc.).
 * Permite mantener presionado para arrastrar y reordenar la rutina completa,
 * o seleccionar con un clic para editar su contenido.
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Copy, Trash2, Dumbbell, Sparkles } from 'lucide-react';

export default function SortableDayCard({
  id,
  dia,
  index,
  isActive,
  totalDias,
  onSelect,
  onClone,
  onDelete,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const totalEjercicios = (dia.bloques || []).reduce(
    (acc, b) => acc + (b.ejercicios?.length || 0),
    0
  );

  const tieneMovilidad = dia.bloques?.find((b) => b.tipo === 'MOVILIDAD')?.ejercicios?.length > 0;
  const tieneActivacion = dia.bloques?.find((b) => b.tipo === 'ACTIVACION')?.ejercicios?.length > 0;
  const tieneDesarrollo = dia.bloques?.find((b) => b.tipo === 'DESARROLLO')?.ejercicios?.length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(index)}
      className={`relative group rounded-2xl p-3 flex flex-col justify-between select-none cursor-pointer transition-all duration-200 aspect-square min-w-[130px] max-w-[160px] border text-left ${
        isActive
          ? 'bg-gradient-to-br from-[#0c1c38] via-slate-900 to-[#071328] border-sky-400 ring-2 ring-sky-400/80 shadow-xl shadow-sky-500/20 text-white scale-[1.02]'
          : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 text-slate-300'
      } ${isDragging ? 'shadow-2xl ring-2 ring-amber-400 rotate-1' : ''}`}
    >
      {/* CABECERA DE LA TARJETA */}
      <div className="flex items-center justify-between w-full">
        {/* DRAG HANDLE */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-1 -ml-1 text-slate-500 hover:text-sky-400 cursor-grab active:cursor-grabbing rounded transition-colors touch-none"
          title="Mantén presionado para arrastrar y reordenar este día"
          aria-label="Reordenar día"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* ETIQUETA / NÚMERO DE DÍA */}
        <span
          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            isActive
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          Día {index + 1}
        </span>

        {/* BOTONES RÁPIDOS DE ACCIÓN */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClone(index);
            }}
            className="p-1 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-800 transition-colors"
            title="Clonar este día completo"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {totalDias > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(index);
              }}
              className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
              title="Eliminar este día"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* CUERPO CENTRAL DE LA TARJETA */}
      <div className="my-1.5 overflow-hidden">
        <h4 className="text-xs font-black truncate text-white leading-snug">
          {dia.nombre || `Día ${index + 1}`}
        </h4>
        <p className="text-[10px] text-slate-400 truncate mt-0.5">
          {dia.descripcion || 'Sin enfoque definido'}
        </p>
      </div>

      {/* PIE DE LA TARJETA: INDICADORES METODOLÓGICOS Y CONTEO */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        {/* Puntos de bloques activos (Movilidad, Activación, Desarrollo) */}
        <div className="flex items-center gap-1" title="Bloques activos: Movilidad (Celeste), Activación (Cian), Desarrollo (Ámbar)">
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              tieneMovilidad ? 'bg-sky-400 shadow-sm shadow-sky-400/50' : 'bg-slate-800'
            }`}
          />
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              tieneActivacion ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' : 'bg-slate-800'
            }`}
          />
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              tieneDesarrollo ? 'bg-amber-400 shadow-sm shadow-amber-400/50' : 'bg-slate-800'
            }`}
          />
        </div>

        {/* Conteo de ejercicios */}
        <span
          className={`text-[10px] font-bold flex items-center gap-1 px-1.5 py-0.5 rounded ${
            isActive ? 'text-sky-300 bg-sky-950/60' : 'text-slate-400'
          }`}
        >
          <Dumbbell className="w-3 h-3" />
          <span>{totalEjercicios} {totalEjercicios === 1 ? 'ej' : 'ejs'}</span>
        </span>
      </div>

      {/* CHIP DE ACTIVO */}
      {isActive && (
        <div className="absolute -top-1.5 -right-1.5 bg-sky-400 text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full shadow-md flex items-center gap-0.5">
          <Sparkles className="w-2.5 h-2.5" />
          <span>Activo</span>
        </div>
      )}
    </div>
  );
}
