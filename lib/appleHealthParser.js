/**
 * ========================================================================
 * PARSER DE APPLE HEALTH (lib/appleHealthParser.js)
 * ========================================================================
 * Lee el `export.zip` de la app Salud de Apple **en el navegador**, en
 * streaming, y devuelve un resumen pequeño de los últimos 30 días.
 *
 * El ZIP completo nunca se sube a MOTION LAB: se descomprime y se procesa
 * localmente. Solo el resumen (pasos, pulso, sueño y entrenamientos) se envía
 * al servidor.
 *
 * Decisiones para evitar datos inflados:
 * - Pasos, calorías y distancia: se elige la fuente con más registros por día
 *   (por ejemplo, Apple Watch en lugar de iPhone) para no duplicar.
 * - Sueño: se elige la fuente con más horas por noche y se prefieren las
 *   etapas (Core/Deep/REM) antes que el valor genérico "Asleep".
 * - Frecuencia cardíaca: se descartan valores fuera de 20-250 bpm.
 *
 * El XML de Apple es plano y muy repetitivo; se parsea con expresiones
 * regulares sobre etiquetas completas, sin cargar el archivo entero en memoria.
 */

const RANGO_DIAS = 30;
const MAX_ENTRENAMIENTOS = 20000;
const MAX_FUENTES = 5;
const MAX_WORKOUTS_RESUMEN = 60;

const ETIQUETAS_ENTRENAMIENTO = {
  Running: 'Running',
  Walking: 'Caminata',
  Cycling: 'Ciclismo',
  TraditionalStrengthTraining: 'Fuerza',
  FunctionalStrengthTraining: 'Fuerza funcional',
  HighIntensityIntervalTraining: 'HIIT',
  Swimming: 'Natación',
  Rowing: 'Remo',
  Elliptical: 'Elíptica',
  Yoga: 'Yoga',
  Pilates: 'Pilates',
  CoreTraining: 'Core',
  Flexibility: 'Movilidad',
  Hiking: 'Trekking',
  Basketball: 'Básquet',
  Soccer: 'Fútbol',
  Tennis: 'Tenis',
  Badminton: 'Bádminton',
  Boxing: 'Boxeo',
  Kickboxing: 'Kickboxing',
  MartialArts: 'Artes marciales',
  Climbing: 'Escalada',
  Dance: 'Baile',
  Golf: 'Golf',
  Skateboarding: 'Skate',
  Snowboarding: 'Snowboard',
  Skiing: 'Esquí',
  Surfing: 'Surf',
  Volleyball: 'Vóley',
  Handball: 'Handball',
  Hockey: 'Hockey',
  Rugby: 'Rugby',
  TableTennis: 'Tenis de mesa',
  CrossTraining: 'Cross training',
  MixedCardio: 'Cardio mixto',
  StairClimbing: 'Escaleras',
  JumpRope: 'Soga',
  Other: 'Otro',
};

const ETIQUETA_RE = /<(\/?)(Record|Workout|WorkoutStatistics|ActivitySummary)\b([^>]*)>/g;

function crearErrorCancelado() {
  const error = new Error('Importación cancelada.');
  error.name = 'AbortError';
  return error;
}

function redondear(valor, decimales = 0) {
  if (valor === null || valor === undefined || !Number.isFinite(Number(valor))) {
    return null;
  }
  const factor = 10 ** decimales;
  return Math.round(Number(valor) * factor) / factor;
}

function aNumero(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const numero = Number(String(valor).replace(',', '.'));
  return Number.isFinite(numero) ? numero : null;
}

function decodificarXml(texto) {
  return String(texto || '').replace(
    /&(#x?[0-9a-fA-F]+|amp|lt|gt|quot|apos);/g,
    (coincidencia, codigo) => {
      if (codigo[0] === '#') {
        const esHex = codigo[1]?.toLowerCase() === 'x';
        const numero = parseInt(esHex ? codigo.slice(2) : codigo.slice(1), esHex ? 16 : 10);
        return Number.isFinite(numero) ? String.fromCodePoint(numero) : coincidencia;
      }
      const entidades = {
        amp: '&',
        lt: '<',
        gt: '>',
        quot: '"',
        apos: "'",
      };
      return entidades[codigo] || coincidencia;
    }
  );
}

function parsearAtributos(texto) {
  const atributos = {};
  const regex = /([a-zA-Z_][\w:.-]*)="([^"]*)"/g;
  let coincidencia;
  while ((coincidencia = regex.exec(texto))) {
    atributos[coincidencia[1]] = decodificarXml(coincidencia[2]);
  }
  return atributos;
}

function diaDe(fechaTexto) {
  if (!fechaTexto) return null;
  const coincidencia = /^(\d{4}-\d{2}-\d{2})/.exec(String(fechaTexto));
  return coincidencia ? coincidencia[1] : null;
}

function fechaAms(fechaTexto) {
  if (!fechaTexto) return null;
  const coincidencia =
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?\s*([+-])(\d{2}):?(\d{2})$/.exec(
      String(fechaTexto).trim()
    );

  if (!coincidencia) {
    const fecha = new Date(fechaTexto);
    return Number.isNaN(fecha.getTime()) ? null : fecha.getTime();
  }

  const [, anio, mes, dia, hora, minuto, segundo, signo, offsetHora, offsetMinuto] =
    coincidencia;
  const utc = Date.UTC(
    Number(anio),
    Number(mes) - 1,
    Number(dia),
    Number(hora),
    Number(minuto),
    Number(segundo)
  );
  const offset =
    (signo === '-' ? -1 : 1) *
    (Number(offsetHora) * 60 + Number(offsetMinuto)) *
    60000;

  return utc - offset;
}

function sumarDias(dia, cantidad) {
  if (!dia) return null;
  const [anio, mes, numeroDia] = dia.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, numeroDia + cantidad));
  return fecha.toISOString().slice(0, 10);
}

function minutosDuracion(valor, unidad) {
  const numero = aNumero(valor);
  if (numero === null) return null;
  const u = String(unidad || '').toLowerCase();
  if (u === 's' || u === 'sec' || u === 'secs' || u === 'second' || u === 'seconds') {
    return numero / 60;
  }
  if (u === 'h' || u === 'hr' || u === 'hrs' || u === 'hour' || u === 'hours') {
    return numero * 60;
  }
  return numero;
}

function caloriasKcal(valor, unidad) {
  const numero = aNumero(valor);
  if (numero === null) return null;
  const u = String(unidad || '').toLowerCase();
  if (u === 'kj' || u === 'kilojoule' || u === 'kilojoules') return numero / 4.184;
  return numero;
}

function distanciaKm(valor, unidad) {
  const numero = aNumero(valor);
  if (numero === null) return null;
  const u = String(unidad || '').toLowerCase();
  if (u === 'm' || u === 'meter' || u === 'meters' || u === 'metro' || u === 'metros') {
    return numero / 1000;
  }
  if (u === 'mi' || u === 'mile' || u === 'miles' || u === 'milla' || u === 'millas') {
    return numero * 1.609344;
  }
  return numero;
}

function etiquetaEntrenamiento(tipo) {
  if (ETIQUETAS_ENTRENAMIENTO[tipo]) return ETIQUETAS_ENTRENAMIENTO[tipo];
  return String(tipo || 'Entrenamiento')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim();
}

function sumarEnMapa(mapa, dia, fuente, valor) {
  if (!dia || !Number.isFinite(valor) || valor <= 0) return;
  let porFuente = mapa.get(dia);
  if (!porFuente) {
    porFuente = new Map();
    mapa.set(dia, porFuente);
  }
  porFuente.set(fuente, (porFuente.get(fuente) || 0) + valor);
}

function elegirMayor(mapaFuentes) {
  if (!mapaFuentes || mapaFuentes.size === 0) return null;
  let mejor = null;
  for (const [fuente, valor] of mapaFuentes) {
    if (mejor === null || valor > mejor.valor) mejor = { fuente, valor };
  }
  return mejor;
}

function promedioMapa(mapa) {
  if (!mapa || !mapa.cuenta) return null;
  return mapa.suma / mapa.cuenta;
}

function crearAcumulador() {
  const pasosPorDia = new Map();
  const fcPorDia = new Map();
  const fcReposoPorDia = new Map();
  const suenoPorNoche = new Map();
  const energiaPorDia = new Map();
  const distanciaPorDia = new Map();
  const actividadResumen = new Map();
  const entrenamientos = [];
  const fuentes = new Map();

  let buffer = '';
  let decodificador = new TextDecoder('utf-8');
  let workoutActual = null;
  let registros = 0;
  let conteo = {
    pasos: 0,
    fc: 0,
    sueno: 0,
    entrenamientos: 0,
    energia: 0,
    distancia: 0,
  };

  function registrarFuente(fuente) {
    const nombre = String(fuente || '').trim();
    if (!nombre) return;
    fuentes.set(nombre, (fuentes.get(nombre) || 0) + 1);
  }

  function acumularFrecuencia(dia, valor) {
    if (!dia || !Number.isFinite(valor) || valor < 20 || valor > 250) return;
    const actual = fcPorDia.get(dia) || {
      suma: 0,
      cuenta: 0,
      minimo: Infinity,
      maximo: -Infinity,
    };
    actual.suma += valor;
    actual.cuenta += 1;
    actual.minimo = Math.min(actual.minimo, valor);
    actual.maximo = Math.max(actual.maximo, valor);
    fcPorDia.set(dia, actual);
  }

  function acumularFrecuenciaReposo(dia, valor) {
    if (!dia || !Number.isFinite(valor) || valor < 20 || valor > 200) return;
    const actual = fcReposoPorDia.get(dia) || { suma: 0, cuenta: 0 };
    actual.suma += valor;
    actual.cuenta += 1;
    fcReposoPorDia.set(dia, actual);
  }

  function acumularSueno(noche, fuente, tipo, horas) {
    if (!noche || !Number.isFinite(horas) || horas <= 0 || horas > 24) return;
    let porFuente = suenoPorNoche.get(noche);
    if (!porFuente) {
      porFuente = new Map();
      suenoPorNoche.set(noche, porFuente);
    }
    let datos = porFuente.get(fuente);
    if (!datos) {
      datos = { generico: 0, etapas: 0, inBed: 0, awake: 0 };
      porFuente.set(fuente, datos);
    }
    datos[tipo] += horas;
  }

  function elegirSueno(porFuente) {
    if (!porFuente || porFuente.size === 0) return null;
    let mejor = null;
    for (const [fuente, datos] of porFuente) {
      const horas = datos.etapas > 0 ? datos.etapas : datos.generico;
      if (mejor === null || horas > mejor.horas) {
        mejor = { fuente, ...datos, horas };
      }
    }
    return mejor;
  }

  function procesarRecord(atributosTexto) {
    let tipo = null;

    // Comprobación rápida antes de parsear todos los atributos.
    if (atributosTexto.includes('type="HKQuantityTypeIdentifierStepCount"')) {
      tipo = 'pasos';
    } else if (atributosTexto.includes('type="HKQuantityTypeIdentifierHeartRate"')) {
      tipo = 'fc';
    } else if (
      atributosTexto.includes('type="HKQuantityTypeIdentifierRestingHeartRate"')
    ) {
      tipo = 'fcReposo';
    } else if (
      atributosTexto.includes('type="HKCategoryTypeIdentifierSleepAnalysis"')
    ) {
      tipo = 'sueno';
    } else if (
      atributosTexto.includes('type="HKQuantityTypeIdentifierActiveEnergyBurned"')
    ) {
      tipo = 'energia';
    } else if (
      atributosTexto.includes(
        'type="HKQuantityTypeIdentifierDistanceWalkingRunning"'
      )
    ) {
      tipo = 'distancia';
    } else {
      return;
    }

    const atributos = parsearAtributos(atributosTexto);
    const fuente = atributos.sourceName || 'Apple Health';
    const dia = diaDe(atributos.startDate) || diaDe(atributos.endDate);

    if (!dia) return;

    registros += 1;
    registrarFuente(fuente);

    if (tipo === 'pasos') {
      const valor = aNumero(atributos.value);
      if (valor !== null && valor > 0) {
        sumarEnMapa(pasosPorDia, dia, fuente, valor);
        conteo.pasos += 1;
      }
      return;
    }

    if (tipo === 'fc') {
      const valor = aNumero(atributos.value);
      if (valor !== null) {
        acumularFrecuencia(dia, valor);
        conteo.fc += 1;
      }
      return;
    }

    if (tipo === 'fcReposo') {
      const valor = aNumero(atributos.value);
      if (valor !== null) {
        acumularFrecuenciaReposo(dia, valor);
        conteo.fc += 1;
      }
      return;
    }

    if (tipo === 'energia') {
      const valor = caloriasKcal(atributos.value, atributos.unit);
      if (valor !== null && valor > 0) {
        sumarEnMapa(energiaPorDia, dia, fuente, valor);
        conteo.energia += 1;
      }
      return;
    }

    if (tipo === 'distancia') {
      const valor = distanciaKm(atributos.value, atributos.unit);
      if (valor !== null && valor > 0) {
        sumarEnMapa(distanciaPorDia, dia, fuente, valor);
        conteo.distancia += 1;
      }
      return;
    }

    if (tipo === 'sueno') {
      const inicio = fechaAms(atributos.startDate);
      const fin = fechaAms(atributos.endDate);
      if (inicio === null || fin === null || fin <= inicio) return;

      const horas = Math.min((fin - inicio) / 3600000, 24);
      const noche = diaDe(atributos.endDate) || dia;
      const valor = String(atributos.value || '').toLowerCase();

      let clase = null;
      if (valor.includes('asleep')) {
        clase =
          valor.includes('core') ||
          valor.includes('deep') ||
          valor.includes('rem') ||
          valor.includes('unspecified')
            ? 'etapas'
            : 'generico';
      } else if (valor.includes('inbed')) {
        clase = 'inBed';
      } else if (valor.includes('awake')) {
        clase = 'awake';
      } else if (/^\d+$/.test(valor)) {
        const numero = Number(valor);
        if (numero === 0) clase = 'inBed';
        else if (numero === 1) clase = 'generico';
        else if (numero === 2) clase = 'awake';
        else if (numero >= 3 && numero <= 6) clase = 'etapas';
      }

      if (clase) {
        acumularSueno(noche, fuente, clase, horas);
        conteo.sueno += 1;
      }
    }
  }

  function procesarWorkout(atributosTexto) {
    const atributos = parsearAtributos(atributosTexto);
    const tipoRaw = atributos.workoutActivityType || atributos.type || '';
    const tipo =
      String(tipoRaw).replace(/^HKWorkoutActivityType/, '') || 'Entrenamiento';
    const inicio = atributos.startDate || atributos.creationDate || '';
    const fin = atributos.endDate || '';
    const dia = diaDe(inicio) || diaDe(fin);
    if (!dia) return null;

    let duracion = minutosDuracion(atributos.duration, atributos.durationUnit);
    if (duracion === null && inicio && fin) {
      const inicioMs = fechaAms(inicio);
      const finMs = fechaAms(fin);
      if (inicioMs !== null && finMs !== null && finMs > inicioMs) {
        duracion = (finMs - inicioMs) / 60000;
      }
    }

    const entrenamiento = {
      tipo,
      tipoEtiqueta: etiquetaEntrenamiento(tipo),
      inicio,
      dia,
      duracionMin: redondear(duracion, 0),
      calorias: redondear(
        caloriasKcal(atributos.totalEnergyBurned, atributos.totalEnergyBurnedUnit),
        0
      ),
      distanciaKm: redondear(
        distanciaKm(atributos.totalDistance, atributos.totalDistanceUnit),
        2
      ),
      fcPromedio: null,
      fcMax: null,
      fuente: atributos.sourceName || '',
    };

    if (entrenamientos.length < MAX_ENTRENAMIENTOS) {
      entrenamientos.push(entrenamiento);
    }
    conteo.entrenamientos += 1;
    registrarFuente(entrenamiento.fuente);

    return entrenamiento;
  }

  function procesarWorkoutStatistics(atributosTexto) {
    if (!workoutActual) return;
    const atributos = parsearAtributos(atributosTexto);
    const tipo = atributos.type || '';

    if (
      tipo === 'HKQuantityTypeIdentifierActiveEnergyBurned' &&
      workoutActual.calorias === null
    ) {
      const valor = atributos.sum ?? atributos.average;
      workoutActual.calorias = redondear(
        caloriasKcal(valor, atributos.unit),
        0
      );
      return;
    }

    if (
      tipo.startsWith('HKQuantityTypeIdentifierDistance') &&
      workoutActual.distanciaKm === null
    ) {
      const valor = atributos.sum ?? atributos.average;
      workoutActual.distanciaKm = redondear(
        distanciaKm(valor, atributos.unit),
        2
      );
      return;
    }

    if (tipo === 'HKQuantityTypeIdentifierHeartRate') {
      const promedio = aNumero(atributos.average ?? atributos.sum);
      if (promedio !== null && promedio >= 20 && promedio <= 250) {
        workoutActual.fcPromedio = redondear(promedio, 0);
      }
      const maximo = aNumero(atributos.maximum);
      if (maximo !== null && maximo >= 20 && maximo <= 250) {
        workoutActual.fcMax = redondear(maximo, 0);
      }
    }
  }

  function procesarActivitySummary(atributosTexto) {
    const atributos = parsearAtributos(atributosTexto);
    const dia = diaDe(atributos.dateComponents) || diaDe(atributos.startDate);
    if (!dia) return;

    const energia = caloriasKcal(
      atributos.activeEnergyBurned,
      atributos.activeEnergyBurnedUnit
    );
    if (energia !== null && energia > 0) {
      actividadResumen.set(dia, Math.max(actividadResumen.get(dia) || 0, energia));
    }
  }

  function procesarEtiquetas(texto) {
    ETIQUETA_RE.lastIndex = 0;
    let coincidencia;

    while ((coincidencia = ETIQUETA_RE.exec(texto))) {
      const [, cierre, etiqueta, atributosCrudos] = coincidencia;

      if (cierre) {
        if (etiqueta === 'Workout') workoutActual = null;
        continue;
      }

      const atributosTexto = String(atributosCrudos || '').trim();
      const autocierre = atributosTexto.endsWith('/');
      const atributosLimpios = autocierre
        ? atributosTexto.slice(0, -1).trim()
        : atributosTexto;

      if (etiqueta === 'Record') {
        procesarRecord(atributosLimpios);
      } else if (etiqueta === 'Workout') {
        const entrenamiento = procesarWorkout(atributosLimpios);
        if (!autocierre) workoutActual = entrenamiento;
      } else if (etiqueta === 'WorkoutStatistics') {
        procesarWorkoutStatistics(atributosLimpios);
      } else if (etiqueta === 'ActivitySummary') {
        procesarActivitySummary(atributosLimpios);
      }
    }
  }

  function procesarBytes(bytes, final) {
    const texto = decodificador.decode(bytes, { stream: !final });
    if (texto) buffer += texto;

    const corte = buffer.lastIndexOf('>');
    if (corte === -1) return;

    const completo = buffer.slice(0, corte + 1);
    buffer = buffer.slice(corte + 1);
    if (completo) procesarEtiquetas(completo);
  }

  function construirResumen(archivo) {
    const hoy = new Date().toISOString().slice(0, 10);
    const limiteFuturo = sumarDias(hoy, 1);

    const todosLosDias = new Set([
      ...pasosPorDia.keys(),
      ...fcPorDia.keys(),
      ...fcReposoPorDia.keys(),
      ...suenoPorNoche.keys(),
      ...energiaPorDia.keys(),
      ...distanciaPorDia.keys(),
      ...actividadResumen.keys(),
      ...entrenamientos.map((entrenamiento) => entrenamiento.dia),
    ]);

    const diasOrdenados = [...todosLosDias]
      .filter((dia) => dia && dia <= limiteFuturo)
      .sort();

    if (diasOrdenados.length === 0) {
      throw new Error(
        'No encontramos datos de pasos, pulso, sueño ni entrenamientos en el archivo. Verificá que sea el export.zip de la app Salud de Apple.'
      );
    }

    const hasta = diasOrdenados[diasOrdenados.length - 1];
    const desde = sumarDias(hasta, -(RANGO_DIAS - 1));
    const diasRango = diasOrdenados.filter((dia) => dia >= desde && dia <= hasta);

    const dias = [];
    for (const dia of diasRango) {
      const pasos = elegirMayor(pasosPorDia.get(dia));
      const frecuencia = fcPorDia.get(dia);
      const reposo = promedioMapa(fcReposoPorDia.get(dia));
      const sueno = elegirSueno(suenoPorNoche.get(dia));
      const energia = elegirMayor(energiaPorDia.get(dia));
      const distancia = elegirMayor(distanciaPorDia.get(dia));

      const horasSueno = sueno ? redondear(sueno.horas, 1) : null;
      let eficienciaSueno = null;
      if (sueno) {
        if (sueno.inBed > 0) {
          eficienciaSueno = redondear((sueno.horas / sueno.inBed) * 100, 0);
        } else if (sueno.horas + sueno.awake > 0) {
          eficienciaSueno = redondear(
            (sueno.horas / (sueno.horas + sueno.awake)) * 100,
            0
          );
        }
        if (eficienciaSueno !== null) {
          eficienciaSueno = Math.max(0, Math.min(100, eficienciaSueno));
        }
      }

      const datosDia = {
        fecha: dia,
        pasos: pasos ? redondear(pasos.valor, 0) : null,
        fcPromedio: frecuencia
          ? redondear(frecuencia.suma / frecuencia.cuenta, 0)
          : null,
        fcMin: frecuencia ? redondear(frecuencia.minimo, 0) : null,
        fcMax: frecuencia ? redondear(frecuencia.maximo, 0) : null,
        fcReposo: reposo !== null ? redondear(reposo, 0) : null,
        suenoHoras: horasSueno,
        suenoEficiencia: eficienciaSueno,
        caloriasActivas: energia
          ? redondear(energia.valor, 0)
          : actividadResumen.has(dia)
            ? redondear(actividadResumen.get(dia), 0)
            : null,
        distanciaKm: distancia ? redondear(distancia.valor, 2) : null,
      };

      const tieneDatos = Object.entries(datosDia).some(
        ([clave, valor]) => clave !== 'fecha' && valor !== null
      );
      if (tieneDatos) dias.push(datosDia);
    }

    const promediar = (valores, decimales = 0) => {
      const limpios = valores.filter(
        (valor) => valor !== null && valor !== undefined && Number.isFinite(valor)
      );
      if (limpios.length === 0) return null;
      return redondear(
        limpios.reduce((total, valor) => total + valor, 0) / limpios.length,
        decimales
      );
    };

    const promedios = {
      pasos: promediar(dias.map((dia) => dia.pasos), 0),
      suenoHoras: promediar(dias.map((dia) => dia.suenoHoras), 1),
      suenoEficiencia: promediar(dias.map((dia) => dia.suenoEficiencia), 0),
      fcPromedio: promediar(dias.map((dia) => dia.fcPromedio), 0),
      fcReposo: promediar(dias.map((dia) => dia.fcReposo), 0),
      caloriasActivas: promediar(dias.map((dia) => dia.caloriasActivas), 0),
      distanciaKm: promediar(dias.map((dia) => dia.distanciaKm), 2),
    };

    const noches = dias.filter((dia) => dia.suenoHoras !== null);
    const sueno = {
      noches: noches.length,
      horasTotales: redondear(
        noches.reduce((total, dia) => total + dia.suenoHoras, 0),
        1
      ),
      promedioHoras: promedios.suenoHoras,
      eficienciaPromedio: promedios.suenoEficiencia,
    };

    const vistos = new Set();
    const entrenamientosUnicos = entrenamientos.filter((entrenamiento) => {
      const clave = [
        entrenamiento.tipo,
        entrenamiento.inicio,
        entrenamiento.dia,
        entrenamiento.duracionMin,
      ].join('|');
      if (vistos.has(clave)) return false;
      vistos.add(clave);
      return true;
    });

    const entrenamientosRango = entrenamientosUnicos
      .filter(
        (entrenamiento) =>
          entrenamiento.dia >= desde && entrenamiento.dia <= hasta
      )
      .sort((a, b) => String(b.inicio).localeCompare(String(a.inicio)));

    const workouts = entrenamientosRango
      .slice(0, MAX_WORKOUTS_RESUMEN)
      .map((entrenamiento) => ({
        tipo: entrenamiento.tipo,
        tipoEtiqueta: entrenamiento.tipoEtiqueta,
        inicio: entrenamiento.inicio,
        dia: entrenamiento.dia,
        duracionMin: entrenamiento.duracionMin,
        calorias: entrenamiento.calorias,
        distanciaKm: entrenamiento.distanciaKm,
        fcPromedio: entrenamiento.fcPromedio,
        fcMax: entrenamiento.fcMax,
      }));

    const fuentesTop = [...fuentes.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_FUENTES)
      .map(([nombre]) => nombre);

    const advertencias = [];
    if (conteo.sueno === 0) {
      advertencias.push('No se encontraron datos de sueño en el export.');
    }
    if (conteo.entrenamientos === 0) {
      advertencias.push('No se encontraron entrenamientos en el export.');
    }
    if (fuentes.size > 1) {
      advertencias.push(
        'Se usó la fuente con más registros por día para evitar duplicados entre dispositivos.'
      );
    }
    if (hasta < sumarDias(hoy, -2)) {
      advertencias.push(`Los datos más recientes del archivo son del ${hasta}.`);
    }

    return {
      version: 1,
      origen: 'apple_health',
      generadoEn: new Date().toISOString(),
      rangoDias: RANGO_DIAS,
      desde,
      hasta,
      dias,
      promedios,
      sueno,
      workouts,
      fuentes: fuentesTop,
      conteo: {
        ...conteo,
        entrenamientos: entrenamientosUnicos.length,
        registros,
      },
      advertencias,
      archivo: {
        nombre: archivo?.name || '',
        bytes: archivo?.size || 0,
      },
    };
  }

  return {
    procesarBytes,
    construirResumen,
    registros: () => registros,
  };
}

async function* leerBloques(archivo, signal) {
  if (typeof archivo.stream === 'function') {
    const reader = archivo.stream().getReader();
    try {
      while (true) {
        if (signal?.aborted) throw crearErrorCancelado();
        const { done, value } = await reader.read();
        if (done) break;
        if (value?.length) yield value;
      }
    } finally {
      if (signal?.aborted) {
        try {
          await reader.cancel();
        } catch {
          // El lector ya puede estar cerrado.
        }
      }
      try {
        reader.releaseLock();
      } catch {
        // Sin lock activo.
      }
    }
    return;
  }

  const tamanoBloque = 4 * 1024 * 1024;
  for (let offset = 0; offset < archivo.size; offset += tamanoBloque) {
    if (signal?.aborted) throw crearErrorCancelado();
    const parte = archivo.slice(offset, Math.min(offset + tamanoBloque, archivo.size));
    const buffer = await parte.arrayBuffer();
    yield new Uint8Array(buffer);
  }
}

export async function parseAppleHealthZip(archivo, { onProgress, signal } = {}) {
  if (!archivo || typeof archivo.size !== 'number' || archivo.size <= 0) {
    throw new Error('El archivo está vacío o no se pudo leer.');
  }

  const { Unzip, UnzipInflate } = await import('fflate');

  const acumulador = crearAcumulador();
  const unzip = new Unzip();
  unzip.register(UnzipInflate);

  let errorZip = null;
  let exportEncontrado = false;
  let exportFinalizado = false;

  unzip.onfile = (entrada) => {
    const nombre = String(entrada.name || '');
    const esExport = /(^|\/)export\.xml$/i.test(nombre);

    if (esExport && !exportEncontrado) {
      exportEncontrado = true;
      entrada.ondata = (error, trozo, final) => {
        if (error) {
          errorZip = error;
          return;
        }
        try {
          acumulador.procesarBytes(trozo || new Uint8Array(0), Boolean(final));
          if (final) exportFinalizado = true;
        } catch (err) {
          errorZip = err;
        }
      };
    } else {
      // Es importante consumir todos los archivos del ZIP: si no se llama a
      // start(), fflate acumula sus datos comprimidos en memoria. Descartamos
      // la salida porque solo necesitamos export.xml.
      entrada.ondata = (error) => {
        if (error && !errorZip) errorZip = error;
      };
    }

    try {
      entrada.start();
    } catch (error) {
      if (!errorZip) errorZip = error;
    }
  };

  const total = archivo.size;
  let leidos = 0;
  let ultimoAviso = 0;
  let ultimoRespiro = Date.now();

  const avisar = (forzar = false) => {
    const ahora = Date.now();
    if (!forzar && ahora - ultimoAviso < 250) return;
    ultimoAviso = ahora;
    onProgress?.({
      leidos,
      total,
      porcentaje: total > 0 ? Math.min(100, Math.round((leidos / total) * 100)) : 0,
      registros: acumulador.registros(),
    });
  };

  avisar(true);

  try {
    for await (const bloque of leerBloques(archivo, signal)) {
      if (signal?.aborted) throw crearErrorCancelado();
      leidos += bloque.length;

      try {
        unzip.push(bloque, false);
      } catch (error) {
        throw new Error(
          'No pudimos descomprimir el archivo. Verificá que sea el export.zip original de Apple Salud.'
        );
      }

      if (errorZip) throw errorZip;
      avisar();

      if (Date.now() - ultimoRespiro > 150) {
        await new Promise((resolver) => setTimeout(resolver, 0));
        ultimoRespiro = Date.now();
      }
    }

    if (signal?.aborted) throw crearErrorCancelado();

    try {
      unzip.push(new Uint8Array(0), true);
    } catch (error) {
      throw new Error(
        'El ZIP está incompleto o dañado. Volvé a exportarlo desde la app Salud.'
      );
    }

    if (errorZip) throw errorZip;

    if (!exportEncontrado) {
      throw new Error(
        'El ZIP no contiene el archivo export.xml de Apple Salud. Asegurate de subir el export.zip completo, sin descomprimir.'
      );
    }

    if (!exportFinalizado) {
      throw new Error(
        'No pudimos terminar de leer export.xml. Probá de nuevo con el archivo original.'
      );
    }

    avisar(true);
    return acumulador.construirResumen(archivo);
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    if (error instanceof Error) throw error;
    throw new Error(
      'No pudimos procesar el archivo. Verificá que sea el export.zip de Apple Salud.'
    );
  }
}
