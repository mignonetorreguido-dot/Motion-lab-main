/**
 * ========================================================================
 * API: Estado de la prueba de Google Fit (app/api/google-fit/estado/route.js)
 * ========================================================================
 * Lee el token guardado en la cookie HttpOnly, lo renueva si hace falta y
 * consulta Google Fit en vivo. No guarda datos de salud en PostgreSQL.
 *
 * Solo responde si GOOGLE_FIT_TEST=1. El alumno debe tener sesión iniciada.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  GOOGLE_FIT_COOKIE,
  GOOGLE_FIT_COOKIE_MAX_AGE,
} from '@/lib/googleFitScopes';
import {
  codificarTokenGoogleFit,
  decodificarTokenGoogleFit,
  googleFitTestActivo,
  obtenerResumenGoogleFit,
  refrescarTokenGoogleFit,
} from '@/lib/googleFit';

export const dynamic = 'force-dynamic';

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function borrarToken(cookieStore) {
  try {
    cookieStore.delete(GOOGLE_FIT_COOKIE);
  } catch {
    // Si la cookie ya no existe, no hay nada que borrar.
  }
}

function guardarToken(cookieStore, tokenData) {
  return codificarTokenGoogleFit(tokenData).then((tokenCifrado) => {
    cookieStore.set(GOOGLE_FIT_COOKIE, tokenCifrado, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: GOOGLE_FIT_COOKIE_MAX_AGE,
    });
  });
}

export async function GET() {
  if (!googleFitTestActivo()) {
    return json(
      {
        success: false,
        configurado: false,
        error: 'La prueba de Google Fit no está habilitada.',
      },
      404
    );
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return json(
      {
        success: false,
        configurado: true,
        conectado: false,
        error: 'Iniciá sesión para usar la prueba de Google Fit.',
      },
      401
    );
  }

  const cookieStore = cookies();
  const tokenGuardado = cookieStore.get(GOOGLE_FIT_COOKIE)?.value;

  if (!tokenGuardado) {
    return json({
      success: true,
      configurado: true,
      conectado: false,
      motivo: 'sin_conectar',
    });
  }

  let tokenData = null;

  try {
    tokenData = await decodificarTokenGoogleFit(tokenGuardado);
  } catch {
    borrarToken(cookieStore);
    return json({
      success: true,
      configurado: true,
      conectado: false,
      motivo: 'cookie_invalida',
      error: 'El permiso guardado no se pudo leer. Volvé a conectar.',
    });
  }

  if (!tokenData?.accessToken && !tokenData?.refreshToken) {
    borrarToken(cookieStore);
    return json({
      success: true,
      configurado: true,
      conectado: false,
      motivo: 'cookie_invalida',
      error: 'El permiso guardado está vacío. Volvé a conectar.',
    });
  }

  let actualizado = false;
  const vencePronto =
    !tokenData.expiresAt ||
    Number(tokenData.expiresAt) <= Date.now() + 120000;

  if (!tokenData.accessToken || vencePronto) {
    try {
      tokenData = await refrescarTokenGoogleFit(tokenData);
      await guardarToken(cookieStore, tokenData);
      actualizado = true;
    } catch (error) {
      borrarToken(cookieStore);
      return json({
        success: true,
        configurado: true,
        conectado: false,
        motivo: 'refresh_fallido',
        error:
          error?.message ||
          'No pudimos renovar el permiso de Google Fit. Volvé a conectar.',
      });
    }
  }

  let resumen = null;

  try {
    resumen = await obtenerResumenGoogleFit({
      accessToken: tokenData.accessToken,
      dias: 7,
    });
  } catch (error) {
    console.error('Error al consultar Google Fit:', error?.message || error);
    return json({
      success: true,
      configurado: true,
      conectado: true,
      cuenta: tokenData.email || null,
      scopes: tokenData.scope || [],
      error:
        error?.message ||
        'No pudimos consultar Google Fit en este momento. Probá de nuevo.',
    });
  }

  if (resumen.tokenInvalido) {
    borrarToken(cookieStore);
    return json({
      success: true,
      configurado: true,
      conectado: false,
      motivo: 'token_rechazado',
      error:
        resumen.error ||
        'Google rechazó el permiso guardado. Volvé a conectar tu cuenta.',
    });
  }

  return json({
    success: true,
    configurado: true,
    conectado: true,
    cuenta: tokenData.email || null,
    scopes: tokenData.scope || [],
    actualizado,
    sinRefreshToken: !tokenData.refreshToken,
    ...resumen,
  });
}
