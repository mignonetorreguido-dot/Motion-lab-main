/**
 * ========================================================================
 * API: Desvincular reloj (app/api/reloj/desvincular/route.js)
 * ========================================================================
 * Revoca las conexiones del alumno autenticado con Junction (Garmin, Polar,
 * Fitbit, Oura, Withings, etc.). No borra la cuenta de Junction ni los datos
 * de MOTION LAB: el alumno puede volver a vincular el reloj cuando quiera.
 *
 * Si se envía `{ "proveedor": "garmin" }` se desvincula sólo ese proveedor.
 * Sin cuerpo, se desvinculan todas las conexiones activas o con error.
 *
 * La API key de Junction nunca sale del servidor.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  desvincularProveedor,
  junctionConfigurado,
  obtenerProveedores,
  resolverUsuarioJunction,
} from '@/lib/junction';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Iniciá sesión para desvincular tu reloj.' },
      { status: 401 }
    );
  }

  if (!junctionConfigurado()) {
    return NextResponse.json(
      {
        success: false,
        configurado: false,
        error:
          'La sincronización con relojes no está configurada en este entorno.',
      },
      { status: 503 }
    );
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    // Sin cuerpo: se desvinculan todas las conexiones.
    body = {};
  }

  const slugSolicitado =
    typeof body?.proveedor === 'string'
      ? body.proveedor.trim().toLowerCase()
      : '';

  try {
    const usuario = await resolverUsuarioJunction(session.user.id);

    if (!usuario?.user_id) {
      return NextResponse.json({
        success: true,
        configurado: true,
        desvinculados: [],
        fallidos: [],
        message: 'No había un reloj vinculado.',
      });
    }

    const proveedores = await obtenerProveedores(usuario.user_id);
    const objetivos = slugSolicitado
      ? proveedores.filter((proveedor) => proveedor.slug === slugSolicitado)
      : proveedores.filter(
          (proveedor) =>
            proveedor.slug &&
            (proveedor.estado === 'connected' || proveedor.estado === 'error')
        );

    if (slugSolicitado && objetivos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ese dispositivo no está vinculado.' },
        { status: 404 }
      );
    }

    const desvinculados = [];
    const fallidos = [];

    for (const proveedor of objetivos) {
      try {
        await desvincularProveedor(usuario.user_id, proveedor.slug);
        desvinculados.push({
          slug: proveedor.slug,
          nombre: proveedor.nombre,
        });
      } catch (error) {
        console.error(
          `❌ No pudimos desvincular ${proveedor.slug} de Junction:`,
          error
        );
        fallidos.push({
          slug: proveedor.slug,
          nombre: proveedor.nombre,
          error: error.message,
        });
      }
    }

    if (fallidos.length > 0 && desvinculados.length === 0) {
      return NextResponse.json(
        {
          success: false,
          configurado: true,
          desvinculados,
          fallidos,
          error:
            'No pudimos desvincular el reloj. Probá de nuevo en unos segundos.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      configurado: true,
      desvinculados,
      fallidos,
      message:
        desvinculados.length > 0
          ? 'El reloj se desvinculó correctamente.'
          : 'No había un reloj vinculado.',
    });
  } catch (error) {
    console.error('❌ Error al desvincular el reloj en Junction:', error);
    return NextResponse.json(
      {
        success: false,
        configurado: true,
        error:
          'No pudimos desvincular el reloj en este momento. Probá de nuevo en unos segundos.',
      },
      { status: 502 }
    );
  }
}
