import Footer from '@/components/Footer';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/site';

/**
 * ========================================================================
 * ARCHIVO DE DISEÑO RAÍZ (app/layout.js) - MOTION LAB
 * ========================================================================
 * Configuración de etiquetas globales, metadatos SEO y soporte de
 * visualización de alto contraste para celulares bajo sol directo.
 */

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  applicationName: SITE_NAME,
  description: SITE_DESCRIPTION,
  keywords: [
    'MOTION LAB',
    'Motion Lab',
    'preparación física',
    'preparación física y rendimiento',
    'entrenamiento de alto rendimiento',
    'rendimiento deportivo',
    'personal trainer',
    'planificación de fuerza',
    'biomecánica',
    'hipertrofia',
    'Resistencia',
    'Chaco',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#05070c' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('motion_lab_theme');
                  if (theme === 'sunlight') {
                    document.documentElement.classList.add('sunlight-mode');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[#05070c] text-slate-100 antialiased min-h-screen selection:bg-blue-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <div className="flex-grow flex flex-col">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
