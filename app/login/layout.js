/**
 * ========================================================================
 * METADATOS DE ACCESO (app/login/layout.js) - MOTION LAB
 * ========================================================================
 * La página de login es un componente de cliente y no puede exportar
 * metadata. Este layout le agrega título, descripción y URL canónica para
 * que Google no la trate como una copia sin versión preferida.
 */

export const metadata = {
  title: 'Iniciar Sesión | MOTION LAB',
  description:
    'Ingresá a tu cuenta de MOTION LAB para ver tu planificación, registrar tus entrenamientos y seguir tu progreso.',
  alternates: {
    canonical: '/login',
  },
};

export default function LoginLayout({ children }) {
  return children;
}
