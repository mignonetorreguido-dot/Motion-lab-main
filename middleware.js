/**
 * ========================================================================
 * MIDDLEWARE DE SESIÓN (middleware.js)
 * ========================================================================
 * 1. Si el usuario ya inició sesión, /login no vuelve a mostrar el formulario:
 *    lo redirige a su panel.
 * 2. /entrenamiento y /bienestar son privados: sin sesión no se renderizan
 *    ni se muestra el contenido de demo. Se redirige al login.
 */

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const SECRET =
  process.env.NEXTAUTH_SECRET || 'motion_lab_super_secret_jwt_key_2026';

function esRutaPrivada(pathname) {
  return (
    pathname === '/entrenamiento' ||
    pathname.startsWith('/entrenamiento/') ||
    pathname === '/bienestar' ||
    pathname.startsWith('/bienestar/')
  );
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (esRutaPrivada(pathname)) {
    const token = await getToken({ req: request, secret: SECRET });

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.search = '';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  if (pathname !== '/login') {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: SECRET });

  if (!token) {
    return NextResponse.next();
  }

  const destino = token.rol === 'ENTRENADOR' ? '/admin' : '/entrenamiento';
  const url = request.nextUrl.clone();
  url.pathname = destino;
  url.search = '';

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/login',
    '/entrenamiento',
    '/entrenamiento/:path*',
    '/bienestar',
    '/bienestar/:path*',
  ],
};
