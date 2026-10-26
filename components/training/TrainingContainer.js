'use client';

/**
 * ========================================================================
 * COMPONENTE: Contenedor Principal de Entrenamiento (components/training/TrainingContainer.js)
 * ========================================================================
 * - Orquesta la navegación entre el Hub Semanal y la Planilla Activa.
 * - Sincroniza en tiempo real las rutinas asignadas por Matías (API como fuente de verdad).
 * - Persiste por cada alumnoId su progreso local de días completados y series guardadas.
 */

import { useState, useEffect } from 'react';
import StudentHub from './StudentHub';
import WorkoutView from './WorkoutView';

const getStorageKey = (baseKey, id) => `${baseKey}_${id || 'demo'}`;

export default function TrainingContainer({
  alumnoId = 'demo-alumno-1',
  alumnoNombre = '',
  estadoPago = 'ACTIVO',
  googleFitTestActivo = false,
}) {
  const [diaSeleccionadoId, setDiaSeleccionadoId] = useState(null);
  const [planSemanal, setPlanSemanal] = useState([]);
  const [rutinasGuardadas, setRutinasGuardadas] = useState({});
  const [diaHoyId, setDiaHoyId] = useState(null);
  const [cargando, setCargando] = useState(true);

  const storagePlanKey = getStorageKey('motion_lab_plan_v3', alumnoId);
  const storageRutinasKey = getStorageKey('motion_lab_rutinas_v3', alumnoId);
  const storageDiaHoyKey = getStorageKey('motion_lab_dia_hoy_v3', alumnoId);

  // Cargar estado desde la API (servidor como prioridad) y sincronizar progreso local
  useEffect(() => {
    async function cargarPlan() {
      setCargando(true);
      try {
        let planLocal = null;
        let rutinasLocal = null;
        let diaHoyLocal = null;

        if (typeof window !== 'undefined') {
          try {
            const rawPlan = localStorage.getItem(storagePlanKey);
            const rawRutinas = localStorage.getItem(storageRutinasKey);
            const rawDiaHoy = localStorage.getItem(storageDiaHoyKey);

            if (rawPlan) planLocal = JSON.parse(rawPlan);
            if (rawRutinas) rutinasLocal = JSON.parse(rawRutinas);
            if (rawDiaHoy) diaHoyLocal = rawDiaHoy;
          } catch (e) {
            console.error('Error leyendo de localStorage:', e);
          }
        }

        // Consultamos la API con el alumnoId real
        const res = await fetch(`/api/rutinas?alumnoId=${alumnoId}`);
        const data = await res.json();

        if (data.success && data.planSemanal && data.planSemanal.length > 0) {
          // La rutina del servidor es la fuente de verdad actualizada por el entrenador
          let planFinal = data.planSemanal;

          // Si el alumno ya completó días localmente en este mismo plan, combinamos el estado
          if (planLocal && Array.isArray(planLocal)) {
            const completadosMap = new Map(
              planLocal.filter((p) => p.estado === 'COMPLETADO').map((p) => [p.id, p])
            );

            planFinal = data.planSemanal.map((dia) => {
              if (completadosMap.has(dia.id)) {
                return { ...dia, ...completadosMap.get(dia.id) };
              }
              return dia;
            });
          }

          setPlanSemanal(planFinal);
          setDiaHoyId(diaHoyLocal || data.diaHoyId || planFinal[0]?.id);

          if (rutinasLocal) {
            setRutinasGuardadas(rutinasLocal);
          }
        } else if (planLocal && planLocal.length > 0) {
          // Si no hay rutinas en la API pero sí en cache local de este alumno
          setPlanSemanal(planLocal);
          if (diaHoyLocal) setDiaHoyId(diaHoyLocal);
          if (rutinasLocal) setRutinasGuardadas(rutinasLocal);
        } else {
          setPlanSemanal([]);
        }
      } catch (err) {
        console.error('Error cargando plan semanal:', err);
      } finally {
        setCargando(false);
      }
    }

    cargarPlan();
  }, [alumnoId, storagePlanKey, storageRutinasKey, storageDiaHoyKey]);

  // Manejar cuando el alumno finaliza o guarda un día de entrenamiento
  const handleFinalizarDia = (rutinaActualizada) => {
    if (!diaSeleccionadoId) return;

    // 1. Guardar la rutina en el diccionario de rutinas guardadas
    const nuevasRutinas = {
      ...rutinasGuardadas,
      [diaSeleccionadoId]: rutinaActualizada,
    };
    setRutinasGuardadas(nuevasRutinas);

    // 2. Marcar el día como COMPLETADO en el cronograma semanal
    const nuevoPlan = planSemanal.map((dia) => {
      if (dia.id === diaSeleccionadoId) {
        return { 
          ...dia, 
          estado: 'COMPLETADO',
          energiaInicial: rutinaActualizada.energiaInicial,
          animoInicial: rutinaActualizada.animoInicial,
          descansoInicial: rutinaActualizada.descansoInicial,
          animoFinal: rutinaActualizada.animoFinal,
          esfuerzoFinal: rutinaActualizada.esfuerzoFinal,
          desahogoFinal: rutinaActualizada.desahogoFinal,
          fechaCompletada: rutinaActualizada.fechaCompletada,
        };
      }
      return dia;
    });
    setPlanSemanal(nuevoPlan);

    // 3. Próximo día sugerido (el primer día no completado)
    const proximoDiaNoCompletado = nuevoPlan.find((dia) => dia.estado !== 'COMPLETADO');
    const nuevoDiaHoy = proximoDiaNoCompletado ? proximoDiaNoCompletado.id : nuevoPlan[0]?.id;
    setDiaHoyId(nuevoDiaHoy);

    // 4. Persistir en localStorage con la clave aislada de este alumno
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storagePlanKey, JSON.stringify(nuevoPlan));
        localStorage.setItem(storageRutinasKey, JSON.stringify(nuevasRutinas));
        localStorage.setItem(storageDiaHoyKey, nuevoDiaHoy);
      } catch (e) {
        console.error('Error guardando en localStorage:', e);
      }
    }

    // 5. Volver al Hub Semanal
    setDiaSeleccionadoId(null);
  };

  // Función para reiniciar el progreso
  const handleReiniciarProgreso = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storagePlanKey);
      localStorage.removeItem(storageRutinasKey);
      localStorage.removeItem(storageDiaHoyKey);
    }
    const planReiniciado = planSemanal.map((dia, idx) => ({
      ...dia,
      estado: idx === 0 ? 'HOY' : 'PENDIENTE',
    }));
    setPlanSemanal(planReiniciado);
    setRutinasGuardadas({});
    setDiaHoyId(planReiniciado[0]?.id || null);
  };

  if (cargando) {
    return (
      <div className="w-full max-w-lg mx-auto text-center py-20 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-4" />
        <p className="text-slate-400 font-medium text-sm">Cargando tu cronograma de entrenamiento...</p>
      </div>
    );
  }

  // 1. Si no hay día seleccionado, mostrar el Hub Semanal
  if (!diaSeleccionadoId) {
    return (
      <StudentHub
        planSemanal={planSemanal}
        diaHoyId={diaHoyId}
        onSeleccionarDia={(id) => setDiaSeleccionadoId(id)}
        onReiniciarProgreso={handleReiniciarProgreso}
        googleFitTestActivo={googleFitTestActivo}
      />
    );
  }

  // 2. Si se seleccionó un día, abrir la planilla interactiva de ese día
  const diaSeleccionado = planSemanal.find((d) => d.id === diaSeleccionadoId);
  const esModoEdicion = diaSeleccionado?.estado === 'COMPLETADO';
  const rutinaInicial = rutinasGuardadas[diaSeleccionadoId] || diaSeleccionado?.bloques ? diaSeleccionado : null;

  return (
    <WorkoutView
      alumnoId={alumnoId}
      diaId={diaSeleccionadoId}
      rutinaInicial={rutinaInicial}
      esModoEdicion={esModoEdicion}
      onFinalizar={handleFinalizarDia}
      onVolver={() => setDiaSeleccionadoId(null)}
    />
  );
}
