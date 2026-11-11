/**
 * ========================================================================
 * CONFIGURACIÓN DE NEXTAUTH (app/api/auth/[...nextauth]/route.js)
 * ========================================================================
 * Maneja la autenticación social (Google OAuth), tradicional (Email / Password)
 * para alumnos y el acceso exclusivo del entrenador con PIN.
 * Usa sesiones JWT y persiste/actualiza el usuario de Google manualmente en
 * PostgreSQL desde el callback `jwt`, sin depender del adaptador estándar.
 *
 * ¿CÓMO FUNCIONA LA SESIÓN CON CREDENTIALS Y JWT?
 * Cuando se usa el proveedor de credenciales (email y contraseña), NextAuth requiere
 * usar la estrategia 'jwt' (JSON Web Token) para la sesión.
 * En los 'callbacks' adjuntamos el 'id', el 'rol' (ALUMNO/ENTRENADOR) y el
 * 'estadoPago' (PENDIENTE/ACTIVO) para poder proteger las vistas de la app.
 */

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import {
  GOOGLE_FIT_COOKIE,
  GOOGLE_FIT_COOKIE_MAX_AGE,
  GOOGLE_FIT_INTENT_COOKIE,
} from '@/lib/googleFitScopes';
import {
  codificarTokenGoogleFit,
  googleFitTestActivo,
} from '@/lib/googleFit';
import {
  emailEntrenadorActual,
  pinEntrenadorPersonalizado,
  verificarCredencialesEntrenador,
} from '@/lib/trainerPin';

const googleEstaConfigurado = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

function scopesComoLista(scope) {
  return String(scope || '')
    .split(/\s+/)
    .map((valor) => valor.trim())
    .filter(Boolean);
}

const googleProvider = googleEstaConfigurado
  ? GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    })
  : null;

/**
 * PROVEEDOR EXCLUSIVO DEL ENTRENADOR (EMAIL + PIN)
 * ------------------------------------------------
 * Existe una sola cuenta de entrenador y está atada a TRAINER_EMAIL. Para
 * entrar hay que escribir ese email y el PIN privado (TRAINER_PIN). Ambos se
 * validan en el servidor y nunca se guardan en el navegador como parte de la
 * sesión.
 *
 * La cuenta se crea sola en el primer ingreso (upsert), así que no hay un
 * formulario público de "registro como profesor": nadie más puede crearse
 * una cuenta ENTRENADOR.
 */
const trainerPinProvider = CredentialsProvider({
  id: 'trainer-pin',
  name: 'Acceso del Entrenador (Email + PIN)',
  credentials: {
    email: { label: 'Email del profesor', type: 'email' },
    pin: { label: 'PIN del profesor', type: 'password' },
  },
  async authorize(credentials) {
    const email = String(credentials?.email || '').trim().toLowerCase();
    const pin = String(credentials?.pin || '').trim();

    if (!email || !pin) {
      throw new Error('Ingresá el email y el PIN del profesor.');
    }

    if (!pinEntrenadorPersonalizado()) {
      console.warn(
        '⚠️ TRAINER_PIN no está configurado: se usa el PIN de demostración. Cambialo antes de publicar la web.'
      );
    }

    if (!verificarCredencialesEntrenador(email, pin)) {
      // Pequeña espera para dificultar los intentos automatizados por fuerza
      // bruta. El PIN recomendado tiene 6 o más dígitos.
      await new Promise((resolve) => setTimeout(resolve, 800));
      throw new Error('El email o el PIN del profesor son incorrectos.');
    }

    const emailEntrenador = emailEntrenadorActual();

    // Aseguramos que la cuenta ÚNICA del entrenador exista en la base de
    // datos. Si PostgreSQL está en modo demo/offline, el acceso igualmente
    // funciona porque la sesión se construye con los datos de abajo.
    let entrenadorDb = null;
    try {
      entrenadorDb = await prisma.usuario.upsert({
        where: { id: 'matias-coach-id' },
        update: {
          rol: 'ENTRENADOR',
          estadoPago: 'ACTIVO',
        },
        create: {
          id: 'matias-coach-id',
          nombre: 'Matías',
          apellido: 'Entrenador',
          email: emailEntrenador,
          rol: 'ENTRENADOR',
          estadoPago: 'ACTIVO',
          tipoPlan: 'PREMIUM',
        },
      });
    } catch {
      // Ignorar si PostgreSQL está en modo offline/demo.
    }

    const nombreEntrenador = entrenadorDb
      ? `${entrenadorDb.nombre} ${entrenadorDb.apellido || ''}`.trim()
      : '';

    return {
      id: entrenadorDb?.id || 'matias-coach-id',
      name: nombreEntrenador || 'Matías Entrenador',
      email: emailEntrenador,
      rol: 'ENTRENADOR',
      estadoPago: 'ACTIVO',
      tipoPlan: 'PREMIUM',
    };
  },
});

export const authOptions = {
  session: {
    // Usamos estrategia JWT para compatibilidad total con Credentials y Google.
    // La sesión queda activa 30 días, incluso si se cierra el navegador o se
    // navega hacia atrás. Sólo se cierra cuando el usuario elige "Cerrar sesión".
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  providers: [
    // 1. PROVEEDOR GOOGLE OAUTH (solo si las credenciales están configuradas)
    ...(googleProvider ? [googleProvider] : []),

    // 2. ACCESO EXCLUSIVO DEL ENTRENADOR CON PIN
    trainerPinProvider,

    // 3. PROVEEDOR TRADICIONAL (Email y Contraseña para alumnos)
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Email o Usuario', type: 'text', placeholder: 'tu@correo.com' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Por favor ingresa tu email y contraseña');
        }

        const inputUser = credentials.email.toLowerCase().trim();
        const inputPass = credentials.password.trim();

        // El entrenador tiene un acceso exclusivo con email + PIN. Bloqueamos
        // sus identificadores incluso si la base de datos está en modo demo.
        const identificadoresEntrenador = [
          'matiasmotionlab',
          'matias@motionlab.fit',
          'matias@motionlab.com',
          emailEntrenadorActual(),
        ];

        if (identificadoresEntrenador.includes(inputUser)) {
          throw new Error(
            'El acceso del entrenador es con email + PIN. Entrá desde "Comenzar" > "Soy Profesor".'
          );
        }

        // 2. Buscar al usuario en la base de datos por email
        let usuario = null;
        try {
          usuario = await prisma.usuario.findUnique({
            where: { email: inputUser },
          });
        } catch (dbErr) {
          console.warn('⚠️ No se pudo consultar Prisma en authorize:', dbErr.message);
        }

        if (usuario) {
          // El panel del entrenador es de acceso exclusivo por PIN. Aunque
          // alguien conozca su email, no puede entrar por este formulario.
          if (usuario.rol === 'ENTRENADOR') {
            throw new Error('El acceso del entrenador es con email + PIN.');
          }

          // Si tiene passwordHash encriptado con bcrypt
          if (usuario.passwordHash) {
            const passwordValida = await bcrypt.compare(inputPass, usuario.passwordHash);
            if (!passwordValida) {
              throw new Error('La contraseña ingresada es incorrecta');
            }
          } else {
            throw new Error('Este usuario todavía no tiene una contraseña configurada');
          }

          // Devolvemos el objeto usuario que pasará al token JWT
          return {
            id: usuario.id,
            name: `${usuario.nombre} ${usuario.apellido || ''}`.trim(),
            email: usuario.email,
            rol: usuario.rol,
            estadoPago: usuario.estadoPago,
            tipoPlan: usuario.tipoPlan,
          };
        }

        throw new Error('No existe ningún usuario registrado con ese email o las credenciales son incorrectas');
      },
    }),
  ],

  callbacks: {
    /**
     * Vinculación de Google Fit SOLO para la prueba local.
     *
     * El botón de la tarjeta pide los scopes de Fitness y deja una cookie
     * breve (`ml_gfit_intent`). Cuando Google vuelve, guardamos el token en
     * una cookie HttpOnly cifrada y devolvemos una URL para cortar el flujo
     * ANTES de que NextAuth cree/actualice la sesión.
     *
     * Así no se crea un usuario nuevo en PostgreSQL ni se cambia la sesión
     * del alumno que ya está usando MOTION LAB.
     *
     * Si el login es el normal (sin intención ni scopes de Fitness), sigue
     * por el camino de siempre.
     */
    async signIn({ user, account, profile }) {
      if (!googleFitTestActivo() || account?.provider !== 'google') {
        return true;
      }

      const cookieStore = cookies();
      const intencion =
        cookieStore.get(GOOGLE_FIT_INTENT_COOKIE)?.value === '1';
      const scopes = scopesComoLista(account?.scope);
      const tieneScopesFitness = scopes.some((scope) =>
        scope.includes('fitness.')
      );

      if (!intencion && !tieneScopesFitness) {
        return true;
      }

      cookieStore.delete(GOOGLE_FIT_INTENT_COOKIE);

      // Si había una intención vieja pero este login no pidió permisos de
      // Fitness, dejamos que NextAuth siga con el login normal. Así una
      // vinculación abandonada no bloquea el ingreso con Google.
      if (!tieneScopesFitness) {
        return true;
      }

      if (!account?.access_token) {
        return '/entrenamiento?googlefit=error';
      }

      try {
        const tokenData = {
          accessToken: account.access_token,
          refreshToken: account.refresh_token || null,
          expiresAt: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000,
          scope: scopes,
          email: user?.email || profile?.email || null,
          nombre: user?.name || profile?.name || null,
          conectadoEn: Date.now(),
        };

        const tokenCifrado = await codificarTokenGoogleFit(tokenData);

        cookieStore.set(GOOGLE_FIT_COOKIE, tokenCifrado, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: GOOGLE_FIT_COOKIE_MAX_AGE,
        });

        return '/entrenamiento?googlefit=conectado';
      } catch (error) {
        console.error(
          'No se pudo guardar el permiso de Google Fit:',
          error?.message || error
        );
        return '/entrenamiento?googlefit=error';
      }
    },

    // El callback 'jwt' se ejecuta cuando se crea o actualiza el token
    async jwt({ token, user, account, trigger, session }) {
      // Alta / ingreso con Google: creamos o recuperamos el usuario en nuestra
      // tabla `usuarios` y usamos siempre el id interno de PostgreSQL.
      if (user && account?.provider === 'google') {
        try {
          const email = user.email?.toLowerCase().trim();
          if (!email) {
            throw new Error('Google no devolvió un correo electrónico.');
          }

          let usuarioDb = await prisma.usuario.findUnique({
            where: { email },
          });

          // La cuenta del entrenador no se abre con Google: su único acceso
          // es email + PIN del panel. Bloqueamos el rol ENTRENADOR y también
          // el email configurado, aunque la cuenta todavía no exista en la
          // base (si no, alguien podría crearla como alumno).
          if (
            usuarioDb?.rol === 'ENTRENADOR' ||
            email === emailEntrenadorActual()
          ) {
            throw new Error('El acceso del entrenador es con email + PIN.');
          }

          if (!usuarioDb) {
            const nombreCompleto = (user.name || email.split('@')[0]).trim();
            const [nombre, ...apellidoPartes] = nombreCompleto.split(/\s+/);

            usuarioDb = await prisma.usuario.create({
              data: {
                nombre: nombre || 'Alumno',
                apellido: apellidoPartes.join(' '),
                email,
                image: user.image || null,
                emailVerified: new Date(),
                rol: 'ALUMNO',
                estadoPago: 'PENDIENTE',
                tipoPlan: 'BASE',
              },
            });
          }

          token.id = usuarioDb.id;
          token.rol = usuarioDb.rol || 'ALUMNO';
          token.estadoPago = usuarioDb.estadoPago || 'PENDIENTE';
          token.tipoPlan = usuarioDb.tipoPlan || 'BASE';
          token.name = `${usuarioDb.nombre} ${usuarioDb.apellido || ''}`.trim();
          token.email = usuarioDb.email;
          if (usuarioDb.image) token.picture = usuarioDb.image;

          return token;
        } catch (error) {
          console.error('No se pudo registrar/recuperar el usuario de Google:', error);
          if (error?.message === 'El acceso del entrenador es con email + PIN.') {
            throw error;
          }
          throw new Error(
            'No pudimos crear tu cuenta con Google. Intentá de nuevo.'
          );
        }
      }

      if (user) {
        token.id = user.id;
        token.rol = user.rol || 'ALUMNO';
        token.estadoPago = user.estadoPago || 'PENDIENTE';
        token.tipoPlan = user.tipoPlan || 'BASE';
      }

      // Si se solicita actualizar la sesión desde el frontend (ej: cuando el profe activa el pago)
      if (trigger === 'update' && session) {
        if (session.estadoPago) token.estadoPago = session.estadoPago;
        if (session.rol) token.rol = session.rol;
      }

      return token;
    },

    // El callback 'session' pasa los datos del token a la sesión accesible en el navegador
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.rol = token.rol;
        session.user.estadoPago = token.estadoPago;
        session.user.tipoPlan = token.tipoPlan;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET || 'motion_lab_super_secret_jwt_key_2026',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
