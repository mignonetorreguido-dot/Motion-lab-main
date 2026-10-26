import { SITE_URL } from '@/lib/site';

/**
 * Mapa del sitio para Google. Solo incluye páginas públicas; las vistas
 * privadas (/entrenamiento, /bienestar, /admin) quedan fuera.
 */
export default function sitemap() {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacidad`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terminos`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
