'use client';

/**
 * ========================================================================
 * COMPONENTE: Panel del Entrenador Matías (components/admin/DashboardTrainer.js)
 * ========================================================================
 * Permite a Matías:
 * 1. Monitorear los alumnos que completaron el Onboarding.
 * 2. Validar pagos cambiando el estado de 'PENDIENTE' a 'ACTIVO' con un clic.
 * 3. Inspeccionar el perfil deportivo, lesiones y RM de cada alumno.
 * 4. Asignar o diseñar rutinas divididas estrictamente en los 3 bloques:
 *    - Bloque de Movilidad
 *    - Bloque de Activación
 *    - Bloque de Desarrollo
 * 5. Ver el contador de sesiones completadas de cada alumno dentro de la
 *    columna 'Bienestar & Fatiga' (sube cuando el alumno finaliza un día).
 * 6. Abrir la rutina completa del alumno con sus series, cargas y notas.
 * 7. Cambiar entre Modo Noche y Modo Soleado en toda la pantalla.
 */

import { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, Clock, Dumbbell, ShieldCheck, 
  Search, Eye, Plus, Trash2, ArrowRight, X, Sparkles, Activity, RotateCcw,
  HeartPulse, ChevronDown, ChevronUp
} from 'lucide-react';
import RoutineBuilder from './RoutineBuilder';
import WatchSummary from './WatchSummary';
import { useTheme } from '@/components/ThemeProvider';

// Alumnos de prueba que no deben mezclarse con los clientes reales del panel.
const IDS_DEMO_PANEL = new Set(['demo-alumno-1', 'demo-alumno-2', 'demo-alumno-3']);

const esAlumnoDemoPanel = (alumno) =>
  IDS_DEMO_PANEL.has(alumno?.id) || alumno?.email === 'alumno@motionlab.com';

const ETIQUETAS_BLOQUE = {
  MOVILIDAD: 'Movilidad',
  ACTIVACION: 'Activación',
  DESARROLLO: 'Desarrollo',
};

function formatearRegistro(valor, sufijo = '') {
  if (valor === null || valor === undefined || valor === '') return '—';
  return `${valor}${sufijo}`;
}

function contarSeriesDeDia(dia) {
  return (dia?.bloques || []).reduce(
    (total, bloque) =>
      total +
      (bloque.ejercicios || []).reduce(
        (subtotal, ejercicio) => subtotal + (ejercicio.series?.length || 0),
        0
      ),
    0
  );
}

const DIMENSIONES_BIENESTAR = [
  { id: 'descanso', nombre: 'Descanso', color: '#a78bfa' },
  { id: 'estres', nombre: 'Estrés', color: '#facc15' },
  { id: 'animo', nombre: 'Ánimo', color: '#22d3ee' },
  { id: 'energia', nombre: 'Energía', color: '#fb7185' },
  { id: 'motivacion', nombre: 'Motivación', color: '#60a5fa' },
];

function parsearRecomendacionesBienestar(valor) {
  if (Array.isArray(valor)) return valor;
  if (!valor) return [];
  try {
    const parsed = JSON.parse(valor);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function etiquetaNivelMental(nivel) {
  if (nivel === 'ALERTA') return 'En alerta';
  if (nivel === 'ATENCION') return 'A fortalecer';
  return 'En equilibrio';
}

function colorNivelMental(nivel) {
  if (nivel === 'ALERTA') return '#fb7185';
  if (nivel === 'ATENCION') return '#fbbf24';
  return '#38bdf8';
}

export default function DashboardTrainer() {
  const { isSunlight } = useTheme();
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('TODOS'); // 'TODOS', 'PENDIENTES', 'ACTIVOS'
  const [busqueda, setBusqueda] = useState('');
  
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardandoRutina, setGuardandoRutina] = useState(false);
  const [notificacion, setNotificacion] = useState('');
  
  const [rutinaActivaAlumno, setRutinaActivaAlumno] = useState(null);
  const [cargandoRutina, setCargandoRutina] = useState(false);
  const [mostrarConstructor, setMostrarConstructor] = useState(false);
  const [diaDetalleAbierto, setDiaDetalleAbierto] = useState(null);
  
  const [diasParaConstructor, setDiasParaConstructor] = useState(null);
  const [cargandoImportacion, setCargandoImportacion] = useState(false);
  const [importKey, setImportKey] = useState('new');
  
  // Novedades: Edición y Creación de usuarios
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [esNuevoUsuario, setEsNuevoUsuario] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', email: '', password: '', whatsapp: '',
    peso: '', altura: '', lesiones: '', estadoPago: 'PENDIENTE', tipoPlan: 'BASE',
    objetivo: 'Rendimiento', deporte: 'Fitness General', club: false,
    nivel: 'Principiante', focos: 'General', disponibilidad: '3 días',
    rmEstimado: '', puntosDebiles: ''
  });

  const abrirModalNuevoUsuario = () => {
    setEsNuevoUsuario(true);
    setEditandoPerfil(true);
    setFormData({
      nombre: '', apellido: '', email: '', password: '', whatsapp: '',
      peso: '', altura: '', lesiones: '', estadoPago: 'PENDIENTE', tipoPlan: 'BASE',
      objetivo: 'Rendimiento', deporte: 'Fitness General', club: false,
      nivel: 'Principiante', focos: 'General', disponibilidad: '3 días',
      rmEstimado: '', puntosDebiles: ''
    });
    setAlumnoSeleccionado(null);
    setRutinaActivaAlumno(null);
    setMostrarConstructor(false);
    setDiaDetalleAbierto(null);
    setDiasParaConstructor(null);
    setImportKey('new');
    setModalAbierto(true);
  };

  const abrirModalAlumno = async (alumno) => {
    setEsNuevoUsuario(false);
    setEditandoPerfil(false);
    
    // Poblar formData por si quiere editar
    setFormData({
      nombre: alumno.nombre || '',
      apellido: alumno.apellido || '',
      email: alumno.email || '',
      password: '', // Se deja vacío por seguridad. Solo se envía si se escribe una nueva.
      whatsapp: alumno.whatsapp || '',
      peso: alumno.peso || '',
      altura: alumno.altura || '',
      lesiones: alumno.lesiones || '',
      estadoPago: alumno.estadoPago || 'PENDIENTE',
      tipoPlan: alumno.tipoPlan || 'BASE',
      objetivo: alumno.perfilDeportivo?.objetivo || 'Rendimiento',
      deporte: alumno.perfilDeportivo?.deporte || 'Fitness General',
      club: alumno.perfilDeportivo?.club || false,
      nivel: alumno.perfilDeportivo?.nivel || 'Principiante',
      focos: alumno.perfilDeportivo?.focos || 'General',
      disponibilidad: alumno.perfilDeportivo?.disponibilidad || '3 días',
      rmEstimado: alumno.perfilDeportivo?.rmEstimado || '',
      puntosDebiles: alumno.perfilDeportivo?.puntosDebiles || ''
    });

    setAlumnoSeleccionado(alumno);
    setRutinaActivaAlumno(null);
    setMostrarConstructor(false);
    setDiaDetalleAbierto(null);
    setDiasParaConstructor(null);
    setImportKey('new');
    setModalAbierto(true);
    setCargandoRutina(true);

    try {
      const res = await fetch(`/api/rutinas?alumnoId=${alumno.id}`);
      const data = await res.json();
      if (data.success && data.planSemanal && data.planSemanal.length > 0) {
        setRutinaActivaAlumno(data.planSemanal);
      } else {
        setMostrarConstructor(true);
      }
    } catch(err) {
      console.error(err);
      setMostrarConstructor(true);
    } finally {
      setCargandoRutina(false);
    }
  };

  const handleImportarRutina = async (alumnoFuenteId) => {
    if (!alumnoFuenteId) return;
    setCargandoImportacion(true);
    try {
      const res = await fetch(`/api/rutinas?alumnoId=${alumnoFuenteId}`);
      const data = await res.json();
      if (data.success && data.planSemanal && data.planSemanal.length > 0) {
        // Transformar data.planSemanal al formato de dias que espera RoutineBuilder
        const diasClonados = data.planSemanal.map(dia => {
          return {
            id: crypto.randomUUID(),
            nombre: dia.nombre,
            descripcion: dia.enfoque,
            bloques: dia.bloques.map(b => ({
              tipo: b.tipo,
              orden: b.orden,
              ejercicios: b.ejercicios.map(ej => ({
                nombre: ej.nombre,
                seriesCount: ej.series?.length || 3,
                repsCount: ej.series?.[0]?.repsRealizadas || 10,
                indicacionProfe: ej.indicacionProfe || '',
                videoUrl: ej.videoUrl || '',
                videoRecomendacion: ej.videoRecomendacion || '',
                mostrarVideoInput: !!ej.videoUrl
              }))
            }))
          };
        });
        setDiasParaConstructor(diasClonados);
        setImportKey(crypto.randomUUID());
        mostrarAviso('Rutina importada con éxito. Puedes modificarla antes de guardar.');
      } else {
        mostrarAviso('El alumno seleccionado no tiene una rutina activa para copiar.');
      }
    } catch(err) {
      console.error(err);
    } finally {
      setCargandoImportacion(false);
    }
  };

  // Estructura de la rutina a crear (3 bloques estrictos)
  const [nuevaRutina, setNuevaRutina] = useState({
    nombre: 'Sesión A - Fuerza & Potencia',
    descripcion: 'Enfocada en miembros inferiores y patrones dominantes de rodilla.',
    bloques: [
      {
        tipo: 'MOVILIDAD',
        orden: 1,
        ejercicios: [
          { nombre: 'Movilidad de Tobillo contra Pared', indicacionProfe: '2x10 por pierna. Controlar talón.' },
          { nombre: 'Rotaciones 90/90 de Cadera', indicacionProfe: '2x8 cambios dinámicos.' },
        ],
      },
      {
        tipo: 'ACTIVACION',
        orden: 2,
        ejercicios: [
          { nombre: 'Puente de Glúteo Unilateral con Banda', indicacionProfe: '3x12 por pierna con pausa arriba.' },
          { nombre: 'Snap Down to Box Jump', indicacionProfe: '3x4 saltos al cajón. Absorber impacto.' },
        ],
      },
      {
        tipo: 'DESARROLLO',
        orden: 3,
        ejercicios: [
          {
            nombre: 'Sentadilla Trasera con Barra (Back Squat)',
            indicacionProfe: '3x8 | RIR Objetivo: 2 | Descanso 2:30 min',
            rirObjetivo: 2,
            series: [
              { numeroSerie: 1, repsRealizadas: 8, cargaKg: 80, rir: 2, rpe: 8 },
              { numeroSerie: 2, repsRealizadas: 8, cargaKg: 80, rir: 2, rpe: 8 },
              { numeroSerie: 3, repsRealizadas: 8, cargaKg: 80, rir: 2, rpe: 8 },
            ],
          },
          {
            nombre: 'Empuje de Cadera con Barra (Barbell Hip Thrust)',
            indicacionProfe: '3x10 | RIR Objetivo: 2 | Pausa 1 seg',
            rirObjetivo: 2,
            series: [
              { numeroSerie: 1, repsRealizadas: 10, cargaKg: 100, rir: 2, rpe: 8 },
              { numeroSerie: 2, repsRealizadas: 10, cargaKg: 100, rir: 2, rpe: 8 },
              { numeroSerie: 3, repsRealizadas: 10, cargaKg: 100, rir: 2, rpe: 8 },
            ],
          },
        ],
      },
    ],
  });

  // Cargar lista de alumnos desde el backend
  const cargarAlumnos = async () => {
    setCargando(true);
    try {
      const res = await fetch('/api/entrenador/alumnos');
      const data = await res.json();
      if (data.success) {
        setAlumnos(data.alumnos);
      }
    } catch (err) {
      console.error('Error cargando alumnos:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    // Carga inicial. El panel no se actualiza solo para evitar parpadeos
    // y que la tabla se rerenderice mientras Matías está editando.
    // La actualización queda disponible con el botón "Actualizar alumnos y alertas".
    cargarAlumnos();
  }, []);

  // Bloquea el scroll de la página mientras la ficha está abierta para que
  // no quede la barra del navegador visible por fuera del modal.
  useEffect(() => {
    if (!modalAbierto) return undefined;

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, [modalAbierto]);

  // Cambiar estado de pago (PENDIENTE <-> ACTIVO)
  const toggleEstadoPago = async (alumnoId, estadoActual) => {
    const nuevoEstado = estadoActual === 'PENDIENTE' ? 'ACTIVO' : 'PENDIENTE';
    try {
      const res = await fetch('/api/entrenador/alumnos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alumnoId, estadoPago: nuevoEstado }),
      });
      const data = await res.json();

      if (data.success) {
        setAlumnos((prev) =>
          prev.map((a) => (a.id === alumnoId ? { ...a, estadoPago: nuevoEstado } : a))
        );
        mostrarAviso(`Pago de alumno actualizado a: ${nuevoEstado}`);
      }
    } catch (err) {
      console.error('Error cambiando estado de pago:', err);
    }
  };

  const guardarPerfilAlumno = async () => {
    setGuardandoRutina(true);
    try {
      const url = '/api/entrenador/alumnos';
      const method = esNuevoUsuario ? 'POST' : 'PUT';
      const payload = esNuevoUsuario
        ? formData
        : { ...formData, id: alumnoSeleccionado.id };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        mostrarAviso(esNuevoUsuario ? 'Alumno creado exitosamente' : 'Perfil actualizado');
        setEditandoPerfil(false);
        if (esNuevoUsuario) {
          setAlumnoSeleccionado(data.alumno);
          setEsNuevoUsuario(false);
        } else {
          setAlumnoSeleccionado(data.alumno);
        }
        cargarAlumnos();
      } else {
        alert(data.error || 'Ocurrió un error al guardar');
      }
    } catch(err) {
      console.error(err);
      alert('Ocurrió un error de conexión');
    } finally {
      setGuardandoRutina(false);
    }
  };

  // Asignar rutina al alumno en el modal
  const guardarYAsignarRutina = async () => {
    if (!alumnoSeleccionado) return;
    setGuardandoRutina(true);

    try {
      const res = await fetch('/api/rutinas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumnoId: alumnoSeleccionado.id,
          dias: [
            {
              nombre: nuevaRutina.nombre,
              descripcion: nuevaRutina.descripcion,
              bloques: nuevaRutina.bloques,
            },
          ],
        }),
      });

      const data = await res.json();
      if (data.success) {
        mostrarAviso(`¡Rutina "${nuevaRutina.nombre}" asignada con éxito!`);
        setModalAbierto(false);
        cargarAlumnos();
      } else {
        alert(data.error || 'No se pudo asignar la rutina');
      }
    } catch (err) {
      console.error('Error al asignar rutina:', err);
      alert('Error de conexión al asignar la rutina');
    } finally {
      setGuardandoRutina(false);
    }
  };

  const mostrarAviso = (msg) => {
    setNotificacion(msg);
    setTimeout(() => setNotificacion(''), 4000);
  };

  // El panel muestra sólo alumnos reales: excluimos las cuentas de prueba.
  const alumnosVisibles = alumnos.filter((alumno) => !esAlumnoDemoPanel(alumno));

  // Filtrado de alumnos
  const alumnosFiltrados = alumnosVisibles.filter((a) => {
    const coincideFiltro =
      filtro === 'TODOS'
        ? true
        : filtro === 'PENDIENTES'
        ? a.estadoPago === 'PENDIENTE'
        : filtro === 'ACTIVOS'
        ? a.estadoPago === 'ACTIVO'
        : filtro === 'ALERTAS'
        ? a.alertaBienestar === 'ROJA' ||
          a.alertaBienestar === 'AMARILLA' ||
          a.alertaMental === 'ROJA' ||
          a.alertaMental === 'AMARILLA'
        : true;

    const textoBusqueda = `${a.nombre} ${a.apellido || ''} ${a.email} ${a.perfilDeportivo?.deporte || ''}`.toLowerCase();
    const coincideBusqueda = textoBusqueda.includes(busqueda.toLowerCase());

    return coincideFiltro && coincideBusqueda;
  });

  const ultimoChequeoMental = alumnoSeleccionado?.ultimoChequeoBienestar || null;
  const historialMental = alumnoSeleccionado?.chequeosBienestar || [];
  const recomendacionesMental = parsearRecomendacionesBienestar(
    ultimoChequeoMental?.recomendaciones
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      
      {/* NOTIFICACIÓN TOAST */}
      {notificacion && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-sky-500 text-slate-950 font-bold text-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{notificacion}</span>
        </div>
      )}

      {/* ENCABEZADO DEL DASHBOARD */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 transition-colors ${
        isSunlight ? 'border-slate-300' : 'border-slate-800/80'
      }`}>
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
            isSunlight ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-blue-500/10 text-sky-400 border-blue-500/20'
          }`}>
            <Activity className="w-3.5 h-3.5" />
            Panel del Entrenador
          </div>
          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
            Gestión de Alumnos • <span className={isSunlight ? 'text-blue-700' : 'text-sky-400'}>Coach Matías</span>
          </h1>
          <p className={`text-sm mt-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
            Valida los pagos de los alumnos y asígnales su planificación estructurada en 3 bloques.
          </p>
        </div>

        {/* CONTADOR RÁPIDO */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={abrirModalNuevoUsuario}
            className="flex flex-col sm:flex-row items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black transition-all shadow-md shadow-sky-500/20"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs sm:text-sm">Nuevo Alumno</span>
          </button>
          <button
            onClick={cargarAlumnos}
            title="Actualizar alumnos y alertas"
            className={`p-2.5 rounded-2xl border transition-all ${
              isSunlight
                ? 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-300'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
            }`}
          >
            <RotateCcw className={`w-5 h-5 ${cargando ? 'animate-spin text-sky-400' : ''}`} />
          </button>
          <div className={`px-4 py-2.5 rounded-2xl border text-center ${
            isSunlight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
          }`}>
            <span className={`text-xs block font-medium ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Total Alumnos</span>
            <span className={`text-xl font-black ${isSunlight ? 'text-slate-900' : 'text-white'}`}>{alumnosVisibles.length}</span>
          </div>
          <div className={`px-4 py-2.5 rounded-2xl border text-center ${
            isSunlight ? 'bg-amber-50 border-amber-300' : 'bg-amber-500/10 border-amber-500/30'
          }`}>
            <span className={`text-xs block font-bold ${isSunlight ? 'text-amber-700' : 'text-amber-400'}`}>Pendientes</span>
            <span className={`text-xl font-black ${isSunlight ? 'text-amber-700' : 'text-amber-400'}`}>
              {alumnosVisibles.filter((a) => a.estadoPago === 'PENDIENTE').length}
            </span>
          </div>
          <div className={`px-4 py-2.5 rounded-2xl border text-center ${
            isSunlight ? 'bg-sky-50 border-sky-300' : 'bg-sky-500/10 border-sky-500/30'
          }`}>
            <span className={`text-xs block font-bold ${isSunlight ? 'text-sky-700' : 'text-sky-400'}`}>Activos</span>
            <span className={`text-xl font-black ${isSunlight ? 'text-sky-700' : 'text-sky-400'}`}>
              {alumnosVisibles.filter((a) => a.estadoPago === 'ACTIVO').length}
            </span>
          </div>
          <div className={`px-4 py-2.5 rounded-2xl border text-center ${
            isSunlight ? 'bg-emerald-50 border-emerald-300' : 'bg-emerald-500/10 border-emerald-500/30'
          }`}>
            <span className={`text-xs block font-bold ${isSunlight ? 'text-emerald-700' : 'text-emerald-400'}`}>Sesiones Totales</span>
            <span className={`text-xl font-black ${isSunlight ? 'text-emerald-700' : 'text-emerald-400'}`}>
              {alumnosVisibles.reduce((acc, a) => acc + (a.sesionesCompletadas || 0), 0)}
            </span>
          </div>
          <div className={`px-4 py-2.5 rounded-2xl border text-center ${
            isSunlight ? 'bg-red-50 border-red-300' : 'bg-red-500/10 border-red-500/30'
          }`}>
            <span className={`text-xs block font-bold ${isSunlight ? 'text-red-600' : 'text-red-400'}`}>Alertas de Bienestar</span>
            <span className={`text-xl font-black ${isSunlight ? 'text-red-600' : 'text-red-400'}`}>
              {alumnosVisibles.filter((a) =>
                a.alertaMental === 'ROJA' ||
                a.alertaMental === 'AMARILLA'
              ).length}
            </span>
          </div>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* BOTONES DE FILTRO */}
        <div className={`flex items-center gap-2 p-1.5 rounded-2xl border w-full sm:w-auto overflow-x-auto ${
          isSunlight ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-900/80 border-slate-800'
        }`}>
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'PENDIENTES', label: 'Pendientes de Pago' },
            { id: 'ACTIVOS', label: 'Alumnos Activos' },
            { id: 'ALERTAS', label: '🚨 Alertas de Fatiga y Bienestar' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltro(tab.id)}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filtro === tab.id
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : isSunlight
                    ? 'text-slate-600 hover:text-slate-950'
                    : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* INPUT DE BÚSQUEDA */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Buscar por nombre, deporte..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-sky-400 border ${
              isSunlight
                ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                : 'bg-slate-900/80 border-slate-800 text-white placeholder-slate-500'
            }`}
          />
        </div>

      </div>

      {/* TABLA DE ALUMNOS */}
      <div className={`border rounded-3xl overflow-hidden shadow-2xl card-glow transition-colors ${
        isSunlight ? 'bg-white border-slate-300' : 'bg-[#0b1220] border-slate-800'
      }`}>
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isSunlight ? 'text-slate-800' : 'text-slate-300'}`}>
            <thead className={`text-[11px] uppercase tracking-wider font-bold border-b ${
              isSunlight
                ? 'bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-slate-900/90 text-slate-400 border-slate-800'
            }`}>
              <tr>
                <th className="py-4 px-6">Alumno</th>
                <th className="py-4 px-6">Plan & Deporte</th>
                <th className="py-4 px-6">Bienestar & Fatiga (UX)</th>
                <th className="py-4 px-6">Nivel & Focos</th>
                <th className="py-4 px-6">Estado de Pago</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className={isSunlight ? 'divide-y divide-slate-200' : 'divide-y divide-slate-800/60'}>
              {cargando ? (
                <tr>
                  <td colSpan={6} className={`py-12 text-center ${isSunlight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Cargando base de datos de alumnos...
                  </td>
                </tr>
              ) : alumnosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No se encontraron alumnos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                alumnosFiltrados.map((alumno) => {
                  const esActivo = alumno.estadoPago === 'ACTIVO';
                  const perfil = alumno.perfilDeportivo;

                  return (
                    <tr key={alumno.id} className={`transition-colors ${isSunlight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/40'}`}>
                      
                      {/* COLUMNA 1: ALUMNO */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-slate-950 font-black text-sm shrink-0">
                            {alumno.nombre?.[0] || 'A'}
                          </div>
                          <div>
                            <div className={`font-bold text-sm ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                              {alumno.nombre} {alumno.apellido || ''}
                            </div>
                            <div className={`text-[11px] ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>{alumno.email}</div>
                            {alumno.whatsapp && (
                              <div className={`text-[10px] mt-0.5 ${isSunlight ? 'text-sky-700' : 'text-sky-400'}`}>{alumno.whatsapp}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* COLUMNA 2: PLAN Y DEPORTE */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            alumno.tipoPlan === 'PREMIUM'
                              ? isSunlight
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : isSunlight
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-blue-500/20 text-sky-400 border border-blue-500/30'
                          }`}>
                            {alumno.tipoPlan === 'PREMIUM' ? 'Plan Premium 1 a 1' : 'Plan Base'}
                          </span>
                          <div className={`font-medium ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                            {perfil?.deporte || 'Fitness General'}
                            {perfil?.club && (
                              <span className={`text-[10px] block font-normal ${isSunlight ? 'text-slate-500' : 'text-slate-400'}`}>(Club Federado)</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* COLUMNA 3: BIENESTAR Y FATIGA (ALERTAS + SESIONES COMPLETADAS) */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-start gap-1.5">
                          {alumno.alertaBienestar === 'ROJA' ? (
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-extrabold animate-pulse ${
                              isSunlight
                                ? 'bg-red-50 text-red-700 border-red-300'
                                : 'bg-red-500/20 text-red-300 border-red-500/40'
                            }`}>
                              <span>🚨</span>
                              <span>
                                {alumno.consecutivosFatiga > 1
                                  ? `ALERTA ROJA (${alumno.consecutivosFatiga} sesiones Agotado)`
                                  : 'ALERTA ROJA (Fatiga Extrema / Agotado)'}
                              </span>
                            </div>
                          ) : alumno.alertaBienestar === 'AMARILLA' ? (
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold ${
                              isSunlight
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}>
                              <span>⚠️</span>
                              <span>Alerta Amarilla (Baja energía / Mal descanso)</span>
                            </div>
                          ) : (
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold ${
                              isSunlight
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            }`}>
                              <span>🟢</span>
                              <span>Óptimo / Buen descanso</span>
                            </div>
                          )}

                          {/* CONTADOR: VECES QUE EL ALUMNO COMPLETÓ SUS ENTRENAMIENTOS */}
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold ${
                            isSunlight
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-blue-500/10 text-sky-300 border-blue-500/30'
                          }`}>
                            <Dumbbell className="w-3.5 h-3.5" />
                            <span>
                              {alumno.sesionesCompletadas || 0}{' '}
                              {(alumno.sesionesCompletadas || 0) === 1 ? 'sesión completada' : 'sesiones completadas'}
                            </span>
                          </div>

                          {/* ALERTA DEL CHEQUEO DE SALUD MENTAL */}
                          {alumno.alertaMental === 'ROJA' ? (
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-extrabold ${
                              isSunlight
                                ? 'bg-rose-50 text-rose-700 border-rose-300'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}>
                              <HeartPulse className="w-3.5 h-3.5" />
                              <span>Salud mental: en alerta</span>
                            </div>
                          ) : alumno.alertaMental === 'AMARILLA' ? (
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold ${
                              isSunlight
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}>
                              <HeartPulse className="w-3.5 h-3.5" />
                              <span>Salud mental: a fortalecer</span>
                            </div>
                          ) : alumno.alertaMental === 'VERDE' ? (
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold ${
                              isSunlight
                                ? 'bg-sky-50 text-sky-700 border-sky-300'
                                : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                            }`}>
                              <HeartPulse className="w-3.5 h-3.5" />
                              <span>Salud mental: en equilibrio</span>
                            </div>
                          ) : (
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-medium ${
                              isSunlight
                                ? 'bg-slate-50 text-slate-500 border-slate-200'
                                : 'bg-slate-900/60 text-slate-500 border-slate-800'
                            }`}>
                              <HeartPulse className="w-3.5 h-3.5" />
                              <span>Sin chequeo mental</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* COLUMNA 4: NIVEL Y FOCOS */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span className={`font-semibold block ${isSunlight ? 'text-slate-900' : 'text-slate-200'}`}>
                            {perfil?.nivel || 'Principiante'}
                          </span>
                          <span className={`text-[11px] block ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                            🎯 {perfil?.focos || 'General'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            📅 {perfil?.disponibilidad || '3 días'}
                          </span>
                        </div>
                      </td>

                      {/* COLUMNA 4: ESTADO DE PAGO & TOGGLE */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleEstadoPago(alumno.id, alumno.estadoPago)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                              esActivo
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40'
                            }`}
                            title="Haz clic para alternar estado"
                          >
                            {esActivo ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Activo (Pagado)</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5" />
                                <span>Pendiente de Pago</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* COLUMNA 5: ACCIONES */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => abrirModalAlumno(alumno)}
                          className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-sky-500/20"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Ficha / Rutina</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================
          MODAL: FICHA DEL ALUMNO Y ASIGNADOR DE RUTINA EN 3 BLOQUES
         ================================================================ */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 !m-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className={`border rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 sm:p-8 shadow-2xl relative transition-colors ${
            isSunlight ? 'bg-white border-slate-300' : 'bg-[#0b1220] border-slate-800'
          }`}>
            
            {/* BOTÓN CERRAR */}
            <button
              onClick={() => setModalAbierto(false)}
              className={`absolute top-6 right-6 p-1 rounded-lg transition-colors ${
                isSunlight ? 'text-slate-600 hover:text-slate-950 bg-slate-200' : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* CABECERA MODAL */}
            <div className={`mb-6 pb-4 border-b flex flex-col gap-3 pr-10 sm:flex-row sm:justify-between sm:items-start ${isSunlight ? 'border-slate-300' : 'border-slate-800'}`}>
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${isSunlight ? 'text-sky-700' : 'text-sky-400'}`}>
                  {esNuevoUsuario ? 'Nuevo Alumno' : 'Ficha Técnica del Alumno'}
                </span>
                <h2 className={`text-2xl font-black mt-1 ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                  {esNuevoUsuario ? 'Crear Perfil' : `${alumnoSeleccionado?.nombre} ${alumnoSeleccionado?.apellido || ''}`}
                </h2>
                {!esNuevoUsuario && (
                  <p className={`text-xs mt-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Email: {alumnoSeleccionado?.email} • WhatsApp: {alumnoSeleccionado?.whatsapp || 'No indicado'}
                  </p>
                )}
              </div>
              {!esNuevoUsuario && (
                <button
                  onClick={() => setEditandoPerfil(!editandoPerfil)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    editandoPerfil 
                      ? isSunlight
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : isSunlight
                        ? 'bg-slate-200 text-slate-700 hover:text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {editandoPerfil ? 'Cancelar Edición' : 'Editar Ficha'}
                </button>
              )}
            </div>

            {/* SECCIÓN 1: DATOS Y OBJETIVOS */}
            {editandoPerfil ? (
              <div className={`mb-6 space-y-4 p-6 rounded-2xl border transition-colors ${
                isSunlight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900/50 border-slate-800'
              }`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Nombre</label>
                    <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className={`w-full rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 border ${
                      isSunlight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`} />
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Apellido</label>
                    <input type="text" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} className={`w-full rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 border ${
                      isSunlight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`} />
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={`w-full rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 border ${
                      isSunlight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`} />
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {esNuevoUsuario ? 'Contraseña' : 'Nueva Contraseña (Opcional)'}
                    </label>
                    <input type="text" placeholder={esNuevoUsuario ? '' : 'Dejar en blanco para no cambiar'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={`w-full rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 border ${
                      isSunlight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`} />
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>WhatsApp</label>
                    <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className={`w-full rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 border ${
                      isSunlight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`} />
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Peso (kg)</label>
                    <input type="number" step="0.1" value={formData.peso} onChange={e => setFormData({...formData, peso: e.target.value})} className={`w-full rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 border ${
                      isSunlight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`} />
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Altura (cm)</label>
                    <input type="number" value={formData.altura} onChange={e => setFormData({...formData, altura: e.target.value})} className={`w-full rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 border ${
                      isSunlight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`} />
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Objetivo</label>
                    <select value={formData.objetivo} onChange={e => setFormData({...formData, objetivo: e.target.value})} className={`w-full rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 border ${
                      isSunlight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}>
                      <option value="Rendimiento">Rendimiento</option>
                      <option value="Estética">Estética</option>
                      <option value="Salud">Salud</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Nivel</label>
                    <select value={formData.nivel} onChange={e => setFormData({...formData, nivel: e.target.value})} className={`w-full rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 border ${
                      isSunlight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}>
                      <option value="Principiante">Principiante</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] uppercase font-bold mb-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Deporte</label>
                  <input type="text" value={formData.deporte} onChange={e => setFormData({...formData, deporte: e.target.value})} className={`w-full rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 border ${
                      isSunlight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`} />
                </div>
                
                <div>
                  <label className={`block text-[10px] uppercase font-bold mb-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Lesiones</label>
                  <textarea value={formData.lesiones} onChange={e => setFormData({...formData, lesiones: e.target.value})} rows={2} className={`w-full rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 border ${
                      isSunlight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`} />
                </div>
                <div>
                  <label className={`block text-[10px] uppercase font-bold mb-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>RM Estimado</label>
                  <input type="text" value={formData.rmEstimado} onChange={e => setFormData({...formData, rmEstimado: e.target.value})} className={`w-full rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 border ${
                      isSunlight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`} />
                </div>
                <div>
                  <label className={`block text-[10px] uppercase font-bold mb-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Puntos Débiles</label>
                  <textarea value={formData.puntosDebiles} onChange={e => setFormData({...formData, puntosDebiles: e.target.value})} rows={2} className={`w-full rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 border ${
                      isSunlight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`} />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={guardarPerfilAlumno}
                    disabled={guardandoRutina}
                    className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm transition-all shadow-md disabled:opacity-50"
                  >
                    {guardandoRutina ? 'Guardando...' : (esNuevoUsuario ? 'Crear Alumno' : 'Guardar Cambios')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className={`p-3 rounded-xl border transition-colors ${isSunlight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-800'}`}>
                    <span className={`text-[10px] uppercase font-bold ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Peso Corporal</span>
                    <div className={`text-base font-black ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                      {alumnoSeleccionado?.peso ? `${alumnoSeleccionado.peso} kg` : 'N/D'}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border transition-colors ${isSunlight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-800'}`}>
                    <span className={`text-[10px] uppercase font-bold ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Altura</span>
                    <div className={`text-base font-black ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                      {alumnoSeleccionado?.altura ? `${alumnoSeleccionado.altura} cm` : 'N/D'}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border transition-colors ${isSunlight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-800'}`}>
                    <span className={`text-[10px] uppercase font-bold ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Objetivo</span>
                    <div className={`text-base font-black ${isSunlight ? 'text-sky-700' : 'text-sky-400'}`}>
                      {alumnoSeleccionado?.perfilDeportivo?.objetivo || 'Rendimiento'}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border transition-colors ${isSunlight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-800'}`}>
                    <span className={`text-[10px] uppercase font-bold ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Nivel</span>
                    <div className={`text-base font-black ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                      {alumnoSeleccionado?.perfilDeportivo?.nivel || 'Principiante'}
                    </div>
                  </div>
                </div>

                {/* LESIONES O RM SI EXISTEN */}
                {(alumnoSeleccionado?.lesiones || alumnoSeleccionado?.perfilDeportivo?.rmEstimado) && (
                  <div className={`p-4 rounded-2xl border text-xs mb-6 space-y-1.5 ${
                    isSunlight ? 'bg-amber-50 border-amber-300' : 'bg-amber-500/10 border-amber-500/30'
                  }`}>
                    {alumnoSeleccionado?.lesiones && (
                      <div>
                        <strong className={isSunlight ? 'text-amber-700' : 'text-amber-400'}>⚠️ Lesiones reportadas:</strong>{' '}
                        <span className={isSunlight ? 'text-slate-700' : 'text-slate-300'}>{alumnoSeleccionado.lesiones}</span>
                      </div>
                    )}
                    {alumnoSeleccionado?.perfilDeportivo?.rmEstimado && (
                      <div>
                        <strong className={isSunlight ? 'text-amber-700' : 'text-amber-400'}>⚡ RMs informadas:</strong>{' '}
                        <span className={isSunlight ? 'text-slate-700' : 'text-slate-300'}>{alumnoSeleccionado.perfilDeportivo.rmEstimado}</span>
                      </div>
                    )}
                    {alumnoSeleccionado?.perfilDeportivo?.puntosDebiles && (
                      <div>
                        <strong className={isSunlight ? 'text-amber-700' : 'text-amber-400'}>🎯 Puntos débiles a enfocar:</strong>{' '}
                        <span className={isSunlight ? 'text-slate-700' : 'text-slate-300'}>{alumnoSeleccionado.perfilDeportivo.puntosDebiles}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* SECCIÓN: BIENESTAR, ALERTAS DE FATIGA Y HISTORIAL DE CHECK-INS */}
                <div className={`mb-6 p-5 rounded-2xl border shadow-lg transition-colors ${
                  isSunlight ? 'bg-sky-50/60 border-sky-300' : 'bg-[#070d19] border-sky-500/30'
                }`}>
                  <div className={`flex flex-col gap-3 pb-3 border-b ${isSunlight ? 'border-slate-300' : 'border-slate-800'}`}>
                    <div className="flex items-start gap-2">
                      <Activity className={`w-5 h-5 mt-0.5 shrink-0 ${isSunlight ? 'text-sky-700' : 'text-sky-400'}`} />
                      <h3 className={`text-sm font-black uppercase tracking-wider leading-snug ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                        Monitoreo Psico-Físico y Alertas (UX Check-in)
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {alumnoSeleccionado?.alertaBienestar === 'ROJA' ? (
                        <span className={`max-w-full px-3 py-1 rounded-full border text-xs font-black flex items-center gap-1.5 ${
                          isSunlight
                            ? 'bg-red-50 text-red-700 border-red-300'
                            : 'bg-red-500/20 text-red-400 border-red-500/40'
                        }`}>
                          <span className="w-2 h-2 shrink-0 rounded-full bg-red-500 animate-ping" />
                          <span>🚨 Alerta Roja: 3 clases consecutivas agotado/estresado</span>
                        </span>
                      ) : alumnoSeleccionado?.alertaBienestar === 'AMARILLA' ? (
                        <span className={`max-w-full px-3 py-1 rounded-full border text-xs font-bold ${
                          isSunlight
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        }`}>
                          ⚠️ Alerta Amarilla: Fatiga o estrés reciente
                        </span>
                      ) : (
                        <span className={`max-w-full px-3 py-1 rounded-full border text-xs font-bold ${
                          isSunlight
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        }`}>
                          🟢 Estado Físico Óptimo
                        </span>
                      )}

                      {/* CONTADOR DE SESIONES COMPLETADAS DEL ALUMNO */}
                      <span className={`max-w-full px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${
                        isSunlight
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-blue-500/10 text-sky-300 border-blue-500/30'
                      }`}>
                        <Dumbbell className="w-3.5 h-3.5 shrink-0" />
                        {alumnoSeleccionado?.sesionesCompletadas || 0}{' '}
                        {(alumnoSeleccionado?.sesionesCompletadas || 0) === 1 ? 'sesión completada' : 'sesiones completadas'}
                      </span>
                    </div>
                  </div>

                  {alumnoSeleccionado?.alertaBienestar === 'ROJA' && (
                    <div className={`mt-3.5 p-3.5 rounded-xl border text-xs ${
                      isSunlight
                        ? 'bg-red-50 border-red-300 text-red-800'
                        : 'bg-red-950/40 border-red-500/40 text-red-200'
                    }`}>
                      <strong className={`block font-black mb-1 ${isSunlight ? 'text-red-700' : 'text-red-400'}`}>
                        🚨 Sugerencia de Intervención para Matías:
                      </strong>
                      Este alumno marcó <strong>&quot;Agotado&quot;</strong> o <strong>&quot;Muy estresado&quot;</strong> durante 3 clases seguidas. Se recomienda programar una semana de descarga (Deload), reducir el RPE objetivo o chequear su descanso y alimentación antes de la próxima sesión intensa.
                    </div>
                  )}

                  {/* Resumen de últimos check-ins */}
                  <div className="mt-4">
                    <span className={`text-[11px] font-bold uppercase block mb-2 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Historial Reciente de Check-ins (Pre y Post Rutina)
                    </span>
                    {alumnoSeleccionado?.checkins && alumnoSeleccionado.checkins.length > 0 ? (
                      <div className="grid gap-2.5 sm:grid-cols-3">
                        {alumnoSeleccionado.checkins.map((chk, i) => (
                          <div key={i} className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                            isSunlight ? 'bg-white border-slate-300' : 'bg-slate-900/90 border-slate-800'
                          }`}>
                            <div className={`flex items-center justify-between text-[11px] font-black pb-1 border-b ${
                              isSunlight ? 'text-sky-700 border-slate-200' : 'text-sky-400 border-slate-800'
                            }`}>
                              <span>{chk.clase || `Sesión ${i + 1}`}</span>
                              <span className="text-slate-500 font-normal">{chk.fecha || ''}</span>
                            </div>
                            <div className={isSunlight ? 'text-slate-700' : 'text-slate-300'}>
                              <span className={`font-medium ${isSunlight ? 'text-slate-500' : 'text-slate-400'}`}>Energía:</span>{' '}
                              <strong className={chk.energiaInicial <= 1 ? 'text-red-500' : 'text-emerald-500'}>
                                {chk.energiaInicial <= 1 ? '🪫 1 (Agotado)' : chk.energiaInicial === 2 ? '🔋 2 (Bajo)' : chk.energiaInicial === 3 ? '🔋 3 (Normal)' : chk.energiaInicial === 4 ? '⚡ 4 (Con ganas)' : '🔥 5 (A tope)'}
                              </strong>
                            </div>
                            <div className={isSunlight ? 'text-slate-700' : 'text-slate-300'}>
                              <span className={`font-medium ${isSunlight ? 'text-slate-500' : 'text-slate-400'}`}>Mental:</span>{' '}
                              <span>{chk.animoInicial <= 1 ? '😫 Muy estresado' : chk.animoInicial === 2 ? '🙁 Desmotivado' : chk.animoInicial === 3 ? '😐 Neutral' : chk.animoInicial === 4 ? '🙂 Bien' : '🤩 Excelente'}</span>
                            </div>
                            {chk.descansoInicial && (
                              <div className={`text-[11px] ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                                <span>Descanso:</span> <strong>{chk.descansoInicial}</strong>
                              </div>
                            )}
                            {chk.esfuerzoFinal && (
                              <div className={`pt-1.5 border-t flex justify-between items-center text-[11px] ${
                                isSunlight ? 'text-slate-700 border-slate-200' : 'text-slate-300 border-slate-800'
                              }`}>
                                <span className={`font-medium ${isSunlight ? 'text-slate-500' : 'text-slate-400'}`}>RPE Final:</span>
                                <span className={`font-extrabold px-2 py-0.5 rounded ${
                                  isSunlight ? 'text-blue-700 bg-blue-100' : 'text-blue-400 bg-blue-500/10'
                                }`}>
                                  {chk.esfuerzoFinal} / 10
                                </span>
                              </div>
                            )}
                            {chk.animoFinal && (
                              <div className={`text-[11px] ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                                <span>Impacto:</span> {chk.animoFinal === 1 ? '📉 Peor' : chk.animoFinal === 2 ? '➖ Igual' : '📈 Renovado'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-xs italic p-3 rounded-xl border ${
                        isSunlight
                          ? 'text-slate-600 bg-slate-100 border-slate-300'
                          : 'text-slate-500 bg-slate-900/40 border-slate-800'
                      }`}>
                        Aún no hay check-ins registrados para este alumno. Aparecerán aquí en tiempo real cuando responda las preguntas de energía y esfuerzo.
                      </p>
                    )}
                  </div>
                </div>

                {/* SECCIÓN: CHEQUEO DE BIENESTAR / SALUD MENTAL */}
                <div className={`mb-6 p-5 rounded-2xl border shadow-lg transition-colors ${
                  isSunlight ? 'bg-sky-50/60 border-sky-300' : 'bg-[#070d19] border-sky-500/30'
                }`}>
                  <div className={`flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b ${
                    isSunlight ? 'border-slate-300' : 'border-slate-800'
                  }`}>
                    <div className="flex items-start gap-2">
                      <HeartPulse className={`w-5 h-5 mt-0.5 shrink-0 ${isSunlight ? 'text-sky-700' : 'text-sky-300'}`} />
                      <div>
                        <h3 className={`text-sm font-black uppercase tracking-wider leading-snug ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                          Chequeo de Bienestar (Salud Mental)
                        </h3>
                        <p className={`text-[11px] mt-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                          Descanso, estrés, ánimo, energía y motivación.
                        </p>
                      </div>
                    </div>

                    {ultimoChequeoMental && (
                      <span
                        className="max-w-full px-3 py-1 rounded-full border text-xs font-black self-start"
                        style={{
                          backgroundColor: `${colorNivelMental(ultimoChequeoMental.nivelGeneral)}1a`,
                          borderColor: `${colorNivelMental(ultimoChequeoMental.nivelGeneral)}55`,
                          color: colorNivelMental(ultimoChequeoMental.nivelGeneral),
                        }}
                      >
                        {etiquetaNivelMental(ultimoChequeoMental.nivelGeneral)} · {ultimoChequeoMental.puntajeGeneral}/100
                      </span>
                    )}
                  </div>

                  {ultimoChequeoMental ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]">
                        <span className={`font-bold ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
                          Último chequeo: {new Date(ultimoChequeoMental.fecha).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className={isSunlight ? 'text-slate-400' : 'text-slate-600'}>•</span>
                        <span className={isSunlight ? 'text-slate-500' : 'text-slate-400'}>
                          {historialMental.length} {historialMental.length === 1 ? 'registro' : 'registros'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
                        {DIMENSIONES_BIENESTAR.map((dimension) => {
                          const puntaje = Number(ultimoChequeoMental[dimension.id]) || 0;
                          return (
                            <div
                              key={dimension.id}
                              className={`rounded-xl border p-2.5 ${isSunlight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'}`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className={`text-[10px] font-bold ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                                  {dimension.nombre}
                                </span>
                                <span className="text-[11px] font-black" style={{ color: dimension.color }}>
                                  {puntaje}
                                </span>
                              </div>
                              <div className={`h-1.5 rounded-full overflow-hidden ${isSunlight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${puntaje}%`, backgroundColor: dimension.color }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {recomendacionesMental.length > 0 && (
                        <div className="grid sm:grid-cols-2 gap-2 mt-4">
                          {recomendacionesMental.map((recomendacion, index) => (
                            <div
                              key={`${recomendacion.id || index}-${index}`}
                              className={`rounded-xl border p-3 ${isSunlight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'}`}
                            >
                              <strong className={`text-[11px] font-black block ${isSunlight ? 'text-slate-800' : 'text-slate-200'}`}>
                                {recomendacion.titulo}
                              </strong>
                              <p className={`text-[11px] leading-relaxed mt-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                                {recomendacion.texto}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {ultimoChequeoMental.comentario && (
                        <div className={`mt-3 rounded-xl border p-3 ${isSunlight ? 'bg-white border-sky-200' : 'bg-slate-900/70 border-sky-500/20'}`}>
                          <strong className={`text-[11px] font-black block ${isSunlight ? 'text-sky-800' : 'text-sky-300'}`}>
                            Comentario del alumno:
                          </strong>
                          <p className={`text-[11px] leading-relaxed mt-1 ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
                            “{ultimoChequeoMental.comentario}”
                          </p>
                        </div>
                      )}

                      {historialMental.length > 1 && (
                        <div className={`mt-4 pt-3 border-t ${isSunlight ? 'border-slate-300' : 'border-slate-800'}`}>
                          <span className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${isSunlight ? 'text-slate-500' : 'text-slate-500'}`}>
                            Chequeos anteriores
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {historialMental.slice(1, 4).map((chequeo) => (
                              <span
                                key={chequeo.id}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold ${
                                  isSunlight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900/70 border-slate-800 text-slate-400'
                                }`}
                              >
                                {new Date(chequeo.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                                <span style={{ color: colorNivelMental(chequeo.nivelGeneral) }}>
                                  {chequeo.puntajeGeneral}/100
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className={`text-xs italic mt-3 p-3 rounded-xl border ${
                      isSunlight
                        ? 'text-slate-600 bg-white border-slate-200'
                        : 'text-slate-500 bg-slate-900/40 border-slate-800'
                    }`}>
                      Este alumno todavía no completó el chequeo de bienestar. Cuando lo haga, vas a ver acá su resultado y sus recomendaciones.
                    </p>
                  )}
                </div>

                {/* SECCIÓN: RELOJ Y RECUPERACIÓN (JUNCTION) */}
                {!esNuevoUsuario && (
                  <WatchSummary alumnoId={alumnoSeleccionado?.id} />
                )}
              </>
            )}

            {/* SECCIÓN 2: ESTADO ACTUAL Y ASIGNACIÓN DE RUTINA */}
            {!esNuevoUsuario && (
              <div className={`pt-2 border-t ${isSunlight ? 'border-slate-300' : 'border-slate-800'}`}>
                {cargandoRutina ? (
                  <div className="text-center py-10">
                    <div className="w-8 h-8 rounded-full border-4 border-sky-500 border-t-transparent animate-spin mx-auto mb-3" />
                    <p className={`text-xs ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Cargando información de rutinas...</p>
                  </div>
                ) : rutinaActivaAlumno && !mostrarConstructor ? (
                  <div className={`border rounded-2xl p-6 transition-colors ${
                    isSunlight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900/50 border-slate-800'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className={`text-base font-extrabold flex items-center gap-2 ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          Plan Semanal Asignado
                        </h3>
                        <p className={`text-xs mt-1 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>Este alumno ya tiene un plan en curso.</p>
                      </div>
                      <button
                        onClick={() => setMostrarConstructor(true)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border ${
                          isSunlight
                            ? 'bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-300'
                            : 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border-sky-500/20'
                        }`}
                      >
                        Reemplazar / Asignar Nueva
                      </button>
                    </div>
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      {rutinaActivaAlumno.map((dia) => {
                        const abierto = diaDetalleAbierto === dia.id;
                        const seriesDia = contarSeriesDeDia(dia);
                        const tieneCheckin = [
                          dia.energiaInicial,
                          dia.animoInicial,
                          dia.descansoInicial,
                          dia.esfuerzoFinal,
                          dia.animoFinal,
                          dia.desahogoFinal,
                        ].some((valor) => valor !== null && valor !== undefined && valor !== '');

                        return (
                          <div
                            key={dia.id}
                            className={`p-4 rounded-xl border transition-all ${
                              abierto ? 'sm:col-span-2' : ''
                            } ${
                              isSunlight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-800'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className={`font-bold text-sm mb-1 ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                                  Día {dia.numeroDia}: {dia.nombre}
                                </div>
                                <div className={`text-xs ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                                  {dia.enfoque || 'Sin descripción'}
                                </div>
                              </div>
                              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                                seriesDia > 0
                                  ? isSunlight
                                    ? 'bg-sky-50 text-sky-800 border-sky-300'
                                    : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                                  : isSunlight
                                    ? 'bg-slate-100 text-slate-600 border-slate-300'
                                    : 'bg-slate-900 text-slate-400 border-slate-700'
                              }`}>
                                {seriesDia} {seriesDia === 1 ? 'serie' : 'series'}
                              </span>
                            </div>

                            <div className={`text-[10px] font-bold mt-2 uppercase ${isSunlight ? 'text-sky-700' : 'text-sky-400'}`}>
                              {dia.bloquesCount ?? dia.bloques?.length ?? 0} Bloques • {dia.ejerciciosCount ?? 0} Ejercicios
                            </div>

                            {tieneCheckin && (
                              <div className={`mt-3 rounded-lg border p-2.5 ${
                                isSunlight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                              }`}>
                                <p className={`text-[10px] font-black uppercase tracking-wide ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                                  Check-in del alumno
                                </p>
                                <div className={`mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
                                  <span>Energía {formatearRegistro(dia.energiaInicial, '/5')}</span>
                                  <span>Ánimo {formatearRegistro(dia.animoInicial, '/5')}</span>
                                  <span>Descanso {formatearRegistro(dia.descansoInicial)}</span>
                                  <span>RPE {formatearRegistro(dia.esfuerzoFinal, '/10')}</span>
                                  <span>Ánimo final {formatearRegistro(dia.animoFinal, '/5')}</span>
                                  <span>Desahogo {formatearRegistro(dia.desahogoFinal)}</span>
                                </div>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => setDiaDetalleAbierto(abierto ? null : dia.id)}
                              className={`mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black transition-colors ${
                                isSunlight
                                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                              }`}
                            >
                              {abierto ? 'Ocultar ejercicios y registros' : 'Ver ejercicios y registros'}
                              {abierto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {abierto && (
                              <div className="mt-3 space-y-3">
                                {(dia.bloques || []).length === 0 ? (
                                  <p className={`text-xs ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                                    Este día todavía no tiene bloques cargados.
                                  </p>
                                ) : (
                                  dia.bloques.map((bloque, indiceBloque) => (
                                    <div
                                      key={bloque.id || `${dia.id}-bloque-${indiceBloque}`}
                                      className={`rounded-xl border p-3 ${
                                        isSunlight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                                          isSunlight ? 'bg-blue-100 text-blue-800' : 'bg-blue-500/10 text-sky-300'
                                        }`}>
                                          {ETIQUETAS_BLOQUE[bloque.tipo] || bloque.tipo}
                                        </span>
                                        <span className={`text-[10px] font-bold ${isSunlight ? 'text-slate-500' : 'text-slate-400'}`}>
                                          {bloque.ejercicios?.length || 0} ejercicios
                                        </span>
                                      </div>

                                      <div className="space-y-2">
                                        {(bloque.ejercicios || []).map((ejercicio, indiceEjercicio) => (
                                          <div
                                            key={ejercicio.id || `${dia.id}-${indiceBloque}-${indiceEjercicio}`}
                                            className={`rounded-lg border p-3 ${
                                              isSunlight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                                            }`}
                                          >
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                              <div className="min-w-0">
                                                <p className={`text-xs font-extrabold ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                                                  {ejercicio.nombre || 'Ejercicio sin nombre'}
                                                </p>
                                                {ejercicio.indicacionProfe && (
                                                  <p className={`mt-1 text-[11px] leading-relaxed ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                                                    {ejercicio.indicacionProfe}
                                                  </p>
                                                )}
                                              </div>
                                              <span className={`shrink-0 self-start rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${
                                                ejercicio.completado
                                                  ? isSunlight
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                                  : isSunlight
                                                    ? 'bg-slate-100 text-slate-600 border-slate-300'
                                                    : 'bg-slate-900 text-slate-400 border-slate-700'
                                              }`}>
                                                {ejercicio.completado ? 'Completado' : 'Pendiente'}
                                              </span>
                                            </div>

                                            {ejercicio.series?.length > 0 ? (
                                              <div className={`mt-2 overflow-x-auto rounded-lg border ${
                                                isSunlight ? 'border-slate-200' : 'border-slate-800'
                                              }`}>
                                                <table className="w-full min-w-[440px] text-left text-[11px]">
                                                  <thead className={isSunlight ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-slate-400'}>
                                                    <tr>
                                                      <th className="px-2 py-1.5 font-black">Serie</th>
                                                      <th className="px-2 py-1.5 font-black">Reps</th>
                                                      <th className="px-2 py-1.5 font-black">Kg</th>
                                                      <th className="px-2 py-1.5 font-black">RIR</th>
                                                      <th className="px-2 py-1.5 font-black">RPE</th>
                                                      <th className="px-2 py-1.5 font-black">Estado</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {ejercicio.series.map((serie, indiceSerie) => (
                                                      <tr
                                                        key={serie.id || `${ejercicio.id}-serie-${indiceSerie}`}
                                                        className={`border-t ${
                                                          isSunlight ? 'border-slate-200' : 'border-slate-800'
                                                        }`}
                                                      >
                                                        <td className={`px-2 py-1.5 font-bold ${isSunlight ? 'text-slate-800' : 'text-slate-200'}`}>
                                                          {serie.numeroSerie ?? indiceSerie + 1}
                                                        </td>
                                                        <td className={`px-2 py-1.5 ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
                                                          {formatearRegistro(serie.repsRealizadas)}
                                                        </td>
                                                        <td className={`px-2 py-1.5 ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
                                                          {formatearRegistro(serie.cargaKg)}
                                                        </td>
                                                        <td className={`px-2 py-1.5 ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
                                                          {formatearRegistro(serie.rir)}
                                                        </td>
                                                        <td className={`px-2 py-1.5 ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
                                                          {formatearRegistro(serie.rpe)}
                                                        </td>
                                                        <td className={`px-2 py-1.5 font-bold ${
                                                          serie.completado
                                                            ? isSunlight ? 'text-emerald-700' : 'text-emerald-300'
                                                            : isSunlight ? 'text-slate-500' : 'text-slate-500'
                                                        }`}>
                                                          {serie.completado ? 'Hecha' : 'Pendiente'}
                                                        </td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            ) : (
                                              <p className={`mt-2 text-[11px] ${isSunlight ? 'text-slate-500' : 'text-slate-500'}`}>
                                                Sin series registradas para este ejercicio.
                                              </p>
                                            )}

                                            {ejercicio.observacion && (
                                              <div className={`mt-2 rounded-lg border px-2.5 py-2 text-[11px] ${
                                                isSunlight
                                                  ? 'bg-sky-50 border-sky-200 text-sky-900'
                                                  : 'bg-sky-500/10 border-sky-500/20 text-sky-200'
                                              }`}>
                                                <span className="font-black uppercase tracking-wide">Nota del alumno: </span>
                                                {ejercicio.observacion}
                                              </div>
                                            )}

                                            {ejercicio.videoUrl && (
                                              <a
                                                href={ejercicio.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`mt-2 inline-flex items-center gap-1 text-[11px] font-bold ${
                                                  isSunlight ? 'text-sky-700 hover:text-sky-900' : 'text-sky-300 hover:text-sky-200'
                                                }`}
                                              >
                                                Ver video de referencia
                                                <ArrowRight className="w-3 h-3" />
                                              </a>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div>
                        <h3 className={`text-base font-extrabold ${isSunlight ? 'text-slate-900' : 'text-white'}`}>
                          Constructor de Rutinas
                        </h3>
                        <p className={`text-xs ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                          Diseña paso a paso la rutina o importa una existente.
                        </p>
                      </div>
                      
                      {/* Selector de importación */}
                      <div className="flex items-center gap-2">
                        <select 
                          className={`text-xs rounded-xl px-3 py-2 outline-none focus:border-sky-500 max-w-[200px] border ${
                            isSunlight
                              ? 'bg-white border-slate-300 text-slate-700'
                              : 'bg-slate-900 border-slate-700 text-slate-300'
                          }`}
                          onChange={(e) => handleImportarRutina(e.target.value)}
                          defaultValue=""
                          disabled={cargandoImportacion}
                        >
                          <option value="" disabled>Copiar rutina de...</option>
                          {alumnosVisibles
                            .filter(a => a.id !== alumnoSeleccionado?.id)
                            .map(a => (
                              <option key={a.id} value={a.id}>{a.nombre} {a.apellido || ''}</option>
                            ))
                          }
                        </select>
                        {cargandoImportacion && <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>}
                      </div>
                    </div>

                    <RoutineBuilder 
                      key={importKey}
                      alumno={alumnoSeleccionado}
                      initialDias={diasParaConstructor}
                      onCancel={() => {
                        if (rutinaActivaAlumno) setMostrarConstructor(false);
                        else setModalAbierto(false);
                      }}
                      onSave={async (rutinaArmada) => {
                        setGuardandoRutina(true);
                        try {
                          const res = await fetch('/api/rutinas', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              alumnoId: alumnoSeleccionado.id,
                              dias: rutinaArmada.dias,
                            }),
                          });

                          const data = await res.json();
                          if (data.success) {
                            mostrarAviso(`¡Rutina multi-día asignada con éxito!`);
                            setModalAbierto(false);
                            cargarAlumnos();
                          } else {
                            alert(data.error || 'No se pudo asignar la rutina');
                          }
                        } catch (err) {
                          console.error('Error al asignar rutina:', err);
                          alert('Error de conexión al asignar la rutina');
                        } finally {
                          setGuardandoRutina(false);
                        }
                      }}
                    />
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
