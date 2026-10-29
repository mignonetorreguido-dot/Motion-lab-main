/**
 * ========================================================================
 * ENDPOINT API: Rutinas en 3 Bloques y Plan Semanal (app/api/rutinas/route.js)
 * ========================================================================
 * Soporta persistencia híbrida:
 * 1. PostgreSQL mediante Prisma cuando la base de datos está conectada.
 * 2. Almacén compartido en memoria (fallbackStore) para asegurar que el alumno
 *    vea sus rutinas de inmediato, incluso sin base de datos activa o en caso de fallo de red.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  guardarRutinasEnStore,
  obtenerRutinasDeStore,
  eliminarRutinaDeStore,
  eliminarRutinasEnDesusoDeStore,
  obtenerRutinasEnDesusoDeStore,
} from '@/lib/fallbackStore';
import { requireTrainer } from '@/lib/requireTrainer';
import { emailEntrenadorActual } from '@/lib/trainerPin';

// ------------------------------------------------------------------------
// GET: Obtener las rutinas activas del alumno para armar el plan semanal
// ------------------------------------------------------------------------
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const alumnoId = searchParams.get('alumnoId') || 'demo-alumno-1';
    const diaId = searchParams.get('diaId');

    let rutinasActivas = [];

    // 1. Intentar consultar rutinas en PostgreSQL mediante Prisma
    if (process.env.DATABASE_URL) {
      try {
        rutinasActivas = await prisma.rutina.findMany({
          where: {
            alumnoId: alumnoId,
            estado: 'ACTIVA',
          },
          orderBy: {
            createdAt: 'asc', // Ordenar por creación para tener Día 1, Día 2...
          },
          include: {
            bloques: {
              orderBy: { orden: 'asc' },
              include: {
                ejercicios: {
                  include: {
                    series: {
                      orderBy: { numeroSerie: 'asc' },
                    },
                  },
                },
              },
            },
          },
        });
      } catch (dbErr) {
        console.warn('⚠️ No se pudo consultar rutinas en PostgreSQL (usando fallbackStore):', dbErr.message);
      }
    }

    // 2. Si PostgreSQL no arrojó rutinas o no está conectado, consultar el almacén en memoria
    if (!rutinasActivas || rutinasActivas.length === 0) {
      const rutinasStore = obtenerRutinasDeStore(alumnoId);
      if (rutinasStore && rutinasStore.length > 0) {
        rutinasActivas = rutinasStore;
      }
    }

    // 3. Consultar rutinas en desuso (completadas o archivadas)
    let rutinasEnDesuso = [];
    if (process.env.DATABASE_URL) {
      try {
        rutinasEnDesuso = await prisma.rutina.findMany({
          where: {
            alumnoId: alumnoId,
            estado: 'COMPLETADA',
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            fechaAsignada: true,
            fechaCompletada: true,
            createdAt: true,
          },
        });
      } catch (dbErr) {
        console.warn('⚠️ No se pudo consultar rutinas completadas en PostgreSQL:', dbErr.message);
      }
    }

    if (!rutinasEnDesuso || rutinasEnDesuso.length === 0) {
      rutinasEnDesuso = obtenerRutinasEnDesusoDeStore(alumnoId).map((r) => ({
        id: r.id,
        nombre: r.nombre,
        descripcion: r.descripcion,
        fechaAsignada: r.fechaAsignada || r.createdAt,
        fechaCompletada: r.fechaCompletada,
        createdAt: r.createdAt,
      }));
    }

    // 4. Armar la respuesta estructurada del plan semanal
    if (rutinasActivas.length > 0) {
      let rutinaSeleccionada = rutinasActivas[0];
      if (diaId) {
        const encontrada = rutinasActivas.find((r) => r.id === diaId);
        if (encontrada) rutinaSeleccionada = encontrada;
      }

      const planSemanal = rutinasActivas.map((rutina, idx) => ({
        id: rutina.id,
        numeroDia: idx + 1,
        nombre: rutina.nombre,
        enfoque: rutina.descripcion || '',
        duracionMin: 60,
        estado: idx === 0 ? 'HOY' : 'PENDIENTE',
        ejerciciosCount: (rutina.bloques || []).reduce(
          (acc, b) => acc + (b.ejercicios ? b.ejercicios.length : 0),
          0
        ),
        bloquesCount: (rutina.bloques || []).length,
        bloques: rutina.bloques || [],
        energiaInicial: rutina.energiaInicial,
        animoInicial: rutina.animoInicial,
        descansoInicial: rutina.descansoInicial,
        animoFinal: rutina.animoFinal,
        esfuerzoFinal: rutina.esfuerzoFinal,
        desahogoFinal: rutina.desahogoFinal,
        fechaCompletada: rutina.fechaCompletada,
      }));

      return NextResponse.json({
        success: true,
        rutina: rutinaSeleccionada,
        planSemanal,
        diaHoyId: rutinasActivas[0].id,
        rutinasEnDesuso,
        totalEnDesuso: rutinasEnDesuso.length,
      });
    }

    // Si aún no se asignó ninguna rutina a este alumno específico
    return NextResponse.json({
      success: true,
      rutina: null,
      planSemanal: [],
      diaHoyId: null,
      rutinasEnDesuso,
      totalEnDesuso: rutinasEnDesuso.length,
    });
  } catch (error) {
    console.error('❌ Error al obtener la rutina:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener la rutina' },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------------------
// POST: Asignar o crear una rutina de múltiples días
// ------------------------------------------------------------------------
export async function POST(request) {
  const auth = await requireTrainer();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const { alumnoId, dias } = body;

    if (!alumnoId || !dias || !Array.isArray(dias)) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios o el formato de "dias" es inválido' },
        { status: 400 }
      );
    }

    // 1. Guardar SIEMPRE de inmediato en fallbackStore
    // Esto garantiza que el alumno verá su rutina sin importar el estado de PostgreSQL
    const planFormateado = guardarRutinasEnStore(alumnoId, dias);

    // 2. Intentar sincronizar y persistir en PostgreSQL si la conexión está disponible
    if (process.env.DATABASE_URL) {
      try {
        // Asegurar que el entrenador exista en la tabla usuarios para no violar la Foreign Key
        await prisma.usuario.upsert({
          where: { id: 'matias-coach-id' },
          update: {},
          create: {
            id: 'matias-coach-id',
            nombre: 'Matías',
            apellido: 'Entrenador',
            email: emailEntrenadorActual(),
            rol: 'ENTRENADOR',
            estadoPago: 'ACTIVO',
            tipoPlan: 'PREMIUM',
          },
        });

        // Asegurar que el alumno exista en la tabla usuarios
        const alumnoExiste = await prisma.usuario.findUnique({
          where: { id: alumnoId },
        });

        if (!alumnoExiste) {
          await prisma.usuario.create({
            data: {
              id: alumnoId,
              nombre: 'Alumno',
              email: `${alumnoId}@motionlab.local`,
              rol: 'ALUMNO',
              estadoPago: 'ACTIVO',
              tipoPlan: 'PREMIUM',
            },
          });
        }

        // Marcar rutinas anteriores como completadas
        await prisma.rutina.updateMany({
          where: { alumnoId: alumnoId, estado: 'ACTIVA' },
          data: { estado: 'COMPLETADA' },
        });

        // Insertar secuencialmente los nuevos días
        for (const dia of dias) {
          await prisma.rutina.create({
            data: {
              alumnoId,
              entrenadorId: 'matias-coach-id',
              nombre: dia.nombre,
              descripcion: dia.descripcion || '',
              bloques: {
                create: (dia.bloques || []).map((bloque, indexBloque) => ({
                  tipo: bloque.tipo,
                  orden: indexBloque + 1,
                  ejercicios: {
                    create: (bloque.ejercicios || []).map((ej) => ({
                      nombre: ej.nombre || 'Ejercicio sin nombre',
                      indicacionProfe: ej.indicacionProfe || '',
                      videoUrl: ej.videoUrl || null,
                      videoRecomendacion: ej.videoRecomendacion || null,
                      rirObjetivo: ej.rirObjetivo ? parseInt(ej.rirObjetivo, 10) : null,
                      series: {
                        create: (ej.series || []).map((s, idxSerie) => ({
                          numeroSerie: idxSerie + 1,
                          repsRealizadas: s.repsRealizadas ? parseInt(s.repsRealizadas, 10) : null,
                          cargaKg: s.cargaKg ? parseFloat(s.cargaKg) : null,
                          rir: s.rir ? parseInt(s.rir, 10) : null,
                          rpe: s.rpe ? parseFloat(s.rpe) : null,
                          completado: false,
                        })),
                      },
                    })),
                  },
                })),
              },
            },
          });
        }
      } catch (dbErr) {
        console.warn('⚠️ No se pudo persistir en PostgreSQL (se usará almacén en memoria):', dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      mensaje: '¡Plan semanal asignado exitosamente al alumno!',
      planSemanal: planFormateado,
    });
  } catch (error) {
    console.error('❌ Error al crear la rutina:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno al procesar el plan' },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------------------
// DELETE: Eliminar rutinas activas, días específicos o rutinas en desuso
// ------------------------------------------------------------------------
export async function DELETE(request) {
  const auth = await requireTrainer();
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    let rutinaId = searchParams.get('rutinaId');
    let alumnoId = searchParams.get('alumnoId');
    let enDesuso = searchParams.get('enDesuso') === 'true';

    try {
      const body = await request.json();
      if (body.rutinaId) rutinaId = body.rutinaId;
      if (body.alumnoId) alumnoId = body.alumnoId;
      if (body.enDesuso !== undefined) enDesuso = Boolean(body.enDesuso);
    } catch {
      // Body vacío o formato no-JSON
    }

    if (!rutinaId && !alumnoId && !enDesuso) {
      return NextResponse.json(
        { success: false, error: 'Se requiere rutinaId, alumnoId o el parámetro enDesuso' },
        { status: 400 }
      );
    }

    // 1. Caso: Eliminar una rutina o día puntual por su ID
    if (rutinaId) {
      if (process.env.DATABASE_URL) {
        try {
          await prisma.rutina.delete({
            where: { id: rutinaId },
          });
        } catch (dbErr) {
          console.warn('⚠️ No se pudo eliminar rutina en DB:', dbErr.message);
        }
      }
      eliminarRutinaDeStore(alumnoId, rutinaId);
      return NextResponse.json({
        success: true,
        mensaje: 'Rutina eliminada exitosamente',
      });
    }

    // 2. Caso: Eliminar rutinas en desuso (completadas) de un alumno o globales
    if (enDesuso) {
      if (process.env.DATABASE_URL) {
        try {
          const whereClause = { estado: 'COMPLETADA' };
          if (alumnoId) whereClause.alumnoId = alumnoId;
          await prisma.rutina.deleteMany({
            where: whereClause,
          });
        } catch (dbErr) {
          console.warn('⚠️ No se pudieron eliminar rutinas en desuso en DB:', dbErr.message);
        }
      }
      eliminarRutinasEnDesusoDeStore(alumnoId || null);
      return NextResponse.json({
        success: true,
        mensaje: alumnoId
          ? 'Rutinas en desuso del alumno eliminadas exitosamente'
          : 'Todas las rutinas en desuso han sido eliminadas exitosamente',
      });
    }

    // 3. Caso: Eliminar toda la rutina activa del alumno
    if (alumnoId) {
      if (process.env.DATABASE_URL) {
        try {
          await prisma.rutina.deleteMany({
            where: { alumnoId: alumnoId },
          });
        } catch (dbErr) {
          console.warn('⚠️ No se pudieron eliminar las rutinas del alumno en DB:', dbErr.message);
        }
      }
      eliminarRutinaDeStore(alumnoId);
      return NextResponse.json({
        success: true,
        mensaje: 'Rutinas del alumno eliminadas exitosamente',
      });
    }
  } catch (error) {
    console.error('❌ Error al eliminar rutina:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno al procesar la eliminación' },
      { status: 500 }
    );
  }
}
