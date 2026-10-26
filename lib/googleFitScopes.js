/**
 * ========================================================================
 * SCOPES DE GOOGLE FIT (lib/googleFitScopes.js)
 * ========================================================================
 * Este archivo es isomorfo: lo usan el servidor (OAuth/API) y el cliente
 * (botón "Conectar Google Fit"). No debe importar módulos de Node ni
 * secretos.
 *
 * La prueba es local y opcional. Sin `GOOGLE_FIT_TEST=1`, la tarjeta no se
 * muestra y el callback de NextAuth sigue funcionando como siempre.
 */

export const GOOGLE_FIT_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
  'https://www.googleapis.com/auth/fitness.body.read',
  'https://www.googleapis.com/auth/fitness.oxygen_saturation.read',
];

export const GOOGLE_FIT_SCOPE_STRING = GOOGLE_FIT_SCOPES.join(' ');

// Cookie HttpOnly donde se guarda el token de Google Fit (cifrado con
// next-auth/jwt). Es independiente de la sesión de MOTION LAB.
export const GOOGLE_FIT_COOKIE = 'ml_gfit_token';

// Cookie breve que marca que el usuario inició el flujo de vinculación.
// Se lee en el callback `signIn` para no crear/derivar una sesión nueva.
export const GOOGLE_FIT_INTENT_COOKIE = 'ml_gfit_intent';

export const GOOGLE_FIT_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;
export const GOOGLE_FIT_INTENT_MAX_AGE = 10 * 60;
