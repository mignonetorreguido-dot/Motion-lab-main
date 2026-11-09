/**
 * ========================================================================
 * HELPERS DE ONBOARDING (lib/onboarding.js)
 * ========================================================================
 * Centraliza el mensaje de WhatsApp que se genera al finalizar el registro,
 * tanto para el alta tradicional con email como para el alta con Google.
 */

export function construirWhatsappOnboarding({
  nombre = '',
  apellido = '',
  tipoPlan = 'BASE',
  objetivo = 'Rendimiento',
  deporte = 'General',
  nivel = 'Principiante',
  focos = [],
  disponibilidad = '3 días',
  rmEstimado = '',
  lesiones = '',
  whatsapp = '',
} = {}) {
  // Número oficial de WhatsApp de Matías. Se mantiene fijo en el código
  // para que todos los enlaces usen el mismo contacto.
  const telefonoMatias = '5493624098320';
  const planTexto =
    tipoPlan === 'PREMIUM' ? 'Plan Performance' : 'Plan Base';
  const focosTexto = Array.isArray(focos) ? focos.join(', ') : focos;

  const textoMensaje =
    `¡Hola Matías! 👋 Acabo de completar mi registro en *Motion Lab*.\n\n` +
    `👤 *Nombre:* ${nombre} ${apellido}\n` +
    (whatsapp ? `📱 *WhatsApp:* ${whatsapp}\n` : '') +
    `📦 *Plan Elegido:* ${planTexto}\n` +
    `🎯 *Objetivo:* ${objetivo} (${deporte || 'General'})\n` +
    `💪 *Nivel:* ${nivel} | *Focos:* ${focosTexto || 'General'}\n` +
    `📅 *Disponibilidad:* ${disponibilidad}\n` +
    (rmEstimado ? `⚡ *RM:* ${rmEstimado}\n` : '') +
    (lesiones ? `⚠️ *Lesiones:* ${lesiones}\n` : '') +
    `\nQuiero coordinar el pago para que puedas activar mi cuenta y comenzar con mi rutina. ¡Gracias!`;

  return `https://wa.me/${telefonoMatias}?text=${encodeURIComponent(textoMensaje)}`;
}
