/**
 * ========================================================================
 * ENDPOINT API: Completar onboarding con Google
 * (app/api/auth/complete-google-onboarding/route.js)
 * ========================================================================
 * Google crea la cuenta base (nombre y email). Este endpoint completa la
 * ficha deportiva que el alumno cargó en el Wizard antes de autenticarse
 * con Google y devuelve el enlace de WhatsApp para coordinar el pago.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { construirWhatsappOnboarding } from '@/lib/onboarding';

export const dynamic = 'force-dynamic';

function texto(valor, porDefecto = '') {
  const limpio = typeof valor === 'string' ? valor.trim() : '';
  return limpio || porDefecto;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tu sesión de Google venció. Volvé a intentarlo desde el registro.',
        },
        { status: 401 }
      );
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Los datos enviados no son válidos.' },
        { status: 400 }
      );
    }

    const {
      tipoPlan = 'BASE',
      objetivo = 'Rendimiento',
      deporte = '',
      club = false,
      nivel = 'Principiante',
      focos = [],
      disponibilidad = '3 días',
      rmEstimado = '',
      puntosDebiles = '',
      peso = null,
      altura = null,
      lesiones = '',
      nombre = '',
      apellido = '',
      whatsapp = '',
    } = data || {};

    if (!texto(deporte) || !texto(disponibilidad)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan datos del perfil deportivo. Volvé al registro y completalos.',
        },
        { status: 400 }
      );
    }

    if (!texto(whatsapp)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ingresá tu número de WhatsApp para que Matías pueda contactarte.',
        },
        { status: 400 }
      );
    }

    const pesoNumero = Number.parseFloat(peso);
    const alturaNumero = Number.parseFloat(altura);

    if (!Number.isFinite(pesoNumero) || !Number.isFinite(alturaNumero)) {
      return NextResponse.json(
        {
          success: false,
          error: 'El peso y la altura son obligatorios para completar tu ficha.',
        },
        { status: 400 }
      );
    }

    const nombreSesion = texto(session.user.name);
    const partesNombreSesion = nombreSesion.split(/\s+/).filter(Boolean);
    const nombreFinal =
      texto(nombre) || partesNombreSesion[0] || 'Alumno';
    const apellidoFinal =
      texto(apellido) || partesNombreSesion.slice(1).join(' ');

    const focosTexto = Array.isArray(focos) ? focos.join(', ') : texto(focos);
    const datosPerfil = {
      objetivo: texto(objetivo, 'Rendimiento'),
      deporte: texto(deporte),
      club: Boolean(club),
      nivel: texto(nivel, 'Principiante'),
      focos: focosTexto || 'General',
      disponibilidad: texto(disponibilidad, '3 días'),
      rmEstimado: texto(rmEstimado) || null,
      puntosDebiles: texto(puntosDebiles) || null,
    };

    const usuario = await prisma.usuario.update({
      where: { id: session.user.id },
      data: {
        nombre: nombreFinal,
        apellido: apellidoFinal,
        whatsapp: texto(whatsapp) || null,
        peso: pesoNumero,
        altura: alturaNumero,
        lesiones: texto(lesiones) || 'Sin lesiones reportadas',
        // No tocamos estadoPago: un alumno existente conserva su estado actual.
        // Los usuarios nuevos de Google ya se crean como PENDIENTE en el login.
        tipoPlan: tipoPlan === 'PREMIUM' ? 'PREMIUM' : 'BASE',
        perfilDeportivo: {
          upsert: {
            create: datosPerfil,
            update: datosPerfil,
          },
        },
      },
      include: {
        perfilDeportivo: true,
      },
    });

    const whatsappUrl = construirWhatsappOnboarding({
      nombre: usuario.nombre,
      apellido: usuario.apellido || '',
      tipoPlan: usuario.tipoPlan,
      objetivo: datosPerfil.objetivo,
      deporte: datosPerfil.deporte,
      nivel: datosPerfil.nivel,
      focos: datosPerfil.focos,
      disponibilidad: datosPerfil.disponibilidad,
      rmEstimado: datosPerfil.rmEstimado || '',
      lesiones: texto(lesiones),
      whatsapp: texto(whatsapp),
    });

    return NextResponse.json({
      success: true,
      mensaje: '¡Cuenta y perfil deportivo guardados exitosamente!',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido || '',
        email: usuario.email,
        whatsapp: usuario.whatsapp || '',
        tipoPlan: usuario.tipoPlan,
        estadoPago: usuario.estadoPago,
      },
      whatsappUrl,
    });
  } catch (error) {
    console.error('Error al completar el onboarding con Google:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          'No pudimos guardar tu ficha. Volvé a intentarlo o completá el registro con email.',
      },
      { status: 500 }
    );
  }
}
