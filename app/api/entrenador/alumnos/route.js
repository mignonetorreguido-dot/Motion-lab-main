/**
 * ========================================================================
 * ENDPOINT API: Lista de Alumnos para el Entrenador (app/api/entrenador/alumnos/route.js)
 * ========================================================================
 * Permite a Matías consultar todos los alumnos registrados, su perfil deportivo,
 * plan seleccionado (BASE / PREMIUM) y estado de pago (PENDIENTE / ACTIVO).
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import {
  obtenerCheckinsDeStore,
  obtenerDetalleSesionesDeStore,
  guardarAlumnoEnStore,
  obtenerAlumnoDeStore,
  obtenerAlumnosDeStore,
  obtenerChequeosBienestarDeStore,
} from '@/lib/fallbackStore';
import { ALUMNOS_DEMO } from '@/lib/demoAlumnos';
import { actualizarAlumno } from '@/lib/actualizarAlumno';
import { requireTrainer } from '@/lib/requireTrainer';

function calcularBienestar(checkins) {
  if (!checkins || checkins.length === 0) {
    return { alertaBienestar: 'VERDE', consecutivosFatiga: 0 };
  }

  const ultimo = checkins[0]; // El check-in más reciente

  // Fatiga crítica/extrema en la última sesión:
  // 1. Energía 1 (Agotado/a)
  // 2. Ánimo 1 (Muy estresado)
  // 3. Post-entreno: RPE >= 9 con ánimo peor
  const fatigaExtremaUltimo =
    (ultimo.energiaInicial !== null && ultimo.energiaInicial !== undefined && Number(ultimo.energiaInicial) <= 1) ||
    (ultimo.animoInicial !== null && ultimo.animoInicial !== undefined && Number(ultimo.animoInicial) <= 1) ||
    (ultimo.esfuerzoFinal !== null && ultimo.esfuerzoFinal !== undefined && Number(ultimo.esfuerzoFinal) >= 9 && Number(ultimo.animoFinal) === 1);

  // Fatiga moderada en la última sesión:
  // Energía 2 (Bajo), Ánimo 2 (Desmotivado), Descanso 'Mal', o RPE >= 9
  const fatigaModeradaUltimo =
    (ultimo.energiaInicial !== null && ultimo.energiaInicial !== undefined && Number(ultimo.energiaInicial) <= 2) ||
    (ultimo.animoInicial !== null && ultimo.animoInicial !== undefined && Number(ultimo.animoInicial) <= 2) ||
    ultimo.descansoInicial === 'Mal' ||
    (ultimo.esfuerzoFinal !== null && ultimo.esfuerzoFinal !== undefined && Number(ultimo.esfuerzoFinal) >= 9) ||
    ultimo.desahogoFinal === 'No, sigo a mil';

  // Conteo de sesiones consecutivas con fatiga
  let consecutivos = 0;
  for (const c of checkins) {
    const esFatiga =
      (c.energiaInicial !== null && c.energiaInicial !== undefined && Number(c.energiaInicial) <= 2) ||
      (c.animoInicial !== null && c.animoInicial !== undefined && Number(c.animoInicial) <= 2) ||
      c.descansoInicial === 'Mal' ||
      (c.esfuerzoFinal !== null && c.esfuerzoFinal !== undefined && Number(c.esfuerzoFinal) >= 9);

    if (esFatiga) {
      consecutivos++;
    } else {
      break;
    }
  }

  if (fatigaExtremaUltimo || consecutivos >= 2) {
    return { alertaBienestar: 'ROJA', consecutivosFatiga: Math.max(consecutivos, 1) };
  } else if (fatigaModeradaUltimo || consecutivos >= 1) {
    return { alertaBienestar: 'AMARILLA', consecutivosFatiga: consecutivos };
  } else {
    return { alertaBienestar: 'VERDE', consecutivosFatiga: 0 };
  }
}

/**
 * Traduce el último chequeo de bienestar a una alerta simple para la tabla
 * del entrenador. Es independiente de la fatiga física del entrenamiento.
 */
function calcularAlertaMental(chequeos = []) {
  const ultimo = chequeos[0];
  if (!ultimo) {
    return { alertaMental: 'SIN_DATOS', ultimoChequeoBienestar: null };
  }

  const alertaMental =
    ultimo.nivelGeneral === 'ALERTA'
      ? 'ROJA'
      : ultimo.nivelGeneral === 'ATENCION'
        ? 'AMARILLA'
        : 'VERDE';

  return { alertaMental, ultimoChequeoBienestar: ultimo };
}

export async function GET() {
  const auth = await requireTrainer();
  if (auth.response) return auth.response;

  try {
    let alumnos = [];
    let chequeosBienestarDB = [];

    if (process.env.DATABASE_URL) {
      try {
        alumnos = await prisma.usuario.findMany({
          where: { rol: 'ALUMNO' },
          include: {
            perfilDeportivo: true,
            rutinasComoAlumno: {
              select: {
                id: true,
                nombre: true,
                fechaAsignada: true,
                estado: true,
                energiaInicial: true,
                animoInicial: true,
                descansoInicial: true,
                animoFinal: true,
                esfuerzoFinal: true,
                desahogoFinal: true,
                fechaCompletada: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        // Historial de chequeos de bienestar de todos los alumnos. Se usa para
        // mostrar el estado mental más reciente en la tabla y en la ficha.
        try {
          chequeosBienestarDB = await prisma.chequeoBienestar.findMany({
            orderBy: { fecha: 'desc' },
            take: 500,
          });
        } catch (wellnessError) {
          console.warn(
            '⚠️ No se pudo consultar el historial de bienestar (se sigue con el resto del panel):',
            wellnessError.message
          );
        }

        // Mapear checkins y calcular alertas para alumnos de base de datos
        alumnos = alumnos.map((alumno) => {
          const rutinas = alumno.rutinasComoAlumno || [];
          const checkinsRutinas = rutinas
            .filter((r) => r.energiaInicial || r.animoInicial || r.descansoInicial)
            .map((r, i) => ({
              clase: r.nombre || `Sesión ${i + 1}`,
              fecha: r.fechaCompletada ? new Date(r.fechaCompletada).toISOString().split('T')[0] : 'Reciente',
              energiaInicial: r.energiaInicial,
              animoInicial: r.animoInicial,
              descansoInicial: r.descansoInicial,
              esfuerzoFinal: r.esfuerzoFinal,
              animoFinal: r.animoFinal,
              desahogoFinal: r.desahogoFinal,
            }));

          const checkinsStore = obtenerCheckinsDeStore(alumno.id);
          // Historial que ya existía en la versión anterior de Motion Lab.
          // Se conserva como línea base hasta que la base sume nuevos check-ins.
          const historialPrevio = ALUMNOS_DEMO.find((demo) => demo.id === alumno.id);
          const checkinsActuales = [...checkinsStore, ...checkinsRutinas];
          const checkinsCompletos = [
            ...checkinsActuales,
            ...(historialPrevio?.checkins || []),
          ];

          // Si todavía no hay check-ins nuevos, respetamos la alerta histórica
          // guardada en la versión anterior. Con datos nuevos se recalcula.
          const bienestar = checkinsActuales.length > 0
            ? calcularBienestar(checkinsCompletos)
            : {
                alertaBienestar: historialPrevio?.alertaBienestar || 'VERDE',
                consecutivosFatiga: Number(historialPrevio?.consecutivosFatiga || 0),
              };

          // Sesiones/días que el alumno ya completó en PostgreSQL (persistidas)
          const rutinasCompletadasIds = rutinas
            .filter((r) => r.fechaCompletada)
            .map((r) => r.id);

          return {
            ...alumno,
            alertaBienestar: bienestar.alertaBienestar,
            consecutivosFatiga: bienestar.consecutivosFatiga,
            sesionesBaseline: Number(historialPrevio?.sesionesBaseline || 0),
            checkins: checkinsCompletos,
            rutinasCompletadasIds,
          };
        });
      } catch (dbErr) {
        console.warn('⚠️ No se pudo consultar alumnos en PostgreSQL (modo demo):', dbErr.message);
      }
    }

    // Datos de demostración si la base de datos está vacía o sin inicializar
    if (!alumnos || alumnos.length === 0) {
      alumnos = ALUMNOS_DEMO;
    }

    // Aplicar los cambios guardados en memoria (modo demo) y sumar los
    // alumnos creados cuando PostgreSQL no está disponible.
    const alumnosEnStore = obtenerAlumnosDeStore();
    const idsExistentes = new Set(alumnos.map((alumno) => alumno.id));
    const alumnosNuevosDelStore = alumnosEnStore.filter(
      (alumno) => alumno.creadoEnDemo && !idsExistentes.has(alumno.id)
    );

    if (alumnosNuevosDelStore.length > 0) {
      alumnos = [...alumnosNuevosDelStore, ...alumnos];
    }

    alumnos = alumnos.map((alumno) => {
      const cambios = obtenerAlumnoDeStore(alumno.id);
      if (!cambios) return alumno;

      return {
        ...alumno,
        ...cambios,
        perfilDeportivo: {
          ...(alumno.perfilDeportivo || {}),
          ...(cambios.perfilDeportivo || {}),
        },
      };
    });

    // Sincronizar check-ins y sesiones completadas desde el almacén en memoria (fallbackStore)
    alumnos = alumnos.map((alumno) => {
      const checkinsStore = obtenerCheckinsDeStore(alumno.id);
      const sesionesStore = obtenerDetalleSesionesDeStore(alumno.id);

      // Sesiones completadas = historial base (demo o PostgreSQL) + sesiones registradas
      // en memoria al finalizar cada día, evitando duplicar la misma rutina/día.
      const completadasExtraDB = (alumno.rutinasCompletadasIds || []).filter(
        (id) => !sesionesStore.rutinas.includes(id)
      ).length;
      const sesionesCompletadas =
        Number(alumno.sesionesBaseline || 0) + sesionesStore.total + completadasExtraDB;

      if (checkinsStore && checkinsStore.length > 0) {
        // Filtrar duplicados por id si ya existen
        const existentesIds = new Set((alumno.checkins || []).map((c) => c.id || c.clase));
        const nuevosDeStore = checkinsStore.filter((c) => !existentesIds.has(c.id));
        const checkinsCombinados = [...nuevosDeStore, ...(alumno.checkins || [])];
        const { alertaBienestar, consecutivosFatiga } = calcularBienestar(checkinsCombinados);

        return {
          ...alumno,
          alertaBienestar,
          consecutivosFatiga,
          checkins: checkinsCombinados,
          sesionesCompletadas,
        };
      }
      return { ...alumno, sesionesCompletadas };
    });

    // Combinar el historial de bienestar de PostgreSQL con el guardado en
    // memoria y calcular la alerta mental más reciente para cada alumno.
    alumnos = alumnos.map((alumno) => {
      const deBaseDeDatos = chequeosBienestarDB.filter(
        (chequeo) => chequeo.alumnoId === alumno.id
      );
      const deMemoria = obtenerChequeosBienestarDeStore(alumno.id);
      const unicos = new Map();

      [...deBaseDeDatos, ...deMemoria].forEach((chequeo) => {
        if (chequeo?.id) unicos.set(chequeo.id, chequeo);
      });

      const chequeosBienestar = [...unicos.values()]
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 5);

      const { alertaMental, ultimoChequeoBienestar } =
        calcularAlertaMental(chequeosBienestar);

      return {
        ...alumno,
        chequeosBienestar,
        ultimoChequeoBienestar,
        alertaMental,
      };
    });

    return NextResponse.json({
      success: true,
      total: alumnos.length,
      alumnos,
    });
  } catch (error) {
    console.error('❌ Error al obtener alumnos:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener lista de alumnos' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const auth = await requireTrainer();
  if (auth.response) return auth.response;

  try {
    let data;
    try {
      data = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Los datos enviados no son válidos' },
        { status: 400 }
      );
    }

    const resultado = await actualizarAlumno(data.id, data);

    if (!resultado.success) {
      return NextResponse.json(resultado, { status: 400 });
    }

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error al actualizar alumno:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el alumno' },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  const auth = await requireTrainer();
  if (auth.response) return auth.response;

  try {
    const body = await req.json();
    const alumnoId = body.alumnoId || body.id;
    const nuevoEstado = body.estadoPago;

    if (!alumnoId || !['PENDIENTE', 'ACTIVO'].includes(nuevoEstado)) {
      return NextResponse.json(
        { success: false, error: 'Estado de pago no válido' },
        { status: 400 }
      );
    }

    let alumnoActualizado = null;

    if (process.env.DATABASE_URL) {
      try {
        alumnoActualizado = await prisma.usuario.update({
          where: { id: alumnoId },
          data: { estadoPago: nuevoEstado },
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            estadoPago: true,
            tipoPlan: true,
          },
        });
      } catch (dbErr) {
        console.warn('⚠️ No se pudo actualizar el pago en PostgreSQL (modo demo):', dbErr.message);
      }
    }

    // Respaldo en memoria para que el cambio se mantenga en modo demo
    const base = ALUMNOS_DEMO.find((alumno) => alumno.id === alumnoId) || {};
    const anterior = obtenerAlumnoDeStore(alumnoId) || {};

    if (!alumnoActualizado) {
      alumnoActualizado = {
        ...base,
        ...anterior,
        id: alumnoId,
        estadoPago: nuevoEstado,
      };
    }

    guardarAlumnoEnStore(alumnoId, {
      estadoPago: nuevoEstado,
      nombre: alumnoActualizado.nombre,
      apellido: alumnoActualizado.apellido,
      email: alumnoActualizado.email,
      tipoPlan: alumnoActualizado.tipoPlan,
    });

    return NextResponse.json({
      success: true,
      mensaje: `El estado de pago del alumno ha sido actualizado a ${nuevoEstado}`,
      alumno: alumnoActualizado,
    });
  } catch (error) {
    console.error('❌ Error al actualizar estado de pago:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cambiar el estado de pago del alumno' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const auth = await requireTrainer();
  if (auth.response) return auth.response;

  try {
    const data = await req.json();
    const {
      nombre, apellido, email, password, whatsapp, peso, altura, lesiones, estadoPago, tipoPlan,
      objetivo, deporte, club, nivel, focos, disponibilidad, rmEstimado, puntosDebiles
    } = data;

    // Generar email único si no se provee
    const finalEmail = email || `alumno-${Date.now()}@motionlab.local`;

    const perfil = {
      objetivo: objetivo || 'Rendimiento',
      deporte: deporte || 'Fitness General',
      club: club === 'true' || club === true,
      nivel: nivel || 'Principiante',
      focos: focos || 'General',
      disponibilidad: disponibilidad || '3 días',
      rmEstimado: rmEstimado || '',
      puntosDebiles: puntosDebiles || '',
    };

    const pesoNumerico = peso ? Number.parseFloat(String(peso).replace(',', '.')) : null;
    const alturaNumerica = altura ? Number.parseFloat(String(altura).replace(',', '.')) : null;

    // 1. Intentar guardar en PostgreSQL cuando la base de datos está configurada
    if (process.env.DATABASE_URL) {
      try {
        let passwordHash = null;
        if (password && password.trim() !== '') {
          passwordHash = await bcrypt.hash(password, 10);
        }

        const nuevoAlumno = await prisma.usuario.create({
          data: {
            nombre: nombre || 'Sin Nombre',
            apellido: apellido || '',
            email: finalEmail.toLowerCase().trim(),
            passwordHash,
            whatsapp,
            peso: Number.isFinite(pesoNumerico) ? pesoNumerico : null,
            altura: Number.isFinite(alturaNumerica) ? alturaNumerica : null,
            lesiones,
            estadoPago: estadoPago || 'PENDIENTE',
            tipoPlan: tipoPlan || 'BASE',
            rol: 'ALUMNO',
            perfilDeportivo: {
              create: perfil,
            }
          },
          include: {
            perfilDeportivo: true,
            rutinasComoAlumno: {
              where: { estado: 'ACTIVA' },
              select: { id: true, nombre: true, fechaAsignada: true },
            },
          }
        });

        return NextResponse.json({ success: true, alumno: nuevoAlumno });
      } catch (error) {
        console.warn('⚠️ No se pudo crear el alumno en PostgreSQL (se usará modo demo):', error.message);
      }
    }

    // 2. Respaldo en memoria para que el panel siga funcionando sin PostgreSQL
    const nuevoId = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const nuevoAlumno = {
      id: nuevoId,
      nombre: nombre || 'Sin Nombre',
      apellido: apellido || '',
      email: finalEmail.toLowerCase().trim(),
      whatsapp: whatsapp || '',
      peso: Number.isFinite(pesoNumerico) ? pesoNumerico : null,
      altura: Number.isFinite(alturaNumerica) ? alturaNumerica : null,
      lesiones: lesiones || '',
      estadoPago: estadoPago || 'PENDIENTE',
      tipoPlan: tipoPlan || 'BASE',
      createdAt: new Date().toISOString(),
      perfilDeportivo: perfil,
      checkins: [],
      alertaBienestar: 'VERDE',
      consecutivosFatiga: 0,
      sesionesBaseline: 0,
      sesionesCompletadas: 0,
      rutinasComoAlumno: [],
      creadoEnDemo: true,
    };

    guardarAlumnoEnStore(nuevoId, nuevoAlumno);

    return NextResponse.json({ success: true, alumno: nuevoAlumno });
  } catch (error) {
    console.error('Error al crear alumno:', error);
    return NextResponse.json({ success: false, error: 'Error al crear el alumno' }, { status: 500 });
  }
}

