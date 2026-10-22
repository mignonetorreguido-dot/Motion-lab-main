import LegalPage from '@/components/LegalPage';

export const metadata = {
  title: 'Términos y Condiciones | MOTION LAB',
  description:
    'Condiciones de uso, planes, pagos y responsabilidad del servicio de entrenamiento MOTION LAB.',
};

const secciones = [
  {
    titulo: 'Servicio',
    parrafos: [
      'MOTION LAB ofrece planificación de entrenamiento, seguimiento del rendimiento y acompañamiento de un entrenador. El Plan Base incluye una rutina estructurada para que el alumno se entrene de forma autónoma. El Plan Premium incluye seguimiento 1 a 1 presencial y remoto por video, con ajustes según horarios, deporte y respuestas individuales.',
    ],
  },
  {
    titulo: 'Cuenta y acceso',
    parrafos: [
      'Para usar el panel tenés que crear una cuenta con datos correctos y mantener la confidencialidad de tus credenciales. Podés ingresar con email o con Google. Sos responsable de la actividad realizada desde tu cuenta.',
    ],
  },
  {
    titulo: 'Planes y pagos',
    parrafos: [
      'Los precios y la modalidad de pago se informan antes de contratar. El acceso a las funciones del plan puede quedar pendiente hasta que el entrenador valide el pago. No se activan cobros automáticos desde esta aplicación.',
    ],
  },
  {
    titulo: 'Rutinas y riesgo',
    parrafos: [
      'La actividad física implica riesgos. Antes de comenzar un plan de alta exigencia consultá con un profesional de la salud. Respetá las indicaciones técnicas, los descansos y las cargas asignadas. Si sentís dolor, mareo o una molestia anormal, detené la sesión y consultá a un profesional.',
      'MOTION LAB no reemplaza una consulta médica, kinesiológica ni nutricional.',
    ],
  },
  {
    titulo: 'Datos de bienestar y relojes',
    parrafos: [
      'El cuestionario de bienestar y los datos de relojes son herramientas de seguimiento, no diagnósticos médicos. La vinculación de un reloj es opcional y requiere tu autorización. Podés desconectarla cuando quieras.',
    ],
  },
  {
    titulo: 'Uso correcto',
    parrafos: [
      'No está permitido compartir tu cuenta, intentar acceder a datos de otros alumnos, copiar rutinas para venderlas ni usar la aplicación de forma que afecte su seguridad o funcionamiento.',
    ],
  },
  {
    titulo: 'Propiedad intelectual',
    parrafos: [
      'Los planes, rutinas, textos, marcas y materiales de MOTION LAB son de uso personal. No pueden reproducirse ni distribuirse comercialmente sin autorización.',
    ],
  },
  {
    titulo: 'Cancelación',
    parrafos: [
      'Podés solicitar la baja o la eliminación de tu cuenta por los canales de contacto. La baja no elimina automáticamente registros necesarios para obligaciones legales o contables.',
    ],
  },
  {
    titulo: 'Cambios y contacto',
    parrafos: [
      'Podemos actualizar estos términos para reflejar cambios en el servicio. La versión vigente se publica en esta página. Consultas: contacto@motionlab.fit o WhatsApp +54 9 362 465-4911.',
    ],
  },
];

export default function TerminosPage() {
  return (
    <LegalPage
      titulo="Términos y Condiciones"
      actualizado="21 de octubre de 2026"
      intro="Estas condiciones regulan el uso de la aplicación y de los servicios de entrenamiento de MOTION LAB. Al crear una cuenta, aceptás estos términos."
      secciones={secciones}
    />
  );
}
