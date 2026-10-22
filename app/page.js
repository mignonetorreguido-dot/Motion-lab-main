/**
 * ========================================================================
 * PÁGINA PRINCIPAL (app/page.js)
 * ========================================================================
 * Este archivo representa la ruta principal ("/") de la web de MOTION LAB.
 * 
 * Componentes visibles en la landing page:
 * 1. Navbar: Barra de navegación con selector de modo soleado/noche
 * 2. Hero: Portada de presentación de alto rendimiento con llamado a acción
 * 3. AboutTrainer: Filosofía de entrenamiento, biomecánica y método
 * 4. GallerySection: Resultados y entornos donde se aplica la ciencia
 * 5. Footer: Pie de página y canales de contacto oficial
 * 6. WhatsAppButton: Botón flotante para escritorio
 */

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AboutTrainer from '@/components/AboutTrainer';
import GallerySection from '@/components/GallerySection';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Barra de menú superior fija con toggle exterior */}
      <Navbar />

      {/* 2. Contenido principal de la landing page */}
      <main className="flex-grow">
        {/* Presentación de alto rendimiento */}
        <Hero />

        {/* Quién es el coach y cómo trabaja el laboratorio */}
        <AboutTrainer />

        {/* Áreas de entrenamiento y resultados visuales */}
        <GallerySection />
      </main>

      {/* 3. Pie de página con información y redes */}
      <Footer />

      {/* 4. Botón flotante para escritorio */}
      <WhatsAppButton />
    </div>
  );
}
