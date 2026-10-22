/**
 * ========================================================================
 * PÁGINA: Entrenamiento del Alumno (app/entrenamiento/page.js)
 * ========================================================================
 * Pantalla interactiva donde el alumno:
 * 1. Accede a su Hub con el entrenamiento de hoy y cronograma semanal asignado por Matías.
 * 2. Puede alternar al Modo Soleado para ver sus series bajo el sol en pista o campo.
 * 3. Registra series interactivas con auto-minimización y notas técnicas.
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import TrainingContainer from '@/components/training/TrainingContainer';
import TrainingHeader from '@/components/training/TrainingHeader';

export const metadata = {
  title: 'Mi Entrenamiento • Plan Semanal | MOTION LAB',
  description: 'Seguimiento interactivo de series, cronograma semanal y observaciones de entrenamiento.',
};

export default async function EntrenamientoPage() {
  const session = await getServerSession(authOptions);

  // Defensa extra además del middleware: sin sesión no se muestra ningún
  // entrenamiento, ni siquiera el alumno de demostración.
  if (!session?.user?.id) {
    redirect('/login');
  }

  const alumnoId = session.user.id;
  const alumnoNombre = session.user.name || '';
  const estadoPago = session.user.estadoPago || 'ACTIVO';

  return (
    <div className="min-h-screen flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
      {/* CABECERA CON TOGGLE SOLEADO Y SESIÓN */}
      <TrainingHeader user={session?.user} />

      {/* CONTENIDO PRINCIPAL CON EL ID DEL ALUMNO AUTENTICADO */}
      <main className="flex-grow max-w-4xl mx-auto w-full pb-8">
        <TrainingContainer
          alumnoId={alumnoId}
          alumnoNombre={alumnoNombre}
          estadoPago={estadoPago}
        />
      </main>

      {/* PIE */}
      <footer className="max-w-4xl mx-auto w-full text-center pt-8 pb-8 text-xs text-slate-500">
        © {new Date().getFullYear()} MOTION LAB • Planificación Semanal y Planilla Digital de Entrenamiento.
      </footer>
    </div>
  );
}
