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
  const telefonoMatias =
    process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5493624654911';
  const planTexto =
    tipoPlan === 'PREMIUM' ? 'Plan Premium Personalizado' : 'Plan Base';
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
