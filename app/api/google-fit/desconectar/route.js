/**
 * ========================================================================
 * API: Desconectar Google Fit (app/api/google-fit/desconectar/route.js)
 * ========================================================================
 * Borra la cookie del permiso y, si se puede, revoca el token en Google.
 * No toca la sesión de MOTION LAB ni la base de datos.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  GOOGLE_FIT_COOKIE,
  GOOGLE_FIT_INTENT_COOKIE,
} from '@/lib/googleFitScopes';
import {
  decodificarTokenGoogleFit,
  googleFitTestActivo,
  revocarTokenGoogleFit,
} from '@/lib/googleFit';

export const dynamic = 'force-dynamic';

export async function POST() {
  if (!googleFitTestActivo()) {
    return NextResponse.json(
      {
        success: false,
        configurado: false,
        error: 'La prueba de Google Fit no está habilitada.',
      },
      { status: 404 }
    );
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Iniciá sesión para desconectar Google Fit.' },
      { status: 401 }
    );
  }

  const cookieStore = cookies();
  const tokenGuardado = cookieStore.get(GOOGLE_FIT_COOKIE)?.value;

  if (tokenGuardado) {
    try {
      const tokenData = await decodificarTokenGoogleFit(tokenGuardado);
      await revocarTokenGoogleFit(
        tokenData?.refreshToken || tokenData?.accessToken
      );
    } catch {
      // Aunque no se pueda decodificar o revocar, borramos la cookie local.
    }
  }

  cookieStore.delete(GOOGLE_FIT_COOKIE);
  cookieStore.delete(GOOGLE_FIT_INTENT_COOKIE);

  return NextResponse.json(
    { success: true },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
