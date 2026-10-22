/**
 * ========================================================================
 * ENDPOINT API: Chequeo de Bienestar (app/api/bienestar/route.js)
 * ========================================================================
 * - POST: recibe las 10 respuestas del alumno, calcula el resultado y lo
 *   guarda en PostgreSQL. Si la base no está disponible, usa el almacén
 *   en memoria para que el panel de Matías lo vea igual.
 * - GET: devuelve el historial del alumno autenticado. El entrenador puede
 *   consultar a cualquier alumno usando ?alumnoId=...
 *
 * El cuestionario es orientativo y no reemplaza la opinión de un profesional.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import {
  calcularResultado,
  esChequeoDeEstaSemana,
  respuestasCompletas,
} from '@/lib/bienestar';
import {
  guardarChequeoBienestarEnStore,
  obtenerChequeosBienestarDeStore,
} from '@/lib/fallbackStore';

export const dynamic = 'force-dynamic';

function parsearRespuestas(valor) {
  if (!valor) return {};
  if (typeof valor === 'object') return valor;
  try {
    return JSON.parse(valor);
  } catch {
    return {};
  }
}

function normalizarChequeo(registro) {
  if (!registro) return null;

  const respuestas = parsearRespuestas(registro.respuestas);
  const resultado = respuestasCompletas(respuestas) ? calcularResultado(respuestas) : null;

  return {
    id: registro.id,
    alumnoId: registro.alumnoId,
    fecha:
      registro.fecha instanceof Date
        ? registro.fecha.toISOString()
        : new Date(registro.fecha).toISOString(),
    descanso: Number(registro.descanso) || 0,
    estres: Number(registro.estres) || 0,
    animo: Number(registro.animo) || 0,
    energia: Number(registro.energia) || 0,
    motivacion: Number(registro.motivacion) || 0,
    puntajeGeneral: Number(registro.puntajeGeneral) || 0,
    nivelGeneral: registro.nivelGeneral || 'ATENCION',
    respuestas,
    recomendaciones: Array.isArray(registro.recomendaciones)
      ? registro.recomendaciones
      : (() => {
          try {
            return JSON.parse(registro.recomendaciones || '[]');
          } catch {
            return [];
          }
        })(),
    comentario: registro.comentario || '',
    resultado,
  };
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Iniciá sesión para guardar tu chequeo de bienestar.',
        },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Los datos enviados no son válidos.' },
        { status: 400 }
      );
    }

    const respuestas = body?.respuestas || {};
    const comentario = typeof body?.comentario === 'string'
      ? body.comentario.trim().slice(0, 1000)
      : '';

    if (!respuestasCompletas(respuestas)) {
      return NextResponse.json(
        { success: false, error: 'Respondé las 10 preguntas antes de guardar.' },
        { status: 400 }
      );
    }

    // El chequeo es semanal: si el alumno ya lo completó esta semana,
    // devolvemos el existente para no duplicar el seguimiento.
    let chequeoExistente =
      obtenerChequeosBienestarDeStore(session.user.id).find((item) =>
        esChequeoDeEstaSemana(item.fecha)
      ) || null;

    if (!chequeoExistente && process.env.DATABASE_URL) {
      try {
        const recientes = await prisma.chequeoBienestar.findMany({
          where: { alumnoId: session.user.id },
          orderBy: { fecha: 'desc' },
          take: 10,
        });
        chequeoExistente =
          recientes.find((item) => esChequeoDeEstaSemana(item.fecha)) || null;
      } catch (dbError) {
        console.warn(
          '⚠️ No se pudo verificar el chequeo semanal en PostgreSQL:',
          dbError.message
        );
      }
    }

    if (chequeoExistente) {
      return NextResponse.json({
        success: true,
        yaRealizado: true,
        persistido: true,
        mensaje:
          'Ya completaste tu chequeo de bienestar de esta semana. Podés volver la próxima semana.',
        chequeo: normalizarChequeo(chequeoExistente),
      });
    }

    const resultado = calcularResultado(respuestas);
    const id = `bienestar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const puntajes = Object.fromEntries(
      resultado.dimensiones.map((dimension) => [dimension.id, dimension.puntaje])
    );

    const registro = {
      id,
      alumnoId: session.user.id,
      fecha: new Date(),
      descanso: puntajes.descanso || 0,
      estres: puntajes.estres || 0,
      animo: puntajes.animo || 0,
      energia: puntajes.energia || 0,
      motivacion: puntajes.motivacion || 0,
      puntajeGeneral: resultado.puntajeGeneral,
      nivelGeneral: resultado.nivelGeneral.clave,
      respuestas,
      recomendaciones: resultado.recomendaciones,
      comentario,
      createdAt: new Date(),
    };

    // Guardamos siempre en memoria para que el panel del entrenador tenga
    // una lectura inmediata, incluso si la base tarda o no está disponible.
    guardarChequeoBienestarEnStore(registro);

    let persistido = false;
    if (process.env.DATABASE_URL) {
      try {
        await prisma.chequeoBienestar.create({
          data: {
            id: registro.id,
            alumnoId: registro.alumnoId,
            fecha: registro.fecha,
            descanso: registro.descanso,
            estres: registro.estres,
            animo: registro.animo,
            energia: registro.energia,
            motivacion: registro.motivacion,
            puntajeGeneral: registro.puntajeGeneral,
            nivelGeneral: registro.nivelGeneral,
            respuestas: JSON.stringify(respuestas),
            recomendaciones: JSON.stringify(registro.recomendaciones),
            comentario: registro.comentario || null,
          },
        });
        persistido = true;
      } catch (dbError) {
        console.warn(
          '⚠️ No se pudo guardar el chequeo de bienestar en PostgreSQL (queda en memoria):',
          dbError.message
        );
      }
    }

    return NextResponse.json({
      success: true,
      persistido,
      mensaje: persistido
        ? 'Chequeo guardado. Matías va a poder ver tus resultados.'
        : 'Chequeo guardado temporalmente. Matías va a poder verlo en esta sesión.',
      chequeo: normalizarChequeo(registro),
    });
  } catch (error) {
    console.error('❌ Error al guardar el chequeo de bienestar:', error);
    return NextResponse.json(
      { success: false, error: 'No pudimos guardar el chequeo. Intentá de nuevo.' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const solicitado = searchParams.get('alumnoId');
    const esEntrenador = session?.user?.rol === 'ENTRENADOR';

    // Sin sesión no exponemos historiales de alumnos.
    if (!session?.user?.id) {
      return NextResponse.json({ success: true, chequeos: [], chequeoEstaSemana: null });
    }

    const alumnoId = esEntrenador
      ? solicitado || session.user.id
      : session.user.id;

    let deBaseDeDatos = [];
    if (process.env.DATABASE_URL) {
      try {
        deBaseDeDatos = await prisma.chequeoBienestar.findMany({
          where: { alumnoId },
          orderBy: { fecha: 'desc' },
          take: 20,
        });
      } catch (dbError) {
        console.warn(
          '⚠️ No se pudo leer el historial de bienestar en PostgreSQL:',
          dbError.message
        );
      }
    }

    const deMemoria = obtenerChequeosBienestarDeStore(alumnoId);
    const unicos = new Map();

    // La memoria se coloca después para que el último chequeo recién hecho
    // se vea aunque la consulta a la base tenga unos segundos de retraso.
    [...deBaseDeDatos, ...deMemoria].forEach((registro) => {
      if (registro?.id) unicos.set(registro.id, registro);
    });

    const chequeos = [...unicos.values()]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 20)
      .map(normalizarChequeo)
      .filter(Boolean);

    const chequeoEstaSemana =
      chequeos.find((item) => esChequeoDeEstaSemana(item.fecha)) || null;

    return NextResponse.json({
      success: true,
      alumnoId,
      total: chequeos.length,
      chequeos,
      chequeoEstaSemana,
    });
  } catch (error) {
    console.error('❌ Error al obtener el historial de bienestar:', error);
    return NextResponse.json(
      { success: false, error: 'No pudimos cargar el historial de bienestar.' },
      { status: 500 }
    );
  }
}
