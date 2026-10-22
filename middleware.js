/**
 * ========================================================================
 * MIDDLEWARE DE SESIÓN (middleware.js)
 * ========================================================================
 * Si el usuario ya inició sesión, /login no vuelve a mostrar el formulario:
 * lo redirige a su panel. Esto evita que al usar el botón "atrás" parezca
 * que la sesión se cerró.
 */

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const SECRET =
  process.env.NEXTAUTH_SECRET || 'motion_lab_super_secret_jwt_key_2026';

export async function middleware(request) {
  if (request.nextUrl.pathname !== '/login') {
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
  matcher: ['/login'],
};
