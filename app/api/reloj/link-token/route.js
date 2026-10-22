/**
 * ========================================================================
 * API: Vincular reloj (app/api/reloj/link-token/route.js)
 * ========================================================================
 * Crea (o recupera) el usuario de Junction y genera un token corto para
 * abrir el flujo OAuth de Garmin, Polar, Fitbit, Google Health/Pixel,
 * Oura, Withings u otro proveedor en la nube.
 *
 * La API key de Junction nunca sale del servidor.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  asegurarUsuarioJunction,
  crearLinkToken,
  junctionConfigurado,
} from '@/lib/junction';

export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Iniciá sesión para vincular tu reloj.' },
      { status: 401 }
    );
  }

  if (!junctionConfigurado()) {
    return NextResponse.json(
      {
        success: false,
        error:
          'La vinculación con relojes todavía no está configurada en este entorno.',
      },
      { status: 503 }
    );
  }

  try {
    const usuario = await asegurarUsuarioJunction(session.user.id);
    const token = await crearLinkToken(usuario.user_id);

    return NextResponse.json({
      success: true,
      linkWebUrl: token.linkWebUrl,
      env: token.entorno,
      region: token.region,
    });
  } catch (error) {
    console.error('❌ Error al generar el enlace de vinculación:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          'No pudimos abrir la vinculación del reloj. Probá de nuevo en unos segundos.',
      },
      { status: 502 }
    );
  }
}
