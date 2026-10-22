import { NextResponse } from 'next/server';

/**
 * ========================================================================
 * CIERRE DE SESIÓN (app/salir/route.js)
 * ========================================================================
 * Cierra la sesión JWT de NextAuth sin depender de JavaScript del cliente.
 * Se usa desde un formulario HTML (POST), así funciona incluso si la página
 * todavía no se hidrató o si falló la carga de un chunk.
 */

export const dynamic = 'force-dynamic';

const COOKIES_BASE = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'next-auth.callback-url',
  '__Secure-next-auth.callback-url',
  'next-auth.csrf-token',
  '__Host-next-auth.csrf-token',
];

function nombresDeCookies() {
  const nombres = [];

  for (const base of COOKIES_BASE) {
    nombres.push(base);

    // NextAuth divide el token en partes cuando supera el tamaño permitido.
    for (let i = 0; i < 6; i += 1) {
      nombres.push(`${base}.${i}`);
    }
  }

  return nombres;
}

export async function POST(request) {
  const response = NextResponse.redirect(new URL('/', request.url), 303);

  for (const nombre of nombresDeCookies()) {
    const seguro =
      nombre.startsWith('__Secure-') || nombre.startsWith('__Host-');

    response.cookies.set(nombre, '', {
      path: '/',
      expires: new Date(0),
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
      secure: seguro,
    });
  }

  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}
