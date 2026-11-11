'use client';

/**
 * ========================================================================
 * COMPONENTE: ExerciseCombobox (Autocomplete Creatable 100% Responsive)
 * ========================================================================
 * components/admin/ExerciseCombobox.js
 *
 * Características principales:
 * 1. Desplegable flotante al hacer Focus / Click en el input.
 * 2. Filtrado reactivo en tiempo real letra por letra sin distinción de mayúsculas/minúsculas.
 * 3. Opción destacada "+ Asignar '[Texto]' como nuevo ejercicio" cuando el texto
 *    no coincide exactamente con un ejercicio existente.
 * 4. Persistencia segura: Al hacer click fuera o onBlur, el texto escrito
 *    se mantiene guardado en el ejercicio sin borrarse ni resetearse.
 * 5. Soporte de teclado (Enter para seleccionar/crear, Escape para cerrar).
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Plus, Check, ChevronDown, Dumbbell, Sparkles } from 'lucide-react';

export default function ExerciseCombobox({
  value = '',
  onChange = () => {},
  placeholder = 'Nombre del ejercicio (ej: Sentadilla Trasera)',
  bloqueTipo = 'DESARROLLO',
  historialEjercicios = [],
  onRegistrarNuevo = () => {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sincronizar el estado local si el valor externo cambia (ej. al clonar o hidratar)
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Listener para cerrar al hacer click fuera sin perder el texto escrito
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filtrado reactivo de opciones
  const opcionesFiltradas = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Ordenar dando prioridad a los ejercicios del mismo bloque metodológico
    const ordenados = [...historialEjercicios].sort((a, b) => {
      const aEsMismoBloque = a.tipoBloque === bloqueTipo;
      const bEsMismoBloque = b.tipoBloque === bloqueTipo;
      if (aEsMismoBloque && !bEsMismoBloque) return -1;
      if (!aEsMismoBloque && bEsMismoBloque) return 1;
      return 0;
    });

    if (!q) {
      return ordenados.slice(0, 12);
    }

    return ordenados.filter((item) => {
      const nombre = (item.nombre || '').toLowerCase();
      const categoria = (item.categoria || '').toLowerCase();
      const tipo = (item.tipoBloque || '').toLowerCase();
      return nombre.includes(q) || categoria.includes(q) || tipo.includes(q);
    }).slice(0, 15);
  }, [historialEjercicios, query, bloqueTipo]);

  // Verificar si el query actual coincide exactamente con algún nombre de la lista
  const coincideExacto = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return historialEjercicios.some(
      (item) => (item.nombre || '').trim().toLowerCase() === q
    );
  }, [historialEjercicios, query]);

  // Manejador al escribir
  const handleInputChange = (e) => {
    const nuevoTexto = e.target.value;
    setQuery(nuevoTexto);
    onChange(nuevoTexto);
    if (!isOpen) setIsOpen(true);
  };

  // Selección de ejercicio existente
  const handleSeleccionar = (ejercicio) => {
    const nombreElegido = typeof ejercicio === 'string' ? ejercicio : ejercicio.nombre;
    setQuery(nombreElegido);
    onChange(nombreElegido, ejercicio);
    setIsOpen(false);
  };

  // Creación libre de nuevo ejercicio (Creatable)
  const handleCrearNuevo = (textoPersonalizado) => {
    const nombreLimpio = textoPersonalizado.trim();
    if (!nombreLimpio) return;

    const nuevoItem = {
      id: `custom-${crypto.randomUUID()}`,
      nombre: nombreLimpio,
      tipoBloque: bloqueTipo,
      categoria: 'Personalizado',
      seriesDefault: bloqueTipo === 'DESARROLLO' ? 3 : 2,
      repsDefault: 10,
      indicacionDefault: '',
      videoUrl: '',
      videoRecomendacion: '',
    };

    setQuery(nombreLimpio);
    onChange(nombreLimpio, nuevoItem);
    onRegistrarNuevo(nuevoItem);
    setIsOpen(false);
  };

  // Soporte de teclado
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!coincideExacto && query.trim().length > 0) {
        handleCrearNuevo(query.trim());
      } else if (opcionesFiltradas.length > 0) {
        handleSeleccionar(opcionesFiltradas[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      
      {/* INPUT PRINCIPAL */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-[#060b16] border border-slate-700/80 hover:border-slate-600 rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-2 text-slate-500 hover:text-cyan-400 transition-colors"
          title="Ver sugerencias de ejercicios"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* MENÚ FLOTANTE DESPLEGABLE */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 max-h-56 overflow-y-auto bg-[#0d1527] border border-slate-800 rounded-xl shadow-2xl shadow-black/80 backdrop-blur-md p-1.5 space-y-1 animate-fadeIn scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          
          {/* OPCIÓN CREATABLE DESTACADA (SI NO COINCIDE EXACTAMENTE) */}
          {!coincideExacto && query.trim().length > 0 && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleCrearNuevo(query.trim());
              }}
              className="w-full text-left p-2.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center gap-2 transition-all group"
            >
              <div className="w-5 h-5 rounded-md bg-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-slate-950 text-cyan-400 flex items-center justify-center shrink-0 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">
                + Asignar <strong className="text-white underline">&ldquo;{query.trim()}&rdquo;</strong> como nuevo ejercicio
              </span>
            </button>
          )}

          {/* LISTA DE EJERCICIOS FILTRADOS */}
          {opcionesFiltradas.length > 0 ? (
            opcionesFiltradas.map((ej) => {
              const esSeleccionado = (ej.nombre || '').toLowerCase() === query.trim().toLowerCase();
              const esMismoBloque = ej.tipoBloque === bloqueTipo;

              return (
                <button
                  key={ej.id || ej.nombre}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSeleccionar(ej);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-all ${
                    esSeleccionado
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-200 hover:bg-[#131e36] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Dumbbell className={`w-3.5 h-3.5 shrink-0 ${esMismoBloque ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate font-semibold">{ej.nombre}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {ej.categoria && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-slate-400">
                        {ej.categoria}
                      </span>
                    )}
                    {esSeleccionado && (
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            coincideExacto && (
              <div className="p-3 text-center text-xs text-slate-500">
                No hay más sugerencias.
              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}
