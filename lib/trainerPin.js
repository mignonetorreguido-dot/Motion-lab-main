/**
 * ========================================================================
 * ACCESO DEL ENTRENADOR CON EMAIL + PIN (lib/trainerPin.js)
 * ========================================================================
 * El panel de Matías es de una sola persona. La cuenta del entrenador se
 * crea una única vez (se aprovisiona sola en el primer ingreso) y queda
 * atada a UN solo email. Para entrar hay que saber ese email y el PIN
 * numérico privado.
 *
 * Configuración (en .env.local o en Vercel):
 *   TRAINER_EMAIL="matias@motionlab.fit"   <- cuenta única del profesor
 *   TRAINER_PIN="246810"                   <- PIN privado de 6+ dígitos
 *
 * Si las variables no están definidas se usan valores de demostración para
 * que la aplicación funcione al instalarla. En producción hay que cambiarlas.
 */

import { timingSafeEqual } from 'node:crypto';

const PIN_DE_DEMOSTRACION = '246810';
const EMAIL_ENTRENADOR_POR_DEFECTO = 'matias@motionlab.fit';

/**
 * Devuelve el email de la única cuenta de entrenador permitida.
 * Esta función nunca debe importarse desde un componente cliente.
 */
export function emailEntrenadorActual() {
  return String(process.env.TRAINER_EMAIL || EMAIL_ENTRENADOR_POR_DEFECTO)
    .trim()
    .toLowerCase();
}

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
 * Comprueba que el email recibido sea el de la única cuenta del entrenador.
 */
export function verificarEmailEntrenador(email) {
  const esperado = emailEntrenadorActual();
  const recibido = String(email ?? '').trim().toLowerCase();

  if (!esperado || !recibido) return false;

  const bufferEsperado = Buffer.from(esperado, 'utf8');
  const bufferRecibido = Buffer.from(recibido, 'utf8');

  if (bufferEsperado.length !== bufferRecibido.length) return false;

  return timingSafeEqual(bufferEsperado, bufferRecibido);
}

/**
 * Valida las dos credenciales del profesor: email único + PIN privado.
 */
export function verificarCredencialesEntrenador(email, pin) {
  return verificarEmailEntrenador(email) && verificarPinEntrenador(pin);
}

/**
 * Indica si el PIN fue definido por el administrador o si se está usando el
 * valor de demostración. Útil para mostrar advertencias en el servidor.
 */
export function pinEntrenadorPersonalizado() {
  return Boolean(process.env.TRAINER_PIN);
}
