/**
 * ========================================================================
 * PÁGINA: Dashboard del Entrenador Matías (app/admin/page.js)
 * ========================================================================
 * Acceso al panel administrativo para validar pagos de alumnos y
 * asignar rutinas en los 3 bloques metodológicos de Motion Lab.
 * Incluye toggle de Modo Soleado / Noche en la cabecera.
 *
 * El acceso está reservado al rol ENTRENADOR. Si no hay sesión, se redirige
 * al login; si la sesión es de alumno, se redirige a su entrenamiento.
 */

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import DashboardTrainer from '@/components/admin/DashboardTrainer';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Panel del Entrenador • Matías | MOTION LAB',
  description: 'Gestión de alumnos, validación de pagos y asignación de rutinas en 3 bloques.',
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  if (session.user.rol !== 'ENTRENADOR') {
    redirect('/entrenamiento');
  }

  return (
    <AdminShell>
      <DashboardTrainer />
    </AdminShell>
  );
}
