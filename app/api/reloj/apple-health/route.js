/**
 * ========================================================================
 * API: Importación manual de Apple Health (app/api/reloj/apple-health/route.js)
 * ========================================================================
 * GET    -> devuelve el resumen importado del alumno autenticado.
 * POST   -> guarda el resumen que el navegador extrajo del export.zip.
 * DELETE -> elimina la importación del alumno.
 *
 * El ZIP completo nunca llega a esta API: el parser corre en el navegador y
 * solo se envía un JSON pequeño con los últimos 30 días.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  eliminarImportacionAppleHealth,
  guardarImportacionAppleHealth,
  normalizarResumenAppleHealth,
  obtenerImportacionAppleHealth,
} from '@/lib/appleHealthStore';

export const dynamic = 'force-dynamic';

const LIMITE_RESUMEN = 300000; // ~300 KB, muy por debajo del límite de Vercel.

function noAutorizado(mensaje) {
  return NextResponse.json({ success: false, error: mensaje }, { status: 401 });
}

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return noAutorizado('Iniciá sesión para consultar tus datos de Apple Salud.');
  }

  const { searchParams } = new URL(request.url);
  const solicitado = searchParams.get('alumnoId');
  let alumnoId = session.user.id;

  if (solicitado && solicitado !== session.user.id) {
    if (session.user.rol !== 'ENTRENADOR') {
      return NextResponse.json(
        { success: false, error: 'No tenés permiso para ver otro alumno.' },
        { status: 403 }
      );
    }
    alumnoId = solicitado;
  }

  try {
    const importacion = await obtenerImportacionAppleHealth(alumnoId);
    return NextResponse.json({
      success: true,
      alumnoId,
      importado: Boolean(importacion),
      importacion,
    });
  } catch (error) {
    console.error('❌ Error al leer la importación de Apple Health:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          'No pudimos leer la importación de Apple Salud. Probá de nuevo en unos segundos.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return noAutorizado('Iniciá sesión para importar tus datos de Apple Salud.');
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'No pudimos leer el resumen enviado.' },
      { status: 400 }
    );
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      { success: false, error: 'El resumen enviado no es válido.' },
      { status: 400 }
    );
  }

  let resumen;
  try {
    resumen = normalizarResumenAppleHealth(body.resumen);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          'El resumen de Apple Salud no tiene el formato esperado.',
      },
      { status: 400 }
    );
  }

  if (JSON.stringify(resumen).length > LIMITE_RESUMEN) {
    return NextResponse.json(
      {
        success: false,
        error:
          'El resumen es demasiado grande. Probá exportando un rango más corto de datos.',
      },
      { status: 413 }
    );
  }

  const nombreCrudo =
    body.archivoNombre || body.resumen?.archivo?.nombre || 'export.zip';
  const archivoNombre = String(nombreCrudo)
    .split(/[\\/]/)
    .pop()
    .slice(0, 200);
  const bytesCrudos =
    body.archivoBytes ?? body.resumen?.archivo?.bytes ?? null;
  const archivoBytes = Number(bytesCrudos);

  try {
    const importacion = await guardarImportacionAppleHealth(session.user.id, {
      resumen,
      archivoNombre,
      archivoBytes: Number.isFinite(archivoBytes) ? archivoBytes : null,
    });

    return NextResponse.json({ success: true, importacion });
  } catch (error) {
    console.error('❌ Error al guardar la importación de Apple Health:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          'No pudimos guardar la importación. Probá de nuevo en unos segundos.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return noAutorizado('Iniciá sesión para eliminar tus datos de Apple Salud.');
  }

  try {
    const eliminados = await eliminarImportacionAppleHealth(session.user.id);
    return NextResponse.json({ success: true, eliminados });
  } catch (error) {
    console.error('❌ Error al eliminar la importación de Apple Health:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          'No pudimos eliminar la importación. Probá de nuevo en unos segundos.',
      },
      { status: 500 }
    );
  }
}
