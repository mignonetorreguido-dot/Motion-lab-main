/**
 * ========================================================================
 * HELPER: Estado del registro con Google en onboarding
 * ========================================================================
 * Guarda la ficha deportiva antes de salir a Google y deja una marca para
 * saber si el usuario abandonó o canceló el flujo. Al volver a /onboarding
 * podemos restaurar el formulario y mostrar un error con opción de reintentar.
 */

const CLAVE_DATOS = 'motionlab_onboarding_google';
const CLAVE_PENDIENTE = 'motionlab_google_pending';
const VIGENCIA_PENDIENTE_MS = 30 * 60 * 1000;

export function guardarDatosOnboardingGoogle(datos) {
  try {
    localStorage.setItem(CLAVE_DATOS, JSON.stringify(datos));
  } catch {
    // Si el navegador bloquea localStorage, el flujo normal sigue funcionando.
  }
}

export function leerDatosOnboardingGoogle() {
  try {
    const crudo = localStorage.getItem(CLAVE_DATOS);
    return crudo ? JSON.parse(crudo) : null;
  } catch {
    return null;
  }
}

export function eliminarDatosOnboardingGoogle() {
  try {
    localStorage.removeItem(CLAVE_DATOS);
  } catch {
    // Sin acción.
  }
}

export function marcarGooglePendiente() {
  try {
    localStorage.setItem(
      CLAVE_PENDIENTE,
      JSON.stringify({ origen: 'onboarding', ts: Date.now() })
    );
  } catch {
    // Sin acción.
  }
}

export function googlePendienteDeOnboarding() {
  try {
    const crudo = localStorage.getItem(CLAVE_PENDIENTE);
    if (!crudo) return false;

    const pendiente = JSON.parse(crudo);

    if (pendiente?.origen !== 'onboarding' || !pendiente?.ts) {
      localStorage.removeItem(CLAVE_PENDIENTE);
      return false;
    }

    if (Date.now() - pendiente.ts > VIGENCIA_PENDIENTE_MS) {
      localStorage.removeItem(CLAVE_PENDIENTE);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function limpiarGooglePendiente() {
  try {
    localStorage.removeItem(CLAVE_PENDIENTE);
  } catch {
    // Sin acción.
  }
}
