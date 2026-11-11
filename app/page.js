/**
 * ========================================================================
 * PÁGINA PRINCIPAL (app/page.js)
 * ========================================================================
 * Este archivo representa la ruta principal ("/") de la web de MOTION LAB.
 * 
 * Componentes visibles en la landing page:
 * 1. Navbar: Barra de navegación con selector de modo soleado/noche
 * 2. Hero: Portada de presentación de alto rendimiento con llamado a acción
 * 3. AboutTrainer: Metodología de entrenamiento, biomecánica y método
 * 4. GallerySection: Resultados y entornos donde se aplica la ciencia
 * 5. Footer: Pie de página y canales de contacto oficial
 */

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AboutTrainer from '@/components/AboutTrainer';
import GallerySection from '@/components/GallerySection';

import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/site';

export const metadata = {
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/',
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/images/motion-lab-field.jpg',
        width: 1200,
        height: 630,
        alt: 'MOTION LAB – entrenamiento de alto rendimiento',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/images/motion-lab-field.jpg'],
  },
};

// Datos estructurados para que Google identifique el nombre del sitio
// ("MOTION LAB") en los resultados de búsqueda. Deben estar en la home.
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: [
    'Motion Lab',
    'MOTION LAB High Performance',
    'MOTION LAB Preparación Física y Rendimiento',
  ],
  url: `${SITE_URL}/`,
  description: SITE_DESCRIPTION,
  inLanguage: 'es-AR',
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Chaco, Argentina',
  },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/icon-512.png`,
      width: 512,
      height: 512,
    },
    sameAs: ['https://www.instagram.com/motionlab_pf/'],
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

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
      
    </div>
  );
}
