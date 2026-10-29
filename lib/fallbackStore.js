/**
 * ========================================================================
 * ALMACÉN COMPARTIDO EN MEMORIA (lib/fallbackStore.js)
 * ========================================================================
 * Proporciona persistencia inmediata y tolerante a fallos para:
 * 1. Rutinas asignadas por Matías a cada alumno.
 * 2. Cuentas de alumnos y entrenador cuando PostgreSQL no está configurado o falla la red.
 * 
 * Se almacena en 'globalThis.__motionLabStore' para mantenerse activo durante
 * la ejecución de la app en Node / Vercel.
 */

const RUTINA_DEFECTO_DEMO = [
  {
    id: 'rutina-demo-dia-1',
    nombre: 'Día 1: Tren Inferior & Fuerza Unilateral',
    descripcion: 'Dominante de rodilla, cuádriceps, glúteos y potencia reactiva',
    bloques: [
      {
        tipo: 'MOVILIDAD',
        orden: 1,
        ejercicios: [
          {
            id: 'ej-mov-1',
            nombre: 'Dorsiflexión de Tobillo contra pared',
            indicacionProfe: '2 series x 10 oscilaciones lentas por pierna sin despegar el talón.',
            completado: true,
            series: [],
          },
          {
            id: 'ej-mov-2',
            nombre: 'Rotaciones 90/90 de Cadera',
            indicacionProfe: '2 series x 8 transiciones manteniendo el pecho erguido.',
            completado: true,
            series: [],
          },
          {
            id: 'ej-mov-3',
            nombre: 'Gato-Camello con disociación escapular',
            indicacionProfe: '10 repeticiones fluidas al compás de la respiración.',
            completado: false,
            series: [],
          },
        ],
      },
      {
        tipo: 'ACTIVACION',
        orden: 2,
        ejercicios: [
          {
            id: 'ej-act-1',
            nombre: 'Puente de Glúteo Unilateral con banda',
            indicacionProfe: '3 series x 12 reps con 2s de pausa arriba.',
            completado: false,
            series: [],
          },
          {
            id: 'ej-act-2',
            nombre: 'Saltos reactivos al cajón bajo',
            indicacionProfe: '3 series x 4 saltos con aterrizaje silencioso.',
            completado: false,
            series: [],
          },
        ],
      },
      {
        tipo: 'DESARROLLO',
        orden: 3,
        ejercicios: [
          {
            id: 'ej-des-1',
            nombre: 'Sentadilla Trasera con Barra (Back Squat)',
            indicacionProfe: '3 series x 8 reps | RIR Objetivo: 2 | Descanso: 2:30 min | Tempo 3-0-1-0',
            rirObjetivo: 2,
            observacion: 'Sentí buena profundidad en la serie 2.',
            completado: false,
            series: [
              { id: 's-1', numeroSerie: 1, repsRealizadas: 8, cargaKg: 80, rir: 3, rpe: 7.0, completado: true },
              { id: 's-2', numeroSerie: 2, repsRealizadas: 8, cargaKg: 85, rir: 2, rpe: 8.0, completado: true },
              { id: 's-3', numeroSerie: 3, repsRealizadas: 8, cargaKg: 85, rir: 2, rpe: 8.5, completado: false },
            ],
          },
          {
            id: 'ej-des-2',
            nombre: 'Empuje de Cadera con Barra (Barbell Hip Thrust)',
            indicacionProfe: '3 series x 10 reps | RIR Objetivo: 2 | Pausa 1 seg arriba',
            rirObjetivo: 2,
            completado: false,
            series: [
              { id: 's-4', numeroSerie: 1, repsRealizadas: 10, cargaKg: 100, rir: 2, rpe: 8.0, completado: false },
              { id: 's-5', numeroSerie: 2, repsRealizadas: 10, cargaKg: 105, rir: 2, rpe: 8.5, completado: false },
              { id: 's-6', numeroSerie: 3, repsRealizadas: 10, cargaKg: 110, rir: 1, rpe: 9.0, completado: false },
            ],
          },
          {
            id: 'ej-des-3',
            nombre: 'Estocada Búlgara con Mancuernas',
            indicacionProfe: '3 series x 8 reps por pierna | RIR: 1-2 | Descanso: 90s',
            rirObjetivo: 2,
            completado: false,
            series: [
              { id: 's-7', numeroSerie: 1, repsRealizadas: 8, cargaKg: 20, rir: 2, rpe: 8.0, completado: false },
              { id: 's-8', numeroSerie: 2, repsRealizadas: 8, cargaKg: 20, rir: 2, rpe: 8.5, completado: false },
              { id: 's-9', numeroSerie: 3, repsRealizadas: 8, cargaKg: 22, rir: 1, rpe: 9.0, completado: false },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rutina-demo-dia-2',
    nombre: 'Día 2: Tren Superior & Empujes',
    descripcion: 'Desarrollo de fuerza en empujes, salud de hombro y core funcional',
    bloques: [
      {
        tipo: 'MOVILIDAD',
        orden: 1,
        ejercicios: [
          {
            id: 'ej-mov-2-1',
            nombre: 'Dislocaciones de Hombro con Pica',
            indicacionProfe: '2 series x 12 repeticiones lentas.',
            completado: false,
            series: [],
          },
        ],
      },
      {
        tipo: 'ACTIVACION',
        orden: 2,
        ejercicios: [
          {
            id: 'ej-act-2-1',
            nombre: 'Facepull con Banda elástica',
            indicacionProfe: '3 series x 15 reps enfocando retracción escapular.',
            completado: false,
            series: [],
          },
        ],
      },
      {
        tipo: 'DESARROLLO',
        orden: 3,
        ejercicios: [
          {
            id: 'ej-des-2-1',
            nombre: 'Press de Banca Plano con Barra',
            indicacionProfe: '4 series x 6 reps | RIR: 2 | Descanso 2 min',
            rirObjetivo: 2,
            completado: false,
            series: [
              { id: 's-2-1', numeroSerie: 1, repsRealizadas: 6, cargaKg: 70, rir: 2, rpe: 8.0, completado: false },
              { id: 's-2-2', numeroSerie: 2, repsRealizadas: 6, cargaKg: 72.5, rir: 2, rpe: 8.5, completado: false },
              { id: 's-2-3', numeroSerie: 3, repsRealizadas: 6, cargaKg: 75, rir: 1, rpe: 9.0, completado: false },
            ],
          },
        ],
      },
    ],
  },
];

if (!globalThis.__motionLabStore) {
  globalThis.__motionLabStore = {
    rutinasPorAlumno: {
      'demo-alumno-1': RUTINA_DEFECTO_DEMO,
      'demo-alumno-2': [],
      'demo-alumno-3': [],
    },
    rutinasCompletadasPorAlumno: {},
    alumnos: {},
    alumnosEliminados: [],
    // Contador de sesiones completadas (check-outs POST) por alumno.
    // Se usa en el Panel del Entrenador: 'Bienestar & Fatiga' muestra
    // cuántas veces entrenó el alumno.
    sesionesPorAlumno: {},
  };
}

/**
 * Guarda o actualiza los días de rutina asignados a un alumno
 */
export function guardarRutinasEnStore(alumnoId, dias) {
  if (!globalThis.__motionLabStore.rutinasPorAlumno) {
    globalThis.__motionLabStore.rutinasPorAlumno = {};
  }

  // Aceptar únicamente listas de días válidas para evitar errores internos
  const diasSeguros = Array.isArray(dias) ? dias : [];

  // Transformar los días recibidos al formato estándar de rutinas con bloques
  const nuevasRutinas = diasSeguros.map((dia, idx) => ({
    id: dia.id || `rutina-${alumnoId}-dia-${idx + 1}-${Date.now()}`,
    nombre: dia.nombre || `Día ${idx + 1}`,
    descripcion: dia.descripcion || '',
    estado: 'ACTIVA',
    alumnoId,
    entrenadorId: 'matias-coach-id',
    createdAt: new Date().toISOString(),
    bloques: (dia.bloques || []).map((b, bIdx) => ({
      id: b.id || `bloque-${bIdx + 1}-${Date.now()}`,
      tipo: b.tipo,
      orden: b.orden || bIdx + 1,
      ejercicios: (b.ejercicios || []).map((ej, ejIdx) => ({
        id: ej.id || `ej-${bIdx + 1}-${ejIdx + 1}-${Date.now()}`,
        nombre: ej.nombre || 'Ejercicio sin nombre',
        indicacionProfe: ej.indicacionProfe || '',
        videoUrl: ej.videoUrl || null,
        videoRecomendacion: ej.videoRecomendacion || null,
        rirObjetivo: ej.rirObjetivo || null,
        observacion: ej.observacion || '',
        completado: Boolean(ej.completado),
        series: (ej.series || []).map((s, sIdx) => ({
          id: s.id || `s-${ejIdx + 1}-${sIdx + 1}-${Date.now()}`,
          numeroSerie: s.numeroSerie || sIdx + 1,
          repsRealizadas: s.repsRealizadas || null,
          cargaKg: s.cargaKg || null,
          rir: s.rir || null,
          rpe: s.rpe || null,
          completado: Boolean(s.completado),
        })),
      })),
    })),
  }));

  if (!globalThis.__motionLabStore.rutinasCompletadasPorAlumno) {
    globalThis.__motionLabStore.rutinasCompletadasPorAlumno = {};
  }
  const rutinasPrevias = globalThis.__motionLabStore.rutinasPorAlumno[alumnoId] || [];
  if (rutinasPrevias.length > 0) {
    const anteriores = globalThis.__motionLabStore.rutinasCompletadasPorAlumno[alumnoId] || [];
    globalThis.__motionLabStore.rutinasCompletadasPorAlumno[alumnoId] = [
      ...anteriores,
      ...rutinasPrevias.map((r) => ({ ...r, estado: 'COMPLETADA' })),
    ];
  }

  globalThis.__motionLabStore.rutinasPorAlumno[alumnoId] = nuevasRutinas;

  // Formato para planSemanal
  return nuevasRutinas.map((r, idx) => ({
    id: r.id,
    numeroDia: idx + 1,
    nombre: r.nombre,
    enfoque: r.descripcion || '',
    duracionMin: 60,
    estado: idx === 0 ? 'HOY' : 'PENDIENTE',
    ejerciciosCount: r.bloques.reduce((acc, b) => acc + (b.ejercicios ? b.ejercicios.length : 0), 0),
    bloquesCount: r.bloques.length,
    bloques: r.bloques,
    energiaInicial: r.energiaInicial || null,
    animoInicial: r.animoInicial || null,
    descansoInicial: r.descansoInicial || null,
    animoFinal: r.animoFinal || null,
    esfuerzoFinal: r.esfuerzoFinal || null,
    desahogoFinal: r.desahogoFinal || null,
    fechaCompletada: r.fechaCompletada || null,
  }));
}

/**
 * Obtiene las rutinas activas de un alumno desde el store
 */
export function obtenerRutinasDeStore(alumnoId) {
  if (!globalThis.__motionLabStore?.rutinasPorAlumno) {
    return [];
  }
  return globalThis.__motionLabStore.rutinasPorAlumno[alumnoId] || [];
}

/**
 * Guarda o actualiza los datos de un alumno en el almacén en memoria.
 * Se usa cuando PostgreSQL no está configurado (modo demo) para que la ficha
 * se pueda editar sin bloquear al entrenador.
 */
export function guardarAlumnoEnStore(alumnoId, datos = {}) {
  if (!globalThis.__motionLabStore) {
    globalThis.__motionLabStore = {
      rutinasPorAlumno: {},
      alumnos: {},
      sesionesPorAlumno: {},
      checkinsPorAlumno: {},
    };
  }
  if (!globalThis.__motionLabStore.alumnos) {
    globalThis.__motionLabStore.alumnos = {};
  }

  const anterior = globalThis.__motionLabStore.alumnos[alumnoId] || {};
  const { perfilDeportivo, ...campos } = datos;

  const actualizado = {
    ...anterior,
    ...campos,
    perfilDeportivo: {
      ...(anterior.perfilDeportivo || {}),
      ...(perfilDeportivo || {}),
    },
    actualizadoEn: new Date().toISOString(),
  };

  globalThis.__motionLabStore.alumnos[alumnoId] = actualizado;
  return actualizado;
}

/**
 * Obtiene los cambios guardados de un alumno en el almacén en memoria.
 * Devuelve null si el alumno nunca fue editado en modo demo.
 */
export function obtenerAlumnoDeStore(alumnoId) {
  return globalThis.__motionLabStore?.alumnos?.[alumnoId] || null;
}

/**
 * Obtiene todos los alumnos creados o editados en modo demo (excluyendo eliminados).
 */
export function obtenerAlumnosDeStore() {
  return Object.values(globalThis.__motionLabStore?.alumnos || {}).filter(
    (a) => !esAlumnoEliminadoEnStore(a?.id)
  );
}

/**
 * Elimina una rutina específica o todas las rutinas de un alumno en el store
 */
export function eliminarRutinaDeStore(alumnoId, rutinaId = null) {
  if (!globalThis.__motionLabStore) return;
  if (rutinaId) {
    if (globalThis.__motionLabStore.rutinasPorAlumno?.[alumnoId]) {
      globalThis.__motionLabStore.rutinasPorAlumno[alumnoId] =
        globalThis.__motionLabStore.rutinasPorAlumno[alumnoId].filter((r) => r.id !== rutinaId);
    }
    if (globalThis.__motionLabStore.rutinasCompletadasPorAlumno?.[alumnoId]) {
      globalThis.__motionLabStore.rutinasCompletadasPorAlumno[alumnoId] =
        globalThis.__motionLabStore.rutinasCompletadasPorAlumno[alumnoId].filter((r) => r.id !== rutinaId);
    }
  } else {
    if (globalThis.__motionLabStore.rutinasPorAlumno) {
      globalThis.__motionLabStore.rutinasPorAlumno[alumnoId] = [];
    }
  }
}

/**
 * Elimina las rutinas en desuso (completadas o archivadas)
 */
export function eliminarRutinasEnDesusoDeStore(alumnoId = null) {
  if (!globalThis.__motionLabStore) return;
  if (alumnoId) {
    if (globalThis.__motionLabStore.rutinasCompletadasPorAlumno) {
      globalThis.__motionLabStore.rutinasCompletadasPorAlumno[alumnoId] = [];
    }
    if (globalThis.__motionLabStore.rutinasPorAlumno?.[alumnoId]) {
      globalThis.__motionLabStore.rutinasPorAlumno[alumnoId] =
        globalThis.__motionLabStore.rutinasPorAlumno[alumnoId].filter((r) => r.estado !== 'COMPLETADA');
    }
  } else {
    globalThis.__motionLabStore.rutinasCompletadasPorAlumno = {};
    if (globalThis.__motionLabStore.rutinasPorAlumno) {
      for (const id in globalThis.__motionLabStore.rutinasPorAlumno) {
        globalThis.__motionLabStore.rutinasPorAlumno[id] =
          globalThis.__motionLabStore.rutinasPorAlumno[id].filter((r) => r.estado !== 'COMPLETADA');
      }
    }
  }
}

/**
 * Obtiene las rutinas en desuso (completadas o archivadas) de un alumno
 */
export function obtenerRutinasEnDesusoDeStore(alumnoId) {
  if (!globalThis.__motionLabStore) return [];
  const completadas = globalThis.__motionLabStore.rutinasCompletadasPorAlumno?.[alumnoId] || [];
  const enRutinas = (globalThis.__motionLabStore.rutinasPorAlumno?.[alumnoId] || []).filter(
    (r) => r.estado === 'COMPLETADA'
  );
  return [...completadas, ...enRutinas];
}

/**
 * Marca un alumno como eliminado en memoria y limpia sus datos relacionados
 */
export function eliminarAlumnoDeStore(alumnoId) {
  if (!globalThis.__motionLabStore) {
    globalThis.__motionLabStore = { alumnosEliminados: [] };
  }
  if (!Array.isArray(globalThis.__motionLabStore.alumnosEliminados)) {
    globalThis.__motionLabStore.alumnosEliminados = [];
  }
  if (!globalThis.__motionLabStore.alumnosEliminados.includes(alumnoId)) {
    globalThis.__motionLabStore.alumnosEliminados.push(alumnoId);
  }
  delete globalThis.__motionLabStore.alumnos?.[alumnoId];
  delete globalThis.__motionLabStore.rutinasPorAlumno?.[alumnoId];
  delete globalThis.__motionLabStore.rutinasCompletadasPorAlumno?.[alumnoId];
  delete globalThis.__motionLabStore.sesionesPorAlumno?.[alumnoId];
  delete globalThis.__motionLabStore.checkinsPorAlumno?.[alumnoId];
  delete globalThis.__motionLabStore.chequeosBienestarPorAlumno?.[alumnoId];
}

/**
 * Verifica si un alumno fue eliminado en el store en memoria
 */
export function esAlumnoEliminadoEnStore(alumnoId) {
  return Boolean(globalThis.__motionLabStore?.alumnosEliminados?.includes(alumnoId));
}

/**
 * Registra un check-in de bienestar (Pre o Post) para un alumno en memoria
 */
export function registrarCheckinEnStore(alumnoId, rutinaId, checkinData) {
  if (!globalThis.__motionLabStore) {
    globalThis.__motionLabStore = { rutinasPorAlumno: {}, alumnos: {}, checkinsPorAlumno: {} };
  }
  if (!globalThis.__motionLabStore.checkinsPorAlumno) {
    globalThis.__motionLabStore.checkinsPorAlumno = {};
  }
  if (!globalThis.__motionLabStore.checkinsPorAlumno[alumnoId]) {
    globalThis.__motionLabStore.checkinsPorAlumno[alumnoId] = [];
  }

  // 1. Actualizar campos en la rutina del store si existe
  const rutinas = globalThis.__motionLabStore.rutinasPorAlumno?.[alumnoId] || [];
  let rutinaActualizada = null;
  for (const r of rutinas) {
    if (r.id === rutinaId || (!rutinaId && r.estado === 'ACTIVA')) {
      if (checkinData.energiaInicial !== undefined) r.energiaInicial = Number(checkinData.energiaInicial);
      if (checkinData.animoInicial !== undefined) r.animoInicial = Number(checkinData.animoInicial);
      if (checkinData.descansoInicial !== undefined) r.descansoInicial = checkinData.descansoInicial;
      if (checkinData.animoFinal !== undefined) r.animoFinal = Number(checkinData.animoFinal);
      if (checkinData.esfuerzoFinal !== undefined) r.esfuerzoFinal = Number(checkinData.esfuerzoFinal);
      if (checkinData.desahogoFinal !== undefined) r.desahogoFinal = checkinData.desahogoFinal;
      if (checkinData.tipo === 'POST') {
        r.fechaCompletada = new Date().toISOString();
        r.estado = 'COMPLETADA';
      }
      rutinaActualizada = r;
      break;
    }
  }

  // 2. Construir el objeto de check-in para el historial
  const ahora = new Date();
  const horaStr = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const nuevoCheckin = {
    id: `chk-${Date.now()}`,
    rutinaId: rutinaId || rutinaActualizada?.id || null,
    tipo: checkinData.tipo || null,
    clase: rutinaActualizada?.nombre ? `Sesión: ${rutinaActualizada.nombre}` : `Sesión (${horaStr})`,
    fecha: ahora.toISOString().split('T')[0],
    energiaInicial: checkinData.energiaInicial !== undefined ? Number(checkinData.energiaInicial) : (rutinaActualizada?.energiaInicial || null),
    animoInicial: checkinData.animoInicial !== undefined ? Number(checkinData.animoInicial) : (rutinaActualizada?.animoInicial || null),
    descansoInicial: checkinData.descansoInicial || rutinaActualizada?.descansoInicial || null,
    animoFinal: checkinData.animoFinal !== undefined ? Number(checkinData.animoFinal) : (rutinaActualizada?.animoFinal || null),
    esfuerzoFinal: checkinData.esfuerzoFinal !== undefined ? Number(checkinData.esfuerzoFinal) : (rutinaActualizada?.esfuerzoFinal || null),
    desahogoFinal: checkinData.desahogoFinal || rutinaActualizada?.desahogoFinal || null,
    timestamp: Date.now(),
  };

  // 3. Contabilizar la sesión completada cuando el alumno termina su día
  //    de entrenamiento (check-out POST). Se deduplica por rutina/día para
  //    no sumar de más si el alumno edita una sesión ya finalizada.
  if (checkinData.tipo === 'POST') {
    if (!globalThis.__motionLabStore.sesionesPorAlumno) {
      globalThis.__motionLabStore.sesionesPorAlumno = {};
    }
    if (!globalThis.__motionLabStore.sesionesPorAlumno[alumnoId]) {
      globalThis.__motionLabStore.sesionesPorAlumno[alumnoId] = { total: 0, rutinas: [] };
    }
    const registroSesiones = globalThis.__motionLabStore.sesionesPorAlumno[alumnoId];
    const claveRutina = rutinaId || rutinaActualizada?.id || null;
    if (claveRutina) {
      if (!registroSesiones.rutinas.includes(claveRutina)) {
        registroSesiones.rutinas.push(claveRutina);
        registroSesiones.total += 1;
      }
    } else {
      registroSesiones.total += 1;
    }
  }

  // Agregar al inicio del historial de este alumno
  globalThis.__motionLabStore.checkinsPorAlumno[alumnoId].unshift(nuevoCheckin);

  return nuevoCheckin;
}

/**
 * Obtiene los check-ins de un alumno desde el store
 */
export function obtenerCheckinsDeStore(alumnoId) {
  return globalThis.__motionLabStore?.checkinsPorAlumno?.[alumnoId] || [];
}

/**
 * Obtiene la cantidad de sesiones completadas (días finalizados) de un alumno.
 * Lo consume el Panel del Entrenador para mostrar "X sesiones completadas"
 * en la columna Bienestar & Fatiga.
 */
export function obtenerSesionesDeStore(alumnoId) {
  return obtenerDetalleSesionesDeStore(alumnoId).total;
}

/**
 * Obtiene el detalle de sesiones completadas de un alumno:
 * - total: cantidad de sesiones contabilizadas.
 * - rutinas: lista de ids de rutina/día ya contabilizados (para deduplicar).
 */
export function obtenerDetalleSesionesDeStore(alumnoId) {
  const registro = globalThis.__motionLabStore?.sesionesPorAlumno?.[alumnoId];
  if (!registro) return { total: 0, rutinas: [] };
  if (typeof registro === 'number') return { total: registro, rutinas: [] };
  return { total: registro.total || 0, rutinas: registro.rutinas || [] };
}

/**
 * Guarda un chequeo de bienestar en el almacén en memoria.
 * Se usa como respaldo cuando la base de datos no está disponible y también
 * para que el panel del entrenador vea el resultado de inmediato.
 */
export function guardarChequeoBienestarEnStore(registro) {
  if (!globalThis.__motionLabStore) {
    globalThis.__motionLabStore = {
      rutinasPorAlumno: {},
      alumnos: {},
      sesionesPorAlumno: {},
      checkinsPorAlumno: {},
      chequeosBienestarPorAlumno: {},
    };
  }
  if (!globalThis.__motionLabStore.chequeosBienestarPorAlumno) {
    globalThis.__motionLabStore.chequeosBienestarPorAlumno = {};
  }

  const alumnoId = registro?.alumnoId;
  if (!alumnoId) return null;

  const historial = globalThis.__motionLabStore.chequeosBienestarPorAlumno[alumnoId] || [];
  const sinDuplicado = historial.filter((item) => item.id !== registro.id);

  // Mantener los últimos 20 chequeos por alumno para no crecer sin control.
  const actualizado = [registro, ...sinDuplicado]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 20);

  globalThis.__motionLabStore.chequeosBienestarPorAlumno[alumnoId] = actualizado;
  return registro;
}

/**
 * Obtiene los chequeos de bienestar de un alumno desde el almacén en memoria.
 */
export function obtenerChequeosBienestarDeStore(alumnoId) {
  const historial = globalThis.__motionLabStore?.chequeosBienestarPorAlumno?.[alumnoId] || [];
  return [...historial].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );
}

