/**
 * ========================================================================
 * AUTORIZACIÓN DEL ENTRENADOR (lib/requireTrainer.js)
 * ========================================================================
 * Centraliza la verificación de sesión para las rutas administrativas.
 * El panel de Matías no debe quedar accesible sólo por conocer la URL:
 * la página y sus endpoints principales exigen rol ENTRENADOR.
 */

import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function requireTrainer() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.rol !== 'ENTRENADOR') {
    return {
      response: NextResponse.json(
        { success: false, error: 'Acceso reservado al entrenador.' },
        { status: 401 }
      ),
    };
  }

  return { session };
}
