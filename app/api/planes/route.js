/**
 * ========================================================================
 * RUTA DE API: /api/planes (app/api/planes/route.js)
 * ========================================================================
 * Endpoint HTTP tipo GET para consultar la lista de planes disponibles.
 * Los planes comerciales son estáticos y no dependen de la base de datos.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Datos de respaldo en caso de que la base de datos aún no tenga tablas creadas
    const planesDefault = [
      {
        id: 1,
        nombre: 'Plan Base',
        precio_mensual: 75000,
        descripcion: 'Entrená por tu cuenta con una planificación personalizada, objetivos claros y seguimiento profesional para acompañar tu evolución.',
        es_destacado: false,
        beneficios: [
          'Evaluación inicial',
          'Planificación individualizada',
          '3 a 5 sesiones semanales',
          'Control de cargas y evolución',
          'Correcciones y ajustes de manera asincrónica',
        ],
      },
      {
        id: 2,
        nombre: 'Plan Performance',
        precio_mensual: 180000,
        descripcion: 'Un proceso integral que combina gimnasio y campo, adaptado a tus objetivos, necesidades y deporte.',
        es_destacado: true,
        beneficios: [
          'Evaluación y planificación individualizada',
          '2 a 3 sesiones de gimnasio',
          '2 a 3 sesiones de campo',
          'Fuerza, velocidad y potencia',
          'Control de cargas y seguimiento',
        ],
      },
    ];

    return NextResponse.json({ success: true, fuente: 'estatico', data: planesDefault });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al obtener los planes' },
      { status: 500 }
    );
  }
}
