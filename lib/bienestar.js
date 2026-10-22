/**
 * ========================================================================
 * CHEQUEO DE BIENESTAR (lib/bienestar.js)
 * ========================================================================
 * Define las preguntas, las cinco dimensiones y el cálculo de resultados
 * del chequeo de bienestar de MOTION LAB.
 *
 * El cuestionario es orientativo: no reemplaza una consulta profesional
 * ni constituye un diagnóstico clínico.
 */

export const DIMENSIONES = [
  {
    id: 'descanso',
    nombre: 'Descanso',
    icono: 'Moon',
    color: '#a78bfa',
    recomendacionTitulo: 'Mejorá tu descanso',
    recomendacion:
      'Intentá mantener horarios regulares para dormir, reducí el uso de pantallas antes de acostarte y creá un ambiente tranquilo y oscuro.',
  },
  {
    id: 'estres',
    nombre: 'Nivel de estrés',
    icono: 'Zap',
    color: '#facc15',
    recomendacionTitulo: 'Manejá el estrés',
    recomendacion:
      'Probá técnicas de respiración, pausas activas o actividades que disfrutes. Tomarte un momento para vos también es entrenamiento.',
  },
  {
    id: 'animo',
    nombre: 'Estado de ánimo',
    icono: 'Smile',
    color: '#22d3ee',
    recomendacionTitulo: 'Cuidá tu ánimo',
    recomendacion:
      'Date espacio para las cosas que te hacen bien. Hablar con alguien de confianza y registrar cómo te sentís puede ayudarte a entenderte mejor.',
  },
  {
    id: 'energia',
    nombre: 'Energía',
    icono: 'BatteryCharging',
    color: '#fb7185',
    recomendacionTitulo: 'Sumá energía a tu día',
    recomendacion:
      'Hidratate bien, incorporá alimentos nutritivos y asegurate de moverte, aunque sea un poco. Tu cuerpo te lo va a agradecer.',
  },
  {
    id: 'motivacion',
    nombre: 'Motivación',
    icono: 'Target',
    color: '#60a5fa',
    recomendacionTitulo: 'Recuperá la motivación',
    recomendacion:
      'Recordá por qué empezaste. Fijate objetivos realistas, celebrá tus avances y rodeate de personas que te impulsen.',
  },
];

/**
 * Cada opción tiene un valor de 0 a 4, donde 4 es el estado más saludable.
 * En las preguntas de estrés, las opciones están ordenadas de mayor a menor
 * estrés, pero el valor siempre representa el bienestar.
 */
export const PREGUNTAS = [
  {
    id: 'descanso_1',
    dimension: 'descanso',
    titulo: '¿Cómo dormiste en las últimas noches?',
    ayuda: 'Pensá en los últimos 7 días.',
    opciones: [
      { valor: 0, etiqueta: 'Muy mal', emoji: '😫' },
      { valor: 1, etiqueta: 'Mal', emoji: '🙁' },
      { valor: 2, etiqueta: 'Regular', emoji: '😐' },
      { valor: 3, etiqueta: 'Bien', emoji: '🙂' },
      { valor: 4, etiqueta: 'Muy bien', emoji: '😴' },
    ],
  },
  {
    id: 'descanso_2',
    dimension: 'descanso',
    titulo: '¿Cómo te sentís al despertarte?',
    ayuda: 'Tu primera sensación al abrir los ojos.',
    opciones: [
      { valor: 0, etiqueta: 'Agotado/a', emoji: '🪫' },
      { valor: 1, etiqueta: 'Cansado/a', emoji: '😴' },
      { valor: 2, etiqueta: 'Normal', emoji: '😐' },
      { valor: 3, etiqueta: 'Descansado/a', emoji: '🙂' },
      { valor: 4, etiqueta: 'Muy descansado/a', emoji: '🌤️' },
    ],
  },
  {
    id: 'estres_1',
    dimension: 'estres',
    titulo: '¿Cómo venís de estrés esta semana?',
    ayuda: 'Pensá en la presión que sentiste en el trabajo, el estudio o tu día a día.',
    opciones: [
      { valor: 0, etiqueta: 'Muy alto', emoji: '🌪️' },
      { valor: 1, etiqueta: 'Alto', emoji: '😰' },
      { valor: 2, etiqueta: 'Moderado', emoji: '😬' },
      { valor: 3, etiqueta: 'Bajo', emoji: '🙂' },
      { valor: 4, etiqueta: 'Muy bajo', emoji: '😌' },
    ],
  },
  {
    id: 'estres_2',
    dimension: 'estres',
    titulo: '¿Te cuesta desconectar de las preocupaciones?',
    ayuda: 'Por ejemplo, cuando terminás tus actividades o antes de dormir.',
    opciones: [
      { valor: 0, etiqueta: 'Siempre', emoji: '🔁' },
      { valor: 1, etiqueta: 'Casi siempre', emoji: '😵‍💫' },
      { valor: 2, etiqueta: 'A veces', emoji: '😐' },
      { valor: 3, etiqueta: 'Casi nunca', emoji: '🙂' },
      { valor: 4, etiqueta: 'Nunca', emoji: '🧘' },
    ],
  },
  {
    id: 'animo_1',
    dimension: 'animo',
    titulo: '¿Cómo te sentiste la mayor parte de la semana?',
    ayuda: 'Elegí la opción que más se parezca a tu estado general.',
    opciones: [
      { valor: 0, etiqueta: 'Muy mal', emoji: '😞' },
      { valor: 1, etiqueta: 'Mal', emoji: '🙁' },
      { valor: 2, etiqueta: 'Neutral', emoji: '😐' },
      { valor: 3, etiqueta: 'Bien', emoji: '🙂' },
      { valor: 4, etiqueta: 'Muy bien', emoji: '😄' },
    ],
  },
  {
    id: 'animo_2',
    dimension: 'animo',
    titulo: '¿Disfrutaste de las cosas que hiciste?',
    ayuda: 'Desde una charla con alguien hasta una actividad que te gusta.',
    opciones: [
      { valor: 0, etiqueta: 'Nunca', emoji: '🌧️' },
      { valor: 1, etiqueta: 'Casi nunca', emoji: '🙁' },
      { valor: 2, etiqueta: 'A veces', emoji: '😐' },
      { valor: 3, etiqueta: 'Casi siempre', emoji: '🙂' },
      { valor: 4, etiqueta: 'Siempre', emoji: '🌞' },
    ],
  },
  {
    id: 'energia_1',
    dimension: 'energia',
    titulo: '¿Cómo está tu energía durante el día?',
    ayuda: 'No pienses solo en el entrenamiento: también en tu rutina diaria.',
    opciones: [
      { valor: 0, etiqueta: 'Sin energía', emoji: '🪫' },
      { valor: 1, etiqueta: 'Baja', emoji: '🔋' },
      { valor: 2, etiqueta: 'Normal', emoji: '🔋🔋' },
      { valor: 3, etiqueta: 'Buena', emoji: '⚡' },
      { valor: 4, etiqueta: 'Excelente', emoji: '🔥' },
    ],
  },
  {
    id: 'energia_2',
    dimension: 'energia',
    titulo: '¿Sentís un cansancio que no mejora con descanso?',
    ayuda: 'Ese cansancio que aparece aunque hayas dormido.',
    opciones: [
      { valor: 0, etiqueta: 'Siempre', emoji: '😴' },
      { valor: 1, etiqueta: 'Casi siempre', emoji: '🥱' },
      { valor: 2, etiqueta: 'A veces', emoji: '😐' },
      { valor: 3, etiqueta: 'Casi nunca', emoji: '🙂' },
      { valor: 4, etiqueta: 'Nunca', emoji: '⚡' },
    ],
  },
  {
    id: 'motivacion_1',
    dimension: 'motivacion',
    titulo: '¿Cómo está tu motivación para entrenar?',
    ayuda: 'Pensá en las ganas de moverte y cumplir con tu plan.',
    opciones: [
      { valor: 0, etiqueta: 'Nula', emoji: '🪫' },
      { valor: 1, etiqueta: 'Baja', emoji: '😕' },
      { valor: 2, etiqueta: 'Regular', emoji: '😐' },
      { valor: 3, etiqueta: 'Buena', emoji: '💪' },
      { valor: 4, etiqueta: 'Muy alta', emoji: '🚀' },
    ],
  },
  {
    id: 'motivacion_2',
    dimension: 'motivacion',
    titulo: '¿Te está costando cumplir tus objetivos?',
    ayuda: 'Puede ser con el entrenamiento, la alimentación o tus rutinas.',
    opciones: [
      { valor: 0, etiqueta: 'Muchísimo', emoji: '🧱' },
      { valor: 1, etiqueta: 'Bastante', emoji: '😮‍💨' },
      { valor: 2, etiqueta: 'Algo', emoji: '😐' },
      { valor: 3, etiqueta: 'Poco', emoji: '🙂' },
      { valor: 4, etiqueta: 'Nada', emoji: '🎯' },
    ],
  },
];

const NIVELES_POR_DIMENSION = {
  descanso: [
    {
      min: 75,
      clave: 'ALTO',
      etiqueta: 'Reparador',
      descripcion:
        'Tu descanso está cumpliendo su función: te levantás con energía y el cuerpo se recupera.',
    },
    {
      min: 50,
      clave: 'MEDIO',
      etiqueta: 'Regular',
      descripcion:
        'Tu descanso no es del todo reparador. Puede que te cueste conciliar el sueño o que te levantes cansado/a.',
    },
    {
      min: 0,
      clave: 'BAJO',
      etiqueta: 'Poco reparador',
      descripcion:
        'Tu descanso está afectando la recuperación. Priorizá horarios regulares y un ambiente tranquilo para dormir.',
    },
  ],
  estres: [
    {
      min: 75,
      clave: 'ALTO',
      etiqueta: 'Bajo',
      descripcion:
        'Venís manejando la presión con calma. Ese equilibrio ayuda a entrenar y recuperarte mejor.',
    },
    {
      min: 50,
      clave: 'MEDIO',
      etiqueta: 'Moderado',
      descripcion:
        'Sentís cierta presión o preocupación en algunos momentos del día. Bajar un cambio y respirar puede ayudarte.',
    },
    {
      min: 0,
      clave: 'BAJO',
      etiqueta: 'Alto',
      descripcion:
        'El estrés está ocupando mucho espacio. Probá pausas activas, respiración y hablarlo con alguien de confianza.',
    },
  ],
  animo: [
    {
      min: 75,
      clave: 'ALTO',
      etiqueta: 'Bueno',
      descripcion:
        'En general te sentís bien, con una actitud positiva hacia la vida y tus actividades.',
    },
    {
      min: 50,
      clave: 'MEDIO',
      etiqueta: 'Regular',
      descripcion:
        'Tu ánimo está estable, con altibajos normales. Date espacio para lo que te hace bien.',
    },
    {
      min: 0,
      clave: 'BAJO',
      etiqueta: 'Bajo',
      descripcion:
        'Tu ánimo está bajo. No lo minimices: hablarlo con alguien y pedir apoyo también es entrenar.',
    },
  ],
  energia: [
    {
      min: 75,
      clave: 'ALTO',
      etiqueta: 'Alta',
      descripcion:
        'Tenés energía suficiente para el día y para entrenar. Aprovechala con inteligencia.',
    },
    {
      min: 50,
      clave: 'MEDIO',
      etiqueta: 'Media',
      descripcion:
        'Tu energía está en un punto medio. Cuidá la hidratación, la comida y los descansos.',
    },
    {
      min: 0,
      clave: 'BAJO',
      etiqueta: 'Baja',
      descripcion:
        'Sentís poca energía durante el día. Revisá sueño, alimentación y carga de entrenamiento.',
    },
  ],
  motivacion: [
    {
      min: 75,
      clave: 'ALTO',
      etiqueta: 'Alta',
      descripcion:
        'Tu motivación está alta. Aprovechá el impulso y sostení la constancia.',
    },
    {
      min: 50,
      clave: 'MEDIO',
      etiqueta: 'Media',
      descripcion:
        'Tu motivación está presente, pero variable. Recordá por qué empezaste y celebrá avances chicos.',
    },
    {
      min: 0,
      clave: 'BAJO',
      etiqueta: 'Baja',
      descripcion:
        'Hoy cuesta mantener la motivación. Bajá la exigencia, elegí objetivos realistas y rodeate de gente que te impulse.',
    },
  ],
};

const NIVELES_GENERALES = [
  {
    min: 75,
    clave: 'EQUILIBRIO',
    etiqueta: 'En equilibrio',
    descripcion: 'Hay aspectos que están funcionando bien. Seguí cuidando tus hábitos.',
  },
  {
    min: 50,
    clave: 'ATENCION',
    etiqueta: 'A fortalecer',
    descripcion:
      'Hay áreas que necesitan atención. Pequeños cambios pueden hacer una gran diferencia.',
  },
  {
    min: 0,
    clave: 'ALERTA',
    etiqueta: 'En alerta',
    descripcion:
      'Varias áreas están pidiendo ayuda. Hablalo con Matías y, si lo necesitás, con un profesional.',
  },
];

export function obtenerNivelDimension(dimensionId, puntaje) {
  const niveles = NIVELES_POR_DIMENSION[dimensionId] || [];
  return niveles.find((nivel) => puntaje >= nivel.min) || niveles[niveles.length - 1];
}

export function obtenerNivelGeneral(puntaje) {
  return NIVELES_GENERALES.find((nivel) => puntaje >= nivel.min) || NIVELES_GENERALES[NIVELES_GENERALES.length - 1];
}

export function calcularResultado(respuestas = {}) {
  const dimensiones = DIMENSIONES.map((dimension) => {
    const preguntas = PREGUNTAS.filter((pregunta) => pregunta.dimension === dimension.id);
    const valores = preguntas.map((pregunta) => {
      const valor = Number(respuestas[pregunta.id]);
      return Number.isFinite(valor) ? Math.min(4, Math.max(0, valor)) : 0;
    });
    const promedio = valores.reduce((total, valor) => total + valor, 0) / valores.length;
    const puntaje = Math.round((promedio / 4) * 100);
    const nivel = obtenerNivelDimension(dimension.id, puntaje);

    return {
      ...dimension,
      puntaje,
      nivel: nivel.etiqueta,
      nivelClave: nivel.clave,
      descripcion: nivel.descripcion,
    };
  });

  const puntajeGeneral = Math.round(
    dimensiones.reduce((total, dimension) => total + dimension.puntaje, 0) / dimensiones.length
  );
  const nivelGeneral = obtenerNivelGeneral(puntajeGeneral);

  const areasParaReforzar = [...dimensiones].sort((a, b) => a.puntaje - b.puntaje).slice(0, 2);

  return {
    dimensiones,
    puntajeGeneral,
    nivelGeneral: {
      ...nivelGeneral,
      etiqueta: nivelGeneral.etiqueta,
    },
    areasParaReforzar,
    recomendaciones: areasParaReforzar.map((dimension) => ({
      id: dimension.id,
      titulo: dimension.recomendacionTitulo,
      texto: dimension.recomendacion,
      color: dimension.color,
      icono: dimension.icono,
    })),
  };
}

export function respuestasCompletas(respuestas = {}) {
  return PREGUNTAS.every((pregunta) => {
    const valor = Number(respuestas[pregunta.id]);
    return Number.isInteger(valor) && valor >= 0 && valor <= 4;
  });
}

// ------------------------------------------------------------------------
// CHEQUEO SEMANAL
// ------------------------------------------------------------------------
// El cuestionario se completa una vez por semana. Calculamos la clave de la
// semana en la zona horaria de Argentina para que cliente y servidor coincidan,
// incluso si el chequeo se hace un domingo a la noche.
const ZONA_HORARIA_BIENESTAR = 'America/Argentina/Buenos_Aires';

function partesDeFechaEnZona(fecha) {
  const fechaObj = new Date(fecha);
  if (Number.isNaN(fechaObj.getTime())) return null;

  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA_BIENESTAR,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(fechaObj);

  const valor = (tipo) => Number(partes.find((parte) => parte.type === tipo)?.value);
  return {
    anio: valor('year'),
    mes: valor('month'),
    dia: valor('day'),
  };
}

/**
 * Devuelve el lunes de la semana de una fecha, en formato YYYY-MM-DD.
 * Se usa como identificador de la semana del chequeo de bienestar.
 */
export function obtenerClaveSemana(fecha = new Date()) {
  const partes = partesDeFechaEnZona(fecha);
  if (!partes) return '';

  const fechaUTC = new Date(Date.UTC(partes.anio, partes.mes - 1, partes.dia));
  const diaSemana = fechaUTC.getUTCDay(); // 0 = domingo, 1 = lunes...
  const desplazamiento = (diaSemana + 6) % 7; // lunes = 0
  fechaUTC.setUTCDate(fechaUTC.getUTCDate() - desplazamiento);

  return fechaUTC.toISOString().slice(0, 10);
}

/**
 * Indica si un chequeo pertenece a la semana actual.
 */
export function esChequeoDeEstaSemana(fecha) {
  if (!fecha) return false;
  const clave = obtenerClaveSemana(fecha);
  return Boolean(clave) && clave === obtenerClaveSemana(new Date());
}
