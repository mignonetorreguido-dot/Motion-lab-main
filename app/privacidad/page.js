import LegalPage from '@/components/LegalPage';

export const metadata = {
  title: 'Política de Privacidad | MOTION LAB',
  description:
    'Cómo MOTION LAB recopila, usa y protege los datos de alumnos, entrenamiento, bienestar y relojes vinculados.',
};

const secciones = [
  {
    titulo: 'Responsable del tratamiento',
    parrafos: [
      'MOTION LAB es responsable de los datos personales que recopila a través de esta aplicación. Para consultas sobre privacidad podés escribir a contacto@motionlab.fit o al WhatsApp +54 9 362 465-4911.',
    ],
  },
  {
    titulo: 'Datos que recopilamos',
    items: [
      'Datos de cuenta: nombre, email, imagen de perfil de Google si elegís ese acceso y número de WhatsApp.',
      'Datos de onboarding: objetivo, deporte, experiencia, disponibilidad, lesiones y preferencias de entrenamiento.',
      'Datos de entrenamiento: rutinas asignadas, series, cargas, notas, observaciones y días completados.',
      'Datos de bienestar: respuestas semanales sobre descanso, estrés, ánimo, energía y motivación.',
      'Datos de relojes: actividad, pasos, calorías, sueño y frecuencia cardíaca que autorices compartir a través de Junction. Estos datos sólo se reciben si vinculás una cuenta compatible.',
    ],
  },
  {
    titulo: 'Para qué usamos los datos',
    items: [
      'Crear y administrar tu cuenta y permitir el acceso con Google o email.',
      'Diseñar, asignar y ajustar tu planificación de entrenamiento.',
      'Hacer seguimiento de tu bienestar y de la recuperación entre sesiones.',
      'Mostrarle a tu entrenador la información necesaria para corregir cargas, técnicas y descansos.',
      'Responder consultas, enviar comunicaciones del servicio y cumplir obligaciones legales.',
    ],
  },
  {
    titulo: 'Relojes y datos de salud',
    parrafos: [
      'La vinculación de relojes es opcional. Al autorizar Junction, aceptás que tus datos de actividad, sueño y pulso se compartan con MOTION LAB para el seguimiento del entrenamiento. Podés revocar el acceso desde la configuración del proveedor o solicitarnos que eliminemos la conexión.',
      'Las mediciones de pulso en vivo por Bluetooth se muestran en tu dispositivo y no se almacenan como historial en MOTION LAB.',
    ],
  },
  {
    titulo: 'Terceros que nos prestan servicios',
    items: [
      'Vercel y PostgreSQL/Prisma para alojar la aplicación y la base de datos.',
      'Google para el inicio de sesión con OAuth.',
      'Junction (ex Vital) para conectar cuentas de Garmin, Polar, Fitbit, Google Health/Pixel Watch, Oura, Withings y otros proveedores compatibles. Junction puede almacenar datos en Estados Unidos.',
      'WhatsApp para la comunicación con el entrenador cuando elegís escribirnos.',
    ],
  },
  {
    titulo: 'Conservación y seguridad',
    parrafos: [
      'Conservamos los datos mientras tu cuenta esté activa o durante el tiempo necesario para cumplir obligaciones legales. Aplicamos medidas técnicas y organizativas razonables para proteger la información, aunque ningún sistema es completamente infalible.',
    ],
  },
  {
    titulo: 'Tus derechos',
    parrafos: [
      'Podés solicitar acceso, rectificación, actualización o eliminación de tus datos, y oponerte a determinados tratamientos. También podés pedir la desconexión del reloj. Responderemos tu solicitud por los canales de contacto indicados.',
    ],
  },
  {
    titulo: 'Cookies y sesión',
    parrafos: [
      'Usamos cookies necesarias para mantener tu sesión iniciada y proteger el acceso. No usamos cookies de publicidad ni vendemos datos personales.',
    ],
  },
  {
    titulo: 'Menores de edad',
    parrafos: [
      'El servicio está pensado para personas mayores de 18 años. Si un menor quiere participar, debe hacerlo con autorización y supervisión de su madre, padre o tutor legal.',
    ],
  },
  {
    titulo: 'Cambios en esta política',
    parrafos: [
      'Podemos actualizar esta política para reflejar cambios en el servicio o en la normativa. Publicaremos la versión vigente en esta página con su fecha de actualización.',
    ],
  },
];

export default function PrivacidadPage() {
  return (
    <LegalPage
      titulo="Política de Privacidad"
      actualizado="21 de octubre de 2026"
      intro="En MOTION LAB cuidamos los datos que nos confiás. Esta política explica qué información recopilamos, para qué la usamos y cómo podés ejercer tus derechos."
      secciones={secciones}
    />
  );
}
