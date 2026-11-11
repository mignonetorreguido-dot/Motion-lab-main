/**
 * ========================================================================
 * PÁGINA: Onboarding de Alumno (app/onboarding/page.js)
 * ========================================================================
 * Pantalla que aloja el formulario por pasos para el alta de nuevos alumnos
 * con la identidad visual de Motion Lab y soporte de alto contraste para celulares.
 */

import Wizard from '@/components/onboarding/Wizard';
import TrainingHeader from '@/components/training/TrainingHeader';

export const metadata = {
  title: 'Onboarding & Registro | MOTION LAB',
  description: 'Digitalización del proceso de alta, evaluación física y selección de plan de entrenamiento con Matías en Motion Lab.',
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
      
      {/* CABECERA CON TOGGLE SOLEADO */}
      <TrainingHeader showBienestar={false} />

      {/* CONTENIDO PRINCIPAL: WIZARD */}
      <main className="flex-grow flex items-center justify-center py-4 pb-8">
        <Wizard />
      </main>

      {/* PIE DISCRETO */}
      
    </div>
  );
}
