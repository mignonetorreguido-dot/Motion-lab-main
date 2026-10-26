/**
 * ========================================================================
 * PUENTE DE PRUEBA CON GOOGLE FIT (lib/googleFit.js)
 * ========================================================================
 * Muchas apps de relojes (Da Fit, Samsung Health, Mi Fitness, Huawei Health)
 * no tienen API pública, pero sincronizan datos con Google Fit. Esta prueba
 * lee esos datos con la API REST de Google Fit para comprobar qué escribe
 * realmente el reloj o la app.
 *
 * Reglas de esta integración:
 * - Solo se activa con GOOGLE_FIT_TEST=1 (pensada para desarrollo local).
 * - Es de solo lectura: no escribe ni modifica datos en Google Fit.
 * - No guarda nada en PostgreSQL ni en la sesión de NextAuth.
 * - Los tokens viven en una cookie HttpOnly cifrada con next-auth/jwt.
 * - No inventa datos: si una métrica no existe, devuelve `disponible: false`.
 *
 * Google Fit está deprecado y puede dejar de funcionar durante 2026.
 */

import { encode, decode } from 'next-auth/jwt';
import { GOOGLE_FIT_COOKIE_MAX_AGE } from './googleFitScopes';

const SECRET =
  process.env.NEXTAUTH_SECRET || 'motion_lab_super_secret_jwt_key_2026';
const SALT = 'motion-lab-google-fit';
const BASE_URL = 'https://www.googleapis.com/fitness/v1';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';

const ETIQUETAS_TIPOS = {
  'com.google.step_count.delta': 'Pasos',
  'com.google.heart_rate.bpm': 'Frecuencia cardíaca',
  'com.google.sleep.segment': 'Sueño',
  'com.google.weight': 'Peso',
  'com.google.oxygen_saturation': 'Oxígeno en sangre',
  'com.google.calories.expended': 'Calorías',
  'com.google.distance.delta': 'Distancia',
  'com.google.active_minutes': 'Minutos activos',
  'com.google.activity.segment': 'Actividad',
  'com.google.body.fat.percentage': 'Grasa corporal',
  'com.google.blood_pressure': 'Presión arterial',
  'com.google.blood_glucose': 'Glucosa',
};

const TIPOS_RELEVANTES = new Set(Object.keys(ETIQUETAS_TIPOS));

// Nombres legibles para las fuentes que Google Fit devuelve sin nombre de
// aplicación. Así el alumno ve "Google Fit" o "Samsung Health" en lugar de
// "App desconocida".
const NOMBRES_PAQUETES = {
  'com.google.android.gms': 'Google Play Services',
  'com.google.android.apps.fitness': 'Google Fit',
  'com.google.android.apps.healthdata': 'Salud de Android',
  'com.sec.android.app.shealth': 'Samsung Health',
  'com.xiaomi.hm.health': 'Mi Fitness',
  'com.huawei.health': 'Huawei Health',
};

export class ErrorGoogleFit extends Error {
  constructor(mensaje, { status = null, codigo = null, payload = null } = {}) {
    super(mensaje);
    this.name = 'ErrorGoogleFit';
    this.status = status;
    this.codigo = codigo;
    this.payload = payload;
  }
}

export function googleFitTestActivo() {
  return process.env.GOOGLE_FIT_TEST === '1';
}

export function googleFitConfigurado() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
}

// ------------------------------------------------------------------------
// TOKEN CIFRADO EN COOKIE
// ------------------------------------------------------------------------

export async function codificarTokenGoogleFit(tokenData) {
  return encode({
    token: tokenData,
    secret: SECRET,
    salt: SALT,
    maxAge: GOOGLE_FIT_COOKIE_MAX_AGE,
  });
}

export async function decodificarTokenGoogleFit(valor) {
  if (!valor) return null;
  return decode({ token: valor, secret: SECRET, salt: SALT });
}

// ------------------------------------------------------------------------
// RENOVACIÓN Y REVOCACIÓN DEL TOKEN
// ------------------------------------------------------------------------

export async function refrescarTokenGoogleFit(tokenData) {
  if (!tokenData?.refreshToken) {
    throw new ErrorGoogleFit(
      'El permiso de Google Fit venció y no hay un refresh token guardado. Volvé a conectar.',
      { codigo: 'sin_refresh_token' }
    );
  }

  if (!googleFitConfigurado()) {
    throw new ErrorGoogleFit(
      'Google OAuth no está configurado en este entorno.',
      { codigo: 'sin_configuracion' }
    );
  }

  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: tokenData.refreshToken,
    grant_type: 'refresh_token',
  });

  let respuesta;
  try {
    respuesta = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });
  } catch {
    throw new ErrorGoogleFit(
      'No pudimos conectarnos con Google para renovar el permiso.',
      { codigo: 'sin_conexion' }
    );
  }

  let payload = null;
  try {
    payload = await respuesta.json();
  } catch {
    payload = null;
  }

  if (!respuesta.ok || !payload?.access_token) {
    const mensaje =
      payload?.error_description ||
      payload?.error ||
      `Google respondió ${respuesta.status} al renovar el permiso.`;
    throw new ErrorGoogleFit(mensaje, {
      status: respuesta.status,
      codigo: payload?.error || 'refresh_fallido',
      payload,
    });
  }

  return {
    ...tokenData,
    accessToken: payload.access_token,
    expiresAt: Date.now() + (Number(payload.expires_in) || 3600) * 1000,
    scope: payload.scope || tokenData.scope,
    refreshToken: payload.refresh_token || tokenData.refreshToken,
    actualizadoEn: Date.now(),
  };
}

export async function revocarTokenGoogleFit(token) {
  if (!token) return;
  try {
    const body = new URLSearchParams({ token });
    await fetch(REVOKE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });
  } catch {
    // La revocación es best-effort: si falla, igual borramos la cookie.
  }
}

// ------------------------------------------------------------------------
// LLAMADAS A LA API DE GOOGLE FIT
// ------------------------------------------------------------------------

function mensajeDeError(payload) {
  if (!payload) return '';
  if (typeof payload.error === 'string') return payload.error;
  if (typeof payload.error?.message === 'string') return payload.error.message;
  if (typeof payload.error_description === 'string') {
    return payload.error_description;
  }
  return '';
}

function codigoDeError(payload) {
  if (!payload) return null;
  return (
    payload.error?.errors?.[0]?.reason ||
    payload.error?.status ||
    (typeof payload.error === 'string' ? payload.error : null)
  );
}

async function googleFitFetch(
  path,
  accessToken,
  { method = 'GET', body, timeoutMs = 20000 } = {}
) {
  if (!accessToken) {
    throw new ErrorGoogleFit('No hay un token de Google Fit disponible.', {
      codigo: 'sin_token',
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const respuesta = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
      signal: controller.signal,
    });

    let payload = null;
    try {
      payload = await respuesta.json();
    } catch {
      payload = null;
    }

    if (!respuesta.ok) {
      throw new ErrorGoogleFit(
        mensajeDeError(payload) ||
          `Google Fit respondió ${respuesta.status}.`,
        {
          status: respuesta.status,
          codigo: codigoDeError(payload),
          payload,
        }
      );
    }

    return payload;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ErrorGoogleFit('La consulta a Google Fit tardó demasiado.', {
        status: 504,
        codigo: 'timeout',
      });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function agregarDatosGoogleFit({
  accessToken,
  dataTypeName,
  startTimeMillis,
  endTimeMillis,
  bucketMillis = 86400000,
}) {
  return googleFitFetch('/users/me/dataset:aggregate', accessToken, {
    method: 'POST',
    body: {
      aggregateBy: [{ dataTypeName }],
      bucketByTime: { durationMillis: bucketMillis },
      startTimeMillis,
      endTimeMillis,
    },
  });
}

export async function listarSesionesGoogleFit({
  accessToken,
  startTimeMillis,
  endTimeMillis,
}) {
  const query = new URLSearchParams({
    startTime: new Date(startTimeMillis).toISOString(),
    endTime: new Date(endTimeMillis).toISOString(),
  });
  return googleFitFetch(`/users/me/sessions?${query}`, accessToken);
}

export async function listarFuentesGoogleFit({ accessToken }) {
  return googleFitFetch('/users/me/dataSources', accessToken);
}

// ------------------------------------------------------------------------
// FECHAS Y NORMALIZACIÓN
// ------------------------------------------------------------------------

function fechaArt(ms) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(ms));
}

function fechaHoyArt() {
  return fechaArt(Date.now());
}

function sumarDias(fecha, dias) {
  const base = new Date(`${fecha}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + dias);
  return base.toISOString().slice(0, 10);
}

function inicioDiaArt(fecha) {
  // Argentina no tiene horario de verano: UTC-3 todo el año.
  return new Date(`${fecha}T00:00:00-03:00`).getTime();
}

function rangoDias(dias) {
  const hasta = fechaHoyArt();
  const desde = sumarDias(hasta, -(dias - 1));
  return {
    desde,
    hasta,
    startTimeMillis: inicioDiaArt(desde),
    endTimeMillis: inicioDiaArt(sumarDias(hasta, 1)),
  };
}

function promedio(valores) {
  const validos = valores.filter(
    (valor) => valor !== null && valor !== undefined && Number.isFinite(valor)
  );
  if (validos.length === 0) return null;
  return validos.reduce((total, valor) => total + valor, 0) / validos.length;
}

function puntosDelBucket(bucket) {
  const puntos = [];
  for (const dataset of bucket?.dataset || []) {
    for (const punto of dataset?.point || []) {
      puntos.push(punto);
    }
  }
  return puntos;
}

function valorNumerico(punto) {
  const valor = punto?.value?.[0];
  if (!valor) return null;
  if (typeof valor.intVal === 'number') return valor.intVal;
  if (typeof valor.fpVal === 'number') return valor.fpVal;
  return null;
}

function puntosPorDia(respuesta) {
  const mapa = new Map();
  for (const bucket of respuesta?.bucket || []) {
    const inicio = Number(bucket?.startTimeMillis);
    if (!Number.isFinite(inicio)) continue;
    const fecha = fechaArt(inicio);
    if (!mapa.has(fecha)) mapa.set(fecha, []);
    mapa.get(fecha).push(...puntosDelBucket(bucket));
  }
  return mapa;
}

function fuentesRelevantes(respuesta) {
  const todas = Array.isArray(respuesta?.dataSource)
    ? respuesta.dataSource
    : [];

  const relevantes = [];
  const vistas = new Set();

  for (const fuente of todas) {
    const tipo = fuente?.dataType?.name;
    if (!tipo) continue;

    const paquete = fuente?.application?.packageName || '';
    const app =
      fuente?.application?.name || NOMBRES_PAQUETES[paquete] || '';
    const stream = fuente?.dataStreamName || '';
    const esDafit = /dafit|da\s*fit/i.test(`${app} ${paquete} ${stream}`);

    if (!TIPOS_RELEVANTES.has(tipo) && !esDafit) continue;

    const clave = `${tipo}|${paquete}|${stream}`;
    if (vistas.has(clave)) continue;
    vistas.add(clave);

    relevantes.push({
      tipo,
      etiqueta: ETIQUETAS_TIPOS[tipo] || tipo,
      app: app || null,
      paquete: paquete || null,
      stream: stream || null,
      esDafit,
    });
  }

  relevantes.sort((a, b) => {
    if (a.esDafit !== b.esDafit) return a.esDafit ? -1 : 1;
    return a.etiqueta.localeCompare(b.etiqueta, 'es');
  });

  return { relevantes, total: todas.length };
}

// ------------------------------------------------------------------------
// RESUMEN PARA LA UI
// ------------------------------------------------------------------------

export async function obtenerResumenGoogleFit({
  accessToken,
  dias = 7,
} = {}) {
  const rango = rangoDias(dias);
  const rangoPeso = rangoDias(30);
  const errores = [];

  const intentar = async (metrica, funcion) => {
    try {
      return { ok: true, data: await funcion() };
    } catch (error) {
      errores.push({
        metrica,
        codigo: error?.codigo || null,
        status: error?.status || null,
        mensaje: error?.message || 'No pudimos leer esta métrica.',
      });
      return { ok: false, error };
    }
  };

  const [pasos, fc, sueno, peso, spo2, fuentes] = await Promise.all([
    intentar('pasos', () =>
      agregarDatosGoogleFit({
        accessToken,
        dataTypeName: 'com.google.step_count.delta',
        startTimeMillis: rango.startTimeMillis,
        endTimeMillis: rango.endTimeMillis,
      })
    ),
    intentar('fc', () =>
      agregarDatosGoogleFit({
        accessToken,
        dataTypeName: 'com.google.heart_rate.bpm',
        startTimeMillis: rango.startTimeMillis,
        endTimeMillis: rango.endTimeMillis,
      })
    ),
    intentar('sueno', () =>
      listarSesionesGoogleFit({
        accessToken,
        startTimeMillis: rango.startTimeMillis,
        endTimeMillis: rango.endTimeMillis,
      })
    ),
    intentar('peso', () =>
      agregarDatosGoogleFit({
        accessToken,
        dataTypeName: 'com.google.weight',
        startTimeMillis: rangoPeso.startTimeMillis,
        endTimeMillis: rangoPeso.endTimeMillis,
      })
    ),
    intentar('spo2', () =>
      agregarDatosGoogleFit({
        accessToken,
        dataTypeName: 'com.google.oxygen_saturation',
        startTimeMillis: rango.startTimeMillis,
        endTimeMillis: rango.endTimeMillis,
      })
    ),
    intentar('fuentes', () => listarFuentesGoogleFit({ accessToken })),
  ]);

  const tokenInvalido =
    errores.length > 0 &&
    errores.every((error) => Number(error.status) === 401) &&
    !pasos.ok &&
    !fc.ok &&
    !sueno.ok &&
    !peso.ok &&
    !spo2.ok &&
    !fuentes.ok;

  if (tokenInvalido) {
    return {
      tokenInvalido: true,
      error:
        'Google rechazó el permiso guardado. Volvé a conectar tu cuenta de Google Fit.',
      errores,
    };
  }

  const diasMap = new Map();
  for (let i = 0; i < dias; i += 1) {
    const fecha = sumarDias(rango.desde, i);
    diasMap.set(fecha, {
      fecha,
      pasos: null,
      fcPromedio: null,
      suenoHoras: null,
      peso: null,
      spo2: null,
    });
  }

  let pasosTotal = 0;
  let diasConPasos = 0;

  if (pasos.ok) {
    const porDia = puntosPorDia(pasos.data);
    for (const [fecha, puntos] of porDia) {
      const total = puntos.reduce(
        (acumulado, punto) => acumulado + (valorNumerico(punto) || 0),
        0
      );
      if (total > 0) {
        const dia = diasMap.get(fecha);
        if (dia) dia.pasos = total;
        pasosTotal += total;
        diasConPasos += 1;
      }
    }
  }

  let diasConFc = 0;

  if (fc.ok) {
    const porDia = puntosPorDia(fc.data);
    for (const [fecha, puntos] of porDia) {
      const valores = puntos
        .map(valorNumerico)
        .filter((valor) => valor !== null && valor > 0);
      if (valores.length > 0) {
        const promedioDia = Math.round(promedio(valores));
        const dia = diasMap.get(fecha);
        if (dia) dia.fcPromedio = promedioDia;
        diasConFc += 1;
      }
    }
  }

  if (sueno.ok) {
    const sesiones = (sueno.data?.session || []).filter(
      (sesion) => Number(sesion?.activityType) === 72
    );

    for (const sesion of sesiones) {
      const inicio = Number(sesion?.startTimeMillis);
      const fin = Number(sesion?.endTimeMillis);
      if (!Number.isFinite(inicio) || !Number.isFinite(fin) || fin <= inicio) {
        continue;
      }

      // Agrupamos por la fecha en que terminó el sueño (la mañana).
      const fecha = fechaArt(fin);
      const horas = (fin - inicio) / 3600000;
      const dia = diasMap.get(fecha);
      if (dia) {
        dia.suenoHoras =
          Math.round(((dia.suenoHoras || 0) + horas) * 10) / 10;
      }
    }
  }

  let pesoUltimo = null;
  let pesoFecha = null;

  if (peso.ok) {
    const porDia = puntosPorDia(peso.data);
    const fechas = [...porDia.keys()].sort();

    for (const fecha of fechas) {
      const puntos = porDia
        .get(fecha)
        .slice()
        .sort(
          (a, b) => Number(a?.startTimeNanos) - Number(b?.startTimeNanos)
        );
      const valores = puntos
        .map(valorNumerico)
        .filter((valor) => valor !== null && valor > 0);

      if (valores.length > 0) {
        const valor = valores[valores.length - 1];
        const dia = diasMap.get(fecha);
        if (dia) dia.peso = Math.round(valor * 10) / 10;
        pesoUltimo = Math.round(valor * 10) / 10;
        pesoFecha = fecha;
      }
    }
  }

  let diasConSpo2 = 0;

  if (spo2.ok) {
    const porDia = puntosPorDia(spo2.data);
    for (const [fecha, puntos] of porDia) {
      const valores = puntos
        .map(valorNumerico)
        .filter((valor) => valor !== null && valor > 0);
      if (valores.length > 0) {
        const promedioDia =
          Math.round(promedio(valores) * 10) / 10;
        const dia = diasMap.get(fecha);
        if (dia) dia.spo2 = promedioDia;
        diasConSpo2 += 1;
      }
    }
  }

  const diasNormalizados = [...diasMap.values()];
  const diasConDatos = diasNormalizados.filter((dia) =>
    [
      dia.pasos,
      dia.fcPromedio,
      dia.suenoHoras,
      dia.peso,
      dia.spo2,
    ].some((valor) => valor !== null && valor !== undefined)
  );
  const nochesConSueno = diasNormalizados.filter(
    (dia) => dia.suenoHoras !== null
  ).length;

  const pasosPromedio =
    diasConPasos > 0 ? Math.round(pasosTotal / diasConPasos) : null;

  const fcPromedio =
    diasConFc > 0
      ? Math.round(
          promedio(
            diasConDatos
              .map((dia) => dia.fcPromedio)
              .filter((valor) => valor !== null)
          )
        )
      : null;

  const suenoPromedio =
    nochesConSueno > 0
      ? Math.round(
          promedio(
            diasConDatos
              .map((dia) => dia.suenoHoras)
              .filter((valor) => valor !== null)
          ) * 10
        ) / 10
      : null;

  const spo2Promedio =
    diasConSpo2 > 0
      ? Math.round(
          promedio(
            diasConDatos
              .map((dia) => dia.spo2)
              .filter((valor) => valor !== null)
          ) * 10
        ) / 10
      : null;

  const { relevantes, total } = fuentes.ok
    ? fuentesRelevantes(fuentes.data)
    : { relevantes: [], total: 0 };

  return {
    desde: rango.desde,
    hasta: rango.hasta,
    metricas: {
      pasos: {
        disponible: diasConPasos > 0,
        total: diasConPasos > 0 ? pasosTotal : null,
        promedio: pasosPromedio,
        dias: diasConPasos,
      },
      fc: {
        disponible: diasConFc > 0,
        promedio: fcPromedio,
        dias: diasConFc,
      },
      sueno: {
        disponible: nochesConSueno > 0,
        promedioHoras: suenoPromedio,
        noches: nochesConSueno,
      },
      peso: {
        disponible: pesoUltimo !== null,
        ultimo: pesoUltimo,
        fecha: pesoFecha,
      },
      spo2: {
        disponible: diasConSpo2 > 0,
        promedio: spo2Promedio,
        dias: diasConSpo2,
      },
    },
    dias: diasNormalizados,
    fuentes: relevantes,
    totalFuentesGoogleFit: total,
    errores,
  };
}
