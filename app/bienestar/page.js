/**
 * ========================================================================
 * PÁGINA: Chequeo de Bienestar (app/bienestar/page.js)
 * ========================================================================
 * Página privada del alumno. El test de bienestar sólo está disponible con
 * sesión iniciada y el resultado se guarda en su ficha y en el panel de
 * Matías.
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BienestarTest from '@/components/bienestar/BienestarTest';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Chequeo de Bienestar | MOTION LAB',
  description:
    'Test corto de bienestar: descanso, estrés, estado de ánimo, energía y motivación. Resultados y recomendaciones al instante.',
};

export default async function BienestarPage() {
  const session = await getServerSession(authOptions);

  // Defensa extra además del middleware: sin sesión no se muestra el test.
  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 sm:pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <BienestarTest
          alumnoId={session.user.id}
          alumnoNombre={session.user.name || ''}
          logueado
        />
      </main>

      <Footer />
    </div>
  );
}
