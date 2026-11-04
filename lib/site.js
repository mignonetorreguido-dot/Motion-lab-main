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
  'https://motion-lab-preparacion-fisica-y-rendimiento.vercel.app'
).replace(/\/$/, '');

export const SITE_NAME = 'MOTION LAB';

export const SITE_TITLE =
  'MOTION LAB – Preparación Física y Rendimiento';

export const SITE_DESCRIPTION =
  'Preparación física y rendimiento en Resistencia, Chaco. Entrenamiento de fuerza, velocidad y potencia con planificación personalizada. Plan Base y Plan Performance.';
