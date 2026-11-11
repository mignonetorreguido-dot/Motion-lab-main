'use client';

/**
 * ========================================================================
 * COMPONENTE: ExerciseCombobox (Autocomplete Creatable 100% Responsive)
 * ========================================================================
 * components/admin/ExerciseCombobox.js
 *
 * Características:
 * 1. Apertura y menú flotante al hacer focus o click en el input.
 * 2. Filtrado reactivo en tiempo real letra por letra (case-insensitive) con
 *    resaltado dinámico en cyan del texto coincidente.
 * 3. Lista con badge tenue "Frecuente".
 * 4. Opción final "+ Asignar '[Texto]' como nuevo ejercicio" (Creatable).
 * 5. Navegación fluida con teclado (Flechas Arriba/Abajo, Enter, Escape).
 * 6. Preservación estricta del valor escrito en click outside o onBlur.
 * 7. Memoria en sesión persistida a nivel de módulo y sincronizada con el estado.
 */

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Plus, ChevronDown } from 'lucide-react';

// Memoria global en sesión persistida a nivel de módulo
const MEMORIA_EJERCICIOS_MODULO = new Set([
  'Prensa de piernas',
  'Press de banca con mancuernas',
  'Press militar',
  'Sentadilla Trasera con Barra (Back Squat)',
  'Peso Muerto Rumano con Barra (RDL)',
  'Empuje de Cadera con Barra (Barbell Hip Thrust)',
  'Dominadas Neutras o Pronas (Pull-Ups)',
  'Estocada Búlgara con Mancuernas',
  'Remo con Mancuerna con Apoyo en Banco',
  'Elevaciones Laterales con Mancuernas',
  'Curl Femoral en Máquina',
  'Fondos en Paralelas (Dips)',
  'Plancha Copenhague + Core Antirrotacional',
  'Pallof Press Isométrico con Polea',
  'Deadbug con Presión en Balón',
  'Rotaciones 90/90 de Cadera',
  'Dorsiflexión de Tobillo contra pared',
  'Gato-Camello con Disociación Torácica',
  "World's Greatest Stretch",
  'Puente de Glúteo Unilateral',
  'Subidas al Cajón (Step-Ups)',
  'Aductores en Máquina o con Banda',
  'Face Pull en Polea con Cuerda',
]);

// Helper para resaltar en cyan las letras que coinciden con la búsqueda
function highlightMatch(text, query) {
  if (!query || !query.trim()) return text;
  const cleanQuery = query.trim();
  const index = text.toLowerCase().indexOf(cleanQuery.toLowerCase());
  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + cleanQuery.length);
  const after = text.slice(index + cleanQuery.length);

  return (
    <span>
      {before}
      <span className="text-cyan-400 font-bold">{match}</span>
      {after}
    </span>
  );
}

export default function ExerciseCombobox({
  value = '',
  onChange = () => {},
  placeholder = 'Ej: Sentadilla Trasera...',
  bloqueTipo = 'DESARROLLO',
  historialEjercicios = [],
  onRegistrarNuevo = () => {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Sincronizar query cuando cambia la prop value externamente
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Cerrar el dropdown al hacer click fuera preservando siempre el valor escrito
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        // Garantizar que el texto escrito persista en el estado padre
        if (query !== value) {
          onChange(query);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [query, value, onChange]);

  // Lista unificada de nombres de ejercicios (Módulo + Catálogo + Historial externo)
  const listaEjerciciosUnica = useMemo(() => {
    const mapa = new Map();

    // 1. Añadir ejercicios de memoria de módulo
    for (const nombre of MEMORIA_EJERCICIOS_MODULO) {
      const normalizado = nombre.trim().toLowerCase();
      if (!mapa.has(normalizado)) {
        mapa.set(normalizado, { nombre, tipoBloque: 'DESARROLLO', frecuente: true });
      }
    }

    // 2. Añadir catálogo / historial que viene por props
    for (const item of historialEjercicios) {
      const nombreItem = typeof item === 'string' ? item : item.nombre;
      if (nombreItem) {
        const normalizado = nombreItem.trim().toLowerCase();
        if (!mapa.has(normalizado)) {
          mapa.set(normalizado, {
            nombre: nombreItem,
            tipoBloque: item.tipoBloque || 'DESARROLLO',
            frecuente: true,
            datos: item,
          });
        }
      }
    }

    return Array.from(mapa.values());
  }, [historialEjercicios]);

  // Filtrado reactivo en tiempo real
  const opcionesFiltradas = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      return listaEjerciciosUnica.slice(0, 10);
    }
    return listaEjerciciosUnica
      .filter((item) => item.nombre.toLowerCase().includes(q))
      .slice(0, 12);
  }, [listaEjerciciosUnica, query]);

  // Verificar si hay coincidencia exacta con algún ejercicio
  const coincideExacto = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return true;
    return opcionesFiltradas.some((op) => op.nombre.toLowerCase() === q);
  }, [opcionesFiltradas, query]);

  // ¿Mostrar la opción creatable al final?
  const mostrarCreatable = useMemo(() => {
    const q = (query || '').trim();
    return q.length > 0 && !coincideExacto;
  }, [query, coincideExacto]);

  // Cantidad total de elementos navegables en el dropdown
  const totalItems = opcionesFiltradas.length + (mostrarCreatable ? 1 : 0);

  // Reiniciar activeIndex al cambiar opciones
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Seleccionar ejercicio existente
  const seleccionarOpcion = useCallback(
    (opcion) => {
      const nombreElegido = opcion.nombre;
      setQuery(nombreElegido);
      onChange(nombreElegido, opcion.datos || opcion);
      setIsOpen(false);
    },
    [onChange]
  );

  // Crear nuevo ejercicio y guardarlo en memoria
  const crearNuevoEjercicio = useCallback(
    (texto) => {
      const limpio = texto.trim();
      if (!limpio) return;

      // Registrar en el Set de memoria del módulo
      MEMORIA_EJERCICIOS_MODULO.add(limpio);

      const nuevoItem = {
        id: `custom-${crypto.randomUUID()}`,
        nombre: limpio,
        tipoBloque: bloqueTipo,
        categoria: 'Personalizado',
        seriesDefault: bloqueTipo === 'DESARROLLO' ? 3 : 2,
        repsDefault: 10,
        indicacionDefault: '',
        videoUrl: '',
        videoRecomendacion: '',
      };

      setQuery(limpio);
      onChange(limpio, nuevoItem);
      onRegistrarNuevo(nuevoItem);
      setIsOpen(false);
    },
    [bloqueTipo, onChange, onRegistrarNuevo]
  );

  // Manejo de input
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    if (!isOpen) setIsOpen(true);
  };

  // Manejo de teclado
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % (totalItems || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + (totalItems || 1)) % (totalItems || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (mostrarCreatable && activeIndex === opcionesFiltradas.length) {
        crearNuevoEjercicio(query);
      } else if (opcionesFiltradas[activeIndex]) {
        seleccionarOpcion(opcionesFiltradas[activeIndex]);
      } else if (query.trim()) {
        crearNuevoEjercicio(query);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      
      {/* INPUT DEL NOMBRE DE EJERCICIO */}
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
          autoComplete="off"
          spellCheck="false"
          className="w-full bg-[#0a101d] border border-slate-700/80 hover:border-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none transition-all"
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setIsOpen((prev) => !prev);
            if (!isOpen) inputRef.current?.focus();
          }}
          className="absolute right-2.5 text-slate-500 hover:text-cyan-400 transition-colors p-1"
          title="Ver ejercicios sugeridos"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-cyan-400' : ''
            }`}
          />
        </button>
      </div>

      {/* MENÚ FLOTANTE DESPLEGABLE (COMBOBOX) */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 w-full sm:min-w-[320px] max-w-[calc(100vw-2rem)] mt-1.5 z-50 max-h-56 overflow-y-auto bg-[#0d1527] border border-slate-800 rounded-xl shadow-2xl shadow-black/80 backdrop-blur-md p-1.5 space-y-1 animate-fadeIn scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
        >
          {/* LISTA DE EJERCICIOS FILTRADOS */}
          {opcionesFiltradas.length > 0 ? (
            opcionesFiltradas.map((opcion, idx) => {
              const isHighlighted = idx === activeIndex;

              return (
                <div
                  key={opcion.nombre}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    seleccionarOpcion(opcion);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    isHighlighted
                      ? 'border border-cyan-500/40 bg-cyan-500/10 text-white'
                      : 'border border-transparent text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  {/* Nombre con match resaltado en cyan */}
                  <span className="truncate font-medium text-slate-100">
                    {highlightMatch(opcion.nombre, query)}
                  </span>

                  {/* Badge Frecuente */}
                  <span className="text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded shrink-0 select-none">
                    Frecuente
                  </span>
                </div>
              );
            })
          ) : (
            !mostrarCreatable && (
              <div className="p-3 text-center text-xs text-slate-500 select-none">
                No se encontraron ejercicios coincidentes.
              </div>
            )
          )}

          {/* OPCIÓN CREATABLE AL FINAL (NUEVO EJERCICIO) */}
          {mostrarCreatable && (
            <div
              onMouseEnter={() => setActiveIndex(opcionesFiltradas.length)}
              onMouseDown={(e) => {
                e.preventDefault();
                crearNuevoEjercicio(query);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors border-t border-slate-800/80 mt-1 ${
                activeIndex === opcionesFiltradas.length
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-cyan-400 hover:bg-cyan-500/10'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400 shrink-0 stroke-[2.5]" />
              <span className="truncate font-medium">
                + Asignar <strong className="text-white">&ldquo;{query.trim()}&rdquo;</strong> como nuevo ejercicio
              </span>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
