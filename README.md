# 🏋️‍♂️ Plataforma Web para Personal Trainer

¡Bienvenido/a al proyecto! Esta es una aplicación web moderna, atlética y completa creada especialmente para un **Entrenador Personal (Personal Trainer)**. Permite a los futuros alumnos responder un **cuestionario inicial de evaluación física** para diagnosticar su nivel y necesidades, y presenta una comparativa clara entre el **Plan Base** y el **Plan Performance**.

**URL pública:** https://motion-lab-preparacion-fisica-y-rendimiento.vercel.app

El proyecto está construido con:
- **Next.js 14** (Framework moderno de React para aplicaciones web rápidas y optimizadas para Google)
- **React 18** (Biblioteca para crear interfaces interactivas mediante componentes)
- **JavaScript estándar** (Sin TypeScript, con código limpio y comentarios línea por línea para facilitar el aprendizaje)
- **Tailwind CSS** (Diseño moderno, modo oscuro atlético y totalmente responsive para teléfonos y PC)
- **PostgreSQL + Prisma** (Base de datos relacional para alumnos, rutinas, check-ins y seguimiento)
- **Vercel** (Plataforma recomendada para publicar tu web en internet con un clic y de forma gratuita)

---

## 📂 Estructura del Proyecto Explicada

```text
├── app/
│   ├── api/
│   │   ├── cuestionario/
│   │   │   └── route.js      -> Backend: Recibe los datos del cuestionario y los guarda en PostgreSQL
│   │   └── planes/
│   │       └── route.js      -> Backend: Devuelve la lista y precios de los planes
│   ├── globals.css           -> Estilos globales y temas deportivos de Tailwind
│   ├── layout.js             -> Estructura común (HTML, fuentes, metadatos para Google SEO)
│   └── page.js               -> Página principal donde se unen todas las secciones
├── components/
│   ├── Navbar.js             -> Barra de navegación fija con menú móvil
│   ├── Hero.js               -> Portada impactante con llamadas a la acción
│   ├── AboutTrainer.js       -> Presentación del entrenador, certificaciones y método
│   ├── FitnessQuiz.js        -> Cuestionario interactivo paso a paso con diagnóstico
│   ├── PricingSection.js     -> Comparación de Plan Base vs Plan Performance
│   ├── TestimonialsAndFaq.js -> Casos de éxito y acordeón de preguntas frecuentes
│   ├── Footer.js             -> Pie de página con redes sociales y aviso de salud
│   └── WhatsAppButton.js     -> Botón flotante siempre visible para chatear
├── prisma/
│   └── schema.prisma         -> Modelos de PostgreSQL (alumnos, rutinas, check-ins, etc.)
├── scripts/
│   └── seed-demo.mjs         -> Carga inicial de los alumnos del panel
├── lib/
│   └── prisma.js             -> Cliente Prisma reutilizable para toda la app
├── .env.example              -> Plantilla con las variables de configuración
├── .env.local                -> Tus contraseñas y configuración local (no se sube a internet)
├── package.json              -> Lista de herramientas instaladas en el proyecto
└── tailwind.config.js        -> Configuración de colores y estilos visuales
```

---

## 🚀 Cómo Ejecutar el Proyecto en tu Computadora

### 1. Requisitos previos
Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).

### 2. Iniciar el servidor de desarrollo
Abre tu terminal (PowerShell o Command Prompt) en esta carpeta y escribe:

```bash
npm run dev
```

Abre tu navegador y entra a:
👉 **[http://localhost:3000](http://localhost:3000)**

¡Ya verás tu página web funcionando en vivo!

---

## 🗄️ Cómo Configurar la Base de Datos PostgreSQL

La aplicación usa **Prisma** con PostgreSQL. La forma recomendada en producción es conectar una base **Prisma Postgres** desde el panel de Vercel; también podés usar cualquier PostgreSQL local o en la nube.

### Opción A: Prisma Postgres desde Vercel (producción)
1. Entrá al proyecto `motion-lab-high-performance` en Vercel.
2. Abrí **Storage** y conectá el store de Prisma Postgres.
3. Vercel agrega automáticamente `DATABASE_URL` (y `POSTGRES_URL` / `PRISMA_DATABASE_URL`).
4. Desde una terminal con esa `DATABASE_URL`, creá las tablas y cargá los alumnos:
   ```bash
   npm run prisma:push
   npm run db:seed
   ```

### Opción B: PostgreSQL local
1. Creá una base de datos PostgreSQL vacía.
2. Copiá `.env.example` a `.env.local` y completá:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/motion_lab"
   ```
3. Creá las tablas y cargá los alumnos:
   ```bash
   npm run prisma:push
   npm run db:seed
   ```

> **Nota:** Si la base no está disponible, la app mantiene un modo demo en memoria para que el panel siga funcionando, pero los cambios no serán permanentes. Con `DATABASE_URL` configurada, las fichas, pagos y rutinas quedan guardados en PostgreSQL.

---

## 🧠 Conceptos Clave de Programación Explicados para Principiantes

### 1. ¿Qué es un Componente en React?
Un componente es como un bloque de Lego. En vez de escribir 1000 líneas en un solo archivo HTML, dividimos la web en piezas pequeñas y reutilizables: `Navbar`, `Hero`, `FitnessQuiz`, etc. Cada archivo exporta una función que devuelve código visual (JSX).

### 2. ¿Para qué sirve `'use client'`?
En Next.js existen dos tipos de componentes:
- **Server Components:** Se procesan en el servidor y envían solo HTML limpio al navegador. Son súper rápidos y seguros para SEO.
- **Client Components (con `'use client'`):** Necesarios cuando el usuario interactúa con la pantalla (por ejemplo, hacer clic en botones, escribir en inputs de texto o abrir menús).

### 3. ¿Qué es el Hook `useState`?
En JavaScript normal, si una variable cambia, la pantalla no se actualiza automáticamente. `useState` es la forma en que React "recuerda" datos y vuelve a pintar la pantalla cuando cambian:
```javascript
// 'pasoActual' es el valor actual (ej: 1)
// 'setPasoActual' es la función que usamos para cambiarlo a 2, 3, etc.
const [pasoActual, setPasoActual] = useState(1);
```

### 4. ¿Cómo viajan los datos al Backend?
Cuando el alumno presiona "Ver mi Diagnóstico":
1. El archivo `FitnessQuiz.js` junta las respuestas y hace una petición con `fetch('/api/cuestionario', { method: 'POST', body: ... })`.
2. El archivo `app/api/cuestionario/route.js` recibe la información en el servidor.
3. La ruta del backend usa Prisma (`lib/prisma.js`) para guardar los datos en PostgreSQL.
4. El servidor responde con `{ success: true }` y la pantalla le muestra el plan recomendado y el botón de WhatsApp.

---

## 🎨 Cómo Personalizar la Web con tus Datos

1. **Tu número de WhatsApp:**
   - Está definido en `lib/onboarding.js` y en los componentes que muestran el botón (`Footer.js`, `Hero.js`, `PricingSection.js`, `WhatsAppButton.js`, `MobileBottomBar.js`).
   - Si cambia, actualizalo en esos archivos.
2. **Nombre del Entrenador:**
   - Coach Matías (Motion Lab). Puedes personalizar su biografía y certificaciones en `components/AboutTrainer.js`.
3. **Precios de los Planes:**
   - Abre `components/PricingSection.js` y cambia `$75.000` o `$180.000` por la moneda y valor que prefieras.

---

## 🔐 Acceso del Entrenador con Cuenta Única + PIN

El botón **Comenzar** de la portada lleva a `/comenzar`, donde se elige el tipo de acceso:

- **Soy Alumno:** crea una cuenta nueva (`/onboarding`) o inicia sesión (`/login`).
- **Soy Profesor:** abre el panel exclusivo de Matías (`/admin`) con el email de su cuenta única y un PIN privado.

Existe **una sola cuenta de profesor**. Se identifica con `TRAINER_EMAIL` y se protege con `TRAINER_PIN`; ambos se validan únicamente en el servidor. La cuenta se crea sola en el primer ingreso, así que no hay un registro público de profesores.

```env
TRAINER_EMAIL="matias@motionlab.fit"
TRAINER_PIN="482913"
```

Si las variables no están definidas se usan los valores de demostración `matias@motionlab.fit` / `246810`; cambialos antes de publicar la web.

> El entrenador no puede ingresar con Google ni con el formulario de alumnos: su único acceso es ese email + PIN. Cualquier otra cuenta se crea siempre como ALUMNO.

---

## 🔐 Cómo Activar el Ingreso con Google

El botón **Continuar con Google** ya está integrado en el login y en el paso final del onboarding. Para que funcione en producción, hay que crear un cliente OAuth en Google Cloud y cargar dos variables en Vercel:

1. Entrá a [Google Cloud Console](https://console.cloud.google.com/) con la cuenta de Google que va a administrar el acceso.
2. Creá un proyecto (por ejemplo, `Motion Lab`).
3. Configurá la pantalla de consentimiento OAuth:
   - Tipo: **External**.
   - Completá nombre de la app, correo de soporte y datos de contacto.
   - En **Test users**, agregá los correos que van a probar el ingreso mientras la app esté en modo testing.
4. Andá a **Credentials → Create Credentials → OAuth client ID**:
   - Tipo: **Web application**.
   - **Authorized JavaScript origins:**
     - `https://motion-lab-preparacion-fisica-y-rendimiento.vercel.app`
     - `https://motion-lab-high-performance.vercel.app`
     - `http://localhost:3000`
   - **Authorized redirect URIs:**
     - `https://motion-lab-preparacion-fisica-y-rendimiento.vercel.app/api/auth/callback/google`
     - `https://motion-lab-high-performance.vercel.app/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google`
5. Copiá el **Client ID** y el **Client Secret**.
6. En Vercel, entrá al proyecto → **Settings → Environment Variables** y agregá:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   Aplicalas a **Production**, **Preview** y **Development**.
7. Para probar en tu computadora, agregalas también a `.env.local`:
   ```env
   GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="tu-client-secret"
   ```
8. Volvé a desplegar. Cuando las credenciales estén presentes, el botón de Google deja de mostrar el aviso de configuración y abre la pantalla real de Google.

> Si la app queda en modo **Testing**, sólo los correos agregados como test users pueden ingresar. Para abrir el acceso a cualquier alumno, publicá la pantalla de consentimiento (los permisos básicos de perfil y email no requieren revisión sensible).

> La URL pública nueva es `https://motion-lab-preparacion-fisica-y-rendimiento.vercel.app`. El dominio viejo se mantiene en la configuración de Google OAuth porque `NEXTAUTH_URL` todavía apunta ahí; así el login sigue funcionando mientras se termina la migración.

---

## ☁️ Cómo Desplegar en Vercel (Poner tu Web en Internet)

1. Sube este proyecto a tu cuenta de **GitHub**.
2. Ve a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
3. Haz clic en **"Add New Project"** y selecciona tu repositorio.
4. En la sección **Storage**, conectá una base **Prisma Postgres**. Vercel configura `DATABASE_URL` automáticamente.
5. Agregá también `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `TRAINER_EMAIL`, `TRAINER_PIN`, `NEXT_PUBLIC_WHATSAPP_PHONE` y, si usás Google, las credenciales OAuth.
6. Antes del primer uso, ejecutá una vez `npm run prisma:push` y `npm run db:seed` con la `DATABASE_URL` de producción.
7. Hacé clic en **Deploy**. ¡En menos de 2 minutos tu web estará activa con un enlace HTTPS público gratuito!
