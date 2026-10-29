import { NextResponse } from 'next/server';
import { actualizarAlumno } from '@/lib/actualizarAlumno';
import { requireTrainer } from '@/lib/requireTrainer';
import prisma from '@/lib/prisma';
import { eliminarAlumnoDeStore } from '@/lib/fallbackStore';

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

export async function DELETE(req, { params }) {
  const auth = await requireTrainer();
  if (auth.response) return auth.response;

  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Falta el identificador del alumno' },
        { status: 400 }
      );
    }

    if (process.env.DATABASE_URL) {
      try {
        await prisma.rutinaRealizada.deleteMany({ where: { alumnoId: id } });
        await prisma.chequeoBienestar.deleteMany({ where: { alumnoId: id } });
        await prisma.usuario.delete({ where: { id } });
      } catch (dbErr) {
        console.warn('⚠️ No se pudo eliminar el alumno en PostgreSQL:', dbErr.message);
      }
    }

    eliminarAlumnoDeStore(id);

    return NextResponse.json({
      success: true,
      mensaje: 'Perfil de alumno eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar alumno:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el alumno' },
      { status: 500 }
    );
  }
}
