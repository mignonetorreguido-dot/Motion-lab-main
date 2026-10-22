/**
 * ========================================================================
 * API: Estado del reloj / recuperación (app/api/reloj/estado/route.js)
 * ========================================================================
 * Devuelve el estado real de la conexión con Junction para el alumno
 * autenticado. El entrenador puede consultar a un alumno con ?alumnoId=...
 * No devuelve la API key ni tokens.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { obtenerEstadoReloj, junctionConfigurado } from '@/lib/junction';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Iniciá sesión para consultar tu reloj.' },
      { status: 401 }
    );
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

  if (!junctionConfigurado()) {
    return NextResponse.json({
      success: true,
      configurado: false,
      conectado: false,
      proveedores: [],
      alumnoId,
    });
  }

  try {
    const estado = await obtenerEstadoReloj(alumnoId);
    return NextResponse.json({ success: true, alumnoId, ...estado });
  } catch (error) {
    console.error('❌ Error al consultar el reloj en Junction:', error);
    return NextResponse.json(
      {
        success: false,
        configurado: true,
        conectado: false,
        proveedores: [],
        error:
          'No pudimos consultar el reloj en este momento. Probá de nuevo en unos segundos.',
      },
      { status: 502 }
    );
  }
}
