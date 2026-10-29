'use client';

/**
 * ========================================================================
 * SELECTOR DE ACCESO "COMENZAR" (components/start/StartRoleSelector.js)
 * ========================================================================
 * Permite elegir el tipo de acceso a MOTION LAB:
 *   1. Alumno: crear una cuenta nueva o iniciar sesión.
 *   2. Profesor: entrar al panel exclusivo de Matías con su cuenta única
 *      (email) y su PIN privado.
 *
 * El PIN se valida en el servidor (proveedor `trainer-pin` de NextAuth).
 * Nunca se guarda en el navegador ni se compara contra valores escritos en
 * el código del cliente.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function StartRoleSelector({ rolInicial = null }) {
  const { isSunlight } = useTheme();

  const [rol, setRol] = useState(rolInicial);
  const [emailProfesor, setEmailProfesor] = useState('');
  const [pin, setPin] = useState('');
  const [mostrarPin, setMostrarPin] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [sesion, setSesion] = useState(null);

  // Mostramos un aviso si ya hay una sesión abierta (por ejemplo, el profesor
  // volvió a esta pantalla desde el panel). No redirigimos automáticamente
  // para que pueda elegir el otro tipo de acceso si lo necesita.
  useEffect(() => {
    let activo = true;

    fetch('/api/auth/session', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (activo && data?.user) setSesion(data.user);
      })
      .catch(() => {
        // Si falla la consulta, simplemente no mostramos el aviso.
      });

    return () => {
      activo = false;
    };
  }, []);

  const elegirRol = (nuevoRol) => {
    setRol(nuevoRol);
    setError('');
    setEmailProfesor('');
    setPin('');
    setMostrarPin(false);
  };

  const ingresarComoProfesor = async (evento) => {
    evento.preventDefault();
    setError('');

    const emailLimpio = emailProfesor.trim().toLowerCase();
    const pinLimpio = pin.trim();

    if (!emailLimpio) {
      setError('Ingresá el email de la cuenta del profesor.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) {
      setError('El email del profesor no tiene un formato válido.');
      return;
    }

    if (!pinLimpio) {
      setError('Ingresá el PIN de acceso del profesor.');
      return;
    }

    setCargando(true);

    try {
      const respuesta = await signIn('trainer-pin', {
        redirect: false,
        email: emailLimpio,
        pin: pinLimpio,
      });

      if (respuesta?.error) {
        setError('El email o el PIN no son correctos. Verificalos e intentá nuevamente.');
        setPin('');
        setCargando(false);
        return;
      }

      // Confirmamos que la sesión realmente quedó creada con rol ENTRENADOR.
      const sesionRes = await fetch('/api/auth/session', { cache: 'no-store' });
      const sesionData = await sesionRes.json();

      if (!sesionRes.ok || sesionData?.user?.rol !== 'ENTRENADOR') {
        setError('No pudimos validar el acceso del profesor. Intentá de nuevo.');
        setCargando(false);
        return;
      }

      window.location.replace('/admin');
    } catch {
      setError('Ocurrió un error al validar el PIN. Intentá de nuevo.');
      setCargando(false);
    }
  };

  const tarjetaBase =
    'group relative overflow-hidden rounded-3xl border-2 p-5 sm:p-6 text-left transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/40';

  const tarjetaInactiva = isSunlight
    ? 'bg-white border-slate-300 hover:border-slate-400 hover:shadow-xl hover:shadow-slate-200/80'
    : 'bg-[#0a0f1d] border-slate-800 hover:border-slate-600 hover:shadow-xl hover:shadow-black/40';

  const tarjetaAlumnoActiva = isSunlight
    ? 'bg-blue-50 border-blue-600 shadow-xl shadow-blue-200/70 ring-2 ring-blue-500/20'
    : 'bg-blue-500/10 border-sky-400 shadow-xl shadow-sky-500/10 ring-2 ring-sky-400/20';

  const tarjetaProfesorActiva = isSunlight
    ? 'bg-amber-50 border-amber-500 shadow-xl shadow-amber-200/70 ring-2 ring-amber-500/20'
    : 'bg-amber-500/10 border-amber-400 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400/20';

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* ENCABEZADO */}
      <div className="text-center mb-8 sm:mb-10">
        <span
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] border ${
            isSunlight
              ? 'bg-blue-100 text-blue-900 border-blue-300'
              : 'bg-slate-900 text-sky-300 border-sky-500/30'
          }`}
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${isSunlight ? 'text-blue-700' : 'text-cyan-400'}`} />
          Acceso MOTION LAB
        </span>

        <h1
          className={`mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight ${
            isSunlight ? 'text-slate-950' : 'text-white'
          }`}
        >
          ¿Cómo querés comenzar?
        </h1>
        <p
          className={`mt-3 text-sm sm:text-base font-medium max-w-xl mx-auto leading-relaxed ${
            isSunlight ? 'text-slate-700' : 'text-slate-300'
          }`}
        >
          Elegí tu perfil para entrar a la plataforma. Los alumnos crean su cuenta
          y el profesor accede con su cuenta única y su PIN privado.
        </p>
      </div>

      {/* AVISO DE SESIÓN ACTIVA */}
      {sesion && (
        <div
          className={`mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${
            isSunlight
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }`}
        >
          <p className="text-xs sm:text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {sesion.rol === 'ENTRENADOR'
                ? 'Ya tenés una sesión de entrenador abierta.'
                : `Sesión activa como ${sesion.name || sesion.email}.`}
            </span>
          </p>
          <Link
            href={sesion.rol === 'ENTRENADOR' ? '/admin' : '/entrenamiento'}
            className={`inline-flex items-center justify-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-full border transition-colors ${
              isSunlight
                ? 'bg-white border-emerald-400 hover:bg-emerald-100'
                : 'bg-emerald-500/15 border-emerald-400/40 hover:bg-emerald-500/25'
            }`}
          >
            {sesion.rol === 'ENTRENADOR' ? 'Ir al panel' : 'Ir a mi entrenamiento'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* TARJETAS DE ROL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* ALUMNO */}
        <button
          type="button"
          onClick={() => elegirRol('alumno')}
          aria-pressed={rol === 'alumno'}
          className={`${tarjetaBase} ${
            rol === 'alumno' ? tarjetaAlumnoActiva : tarjetaInactiva
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                isSunlight
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-blue-500/15 text-sky-400 border-blue-500/30'
              }`}
            >
              <Dumbbell className="w-7 h-7" />
            </div>
            <span
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                rol === 'alumno'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : isSunlight
                    ? 'border-slate-300 text-transparent'
                    : 'border-slate-700 text-transparent'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          <span
            className={`block mt-5 text-xl sm:text-2xl font-black ${
              isSunlight ? 'text-slate-950' : 'text-white'
            }`}
          >
            Soy Alumno
          </span>
          <span
            className={`block mt-1.5 text-sm leading-relaxed ${
              isSunlight ? 'text-slate-700' : 'text-slate-300'
            }`}
          >
            Quiero crear mi cuenta, completar mi perfil y entrenar con el plan
            que Matías prepara para mí.
          </span>
          <span
            className={`mt-4 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${
              isSunlight ? 'text-blue-700' : 'text-sky-300'
            }`}
          >
            Registro y rutinas
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>

        {/* PROFESOR */}
        <button
          type="button"
          onClick={() => elegirRol('profesor')}
          aria-pressed={rol === 'profesor'}
          className={`${tarjetaBase} ${
            rol === 'profesor' ? tarjetaProfesorActiva : tarjetaInactiva
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                isSunlight
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
            >
              <ShieldCheck className="w-7 h-7" />
            </div>
            <span
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                rol === 'profesor'
                  ? 'bg-amber-500 border-amber-500 text-slate-950'
                  : isSunlight
                    ? 'border-slate-300 text-transparent'
                    : 'border-slate-700 text-transparent'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          <span
            className={`block mt-5 text-xl sm:text-2xl font-black ${
              isSunlight ? 'text-slate-950' : 'text-white'
            }`}
          >
            Soy Profesor
          </span>
          <span
            className={`block mt-1.5 text-sm leading-relaxed ${
              isSunlight ? 'text-slate-700' : 'text-slate-300'
            }`}
          >
            Panel exclusivo de Matías para gestionar alumnos, pagos y rutinas
            de entrenamiento.
          </span>
          <span
            className={`mt-4 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${
              isSunlight ? 'text-amber-700' : 'text-amber-300'
            }`}
          >
            Cuenta única + PIN privado
            <LockKeyhole className="w-3.5 h-3.5" />
          </span>
        </button>
      </div>

      {/* PANEL DEL ALUMNO */}
      {rol === 'alumno' && (
        <div
          className={`mt-5 rounded-3xl border p-5 sm:p-7 animate-fadeIn ${
            isSunlight
              ? 'bg-white border-slate-300 shadow-xl shadow-slate-200/70'
              : 'bg-[#0a0f1d] border-slate-800 shadow-2xl shadow-black/30'
          }`}
        >
          <div className="flex items-start gap-3 mb-5">
            <div
              className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center border ${
                isSunlight
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-blue-500/15 text-sky-400 border-blue-500/30'
              }`}
            >
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-lg font-black ${isSunlight ? 'text-slate-950' : 'text-white'}`}>
                Empezá tu camino en MOTION LAB
              </h3>
              <p className={`text-sm mt-0.5 ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
                Si es tu primera vez, creá tu cuenta y completá el cuestionario
                inicial. Si ya entrenás con Matías, ingresá con tu email.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 hover:from-blue-600 hover:to-sky-400 text-white font-black text-sm shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98] touch-target"
            >
              <UserPlus className="w-4 h-4" />
              Crear mi cuenta
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className={`inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl border font-black text-sm transition-colors active:scale-[0.98] touch-target ${
                isSunlight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 hover:bg-slate-100'
                  : 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      )}

      {/* PANEL DEL PROFESOR */}
      {rol === 'profesor' && (
        <div
          className={`mt-5 rounded-3xl border p-5 sm:p-7 animate-fadeIn ${
            isSunlight
              ? 'bg-white border-amber-300 shadow-xl shadow-amber-200/60'
              : 'bg-[#0a0f1d] border-amber-500/30 shadow-2xl shadow-black/30'
          }`}
        >
          <div className="flex items-start gap-3 mb-5">
            <div
              className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center border ${
                isSunlight
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
            >
              <LockKeyhole className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-lg font-black ${isSunlight ? 'text-slate-950' : 'text-white'}`}>
                Acceso exclusivo del entrenador
              </h3>
              <p className={`text-sm mt-0.5 ${isSunlight ? 'text-slate-700' : 'text-slate-300'}`}>
                Existe una sola cuenta de profesor. Ingresá su email y el PIN
                privado de Matías para abrir el panel.
              </p>
            </div>
          </div>

          <form onSubmit={ingresarComoProfesor} className="space-y-4">
            <div>
              <label
                htmlFor="email-profesor"
                className={`block text-xs font-black uppercase tracking-wider mb-2 ${
                  isSunlight ? 'text-slate-800' : 'text-slate-300'
                }`}
              >
                Email del profesor
              </label>
              <div className="relative">
                <Mail
                  className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isSunlight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                />
                <input
                  id="email-profesor"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  spellCheck={false}
                  maxLength={160}
                  value={emailProfesor}
                  onChange={(evento) => {
                    setEmailProfesor(evento.target.value);
                    setError('');
                  }}
                  placeholder="profesor@motionlab.fit"
                  className={`w-full rounded-2xl border-2 py-4 pl-12 pr-4 text-sm font-bold transition-colors focus:outline-none touch-target ${
                    isSunlight
                      ? 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-400 focus:border-amber-500'
                      : 'bg-[#05070c] border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400'
                  }`}
                />
              </div>
              <p className={`text-[11px] mt-2 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                Es el email de la única cuenta habilitada como profesor.
              </p>
            </div>

            <div>
              <label
                htmlFor="pin-profesor"
                className={`block text-xs font-black uppercase tracking-wider mb-2 ${
                  isSunlight ? 'text-slate-800' : 'text-slate-300'
                }`}
              >
                PIN de acceso
              </label>
              <div className="relative">
                <KeyRound
                  className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isSunlight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                />
                <input
                  id="pin-profesor"
                  type={mostrarPin ? 'text' : 'password'}
                  inputMode="numeric"
                  autoComplete="current-password"
                  maxLength={32}
                  value={pin}
                  onChange={(evento) => {
                    setPin(evento.target.value.replace(/\D/g, '').slice(0, 32));
                    setError('');
                  }}
                  placeholder="••••••"
                  className={`w-full rounded-2xl border-2 py-4 pl-12 pr-14 text-center text-2xl font-black tracking-[0.35em] transition-colors focus:outline-none touch-target ${
                    isSunlight
                      ? 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-300 focus:border-amber-500'
                      : 'bg-[#05070c] border-slate-700 text-white placeholder:text-slate-600 focus:border-amber-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPin((valor) => !valor)}
                  aria-label={mostrarPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors ${
                    isSunlight
                      ? 'text-slate-600 hover:bg-slate-100'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {mostrarPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className={`text-[11px] mt-2 ${isSunlight ? 'text-slate-600' : 'text-slate-400'}`}>
                PIN numérico privado. No lo compartas con los alumnos.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-600"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <button
                type="submit"
                disabled={cargando}
                className="inline-flex flex-1 items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed touch-target"
              >
                {cargando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verificando PIN...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Entrar al panel
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => elegirRol(null)}
                className={`inline-flex items-center justify-center gap-1.5 py-3.5 px-4 rounded-2xl border text-xs font-bold transition-colors touch-target ${
                  isSunlight
                    ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PIE DE SEGURIDAD */}
      <p
        className={`mt-6 text-center text-[11px] sm:text-xs font-medium flex items-center justify-center gap-1.5 ${
          isSunlight ? 'text-slate-600' : 'text-slate-500'
        }`}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Sólo la cuenta única de Matías, protegida con su PIN privado, puede abrir el panel.
      </p>
    </div>
  );
}
