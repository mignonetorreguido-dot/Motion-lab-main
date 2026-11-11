/**
 * ========================================================================
 * CONTENIDO HTML: MANUAL DEL USUARIO / ALUMNO (MOTION LAB)
 * ========================================================================
 */

import { LOGO_SVG, LOGO_SVG_LIGHT } from './build-manuals.mjs';

export function getStudentManualHTML() {
  return `
    <!-- PORTADA DEL MANUAL DEL ALUMNO -->
    <div class="cover">
      <div class="cover-glow"></div>
      
      <div class="cover-logo">
        ${LOGO_SVG}
      </div>

      <div>
        <span class="badge-pill">Guía del Deportista</span>
        <h1 class="cover-title">Manual de Uso de la Aplicación para el Alumno</h1>
        <p class="cover-subtitle">
          Guía paso a paso para completar tu evaluación inicial, ingresar a tu panel de entrenamiento semanal, registrar tus cargas en los 3 bloques, evaluar tu fatiga y vincular tu reloj inteligente.
        </p>
      </div>

      <div class="cover-meta">
        <div><strong>Plataforma:</strong> Motion Lab App v1.0</div>
        <div><strong>Destinatario:</strong> Alumnos &amp; Deportistas</div>
        <div><strong>Coach Responsable:</strong> Matías</div>
        <div><strong>Fecha:</strong> Noviembre 2026</div>
      </div>
    </div>

    <!-- PÁGINA 2: INTRODUCCIÓN Y ONBOARDING -->
    <div class="page-break"></div>
    
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      ${LOGO_SVG_LIGHT}
      <span style="font-size: 7.5pt; color: #64748b; font-weight: 700;">MANUAL DEL ALUMNO • PARTE 1</span>
    </div>

    <h1 class="sec-title">
      <span>1. Bienvenidos a Motion Lab y Onboarding Inicial</span>
      <span class="badge badge-green">Paso a Paso</span>
    </h1>

    <p>
      <strong>Motion Lab</strong> es una plataforma diseñada para acompañarte en tu evolución física, combinando la planificación personalizada de tu entrenador <strong>Matías</strong> con herramientas interactivas para medir tu progreso, cargas reales y nivel de recuperación sesión tras sesión.
    </p>

    <h2 class="sub-title">1.1. Evaluación Inicial en 6 Pasos (/onboarding)</h2>
    <p>
      Antes de recibir tu primer plan, completarás un cuestionario interactivo que diagnostica tu punto de partida:
    </p>

    <div class="step-row">
      <div class="step-num">0</div>
      <div class="step-text"><strong>Plan y Objetivo:</strong> Seleccionás entre <em>Plan Base</em> o <em>Plan Performance</em>, y definís tu meta principal (Rendimiento deportivo, Estética corporal o Salud y longevidad).</div>
    </div>
    <div class="step-row">
      <div class="step-num">1</div>
      <div class="step-text"><strong>Deporte y Club:</strong> Indicás qué disciplina practicás (Fútbol, Running, Crossfit, etc.) y si competís en un club federado.</div>
    </div>
    <div class="step-row">
      <div class="step-num">2</div>
      <div class="step-text"><strong>Nivel de Experiencia:</strong> Principiante (menos de 6 meses), Intermedio (1 a 3 años) o Avanzado (más de 3 años entrenando con sobrecarga).</div>
    </div>
    <div class="step-row">
      <div class="step-num">3</div>
      <div class="step-text"><strong>Focos y Disponibilidad:</strong> Elegís tus prioridades (Fuerza, Velocidad, Hipertrofia, Resistencia, Movilidad) y los días semanales que podés dedicar.</div>
    </div>
    <div class="step-row">
      <div class="step-num">4</div>
      <div class="step-text"><strong>Ficha Condicional Avanzada:</strong> Declarás lesiones o cirugías previas, molestias actuales, puntos débiles que deseás mejorar y tus marcas o RMs estimadas si las conocés.</div>
    </div>
    <div class="step-row">
      <div class="step-num">5</div>
      <div class="step-text"><strong>Creación de Cuenta y WhatsApp:</strong> Ingresás tus datos (Nombre, Email, Clave, WhatsApp, Peso, Altura) o te autenticás con Google. Al finalizar, la app te conecta automáticamente por WhatsApp con Matías para darte la bienvenida.</div>
    </div>

    <!-- MOCKUP PANTALLA ONBOARDING -->
    <h2 class="sub-title">Pantalla de Ejemplo 1: Cuestionario de Evaluación Inicial (Wizard)</h2>
    <div class="mockup-box">
      <div class="mockup-topbar">
        <div class="mockup-dots"><span class="mockup-dot dot-r"></span><span class="mockup-dot dot-y"></span><span class="mockup-dot dot-g"></span></div>
        <span>motion-lab.app/onboarding — Paso 4 de 5: Ficha Fisiológica</span>
        <span class="m-tag m-tag-blue">80% Completado</span>
      </div>
      <div class="mockup-inner" style="padding: 14px;">
        <div style="font-size: 11pt; font-weight: 900; color: #fff; margin-bottom: 2px;">Cuentale a Matías tu estado actual</div>
        <div style="font-size: 7pt; color: #94a3b8; margin-bottom: 10px;">Esta información nos permite cuidar tus articulaciones y dosificar las cargas.</div>

        <div class="m-grid-2" style="margin-bottom: 8px;">
          <div>
            <div style="font-size: 6.5pt; color: #94a3b8; font-weight: 700; margin-bottom: 2px;">¿Tenés alguna lesión o molestia previa?</div>
            <div style="background: #030712; border: 1px solid #334155; border-radius: 5px; padding: 6px; font-size: 7.5pt; color: #fff;">
              Molestia leve en isquiotibial izquierdo al correr a máxima velocidad.
            </div>
          </div>
          <div>
            <div style="font-size: 6.5pt; color: #94a3b8; font-weight: 700; margin-bottom: 2px;">RMs conocidas (Opcional)</div>
            <div style="background: #030712; border: 1px solid #334155; border-radius: 5px; padding: 6px; font-size: 7.5pt; color: #fff;">
              Sentadilla: 120 kg | Banco: 85 kg
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; border-top: 1px solid #1e293b; padding-top: 8px;">
          <span class="m-btn m-btn-slate" style="font-size: 7pt;">← Volver al paso anterior</span>
          <span class="m-btn m-btn-sky" style="font-size: 7pt;">Continuar al registro final →</span>
        </div>
      </div>
    </div>

    <!-- PÁGINA 3: LOGIN Y HUB SEMANAL -->
    <div class="page-break"></div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      ${LOGO_SVG_LIGHT}
      <span style="font-size: 7.5pt; color: #64748b; font-weight: 700;">MANUAL DEL ALUMNO • PARTE 2</span>
    </div>

    <h1 class="sec-title">
      <span>2. Acceso y Hub Semanal del Alumno (/entrenamiento)</span>
      <span class="badge badge-green">Mi Panel</span>
    </h1>

    <h2 class="sub-title">2.1. Inicio de Sesión y Activación</h2>
    <p>
      Para ingresar a tu cuenta, entrá en <code>/login</code> o desde <code>/comenzar?rol=alumno</code> con tu correo y contraseña o con tu cuenta de Google.
    </p>

    <div class="callout callout-warn">
      <strong>¿Qué pasa si mi pago está pendiente?</strong> Si acabás de registrarte y tu suscripción aún no fue validada, la plataforma te mostrará una pantalla de cortesía recordándote coordinar la activación con Matías. En cuanto Matías active tu ficha desde su panel, tu rutina aparecerá al instante.
    </div>

    <h2 class="sub-title">2.2. El Hub Semanal de Entrenamiento</h2>
    <p>
      Tu pantalla de bienvenida en <code>/entrenamiento</code> reúne todo lo que necesitás para tu semana:
    </p>

    <table class="doc-table">
      <thead>
        <tr>
          <th style="width: 25%;">Sección del Hub</th>
          <th style="width: 45%;">Qué te muestra</th>
          <th style="width: 30%;">Acción recomendada</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Entrenamiento de Hoy</strong></td>
          <td>Tarjeta destacada que identifica automáticamente la próxima sesión pendiente recomendada por Matías.</td>
          <td>Presionar <em>"Comenzar Entrenamiento"</em> para iniciar la sesión del día.</td>
        </tr>
        <tr>
          <td><strong>Selector de Días</strong></td>
          <td>Listado de todas las sesiones de tu semana (Día 1, Día 2, etc.) con sus ejercicios programados.</td>
          <td>Podés elegir entrenar cualquier día según tu disponibilidad.</td>
        </tr>
        <tr>
          <td><strong>Días Completados</strong></td>
          <td>Los días finalizados quedan marcados con tilde verde y botón de <em>"Editar Día X"</em>.</td>
          <td>Permite corregir pesos o repeticiones si te olvidaste de anotar algo.</td>
        </tr>
        <tr>
          <td><strong>Vincular Reloj / Apple Health</strong></td>
          <td>Tarjeta para conectar tu smartwatch (Garmin, Google Fit) o importar el export.zip de Apple Salud.</td>
          <td>Matías ve actividad, sueño y pulso de los últimos 30 días.</td>
        </tr>
        <tr>
          <td><strong>Modo Soleado (Luz)</strong></td>
          <td>Toggle en cabecera para cambiar el tema a fondo blanco y letras negras.</td>
          <td><strong>Activalo si entrenás al aire libre bajo el sol</strong> para ver la pantalla sin reflejos.</td>
        </tr>
      </tbody>
    </table>

    <!-- MOCKUP HUB SEMANAL -->
    <h2 class="sub-title">Pantalla de Ejemplo 2: Hub Semanal del Alumno (/entrenamiento)</h2>
    <div class="mockup-box">
      <div class="mockup-topbar">
        <div class="mockup-dots"><span class="mockup-dot dot-r"></span><span class="mockup-dot dot-y"></span><span class="mockup-dot dot-g"></span></div>
        <span>motion-lab.app/entrenamiento — Hub del Alumno</span>
        <div style="display: flex; gap: 4px;">
          <span class="m-tag m-tag-green">Plan Performance</span>
          <span class="m-tag m-tag-blue">☀️ Modo Soleado</span>
        </div>
      </div>
      <div class="mockup-inner">
        <!-- Saludo y progreso -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <div style="font-size: 11pt; font-weight: 900; color: #fff;">¡Hola, Guido! 👋</div>
            <div style="font-size: 6.5pt; color: #94a3b8;">Tenés 1 sesión completada de 3 planificadas esta semana.</div>
          </div>
          <div style="text-align: right;">
            <span class="m-tag m-tag-green" style="font-size: 7.5pt; padding: 4px 8px;">🏆 33% Progreso Semanal</span>
          </div>
        </div>

        <!-- Tarjeta del entrenamiento de hoy -->
        <div class="m-card" style="background: linear-gradient(135deg, #0f1f38 0%, #07152b 100%); border: 1.5px solid #0284c7; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span class="m-tag m-tag-blue">Sugerido para hoy</span>
              <div style="font-size: 10pt; font-weight: 900; color: #fff; margin-top: 3px;">Día 2: Potencia y Tren Superior</div>
              <div style="font-size: 6.5pt; color: #cbd5e1; margin-top: 1px;">3 Bloques: Movilidad + Activación + Press Banca y Dominadas</div>
            </div>
            <span class="m-btn m-btn-sky" style="font-size: 7.5pt; padding: 5px 12px;">Comenzar Entrenamiento →</span>
          </div>
        </div>

        <!-- Lista de días de la semana -->
        <div class="m-grid-3">
          <div style="background: #091322; border: 1px solid #10b981; border-radius: 6px; padding: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 800; color: #34d399; font-size: 7pt;">✓ Día 1: Sentadilla y Piernas</span>
              <span class="m-tag m-tag-green" style="font-size: 5.5pt;">Completado</span>
            </div>
            <div style="font-size: 6pt; color: #94a3b8; margin-top: 2px;">Realizado hace 2 días • RPE 8.5</div>
            <span class="m-btn m-btn-slate" style="font-size: 6pt; margin-top: 4px; padding: 2px 6px;">✏️ Editar registro</span>
          </div>

          <div style="background: #0f172a; border: 1px solid #0284c7; border-radius: 6px; padding: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 800; color: #fff; font-size: 7pt;">Día 2: Tren Superior</span>
              <span class="m-tag m-tag-blue" style="font-size: 5.5pt;">Pendiente</span>
            </div>
            <div style="font-size: 6pt; color: #94a3b8; margin-top: 2px;">4 ejercicios programados</div>
            <span class="m-btn m-btn-sky" style="font-size: 6pt; margin-top: 4px; padding: 2px 6px;">Entrenar hoy</span>
          </div>

          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; padding: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 800; color: #94a3b8; font-size: 7pt;">Día 3: Zona Media y Pliometría</span>
              <span class="m-tag m-tag-slate" style="font-size: 5.5pt;">Pendiente</span>
            </div>
            <div style="font-size: 6pt; color: #64748b; margin-top: 2px;">Próxima sesión</div>
            <span class="m-btn m-btn-slate" style="font-size: 6pt; margin-top: 4px; padding: 2px 6px;">Ver rutina</span>
          </div>
        </div>
      </div>
    </div>

    <!-- PÁGINA 4: CHECK-IN PRE Y LOS 3 BLOQUES -->
    <div class="page-break"></div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      ${LOGO_SVG_LIGHT}
      <span style="font-size: 7.5pt; color: #64748b; font-weight: 700;">MANUAL DEL ALUMNO • PARTE 3</span>
    </div>

    <h1 class="sec-title">
      <span>3. La Sesión de Entrenamiento en Acción</span>
      <span class="badge badge-green">Paso a Paso</span>
    </h1>

    <h2 class="sub-title">3.1. El Check-in Pre-Entrenamiento (3 Clics Rápidos)</h2>
    <p>
      Antes de iniciar cualquier ejercicio, la app abre automáticamente una ventana modal para registrar tu estado de entrada. Esto le permite a Matías saber si llegás fresco o fatigado:
    </p>

    <div class="m-grid-3" style="margin-bottom: 8px;">
      <div class="m-card">
        <div class="m-metric-title">1. Nivel de Energía</div>
        <div style="font-size: 7.5pt; color: #fff; margin-top: 3px;">🪫 1 (Agotado) hasta 🔥 5 (A tope)</div>
        <div style="font-size: 6pt; color: #94a3b8; margin-top: 2px;">Elegí el emoji según cómo te sentís corporalmente.</div>
      </div>
      <div class="m-card">
        <div class="m-metric-title">2. Estado Mental</div>
        <div style="font-size: 7.5pt; color: #fff; margin-top: 3px;">😫 Estresado hasta 🤩 Excelente</div>
        <div style="font-size: 6pt; color: #94a3b8; margin-top: 2px;">Mide tu carga psicológica y foco de atención.</div>
      </div>
      <div class="m-card">
        <div class="m-metric-title">3. Descanso Previo</div>
        <div style="font-size: 7.5pt; color: #fff; margin-top: 3px;">Mal • Regular • Bien • Excelente</div>
        <div style="font-size: 6pt; color: #94a3b8; margin-top: 2px;">Indica la calidad de tu sueño de anoche.</div>
      </div>
    </div>

    <!-- MOCKUP CHECKIN PRE -->
    <h2 class="sub-title">Pantalla de Ejemplo 3: Check-in Pre-Entrenamiento</h2>
    <div class="mockup-box">
      <div class="mockup-topbar">
        <div class="mockup-dots"><span class="mockup-dot dot-r"></span><span class="mockup-dot dot-y"></span><span class="mockup-dot dot-g"></span></div>
        <span>Check-in Inicial: ¿Cómo llegás a entrenar hoy?</span>
        <span class="m-tag m-tag-amber">Obligatorio</span>
      </div>
      <div class="mockup-inner" style="padding: 12px; text-align: center;">
        <div style="font-size: 9pt; font-weight: 800; color: #fff; margin-bottom: 6px;">Evaluación de Energía de Entrada</div>
        <div style="display: flex; justify-content: center; gap: 6px; margin-bottom: 10px;">
          <span style="background: #1e293b; padding: 4px 8px; border-radius: 6px; font-size: 7pt; color: #cbd5e1;">🪫 1 Agotado</span>
          <span style="background: #1e293b; padding: 4px 8px; border-radius: 6px; font-size: 7pt; color: #cbd5e1;">🔋 2 Bajo</span>
          <span style="background: #1e293b; padding: 4px 8px; border-radius: 6px; font-size: 7pt; color: #cbd5e1;">🔋 3 Normal</span>
          <span style="background: #0284c7; padding: 4px 8px; border-radius: 6px; font-size: 7pt; color: #fff; font-weight: 800; border: 1px solid #38bdf8;">⚡ 4 Con Ganas</span>
          <span style="background: #1e293b; padding: 4px 8px; border-radius: 6px; font-size: 7pt; color: #cbd5e1;">🔥 5 A Tope</span>
        </div>
        <span class="m-btn m-btn-green" style="font-size: 7.5pt; padding: 5px 14px;">Confirmar y Comenzar Rutina</span>
      </div>
    </div>

    <h2 class="sub-title">3.2. Cómo Registrar tus Series en el Bloque de Desarrollo</h2>
    <p>
      Durante el entrenamiento, la pantalla se divide en los 3 bloques metodológicos:
    </p>

    <!-- MOCKUP VISTA DE ENTRENAMIENTO ACTIVA -->
    <h2 class="sub-title">Pantalla de Ejemplo 4: Registro de Series y Cargas en Vivo</h2>
    <div class="mockup-box">
      <div class="mockup-topbar">
        <div class="mockup-dots"><span class="mockup-dot dot-r"></span><span class="mockup-dot dot-y"></span><span class="mockup-dot dot-g"></span></div>
        <span>Día 1: Sentadilla Trasera con Barra (Ejercicio 3 de 4)</span>
        <span class="m-tag m-tag-amber">Bloque 3: Desarrollo</span>
      </div>
      <div class="mockup-inner">
        <!-- Indicaciones del profe y video -->
        <div style="background: #1e1505; border: 1px solid #f59e0b; border-radius: 6px; padding: 7px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: #fbbf24; font-size: 8pt;">Indicación de Matías:</strong>
              <span style="color: #fde68a; font-size: 7pt;"> "4 series de 6 repeticiones. RIR Objetivo: 2 (dejá 2 reps en el tanque). Bajada controlada en 3 segundos."</span>
            </div>
            <span class="m-btn m-btn-slate" style="font-size: 6.5pt;">🎬 Ver Video Técnico</span>
          </div>
        </div>

        <!-- Tabla interactiva de series -->
        <table class="m-table">
          <thead>
            <tr>
              <th style="width: 15%;">Serie</th>
              <th style="width: 25%;">Carga (Kg)</th>
              <th style="width: 25%;">Reps Reales</th>
              <th style="width: 20%;">RIR Sentido</th>
              <th style="width: 15%; text-align: center;">Listo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="badge badge-dark">Serie 1</span></td>
              <td><strong style="color: #38bdf8; font-size: 8.5pt;">100 kg</strong></td>
              <td><strong style="color: #fff; font-size: 8.5pt;">6 reps</strong></td>
              <td><span class="m-tag m-tag-green">RIR 2</span></td>
              <td style="text-align: center;"><span style="color: #10b981; font-weight: 900;">✓</span></td>
            </tr>
            <tr>
              <td><span class="badge badge-dark">Serie 2</span></td>
              <td><strong style="color: #38bdf8; font-size: 8.5pt;">100 kg</strong></td>
              <td><strong style="color: #fff; font-size: 8.5pt;">6 reps</strong></td>
              <td><span class="m-tag m-tag-green">RIR 2</span></td>
              <td style="text-align: center;"><span style="color: #10b981; font-weight: 900;">✓</span></td>
            </tr>
            <tr>
              <td><span class="badge badge-blue">Serie 3</span></td>
              <td><span style="background: #030712; border: 1px solid #0284c7; padding: 2px 6px; border-radius: 4px; color: #fff;">105 kg</span></td>
              <td><span style="background: #030712; border: 1px solid #0284c7; padding: 2px 6px; border-radius: 4px; color: #fff;">6 reps</span></td>
              <td><span style="background: #030712; border: 1px solid #0284c7; padding: 2px 6px; border-radius: 4px; color: #fff;">RIR 1</span></td>
              <td style="text-align: center;"><span class="m-btn m-btn-sky" style="font-size: 5.5pt; padding: 2px 5px;">Tildar</span></td>
            </tr>
          </tbody>
        </table>

        <!-- Notas al entrenador -->
        <div style="margin-top: 8px;">
          <div style="font-size: 6.5pt; color: #94a3b8; font-weight: 700; margin-bottom: 2px;">💬 Nota u observación para Matías en este ejercicio:</div>
          <div style="background: #030712; border: 1px solid #334155; border-radius: 4px; padding: 4px 6px; font-size: 6.8pt; color: #cbd5e1;">
            Subí a 105 kg en la 3ra serie porque me sentí muy cómodo de rodilla. Salió limpio.
          </div>
        </div>
      </div>
    </div>

    <!-- PÁGINA 5: CHECK-IN POST Y BIENESTAR -->
    <div class="page-break"></div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      ${LOGO_SVG_LIGHT}
      <span style="font-size: 7.5pt; color: #64748b; font-weight: 700;">MANUAL DEL ALUMNO • PARTE 4</span>
    </div>

    <h1 class="sec-title">
      <span>4. Cierre de Sesión y Chequeo Semanal de Bienestar</span>
      <span class="badge badge-green">Salud &amp; Métricas</span>
    </h1>

    <h2 class="sub-title">4.1. El Check-in Post-Entrenamiento (Fin de la Rutina)</h2>
    <p>
      Al presionar <strong>"Finalizar Entrenamiento"</strong>, se desplegará el modal de cierre para registrar la fatiga real del entrenamiento:
    </p>

    <div class="step-row">
      <div class="step-num">1</div>
      <div class="step-text"><strong>RPE Final (Escala 1 al 10):</strong> Calificás el esfuerzo global de la sesión (ej. <em>1 a 4 suave, 5 a 7 moderado, 8 a 9 muy exigente, 10 esfuerzo máximo al fallo</em>).</div>
    </div>
    <div class="step-row">
      <div class="step-num">2</div>
      <div class="step-text"><strong>Impacto Anímico:</strong> ¿Cómo terminás la clase? (<em>📉 Peor que al entrar, ➖ Igual, 📈 Renovado y con energía</em>).</div>
    </div>
    <div class="step-row">
      <div class="step-num">3</div>
      <div class="step-text"><strong>Guardado y Trofeo:</strong> El sistema guarda tus kilos y series en la base de datos PostgreSQL y te felicita con el trofeo de sesión completada.</div>
    </div>

    <h2 class="sub-title">4.2. Chequeo de Bienestar Mental Semanal (/bienestar)</h2>
    <p>
      Una vez por semana, Motion Lab te invitará a responder un breve test de 10 preguntas sobre 5 dimensiones clave para tu recuperación:
    </p>

    <!-- MOCKUP TEST BIENESTAR -->
    <h2 class="sub-title">Pantalla de Ejemplo 5: Chequeo de Bienestar Mental (/bienestar)</h2>
    <div class="mockup-box">
      <div class="mockup-topbar">
        <div class="mockup-dots"><span class="mockup-dot dot-r"></span><span class="mockup-dot dot-y"></span><span class="mockup-dot dot-g"></span></div>
        <span>motion-lab.app/bienestar — Tu Diagnóstico Psico-Físico Semanal</span>
        <span class="m-tag m-tag-blue">Nivel: En Equilibrio</span>
      </div>
      <div class="mockup-inner">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div>
            <div style="font-size: 10pt; font-weight: 900; color: #fff;">Puntaje General: 78 / 100</div>
            <div style="font-size: 6.5pt; color: #38bdf8;">Estado óptimo de recuperación deportiva.</div>
          </div>
          <span class="m-tag m-tag-green" style="font-size: 7.5pt;">🟢 Óptimo para entrenar</span>
        </div>

        <!-- 5 Dimensiones -->
        <div class="m-grid-5" style="margin-bottom: 8px;">
          <div style="background: #030712; padding: 5px; border-radius: 4px; text-align: center;">
            <div style="font-size: 6pt; color: #94a3b8;">Descanso</div>
            <div style="font-size: 9pt; font-weight: 800; color: #a78bfa;">75%</div>
          </div>
          <div style="background: #030712; padding: 5px; border-radius: 4px; text-align: center;">
            <div style="font-size: 6pt; color: #94a3b8;">Estrés</div>
            <div style="font-size: 9pt; font-weight: 800; color: #facc15;">70%</div>
          </div>
          <div style="background: #030712; padding: 5px; border-radius: 4px; text-align: center;">
            <div style="font-size: 6pt; color: #94a3b8;">Ánimo</div>
            <div style="font-size: 9pt; font-weight: 800; color: #22d3ee;">85%</div>
          </div>
          <div style="background: #030712; padding: 5px; border-radius: 4px; text-align: center;">
            <div style="font-size: 6pt; color: #94a3b8;">Energía</div>
            <div style="font-size: 9pt; font-weight: 800; color: #fb7185;">80%</div>
          </div>
          <div style="background: #030712; padding: 5px; border-radius: 4px; text-align: center;">
            <div style="font-size: 6pt; color: #94a3b8;">Motivación</div>
            <div style="font-size: 9pt; font-weight: 800; color: #60a5fa;">80%</div>
          </div>
        </div>

        <div style="background: #021226; border: 1px solid #0284c7; border-radius: 4px; padding: 6px;">
          <strong style="color: #38bdf8; font-size: 7pt;">💡 Consejo de Recuperación Personalizado:</strong>
          <span style="color: #cbd5e1; font-size: 6.8pt;"> Tu nivel de energía y descanso están sincronizados. Mantené tu hidratación previa y aprovechá esta semana para consolidar tus marcas en los ejercicios principales.</span>
        </div>
      </div>
    </div>

    <h2 class="sub-title">4.3. Vinculación de Reloj Inteligente y Apple Health</h2>
    <p>
      En tu Hub podés conectar tu reloj o importar tus datos de Apple Salud para que Matías evalúe tu frecuencia cardíaca y sueño:
    </p>
    <table class="doc-table">
      <thead>
        <tr>
          <th style="width: 30%;">Tipo de Dispositivo</th>
          <th style="width: 35%;">Cómo se conecta</th>
          <th style="width: 35%;">Qué datos sincroniza</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Reloj en la Nube (Junction / Google Fit)</strong></td>
          <td>Presionar <em>"Conectar Reloj"</em> y autorizar con tu cuenta de Google Fit o Garmin.</td>
          <td>Horas de sueño profundo, frecuencia cardíaca en reposo y pasos diarios.</td>
        </tr>
        <tr>
          <td><strong>Apple Watch (importación manual)</strong></td>
          <td>Exportar tus datos desde la app Salud del iPhone y subir el archivo <em>export.zip</em> en la tarjeta "Apple Watch".</td>
          <td>Pasos, sueño, frecuencia cardíaca y entrenamientos de los últimos 30 días.</td>
        </tr>
      </tbody>
    </table>
    <p style="font-size: 8pt; color: #475569;">
      Apple Watch no se sincroniza automáticamente desde la web. La importación manual es la alternativa disponible: el ZIP se procesa en tu navegador y MOTION LAB solo guarda un resumen de 30 días.
    </p>

    <div class="footer-bar">
      <span>MOTION LAB • Manual de Operaciones para el Alumno</span>
      <span>Preparación Física &amp; Rendimiento</span>
    </div>
  `;
}
