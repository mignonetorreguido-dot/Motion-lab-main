/**
 * ========================================================================
 * PERSISTENCIA DEL RESUMEN DE APPLE HEALTH (lib/appleHealthStore.js)
 * ========================================================================
 * Guarda un único resumen por alumno en PostgreSQL.
 *
 * La tabla se crea de forma automática e idempotente la primera vez que se
 * usa. Así no hace falta ejecutar una migración manual en producción ni
 * depender de tener la DATABASE_URL en la máquina local.
 *
 * Solo se guarda el resumen JSON (30 días), nunca el ZIP completo.
 */

import prisma from '@/lib/prisma';

const TABLA = 'apple_health_imports';

let tablaLista = false;
let promesaTabla = null;

async function asegurarTabla() {
  if (tablaLista) return;
  if (!promesaTabla) {
    promesaTabla = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "${TABLA}" (
          "id" TEXT NOT NULL,
          "alumnoId" TEXT NOT NULL,
          "resumen" JSONB NOT NULL,
          "archivoNombre" TEXT,
          "archivoBytes" INTEGER,
          "importadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "${TABLA}_pkey" PRIMARY KEY ("id")
        )
      `);

      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "${TABLA}_alumnoId_key"
        ON "${TABLA}" ("alumnoId")
      `);

      tablaLista = true;
    })().catch((error) => {
      promesaTabla = null;
      throw error;
    });
  }

  await promesaTabla;
}

function texto(valor, maximo = 120) {
  if (typeof valor !== 'string') return '';
  return valor.trim().slice(0, maximo);
}

function numero(valor, { minimo = -Infinity, maximo = Infinity, decimales = null } = {}) {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  if (!Number.isFinite(n) || n < minimo || n > maximo) return null;
  if (decimales === null) return n;
  const factor = 10 ** decimales;
  return Math.round(n * factor) / factor;
}

function entero(valor, { minimo = 0, maximo = 1000000 } = {}) {
  const n = Math.round(Number(valor));
  if (!Number.isFinite(n) || n < minimo || n > maximo) return 0;
  return n;
}

function dia(valor) {
  const limpio = texto(valor, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(limpio) ? limpio : null;
}

/**
 * Limpia y valida el resumen que llega del navegador. Es una defensa extra:
 * el parser ya genera este formato, pero el endpoint es accesible para
 * cualquier alumno autenticado.
 */
export function normalizarResumenAppleHealth(resumen) {
  if (!resumen || typeof resumen !== 'object' || Array.isArray(resumen)) {
    throw new Error('El resumen de Apple Salud no tiene el formato esperado.');
  }

  const dias = (Array.isArray(resumen.dias) ? resumen.dias : [])
    .slice(0, 31)
    .map((item) => {
      const fecha = dia(item?.fecha);
      if (!fecha) return null;
      return {
        fecha,
        pasos: numero(item?.pasos, { minimo: 0, maximo: 200000 }),
        fcPromedio: numero(item?.fcPromedio, { minimo: 20, maximo: 250 }),
        fcMin: numero(item?.fcMin, { minimo: 20, maximo: 250 }),
        fcMax: numero(item?.fcMax, { minimo: 20, maximo: 250 }),
        fcReposo: numero(item?.fcReposo, { minimo: 20, maximo: 200 }),
        suenoHoras: numero(item?.suenoHoras, {
          minimo: 0,
          maximo: 24,
          decimales: 1,
        }),
        suenoEficiencia: numero(item?.suenoEficiencia, {
          minimo: 0,
          maximo: 100,
        }),
        caloriasActivas: numero(item?.caloriasActivas, {
          minimo: 0,
          maximo: 20000,
        }),
        distanciaKm: numero(item?.distanciaKm, {
          minimo: 0,
          maximo: 1000,
          decimales: 2,
        }),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const workouts = (Array.isArray(resumen.workouts) ? resumen.workouts : [])
    .slice(0, 60)
    .map((item) => {
      const fecha = dia(item?.dia);
      const tipo = texto(item?.tipo, 40);
      if (!fecha || !tipo) return null;
      return {
        tipo,
        tipoEtiqueta: texto(item?.tipoEtiqueta, 40) || tipo,
        inicio: texto(item?.inicio, 30),
        dia: fecha,
        duracionMin: numero(item?.duracionMin, { minimo: 0, maximo: 1440 }),
        calorias: numero(item?.calorias, { minimo: 0, maximo: 20000 }),
        distanciaKm: numero(item?.distanciaKm, {
          minimo: 0,
          maximo: 1000,
          decimales: 2,
        }),
        fcPromedio: numero(item?.fcPromedio, { minimo: 20, maximo: 250 }),
        fcMax: numero(item?.fcMax, { minimo: 20, maximo: 250 }),
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(b.inicio).localeCompare(String(a.inicio)));

  if (dias.length === 0 && workouts.length === 0) {
    throw new Error(
      'El resumen no contiene días ni entrenamientos válidos. Volvé a importar el export.zip.'
    );
  }

  const promedios = {
    pasos: numero(resumen.promedios?.pasos, { minimo: 0, maximo: 200000 }),
    suenoHoras: numero(resumen.promedios?.suenoHoras, {
      minimo: 0,
      maximo: 24,
      decimales: 1,
    }),
    suenoEficiencia: numero(resumen.promedios?.suenoEficiencia, {
      minimo: 0,
      maximo: 100,
    }),
    fcPromedio: numero(resumen.promedios?.fcPromedio, {
      minimo: 20,
      maximo: 250,
    }),
    fcReposo: numero(resumen.promedios?.fcReposo, {
      minimo: 20,
      maximo: 200,
    }),
    caloriasActivas: numero(resumen.promedios?.caloriasActivas, {
      minimo: 0,
      maximo: 20000,
    }),
    distanciaKm: numero(resumen.promedios?.distanciaKm, {
      minimo: 0,
      maximo: 1000,
      decimales: 2,
    }),
  };

  const sueno = {
    noches: entero(resumen.sueno?.noches, { maximo: 31 }),
    horasTotales: numero(resumen.sueno?.horasTotales, {
      minimo: 0,
      maximo: 24 * 31,
      decimales: 1,
    }),
    promedioHoras: numero(resumen.sueno?.promedioHoras, {
      minimo: 0,
      maximo: 24,
      decimales: 1,
    }),
    eficienciaPromedio: numero(resumen.sueno?.eficienciaPromedio, {
      minimo: 0,
      maximo: 100,
    }),
  };

  const fuentes = [
    ...new Set(
      (Array.isArray(resumen.fuentes) ? resumen.fuentes : [])
        .map((fuente) => texto(fuente, 80))
        .filter(Boolean)
    ),
  ].slice(0, 5);

  const advertencias = (Array.isArray(resumen.advertencias)
    ? resumen.advertencias
    : []
  )
    .map((advertencia) => texto(advertencia, 220))
    .filter(Boolean)
    .slice(0, 5);

  const conteo = {
    pasos: entero(resumen.conteo?.pasos),
    fc: entero(resumen.conteo?.fc),
    sueno: entero(resumen.conteo?.sueno),
    entrenamientos: entero(resumen.conteo?.entrenamientos),
    energia: entero(resumen.conteo?.energia),
    distancia: entero(resumen.conteo?.distancia),
    registros: entero(resumen.conteo?.registros),
  };

  let desde = dia(resumen.desde);
  let hasta = dia(resumen.hasta);

  if (!desde) {
    desde = dias[0]?.fecha || workouts[workouts.length - 1]?.dia || null;
  }
  if (!hasta) {
    hasta = dias[dias.length - 1]?.fecha || workouts[0]?.dia || null;
  }
  if (desde && hasta && desde > hasta) {
    [desde, hasta] = [hasta, desde];
  }

  return {
    version: 1,
    origen: 'apple_health',
    generadoEn: texto(resumen.generadoEn, 40),
    rangoDias: 30,
    desde,
    hasta,
    dias,
    promedios,
    sueno,
    workouts,
    fuentes,
    conteo,
    advertencias,
  };
}

function serializar(registro) {
  if (!registro) return null;
  return {
    resumen: registro.resumen,
    archivoNombre: registro.archivoNombre || null,
    archivoBytes: registro.archivoBytes ?? null,
    importadoEn: registro.importadoEn,
    actualizadoEn: registro.updatedAt,
  };
}

export async function obtenerImportacionAppleHealth(alumnoId) {
  if (!alumnoId) return null;
  await asegurarTabla();
  const registro = await prisma.importacionAppleHealth.findUnique({
    where: { alumnoId },
  });
  return serializar(registro);
}

export async function guardarImportacionAppleHealth(
  alumnoId,
  { resumen, archivoNombre, archivoBytes }
) {
  if (!alumnoId) throw new Error('Falta el alumno.');
  await asegurarTabla();

  const ahora = new Date();
  const nombre = texto(archivoNombre, 200) || null;
  const bytes = numero(archivoBytes, { minimo: 0, maximo: 2000000000 });

  const registro = await prisma.importacionAppleHealth.upsert({
    where: { alumnoId },
    create: {
      alumnoId,
      resumen,
      archivoNombre: nombre,
      archivoBytes: bytes === null ? null : Math.round(bytes),
      importadoEn: ahora,
      updatedAt: ahora,
    },
    update: {
      resumen,
      archivoNombre: nombre,
      archivoBytes: bytes === null ? null : Math.round(bytes),
      importadoEn: ahora,
      updatedAt: ahora,
    },
  });

  return serializar(registro);
}

export async function eliminarImportacionAppleHealth(alumnoId) {
  if (!alumnoId) return 0;
  await asegurarTabla();
  const resultado = await prisma.importacionAppleHealth.deleteMany({
    where: { alumnoId },
  });
  return resultado.count;
}
