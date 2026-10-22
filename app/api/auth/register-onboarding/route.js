/**
 * ========================================================================
 * ENDPOINT API: Registro Completo de Onboarding (app/api/auth/register-onboarding/route.js)
 * ========================================================================
 * Recibe todas las respuestas del Wizard de Onboarding (Pasos 0 al 5):
 * 1. Crea el Usuario con estadoPago: 'PENDIENTE'.
 * 2. Encripta la contraseña con bcryptjs (si se registró con email).
 * 3. Crea el PerfilDeportivo vinculado al alumno con todos sus datos y RM.
 * 4. Genera el enlace dinámico de WhatsApp directo a Matías para coordinar el pago.
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { construirWhatsappOnboarding } from '@/lib/onboarding';

export async function POST(request) {
  try {
    const data = await request.json();

    const {
      tipoPlan = 'BASE',
      objetivo = 'Rendimiento',
      deporte = 'General',
      club = false,
      nivel = 'Principiante',
      focos = [],
      disponibilidad = '3 días',
      rmEstimado = '',
      puntosDebiles = '',
      peso = null,
      altura = null,
      lesiones = '',
      nombre,
      apellido = '',
      whatsapp = '',
      email,
      password,
    } = data;

    // Validación básica de campos de registro
    if (!nombre || !email) {
      return NextResponse.json(
        { success: false, error: 'Nombre y correo electrónico son obligatorios' },
        { status: 400 }
      );
    }

    if (!whatsapp || !whatsapp.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ingresá tu número de WhatsApp para que Matías pueda contactarte.',
        },
        { status: 400 }
      );
    }

    const emailNormalizado = email.toLowerCase().trim();
    let passwordHash = null;

    // Si el usuario proporcionó contraseña tradicional, la encriptamos con bcrypt
    if (password && password.length >= 6) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    let usuarioGuardado = null;
    let guardadoEnDb = false;

    try {
      // 1. Verificar si el usuario ya existe en la base de datos
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { email: emailNormalizado },
      });

      if (usuarioExistente) {
        return NextResponse.json(
          { success: false, error: 'Ya existe una cuenta con ese correo electrónico. Inicia sesión.' },
          { status: 409 }
        );
      }

      // 2. Crear el Usuario en PostgreSQL con estado de pago 'PENDIENTE'
      usuarioGuardado = await prisma.usuario.create({
        data: {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: emailNormalizado,
          passwordHash: passwordHash,
          whatsapp: whatsapp.trim(),
          peso: peso ? parseFloat(peso) : null,
          altura: altura ? parseFloat(altura) : null,
          lesiones: lesiones.trim() || 'Sin lesiones reportadas',
          estadoPago: 'PENDIENTE',
          tipoPlan: tipoPlan === 'PREMIUM' ? 'PREMIUM' : 'BASE',
          rol: 'ALUMNO',
          perfilDeportivo: {
            create: {
              objetivo: objetivo,
              deporte: deporte.trim(),
              club: Boolean(club),
              nivel: nivel,
              focos: Array.isArray(focos) ? focos.join(', ') : focos,
              disponibilidad: disponibilidad,
              rmEstimado: rmEstimado.trim() || null,
              puntosDebiles: puntosDebiles.trim() || null,
            },
          },
        },
        include: {
          perfilDeportivo: true,
        },
      });

      guardadoEnDb = true;
      console.log('✅ Alumno y perfil deportivo creados en Prisma:', usuarioGuardado.id);
    } catch (dbError) {
      console.warn('⚠️ No se pudo guardar en PostgreSQL vía Prisma (Modo Demo):', dbError.message);
      // Creamos un objeto simulado para continuar sin bloquear la experiencia
      usuarioGuardado = {
        id: 'demo-user-' + Date.now(),
        nombre,
        apellido,
        email: emailNormalizado,
        whatsapp,
        tipoPlan,
        estadoPago: 'PENDIENTE',
      };
    }

    // 3. Generación del mensaje y enlace directo a WhatsApp con Matías
    const whatsappUrl = construirWhatsappOnboarding({
      nombre,
      apellido,
      tipoPlan,
      objetivo,
      deporte,
      nivel,
      focos,
      disponibilidad,
      rmEstimado,
      lesiones,
      whatsapp,
    });

    return NextResponse.json({
      success: true,
      mensaje: guardadoEnDb
        ? '¡Cuenta y perfil deportivo creados exitosamente! Estado: Pendiente de pago.'
        : '¡Registro simulado con éxito (modo demo sin PostgreSQL activo)!',
      usuario: {
        id: usuarioGuardado.id,
        nombre: usuarioGuardado.nombre,
        email: usuarioGuardado.email,
        whatsapp: usuarioGuardado.whatsapp || whatsapp || '',
        tipoPlan: usuarioGuardado.tipoPlan,
        estadoPago: usuarioGuardado.estadoPago,
      },
      whatsappUrl,
    });
  } catch (error) {
    console.error('❌ Error en /api/auth/register-onboarding:', error);
    return NextResponse.json(
      { success: false, error: 'Ocurrió un error inesperado al procesar el onboarding' },
      { status: 500 }
    );
  }
}
