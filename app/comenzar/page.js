/**
 * ========================================================================
 * PÁGINA: Comenzar / Elección de perfil (app/comenzar/page.js)
 * ========================================================================
 * Punto de entrada elegido desde el botón "Comenzar" de la landing.
 * Ofrece dos caminos:
 *   - Alumno: crear una cuenta o iniciar sesión.
 *   - Profesor: acceder al panel exclusivo de Matías con su cuenta única
 *     (email) y su PIN privado.
 */

import StartShell from '@/components/start/StartShell';

export const metadata = {
  title: 'Comenzar | MOTION LAB',
  description:
    'Elegí cómo ingresar a MOTION LAB: creá tu cuenta de alumno o accedé al panel del entrenador con su cuenta única y PIN.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ComenzarPage({ searchParams }) {
  const rol =
    searchParams?.rol === 'profesor'
      ? 'profesor'
      : searchParams?.rol === 'alumno'
        ? 'alumno'
        : null;

  return <StartShell rolInicial={rol} />;
}
