/**
 * ========================================================================
 * ACCESO DEL ENTRENADOR CON PIN (lib/trainerPin.js)
 * ========================================================================
 * El panel de Matías es de una sola persona. En lugar de compartir el email
 * y la contraseña de la cuenta, el acceso se hace con un PIN numérico.
 *
 * Configuración:
 *   TRAINER_PIN="246810"   (en .env.local o en Vercel)
 *
 * Si la variable no está definida se usa un PIN de demostración para que la
 * aplicación funcione al instalarla. En producción conviene cambiarlo por
 * uno propio de 6 o más dígitos.
 */

import { timingSafeEqual } from 'node:crypto';

const PIN_DE_DEMOSTRACION = '246810';

/**
 * Devuelve el PIN configurado en el servidor.
 * Esta función nunca debe importarse desde un componente cliente.
 */
export function pinEntrenadorActual() {
  return String(process.env.TRAINER_PIN || PIN_DE_DEMOSTRACION).trim();
}

/**
 * Compara el PIN recibido con el configurado sin filtrar información por
 * tiempos de respuesta (timingSafeEqual).
 */
export function verificarPinEntrenador(pin) {
  const esperado = pinEntrenadorActual();
  const recibido = String(pin ?? '').trim();

  if (!esperado || !recibido) return false;

  const bufferEsperado = Buffer.from(esperado, 'utf8');
  const bufferRecibido = Buffer.from(recibido, 'utf8');

  if (bufferEsperado.length !== bufferRecibido.length) return false;

  return timingSafeEqual(bufferEsperado, bufferRecibido);
}

/**
 * Indica si el PIN fue definido por el administrador o si se está usando el
 * valor de demostración. Útil para mostrar advertencias en el servidor.
 */
export function pinEntrenadorPersonalizado() {
  return Boolean(process.env.TRAINER_PIN);
}
