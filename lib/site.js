/**
 * ========================================================================
 * DATOS DEL SITIO (lib/site.js)
 * ========================================================================
 * Nombre, URL y textos que Google usa para identificar el sitio en los
 * resultados de búsqueda. Se comparten entre el layout y la página de inicio
 * para que el título, Open Graph y los datos estructurados coincidan.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  'https://motion-lab-high-performance.vercel.app'
).replace(/\/$/, '');

export const SITE_NAME = 'MOTION LAB';

export const SITE_TITLE =
  'MOTION LAB – High Performance Training & Planificación Personalizada';

export const SITE_DESCRIPTION =
  'Entrenamiento de fuerza y rendimiento atlético. Plan Base y Plan Premium Personalizado 1 a 1, con seguimiento semanal y datos de tu reloj.';
