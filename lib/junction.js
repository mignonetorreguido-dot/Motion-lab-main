/**
 * ========================================================================
 * INTEGRACIÓN CON JUNCTION (lib/junction.js)
 * ========================================================================
 * Junction (ex Vital) conecta cuentas de Garmin, Polar, Fitbit, Google
 * Health/Pixel Watch, Oura, Withings y otros proveedores en la nube.
 *
 * - La API key vive sólo en el servidor.
 * - No se guardan datos sensibles en el navegador.
 * - Apple Watch y Samsung Health usan SDK móvil (HealthKit / Health Connect),
 *   por lo que no se pueden vincular desde esta web. El panel lo aclara.
 *
 * Este módulo no inventa datos: si no hay una cuenta vinculada, devuelve
 * `conectado: false`.
 */

const REGION = process.env.JUNCTION_REGION === 'eu' ? 'eu' : 'us';
const ENTORNO = process.env.JUNCTION_ENV === 'production' ? 'production' : 'sandbox';

const BASE_URL =
  ENTORNO === 'production'
    ? `https://api.${REGION}.junction.com`
    : `https://api.sandbox.${REGION}.junction.com`;

const API_KEY = process.env.JUNCTION_API_KEY;

export function junctionConfigurado() {
  return Boolean(API_KEY);
}

export function configuracionJunction() {
  return { region: REGION, entorno: ENTORNO };
}

function detalleError(payload) {
  if (!payload) return '';
  if (typeof payload.detail === 'string') return payload.detail;
  if (payload.detail?.error_message) return payload.detail.error_message;
  if (payload.error) return String(payload.error);
  return '';
}

async function junctionFetch(path, { method = 'GET', body, timeoutMs = 15000 } = {}) {
  if (!API_KEY) {
    const error = new Error('La integración con relojes no está configurada.');
    error.status = 503;
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'x-vital-api-key': API_KEY,
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
      signal: controller.signal,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const error = new Error(
        detalleError(payload) || `Junction respondió ${response.status}.`
      );
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('La consulta al reloj tardó demasiado.');
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Busca el usuario de Junction asociado a nuestro id interno.
 * Devuelve null si todavía no existe (no es un error).
 */
export async function resolverUsuarioJunction(clientUserId) {
  try {
    return await junctionFetch(
      `/v2/user/resolve/${encodeURIComponent(clientUserId)}`
    );
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

/**
 * Crea el usuario de Junction si es la primera vez, o lo recupera si ya existe.
 */
export async function asegurarUsuarioJunction(clientUserId) {
  const existente = await resolverUsuarioJunction(clientUserId);
  if (existente?.user_id) return existente;

  try {
    return await junctionFetch('/v2/user/', {
      method: 'POST',
      body: { client_user_id: clientUserId },
    });
  } catch (error) {
    // Junction responde 400 con el user_id cuando el client_user_id ya existe.
    if (error.status === 400 && error.payload?.detail?.user_id) {
      return {
        user_id: error.payload.detail.user_id,
        client_user_id: clientUserId,
        created_on: error.payload.detail.created_on,
      };
    }
    throw error;
  }
}

export async function crearLinkToken(userId) {
  const data = await junctionFetch('/v2/link/token', {
    method: 'POST',
    body: { user_id: userId },
  });

  return {
    linkToken: data.link_token,
    linkWebUrl: data.link_web_url,
    ...configuracionJunction(),
  };
}

export async function obtenerProveedores(userId) {
  const data = await junctionFetch(`/v2/user/providers/${userId}`);
  const crudos = data?.providers || {};
  const lista = Array.isArray(crudos)
    ? crudos
    : Object.values(crudos).flat();

  return lista.map((proveedor) => ({
    nombre: proveedor.name,
    slug: proveedor.slug,
    logo: proveedor.logo,
    estado: proveedor.status,
    creadoEn: proveedor.created_on,
    error: proveedor.error_details?.error_message || null,
  }));
}

function fechaHoy() {
  // Usamos la fecha de Argentina para que el "último día" coincida con el
  // calendario del alumno, no con UTC.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function sumarDias(fecha, dias) {
  const base = new Date(`${fecha}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + dias);
  return base.toISOString().slice(0, 10);
}

function numero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function promedio(valores) {
  const validos = valores.filter((valor) => valor !== null && valor !== undefined);
  if (validos.length === 0) return null;
  return Math.round(validos.reduce((total, valor) => total + valor, 0) / validos.length);
}

/**
 * Trae actividad y sueño de los últimos 7 días y los normaliza para la UI.
 * No persiste datos: se consulta en vivo a Junction.
 */
export async function obtenerResumenReloj(userId, { dias = 7 } = {}) {
  const fin = fechaHoy();
  const inicio = sumarDias(fin, -(dias - 1));
  const query = `start_date=${inicio}&end_date=${fin}`;

  const [actividadData, suenoData] = await Promise.all([
    junctionFetch(`/v2/summary/activity/${userId}?${query}`),
    junctionFetch(`/v2/summary/sleep/${userId}?${query}`),
  ]);

  const mapa = new Map();
  const fuentes = new Set();

  const obtenerDia = (fecha) => {
    if (!mapa.has(fecha)) {
      mapa.set(fecha, {
        fecha,
        pasos: null,
        caloriasActivas: null,
        fcReposo: null,
        fcPromedio: null,
        fcMax: null,
        suenoHoras: null,
        suenoEficiencia: null,
        fcSueno: null,
        proveedor: null,
      });
    }
    return mapa.get(fecha);
  };

  for (const item of actividadData?.activity || []) {
    const fecha = item.calendar_date || String(item.date || '').slice(0, 10);
    if (!fecha) continue;

    const dia = obtenerDia(fecha);
    dia.pasos = numero(item.steps);
    dia.caloriasActivas = numero(item.calories_active);
    dia.fcReposo = numero(item.heart_rate?.resting_bpm);
    dia.fcPromedio = numero(item.heart_rate?.avg_bpm);
    dia.fcMax = numero(item.heart_rate?.max_bpm);

    const proveedor = item.source?.provider;
    if (proveedor) {
      dia.proveedor = proveedor;
      fuentes.add(proveedor);
    }
  }

  for (const item of suenoData?.sleep || []) {
    const fecha = item.calendar_date || String(item.date || '').slice(0, 10);
    if (!fecha) continue;

    const dia = obtenerDia(fecha);
    const duracion = numero(item.duration);
    if (duracion !== null && duracion > 0) {
      dia.suenoHoras = Math.round((duracion / 3600) * 10) / 10;
    }

    const eficiencia = numero(item.efficiency);
    if (eficiencia !== null) {
      dia.suenoEficiencia = Math.round(
        eficiencia <= 1 ? eficiencia * 100 : eficiencia
      );
    }

    dia.fcSueno = numero(item.hr_average);

    const proveedor = item.source?.provider;
    if (proveedor) {
      dia.proveedor = proveedor;
      fuentes.add(proveedor);
    }
  }

  const diasConDatos = [...mapa.values()]
    .filter((dia) =>
      [
        dia.pasos,
        dia.caloriasActivas,
        dia.fcReposo,
        dia.fcPromedio,
        dia.suenoHoras,
        dia.fcSueno,
      ].some((valor) => valor !== null && valor !== undefined)
    )
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  const diasConSueno = diasConDatos.filter(
    (dia) => dia.suenoHoras !== null && dia.suenoHoras !== undefined
  );

  return {
    desde: inicio,
    hasta: fin,
    dias: diasConDatos,
    fuentes: [...fuentes],
    promedios: {
      pasos: promedio(diasConDatos.map((dia) => dia.pasos)),
      caloriasActivas: promedio(diasConDatos.map((dia) => dia.caloriasActivas)),
      fcReposo: promedio(diasConDatos.map((dia) => dia.fcReposo)),
      fcPromedio: promedio(diasConDatos.map((dia) => dia.fcPromedio)),
      fcMax: promedio(diasConDatos.map((dia) => dia.fcMax)),
      suenoHoras:
        diasConSueno.length > 0
          ? Math.round(
              (diasConSueno.reduce(
                (total, dia) => total + dia.suenoHoras,
                0
              ) /
                diasConSueno.length) *
                10
            ) / 10
          : null,
      suenoEficiencia: promedio(diasConDatos.map((dia) => dia.suenoEficiencia)),
    },
  };
}

/**
 * Estado completo para la tarjeta del alumno o la ficha del entrenador.
 */
export async function obtenerEstadoReloj(clientUserId, { incluirResumen = true } = {}) {
  if (!junctionConfigurado()) {
    return { configurado: false, conectado: false, proveedores: [] };
  }

  const usuario = await resolverUsuarioJunction(clientUserId);
  if (!usuario?.user_id) {
    return { configurado: true, conectado: false, proveedores: [] };
  }

  const proveedores = await obtenerProveedores(usuario.user_id);
  const conectados = proveedores.filter(
    (proveedor) => proveedor.estado === 'connected'
  );

  if (conectados.length === 0) {
    return {
      configurado: true,
      conectado: false,
      proveedores,
      resumen: null,
    };
  }

  let resumen = null;
  if (incluirResumen) {
    try {
      resumen = await obtenerResumenReloj(usuario.user_id);
    } catch (error) {
      // Si el proveedor está conectado pero todavía no entregó datos, la
      // vinculación sigue siendo válida. Mostramos el error sin romper la UI.
      return {
        configurado: true,
        conectado: true,
        proveedores,
        resumen: null,
        errorDatos: error.message,
      };
    }
  }

  return {
    configurado: true,
    conectado: true,
    proveedores,
    resumen,
  };
}
