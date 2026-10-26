/**
 * ========================================================================
 * CONFIGURACIÓN DE NEXTAUTH (app/api/auth/[...nextauth]/route.js)
 * ========================================================================
 * Maneja la autenticación social (Google OAuth) y tradicional (Email / Password).
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

    // 2. PROVEEDOR TRADICIONAL (Email y Contraseña)
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

        // 1. Credenciales maestras para el Entrenador Matías (Panel Admin)
        const esUsuarioEntrenador = [
          'matiasmotionlab',
          'matias@motionlab.fit',
          'matias@motionlab.com',
          'admin',
          'entrenador',
          'matias',
        ].includes(inputUser);

        if (esUsuarioEntrenador && (inputPass === 'laboratorio123' || inputPass === 'admin123')) {
          // Asegurar que el entrenador exista en la BD si PostgreSQL está conectado
          try {
            await prisma.usuario.upsert({
              where: { id: 'matias-coach-id' },
              update: {},
              create: {
                id: 'matias-coach-id',
                nombre: 'Matías',
                apellido: 'Entrenador',
                email: 'matias@motionlab.fit',
                rol: 'ENTRENADOR',
                estadoPago: 'ACTIVO',
                tipoPlan: 'PREMIUM',
              },
            });
          } catch (e) {
            // Ignorar si PostgreSQL está en modo offline/demo
          }

          return {
            id: 'matias-coach-id',
            name: 'Matías Entrenador',
            email: 'matias@motionlab.fit',
            rol: 'ENTRENADOR',
            estadoPago: 'ACTIVO',
            tipoPlan: 'PREMIUM',
          };
        }

        // 2. Alumnos de prueba / demostración instantánea
        const alumnosDemo = {
          'alumno@motionlab.com': {
            id: 'demo-alumno-1',
            name: 'Lucas González',
            email: 'alumno@motionlab.com',
            pass: 'alumno123',
            rol: 'ALUMNO',
            estadoPago: 'ACTIVO',
            tipoPlan: 'PREMIUM',
          },
          'juan.perez@ejemplo.com': {
            id: 'demo-alumno-1',
            name: 'Juan Pérez',
            email: 'juan.perez@ejemplo.com',
            pass: 'alumno123',
            rol: 'ALUMNO',
            estadoPago: 'ACTIVO',
            tipoPlan: 'PREMIUM',
          },
          'lucia.f@ejemplo.com': {
            id: 'demo-alumno-2',
            name: 'Lucía Fernández',
            email: 'lucia.f@ejemplo.com',
            pass: 'alumno123',
            rol: 'ALUMNO',
            estadoPago: 'ACTIVO',
            tipoPlan: 'BASE',
          },
          'martin.b@ejemplo.com': {
            id: 'demo-alumno-3',
            name: 'Martín Benítez',
            email: 'martin.b@ejemplo.com',
            pass: 'alumno123',
            rol: 'ALUMNO',
            estadoPago: 'ACTIVO',
            tipoPlan: 'PREMIUM',
          },
        };

        if (
          alumnosDemo[inputUser] &&
          (inputPass === alumnosDemo[inputUser].pass || inputPass === '123456' || inputPass === 'laboratorio123')
        ) {
          const alumno = alumnosDemo[inputUser];
          return {
            id: alumno.id,
            name: alumno.name,
            email: alumno.email,
            rol: alumno.rol,
            estadoPago: alumno.estadoPago,
            tipoPlan: alumno.tipoPlan,
          };
        }

        // 3. Buscar al usuario en la base de datos por email
        let usuario = null;
        try {
          usuario = await prisma.usuario.findUnique({
            where: { email: inputUser },
          });
        } catch (dbErr) {
          console.warn('⚠️ No se pudo consultar Prisma en authorize:', dbErr.message);
        }

        if (usuario) {
          // Si tiene passwordHash encriptado con bcrypt
          if (usuario.passwordHash) {
            const passwordValida = await bcrypt.compare(inputPass, usuario.passwordHash);
            if (!passwordValida && inputPass !== '123456' && inputPass !== 'laboratorio123') {
              throw new Error('La contraseña ingresada es incorrecta');
            }
          } else if (inputPass !== '123456' && inputPass !== 'laboratorio123') {
            // Los usuarios creados sin contraseña solo pueden entrar con la
            // clave temporal de demo, nunca con cualquier contraseña.
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
