import { SITE_URL } from '@/lib/site';

/**
 * Reglas para los rastreadores. Las páginas privadas y las APIs no se
 * indexan; el resto del sitio queda disponible.
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/bienestar',
          '/comenzar',
          '/entrenamiento',
          '/onboarding',
          '/salir',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
