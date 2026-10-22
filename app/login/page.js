'use client';

import { useEffect, useState } from 'react';
import { signIn, getProviders } from 'next-auth/react';
import { ArrowRight, LogIn, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useTheme } from '@/components/ThemeProvider';

function destinoSegunSesion(session) {
  return session?.user?.rol === 'ENTRENADOR' ? '/admin' : '/entrenamiento';
}

export default function LoginPage() {
  const { isSunlight } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleCargando, setGoogleCargando] = useState(false);
  const [googleDisponible, setGoogleDisponible] = useState(null);

  // Detectamos si Google OAuth está configurado en el servidor.
  useEffect(() => {
    let activo = true;

    getProviders()
      .then((providers) => {
        if (activo) setGoogleDisponible(Boolean(providers?.google));
      })
      .catch(() => {
        if (activo) setGoogleDisponible(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  // Si ya hay una sesión activa, no mostramos el formulario: llevamos al panel
  // que corresponde. También se revisa al volver con el botón "atrás" para que
  // la sesión no parezca cerrada.
  useEffect(() => {
    let activo = true;
    const params = new URLSearchParams(window.location.search);
    const vieneDeGoogle = params.get('google') === '1';

    if (params.get('error')) {
      setError('No pudimos completar el ingreso con Google. Intentá de nuevo.');
    }

    if (vieneDeGoogle) setGoogleCargando(true);

    const revisarSesion = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        const session = await res.json();

        if (!activo) return;

        if (session?.user) {
          window.location.replace(destinoSegunSesion(session));
          return;
        }

        if (vieneDeGoogle) {
          setError('No pudimos validar tu sesión de Google.');
          setGoogleCargando(false);
        }
      } catch {
        if (activo && vieneDeGoogle) {
          setError('No pudimos validar tu sesión de Google.');
          setGoogleCargando(false);
        }
      }
    };

    revisarSesion();

    // Al volver desde el historial, el navegador puede restaurar la página
    // desde caché sin ejecutar el montaje de React. Revisamos la sesión otra vez.
    const alMostrar = (evento) => {
      if (evento.persisted) revisarSesion();
    };

    window.addEventListener('pageshow', alMostrar);

    return () => {
      activo = false;
      window.removeEventListener('pageshow', alMostrar);
    };
  }, []);

  const iniciarConGoogle = async () => {
    setError('');

    if (googleDisponible !== true) {
      setError(
        googleDisponible === false
          ? 'El acceso con Google estará disponible próximamente. Mientras tanto, ingresá con tu email.'
          : 'Estamos verificando el acceso con Google. Intentá de nuevo en un segundo.'
      );
      return;
    }

    setGoogleCargando(true);

    try {
      await signIn('google', {
        callbackUrl: '/login?google=1',
      });
    } catch (err) {
      console.error('Error al iniciar con Google:', err);
      setGoogleCargando(false);
      setError('No pudimos abrir Google. Revisá la configuración e intentá de nuevo.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
        const sessionData = await sessionRes.json();

        if (!sessionRes.ok || !sessionData?.user) {
          throw new Error('No pudimos validar tu sesión. Intentá de nuevo.');
        }

        // replace() evita que la página de login quede en el historial y que
        // el botón "atrás" muestre un formulario como si la sesión se hubiera cerrado.
        window.location.replace(destinoSegunSesion(sessionData));
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al iniciar sesión.');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden transition-colors ${
      isSunlight ? 'bg-slate-50 text-slate-900' : 'bg-[#05070c] text-white'
    }`}>
      <Navbar />

      <main className="flex-grow flex items-center justify-center p-4 pt-28 pb-8 relative z-10">
        <div className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl relative transition-all ${
          isSunlight
            ? 'bg-white border-2 border-slate-300 shadow-slate-200'
            : 'bg-[#0a0f1d] border-slate-800'
        }`}>
          <div className="text-center mb-8">
            <div className={`mx-auto w-16 h-16 flex items-center justify-center rounded-full mb-4 border ${
              isSunlight
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-blue-500/10 text-sky-400 border-blue-500/20'
            }`}>
              <LogIn className="w-8 h-8" />
            </div>
            <h1 className={`text-3xl font-black tracking-tight ${isSunlight ? 'text-[#020617]' : 'text-white'}`}>
              Iniciar Sesión
            </h1>
            <p className={`mt-2 text-sm font-semibold ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
              Accede a tu cuenta de Motion Lab
            </p>

            {/* INGRESO CON GOOGLE */}
            <div className="mt-5">
              <button
                type="button"
                onClick={iniciarConGoogle}
                disabled={googleCargando || loading || googleDisponible === false}
                className={`w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 shadow-md transition-all hover:scale-[1.01] border disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  isSunlight ? 'border-slate-300' : 'border-slate-200'
                }`}
              >
                {googleCargando ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>
                  {googleCargando
                    ? 'Conectando con Google...'
                    : googleDisponible === false
                      ? 'Google (próximamente)'
                      : 'Continuar con Google'}
                </span>
              </button>

              {googleDisponible === false && (
                <p className={`text-[11px] mt-2 leading-relaxed ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                  El acceso con Google estará disponible próximamente. Mientras tanto, ingresá con tu email.
                </p>
              )}
            </div>

            <div className={`flex items-center gap-3 mt-5 ${isSunlight ? 'text-slate-500' : 'text-slate-500'}`}>
              <div className={`flex-grow h-px ${isSunlight ? 'bg-slate-300' : 'bg-slate-700'}`} />
              <span className="text-[10px] uppercase tracking-wider font-bold">
                o ingresá con tu cuenta
              </span>
              <div className={`flex-grow h-px ${isSunlight ? 'bg-slate-300' : 'bg-slate-700'}`} />
            </div>

            {/* ACCESOS RÁPIDOS DE PRUEBA */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={() => {
                  setEmail('matiasMotionLab');
                  setPassword('laboratorio123');
                }}
                className={`text-[11px] font-bold py-1.5 px-3 rounded-full border transition-all ${
                  isSunlight
                    ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                    : 'bg-blue-500/10 text-sky-300 border-blue-500/30 hover:bg-blue-500/20'
                }`}
              >
                ⚡ Entrenador Matías
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('alumno@motionlab.com');
                  setPassword('alumno123');
                }}
                className={`text-[11px] font-bold py-1.5 px-3 rounded-full border transition-all ${
                  isSunlight
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
              >
                ⚡ Alumno Demo
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${
                isSunlight ? 'text-slate-800' : 'text-slate-300'
              }`}>
                Email o Usuario
              </label>
              <input
                type="text"
                required
                className={`w-full rounded-2xl px-4 py-3.5 text-sm font-semibold transition-colors border touch-target ${
                  isSunlight
                    ? 'bg-white border-2 border-slate-300 text-slate-900 focus:border-blue-600 focus:outline-none'
                    : 'bg-[#05070c] border border-slate-700 text-white focus:outline-none focus:border-sky-500'
                }`}
                placeholder="tu@correo.com o usuario"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${
                isSunlight ? 'text-slate-800' : 'text-slate-300'
              }`}>
                Contraseña
              </label>
              <input
                type="password"
                required
                className={`w-full rounded-2xl px-4 py-3.5 text-sm font-semibold transition-colors border touch-target ${
                  isSunlight
                    ? 'bg-white border-2 border-slate-300 text-slate-900 focus:border-blue-600 focus:outline-none'
                    : 'bg-[#05070c] border border-slate-700 text-white focus:outline-none focus:border-sky-500'
                }`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border-2 border-red-500/40 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 hover:from-blue-600 hover:to-sky-400 text-white font-black uppercase tracking-wider text-sm transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50 touch-target active:scale-[0.98]"
            >
              {loading ? 'Ingresando...' : 'Entrar a mi Cuenta'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className={`mt-6 pt-6 border-t text-center ${isSunlight ? 'border-slate-200' : 'border-slate-800'}`}>
            <p className={`text-sm font-semibold ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
              ¿No tienes una cuenta?{' '}
              <Link href="/onboarding" className="text-blue-600 hover:text-blue-800 font-black transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
