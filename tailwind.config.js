/** 
 * Configuración de Tailwind CSS para MOTION LAB
 * 
 * En 'content' le decimos a Tailwind en qué carpetas buscar clases.
 * En 'theme.extend.colors' configuramos la paleta de colores de MOTION LAB:
 * - Azul Eléctrico y Cyan Deportivo como colores primarios de acento.
 * - Fondos negros profundos y grafito de alto rendimiento.
 */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        motion: {
          dark: '#05070c',      // Fondo general negro profundo
          card: '#0c1322',      // Fondo para tarjetas de planes y preguntas
          cardHover: '#111c33', // Hover para tarjetas interactivas
          border: '#1b2a47',    // Bordes sutiles azulados
          blue: '#0066ff',      // Azul Eléctrico de marca MOTION LAB
          cyan: '#00d4ff',      // Cyan Neón para brillos y acentos
          sky: '#38bdf8',       // Celeste atlético para textos destacados
          amber: '#f59e0b',     // Dorado/Ámbar para el Plan Performance
        }
      }
    },
  },
  plugins: [],
};
