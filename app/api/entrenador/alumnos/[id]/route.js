import { NextResponse } from 'next/server';
import { actualizarAlumno } from '@/lib/actualizarAlumno';
import { requireTrainer } from '@/lib/requireTrainer';

export async function PUT(req, { params }) {
  const auth = await requireTrainer();
  if (auth.response) return auth.response;

  try {
    let data;
    try {
      data = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Los datos enviados no son válidos' },
        { status: 400 }
      );
    }

    const resultado = await actualizarAlumno(params.id, data);

    if (!resultado.success) {
      return NextResponse.json(resultado, { status: 400 });
    }

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error al actualizar alumno:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el alumno' },
      { status: 500 }
    );
  }
}
