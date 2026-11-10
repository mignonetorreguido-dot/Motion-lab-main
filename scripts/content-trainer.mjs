/**
 * ========================================================================
 * CONTENIDO HTML: MANUAL DEL PERSONAL TRAINER (ADMIN / COACH MATÍAS)
 * ========================================================================
 */

import { LOGO_SVG, LOGO_SVG_LIGHT } from './build-manuals.mjs';

export function getTrainerManualHTML() {
  return `
    <!-- PORTADA DEL MANUAL DEL ENTRENADOR -->
    <div class="cover">
      <div class="cover-glow"></div>
      
      <div class="cover-logo">
        ${LOGO_SVG}
      </div>

      <div>
        <span class="badge-pill">Módulo Administrativo &amp; Coaching</span>
        <h1 class="cover-title">Manual de Operaciones para el Personal Trainer</h1>
        <p class="cover-subtitle">
          Guía técnica y operativa completa para la gestión integral de alumnos, validación instantánea de pagos, monitoreo psico-físico con alertas de fatiga y diseño de planificaciones estructuradas en 3 bloques.
        </p>
      </div>

      <div class="cover-meta">
        <div><strong>Plataforma:</strong> Motion Lab App v1.0</div>
        <div><strong>Rol de Acceso:</strong> ENTRENADOR (Coach Matías)</div>
        <div><strong>Documento:</strong> Manual Oficial del Administrador</div>
        <div><strong>Fecha:</strong> Noviembre 2026</div>
      </div>
    </div>

    <!-- PÁGINA 2: ÍNDICE Y RESUMEN GENERAL -->
    <div class="page-break"></div>
    
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      ${LOGO_SVG_LIGHT}
      <span style="font-size: 7.5pt; color: #64748b; font-weight: 700;">MANUAL DEL ENTRENADOR • PARTE 1</span>
    </div>

    <h1 class="sec-title">
      <span>1. Resumen Ejecutivo y Arquitectura del Sistema</span>
      <span class="badge badge-blue">Admin Panel</span>
    </h1>

    <p>
      El panel de administración de <strong>Motion Lab</strong> está concebido como el centro de control táctico y metodológico para el entrenador <strong>Matías</strong>. Su propósito es centralizar la gestión de deportistas y alumnos, permitiendo el diagnóstico físico inmediato, la supervisión de estados de pago y la programación de entrenamientos basada en evidencia científica y control de fatiga.
    </p>

    <div class="callout callout-info">
      <strong>Metodología Motion Lab:</strong> Toda la arquitectura de entrenamiento gira en torno a tres pilares: (1) <em>Validación de carga</em>, (2) <em>Monitoreo de fatiga y bienestar psico-emocional</em>, y (3) <em>Estructuración estricta en 3 bloques (Movilidad, Activación y Desarrollo)</em>.
    </div>

    <h2 class="sub-title">1.1. Seguridad, Acceso y Modos de Visualización</h2>
    <p>
      El acceso administrativo está estrictamente restringido al rol <code>ENTRENADOR</code> mediante autenticación protegida en NextAuth. Existen dos vías oficiales para ingresar al panel:
    </p>

    <div class="step-row">
      <div class="step-num">1</div>
      <div class="step-text"><strong>Ruta Directa para el Profesor:</strong> Navegar a <code>/comenzar?rol=profesor</code> o presionar "Soy Profesor" en el selector de roles de bienvenida.</div>
    </div>
    <div class="step-row">
      <div class="step-num">2</div>
      <div class="step-text"><strong>Ruta Tradicional de Login:</strong> Ingresar desde <code>/login</code> completando el correo del entrenador y la clave/PIN de seguridad.</div>
    </div>

    <div class="callout callout-warn">
      <strong>Protección de Ruta:</strong> Si un alumno intenta acceder a <code>/admin</code>, el middleware del sistema lo redirige automáticamente a su propio panel en <code>/entrenamiento</code>. Si un usuario no autenticado intenta ingresar, es enviado a la pantalla de login.
    </div>

    <h2 class="sub-title">1.2. Selector de Modo Soleado / Modo Noche</h2>
    <p>
      En la esquina superior derecha del panel administrativo se encuentra el <strong>Toggle de Tema</strong>. Este permite alternar entre:
    </p>
    <table class="doc-table">
      <thead>
        <tr>
          <th style="width: 25%;">Modo</th>
          <th style="width: 35%;">Aspecto Visual</th>
          <th style="width: 40%;">Uso Recomendado</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Modo Noche (Oscuro)</strong></td>
          <td>Fondo negro atlético (<code>#05070c</code>), textos en blanco y acentos celestes eléctricos.</td>
          <td>Uso en interiores, oficina o revisión nocturna de planificaciones. Reduce la fatiga visual.</td>
        </tr>
        <tr>
          <td><strong>Modo Soleado (Luz)</strong></td>
          <td>Fondo blanco puro / pizarra claro, textos en negro de alto contraste y bordes reforzados.</td>
          <td><strong>Uso en exteriores o en cancha</strong> bajo la luz directa del sol. Garantiza legibilidad total de números y series.</td>
        </tr>
      </tbody>
    </table>

    <!-- MOCKUP PANTALLA LOGIN PROFESOR -->
    <h2 class="sub-title">Pantalla de Ejemplo 1: Acceso Administrativo (/comenzar?rol=profesor)</h2>
    <div class="mockup-box">
      <div class="mockup-topbar">
        <div class="mockup-dots"><span class="mockup-dot dot-r"></span><span class="mockup-dot dot-y"></span><span class="mockup-dot dot-g"></span></div>
        <span>motion-lab.app/comenzar?rol=profesor</span>
        <span class="m-tag m-tag-blue">SSL Seguro</span>
      </div>
      <div class="mockup-inner" style="display: flex; justify-content: center; padding: 18px;">
        <div class="m-card" style="width: 340px; padding: 16px; text-align: center;">
          <div style="display: inline-block; padding: 4px 10px; background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.3); border-radius: 20px; font-size: 6.5pt; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 6px;">
            Acceso Entrenador
          </div>
          <div style="font-size: 13pt; font-weight: 900; color: #fff; margin-bottom: 4px;">Panel de Control Matías</div>
          <div style="font-size: 7pt; color: #94a3b8; margin-bottom: 12px;">Ingresa tus credenciales maestras para gestionar alumnos y rutinas</div>

          <div style="text-align: left; margin-bottom: 8px;">
            <div style="font-size: 6.5pt; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin-bottom: 2px;">Email del Entrenador</div>
            <div style="background: #030712; border: 1px solid #334155; border-radius: 5px; padding: 5px 8px; color: #fff; font-size: 7.5pt;">matias@motionlab.com</div>
          </div>
          <div style="text-align: left; margin-bottom: 12px;">
            <div style="font-size: 6.5pt; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin-bottom: 2px;">PIN / Contraseña de Seguridad</div>
            <div style="background: #030712; border: 1px solid #334155; border-radius: 5px; padding: 5px 8px; color: #38bdf8; font-size: 8pt; letter-spacing: 2px;">••••••••</div>
          </div>

          <div class="m-btn m-btn-sky" style="width: 100%; padding: 6px; font-size: 8pt;">Ingresar al Panel Administrativo</div>
        </div>
      </div>
    </div>

    <!-- PÁGINA 3: DASHBOARD PRINCIPAL -->
    <div class="page-break"></div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      ${LOGO_SVG_LIGHT}
      <span style="font-size: 7.5pt; color: #64748b; font-weight: 700;">MANUAL DEL ENTRENADOR • PARTE 2</span>
    </div>

    <h1 class="sec-title">
      <span>2. Dashboard Central del Entrenador (/admin)</span>
      <span class="badge badge-blue">Gestión de Alumnos</span>
    </h1>

    <p>
      El Dashboard es la pantalla neurálgica donde el entrenador visualiza de forma instantánea el estado de todos sus alumnos. Está diseñado con arquitectura reactiva para no recargar la página ante cambios de estado de pago o alertas.
    </p>

    <h2 class="sub-title">2.1. Tarjetas de Métricas en Tiempo Real</h2>
    <p>Ubicadas en la barra superior derecha del panel, calculadas al vuelo sobre la base de datos:</p>
    
    <div class="m-grid-5" style="margin-bottom: 10px;">
      <div class="m-card" style="text-align: center; border-left: 3px solid #64748b;">
        <div style="font-size: 6.5pt; color: #94a3b8; text-transform: uppercase;">Total Alumnos</div>
        <div style="font-size: 13pt; font-weight: 900; color: #fff;">18</div>
        <div style="font-size: 6pt; color: #64748b;">Registrados</div>
      </div>
      <div class="m-card" style="text-align: center; border-left: 3px solid #f59e0b;">
        <div style="font-size: 6.5pt; color: #fbbf24; text-transform: uppercase;">Pendientes</div>
        <div style="font-size: 13pt; font-weight: 900; color: #fbbf24;">4</div>
        <div style="font-size: 6pt; color: #fbbf24;">Por validar pago</div>
      </div>
      <div class="m-card" style="text-align: center; border-left: 3px solid #0284c7;">
        <div style="font-size: 6.5pt; color: #38bdf8; text-transform: uppercase;">Activos</div>
        <div style="font-size: 13pt; font-weight: 900; color: #38bdf8;">14</div>
        <div style="font-size: 6pt; color: #38bdf8;">Con acceso pleno</div>
      </div>
      <div class="m-card" style="text-align: center; border-left: 3px solid #10b981;">
        <div style="font-size: 6.5pt; color: #34d399; text-transform: uppercase;">Sesiones Hechas</div>
        <div style="font-size: 13pt; font-weight: 900; color: #34d399;">142</div>
        <div style="font-size: 6pt; color: #34d399;">Total completadas</div>
      </div>
      <div class="m-card" style="text-align: center; border-left: 3px solid #ef4444;">
        <div style="font-size: 6.5pt; color: #f87171; text-transform: uppercase;">Alertas Bienestar</div>
        <div style="font-size: 13pt; font-weight: 900; color: #f87171;">2</div>
        <div style="font-size: 6pt; color: #f87171;">Fatiga o estrés</div>
      </div>
    </div>

    <h2 class="sub-title">2.2. Botones de Acción Rápida del Encabezado</h2>
    <table class="doc-table">
      <thead>
        <tr>
          <th style="width: 25%;">Botón / Control</th>
          <th style="width: 20%;">Ubicación</th>
          <th style="width: 55%;">Función Operativa</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="m-btn m-btn-sky">+ Nuevo Alumno</span></td>
          <td>Barra superior</td>
          <td>Abre un modal en blanco para crear un alumno manualmente (sin que este pase por la landing pública). Permite cargar datos, definir contraseña y asignar plan en caliente.</td>
        </tr>
        <tr>
          <td><span class="m-btn m-btn-slate">Limpiar Rutinas Viejas</span></td>
          <td>Barra superior</td>
          <td>Acción de mantenimiento que abre un modal de confirmación para purgar todas las rutinas completadas o en desuso que ya no pertenecen a planes activos.</td>
        </tr>
        <tr>
          <td><span class="m-btn m-btn-slate">↻ Recargar</span></td>
          <td>Barra superior</td>
          <td>Refresca los datos en segundo plano consultando <code>/api/entrenador/alumnos</code> sin necesidad de recargar el navegador.</td>
        </tr>
        <tr>
          <td><strong>Buscador Reactivo</strong></td>
          <td>Barra de filtros</td>
          <td>Filtra la tabla en vivo por nombre, apellido, correo electrónico o deporte practicado.</td>
        </tr>
        <tr>
          <td><strong>Pestañas de Filtro</strong></td>
          <td>Barra de filtros</td>
          <td>Alterna entre: <em>Todos</em>, <em>Pendientes de Pago</em>, <em>Alumnos Activos</em>, <em>🚨 Alertas de Fatiga</em> y <em>🗑️ En Desuso</em>.</td>
        </tr>
      </tbody>
    </table>

    <h2 class="sub-title">2.3. Tabla Principal de Alumnos y Acciones Rápidas</h2>
    <p>
      Cada fila de la tabla representa a un alumno registrado con información diagnóstica clave:
    </p>

    <!-- MOCKUP PANTALLA DASHBOARD -->
    <div class="mockup-box">
      <div class="mockup-topbar">
        <div class="mockup-dots"><span class="mockup-dot dot-r"></span><span class="mockup-dot dot-y"></span><span class="mockup-dot dot-g"></span></div>
        <span>motion-lab.app/admin — Panel del Entrenador Matías</span>
        <div style="display: flex; gap: 4px;">
          <span class="m-tag m-tag-blue">14 Activos</span>
          <span class="m-tag m-tag-amber">4 Pendientes</span>
        </div>
      </div>
      <div class="mockup-inner">
        <!-- Barra de herramientas mockup -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="display: flex; gap: 4px;">
            <span class="m-tag m-tag-blue" style="padding: 3px 8px;">Todos (18)</span>
            <span class="m-tag m-tag-amber" style="padding: 3px 8px;">Pendientes (4)</span>
            <span class="m-tag m-tag-green" style="padding: 3px 8px;">Activos (14)</span>
            <span class="m-tag m-tag-red" style="padding: 3px 8px;">🚨 Alertas (2)</span>
          </div>
          <div style="background: #030712; border: 1px solid #334155; padding: 2px 8px; border-radius: 4px; font-size: 6.5pt; color: #94a3b8;">
            🔍 Buscar alumno...
          </div>
        </div>

        <!-- Tabla mockup -->
        <table class="m-table">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Plan &amp; Deporte</th>
              <th>Bienestar &amp; Fatiga</th>
              <th>Nivel &amp; Focos</th>
              <th>Estado Pago</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <div style="width: 22px; height: 22px; border-radius: 6px; background: #0284c7; color: #fff; font-weight: 900; display: flex; align-items: center; justify-content: center; font-size: 7.5pt;">G</div>
                  <div>
                    <div style="font-weight: 800; color: #fff;">Guido Mignoneto</div>
                    <div style="font-size: 6pt; color: #94a3b8;">guido@motionlab.com • +54 9 11 5555-1234</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="m-tag m-tag-amber">Performance</span>
                <div style="font-size: 6.5pt; color: #cbd5e1; margin-top: 1px;">Fútbol (Club Federado)</div>
              </td>
              <td>
                <span class="m-tag m-tag-red">🚨 Alerta Roja (3 días fatiga)</span>
                <div style="font-size: 6pt; color: #94a3b8; margin-top: 1px;">12 sesiones completadas</div>
              </td>
              <td>
                <span style="font-weight: 700; color: #fff;">Avanzado</span>
                <div style="font-size: 6pt; color: #94a3b8;">Fuerza, Velocidad</div>
              </td>
              <td>
                <span class="m-btn m-btn-green" style="font-size: 6pt; cursor: pointer;">✓ ACTIVO</span>
              </td>
              <td style="text-align: right;">
                <span class="m-btn m-btn-sky" style="font-size: 6.5pt;">👁 Ver Ficha / Rutina</span>
              </td>
            </tr>
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <div style="width: 22px; height: 22px; border-radius: 6px; background: #64748b; color: #fff; font-weight: 900; display: flex; align-items: center; justify-content: center; font-size: 7.5pt;">S</div>
                  <div>
                    <div style="font-weight: 800; color: #fff;">Sofía Rossi</div>
                    <div style="font-size: 6pt; color: #94a3b8;">sofia.rossi@email.com • +54 9 11 4444-9876</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="m-tag m-tag-blue">Plan Base</span>
                <div style="font-size: 6.5pt; color: #cbd5e1; margin-top: 1px;">Running / Trail</div>
              </td>
              <td>
                <span class="m-tag m-tag-green">🟢 Estado Óptimo</span>
                <div style="font-size: 6pt; color: #94a3b8; margin-top: 1px;">8 sesiones completadas</div>
              </td>
              <td>
                <span style="font-weight: 700; color: #fff;">Intermedio</span>
                <div style="font-size: 6pt; color: #94a3b8;">Resistencia, Core</div>
              </td>
              <td>
                <span class="m-btn m-btn-amber" style="font-size: 6pt; cursor: pointer;">⏳ PENDIENTE</span>
              </td>
              <td style="text-align: right;">
                <span class="m-btn m-btn-sky" style="font-size: 6.5pt;">👁 Ver Ficha / Rutina</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="callout callout-success">
      <strong>Toggle Instantáneo de Pago (1 Clic):</strong> Al presionar el botón de la columna <em>Estado de Pago</em>, el sistema invoca la API <code>/api/entrenador/alumnos/[id]/estado-pago</code> y cambia de <code>PENDIENTE</code> a <code>ACTIVO</code> (o viceversa) al instante. Si pasa a <em>ACTIVO</em>, el alumno inmediatamente puede ingresar a ver y realizar su rutina.
    </div>

    <!-- PÁGINA 4: FICHA TÉCNICA DEL ALUMNO -->
    <div class="page-break"></div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      ${LOGO_SVG_LIGHT}
      <span style="font-size: 7.5pt; color: #64748b; font-weight: 700;">MANUAL DEL ENTRENADOR • PARTE 3</span>
    </div>

    <h1 class="sec-title">
      <span>3. Ficha Técnica Integral del Alumno (Modal)</span>
      <span class="badge badge-blue">Diagnóstico y Salud</span>
    </h1>

    <p>
      Al presionar <strong>"Ver Ficha / Rutina"</strong> sobre cualquier deportista, se despliega el modal técnico con toda su radiografía deportiva, historial clínico, alertas automáticas de fatiga y planificaciones.
    </p>

    <h2 class="sub-title">3.1. Datos Físicos, Lesiones y Repeticiones Máximas (RM)</h2>
    <p>
      El sistema compila los datos ingresados en el Onboarding o cargados manualmente por el profesor:
    </p>
    <table class="doc-table">
      <thead>
        <tr>
          <th style="width: 25%;">Dato / Campo</th>
          <th style="width: 40%;">Significado en Plataforma</th>
          <th style="width: 35%;">Impacto en la Planificación</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Peso y Altura</strong></td>
          <td>Medidas antropométricas base (ej. 78 kg / 182 cm).</td>
          <td>Cálculo de ratios de fuerza relativa y evolución corporal.</td>
        </tr>
        <tr>
          <td><strong>Objetivo &amp; Deporte</strong></td>
          <td>Rendimiento, Estética o Salud; deporte y si compite en club federado.</td>
          <td>Permite al entrenador orientar la selección de ejercicios hacia la especificidad motriz.</td>
        </tr>
        <tr>
          <td><strong>⚠️ Lesiones Reportadas</strong></td>
          <td>Historial de molestias o cirugías informado por el alumno.</td>
          <td><strong>Alerta visual destacada en amarillo:</strong> previene la prescripción de ejercicios lesivos.</td>
        </tr>
        <tr>
          <td><strong>⚡ RMs Estimadas</strong></td>
          <td>Cargas máximas registradas (ej. <em>Sentadilla 120kg, Banco 90kg</em>).</td>
          <td>Referencia para pautar cargas en porcentajes o en RIR (Repeticiones en Reserva).</td>
        </tr>
        <tr>
          <td><strong>🎯 Puntos Débiles</strong></td>
          <td>Zonas a potenciar (ej. <em>Falta de movilidad de tobillo, estabilidad escapular</em>).</td>
          <td>Guía para nutrir el Bloque 1 de Movilidad y el Bloque 2 de Activación.</td>
        </tr>
      </tbody>
    </table>

    <h2 class="sub-title">3.2. Edición en Caliente y Doble Verificación de Eliminación</h2>
    <p>
      En la cabecera de la ficha, Matías dispone de dos controles de administración crítica:
    </p>
    <div class="step-row">
      <div class="step-num">A</div>
      <div class="step-text"><strong>Botón "Editar Ficha":</strong> Habilita los campos editables del perfil (peso, altura, WhatsApp, contraseña, objetivo, deporte, etc.) y permite guardar cambios al instante mediante <code>guardarPerfilAlumno()</code>.</div>
    </div>
    <div class="step-row">
      <div class="step-num">B</div>
      <div class="step-text"><strong>Botón "Eliminar Perfil" con Doble Verificación:</strong> Para salvaguardar la información ante clics involuntarios, el sistema exige dos confirmaciones:
        <ul style="margin-top: 3px; padding-left: 15px; font-size: 8pt; color: #475569;">
          <li><em>Paso 1 (Advertencia):</em> Muestra el nombre del alumno y pide "Continuar a 2da Verificación".</li>
          <li><em>Paso 2 (Final e irreversible):</em> Se tiñe en rojo intenso y advierte que se borrarán todas las series, check-ins y registros de la base de datos de forma definitiva.</li>
        </ul>
      </div>
    </div>

    <!-- MOCKUP FICHA DEL ALUMNO -->
    <h2 class="sub-title">Pantalla de Ejemplo 2: Ficha Técnica y Alertas Psico-Físicas</h2>
    <div class="mockup-box">
      <div class="mockup-topbar">
        <div class="mockup-dots"><span class="mockup-dot dot-r"></span><span class="mockup-dot dot-y"></span><span class="mockup-dot dot-g"></span></div>
        <span>Ficha Técnica: Guido Mignoneto — ID: usr_9941</span>
        <div style="display: flex; gap: 4px;">
          <span class="m-btn m-btn-slate" style="font-size: 6pt;">✏️ Editar Ficha</span>
          <span class="m-btn m-btn-red" style="font-size: 6pt;">🗑️ Eliminar</span>
        </div>
      </div>
      <div class="mockup-inner">
        <!-- Bloque datos médicos y deportivos -->
        <div class="m-grid-4" style="margin-bottom: 8px;">
          <div class="m-card">
            <div class="m-metric-title">Datos Físicos</div>
            <div style="font-size: 8.5pt; font-weight: 800; color: #fff;">78.5 kg • 181 cm</div>
            <div style="font-size: 6pt; color: #94a3b8;">Disponibilidad: 4 días/sem</div>
          </div>
          <div class="m-card">
            <div class="m-metric-title">Deporte &amp; Nivel</div>
            <div style="font-size: 8.5pt; font-weight: 800; color: #38bdf8;">Fútbol (Federado)</div>
            <div style="font-size: 6pt; color: #94a3b8;">Nivel: Avanzado competitivo</div>
          </div>
          <div class="m-card" style="border-left: 2px solid #f59e0b;">
            <div class="m-metric-title" style="color: #fbbf24;">⚠️ Lesiones Previas</div>
            <div style="font-size: 7.5pt; color: #fbbf24; font-weight: 700;">Molestia en isquio izquierdo</div>
            <div style="font-size: 6pt; color: #94a3b8;">Evitar estiramientos balísticos</div>
          </div>
          <div class="m-card" style="border-left: 2px solid #0284c7;">
            <div class="m-metric-title" style="color: #38bdf8;">⚡ RMs Referencia</div>
            <div style="font-size: 7.5pt; color: #fff; font-weight: 700;">Sentadilla: 130 kg</div>
            <div style="font-size: 6pt; color: #94a3b8;">Banco: 95 kg • Peso Muerto: 150 kg</div>
          </div>
        </div>

        <!-- Alertas de fatiga y checkins -->
        <div class="m-card" style="margin-bottom: 8px; border-left: 3px solid #ef4444; background: #0c1527;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 7.5pt; font-weight: 900; color: #f87171; text-transform: uppercase;">
              🚨 Monitoreo Psico-Físico: Alerta Roja de Fatiga Acumulada
            </div>
            <span class="m-tag m-tag-red">3 Sesiones Consecutivas Agotado</span>
          </div>
          <p style="font-size: 7pt; color: #cbd5e1; margin-bottom: 6px;">
            <strong>Diagnóstico Automático:</strong> El alumno completó 3 entrenamientos reportando energía inicial baja (≤1) o estrés severo. Se sugiere aplicar una semana de descarga (Deload) reduciendo el volumen un 40% y RPE ≤ 6.
          </p>

          <!-- Tarjetas de últimos 3 check-ins -->
          <div class="m-grid-3">
            <div style="background: #060b14; border: 1px solid #1e293b; border-radius: 4px; padding: 5px;">
              <div style="font-size: 6.5pt; font-weight: 800; color: #38bdf8;">Día 3 — Ayer</div>
              <div style="font-size: 6.5pt; color: #f87171;">Energía: 🪫 1 (Agotado)</div>
              <div style="font-size: 6.5pt; color: #94a3b8;">Estrés: 😫 Muy estresado</div>
              <div style="font-size: 6.5pt; color: #fbbf24;">RPE Final: 9.0 / 10</div>
            </div>
            <div style="background: #060b14; border: 1px solid #1e293b; border-radius: 4px; padding: 5px;">
              <div style="font-size: 6.5pt; font-weight: 800; color: #38bdf8;">Día 2 — 3 días atrás</div>
              <div style="font-size: 6.5pt; color: #f87171;">Energía: 🔋 2 (Bajo)</div>
              <div style="font-size: 6.5pt; color: #94a3b8;">Estrés: 🙁 Desmotivado</div>
              <div style="font-size: 6.5pt; color: #fbbf24;">RPE Final: 8.5 / 10</div>
            </div>
            <div style="background: #060b14; border: 1px solid #1e293b; border-radius: 4px; padding: 5px;">
              <div style="font-size: 6.5pt; font-weight: 800; color: #38bdf8;">Día 1 — 5 días atrás</div>
              <div style="font-size: 6.5pt; color: #f87171;">Energía: 🪫 1 (Agotado)</div>
              <div style="font-size: 6.5pt; color: #94a3b8;">Estrés: 😫 Muy estresado</div>
              <div style="font-size: 6.5pt; color: #fbbf24;">RPE Final: 8.0 / 10</div>
            </div>
          </div>
        </div>

        <!-- Chequeo de bienestar de 5 dimensiones -->
        <div class="m-card" style="background: #070d19; border: 1px solid #0284c7;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <div style="font-size: 7.5pt; font-weight: 800; color: #fff;">Chequeo de Salud Mental Semanal (10 Preguntas)</div>
            <span class="m-tag m-tag-amber">A Fortalecer • 64 / 100</span>
          </div>
          <div class="m-grid-5" style="margin-top: 4px;">
            <div style="background: #030712; padding: 4px; border-radius: 4px; text-align: center;">
              <div style="font-size: 6pt; color: #94a3b8;">Descanso</div>
              <div style="font-size: 8pt; font-weight: 800; color: #a78bfa;">45%</div>
            </div>
            <div style="background: #030712; padding: 4px; border-radius: 4px; text-align: center;">
              <div style="font-size: 6pt; color: #94a3b8;">Estrés</div>
              <div style="font-size: 8pt; font-weight: 800; color: #facc15;">55%</div>
            </div>
            <div style="background: #030712; padding: 4px; border-radius: 4px; text-align: center;">
              <div style="font-size: 6pt; color: #94a3b8;">Ánimo</div>
              <div style="font-size: 8pt; font-weight: 800; color: #22d3ee;">70%</div>
            </div>
            <div style="background: #030712; padding: 4px; border-radius: 4px; text-align: center;">
              <div style="font-size: 6pt; color: #94a3b8;">Energía</div>
              <div style="font-size: 8pt; font-weight: 800; color: #fb7185;">60%</div>
            </div>
            <div style="background: #030712; padding: 4px; border-radius: 4px; text-align: center;">
              <div style="font-size: 6pt; color: #94a3b8;">Motivación</div>
              <div style="font-size: 8pt; font-weight: 800; color: #60a5fa;">90%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PÁGINA 5: CONSTRUCTOR DE RUTINAS -->
    <div class="page-break"></div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      ${LOGO_SVG_LIGHT}
      <span style="font-size: 7.5pt; color: #64748b; font-weight: 700;">MANUAL DEL ENTRENADOR • PARTE 4</span>
    </div>

    <h1 class="sec-title">
      <span>4. Constructor y Asignador de Rutinas (RoutineBuilder)</span>
      <span class="badge badge-blue">Planificación en 3 Bloques</span>
    </h1>

    <p>
      El <strong>RoutineBuilder</strong> es el componente técnico con el que Matías planifica sesiones estructuradas. Toda rutina en Motion Lab se rige rigurosamente por la <strong>metodología de los 3 bloques</strong>:
    </p>

    <div class="m-grid-3" style="margin-bottom: 10px;">
      <div style="background: #f0f9ff; border: 1.5px solid #0284c7; border-radius: 6px; padding: 8px;">
        <span class="badge badge-blue">Bloque 1: MOVILIDAD</span>
        <div style="font-weight: 800; color: #0369a1; margin-top: 4px; font-size: 8.5pt;">Apertura y Rango Articular</div>
        <p style="font-size: 7.5pt; color: #334155; margin-top: 2px;">
          Movilidad de cadera, tobillo, columna torácica y liberación miofascial. Prepara los tejidos y reduce el riesgo de lesiones.
        </p>
      </div>
      <div style="background: #ecfeff; border: 1.5px solid #06b6d4; border-radius: 6px; padding: 8px;">
        <span class="badge" style="background: #cffafe; color: #0891b2; border: 1px solid #a5f3fc;">Bloque 2: ACTIVACIÓN</span>
        <div style="font-weight: 800; color: #0891b2; margin-top: 4px; font-size: 8.5pt;">Despertar Neural y Core</div>
        <p style="font-size: 7.5pt; color: #334155; margin-top: 2px;">
          Ejercicios de anti-rotación, estabilidad central, activación glútea y pliometría preparatoria de baja intensidad.
        </p>
      </div>
      <div style="background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: 6px; padding: 8px;">
        <span class="badge badge-amber">Bloque 3: DESARROLLO</span>
        <div style="font-weight: 800; color: #b45309; margin-top: 4px; font-size: 8.5pt;">Sobrecarga y Fuerza Principal</div>
        <p style="font-size: 7.5pt; color: #334155; margin-top: 2px;">
          Patrones fundamentales (sentadilla, bisagra, empuje, tracción). Se divide en series, cargas (Kg), repeticiones y control de RIR.
        </p>
      </div>
    </div>

    <h2 class="sub-title">4.1. Funcionalidades Avanzadas del Constructor</h2>
    <table class="doc-table">
      <thead>
        <tr>
          <th style="width: 25%;">Acción Operativa</th>
          <th style="width: 20%;">Botón / Comando</th>
          <th style="width: 55%;">Descripción y Utilidad Táctica</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Agregar Día</strong></td>
          <td><span class="m-btn m-btn-sky">+ Agregar Día</span></td>
          <td>Crea una nueva pestaña de sesión (Día 1, Día 2, etc.) inicializada con los 3 bloques metodológicos vacíos.</td>
        </tr>
        <tr>
          <td><strong>Clonar Día Completo</strong></td>
          <td><span class="m-btn m-btn-slate">⧉ Clonar Día</span></td>
          <td><strong>Ahorro de tiempo:</strong> Duplica instantáneamente el día activo con todos sus bloques, ejercicios, series y notas. Ideal para crear variaciones o microciclos similares.</td>
        </tr>
        <tr>
          <td><strong>Importar Rutina de Otro Alumno</strong></td>
          <td><span class="m-btn m-btn-slate">📥 Importar de Alumno...</span></td>
          <td>Despliega un selector de deportistas para clonar una planificación exitosa previa como plantilla de trabajo.</td>
        </tr>
        <tr>
          <td><strong>Enlazar Video Demostrativo</strong></td>
          <td><span class="m-btn m-btn-slate">🎬 Video</span></td>
          <td>Permite insertar URLs de videos (YouTube, Drive o MP4) y agregar recomendaciones técnicas de ejecución que el alumno verá en su pantalla.</td>
        </tr>
        <tr>
          <td><strong>Guardar y Asignar</strong></td>
          <td><span class="m-btn m-btn-green">💾 Guardar y Asignar</span></td>
          <td>Valida la estructura, formatea los bloques para PostgreSQL y deja la rutina lista para que el alumno la vea al iniciar sesión.</td>
        </tr>
      </tbody>
    </table>

    <!-- MOCKUP CONSTRUCTOR DE RUTINAS -->
    <h2 class="sub-title">Pantalla de Ejemplo 3: Constructor de Rutinas Multidía (RoutineBuilder)</h2>
    <div class="mockup-box">
      <div class="mockup-topbar">
        <div class="mockup-dots"><span class="mockup-dot dot-r"></span><span class="mockup-dot dot-y"></span><span class="mockup-dot dot-g"></span></div>
        <span>RoutineBuilder: Diseñando Plan Semanal para Guido Mignoneto</span>
        <div style="display: flex; gap: 4px;">
          <span class="m-btn m-btn-slate" style="font-size: 6pt;">📥 Importar Plantilla</span>
          <span class="m-btn m-btn-green" style="font-size: 6pt;">💾 Guardar Plan</span>
        </div>
      </div>
      <div class="mockup-inner">
        <!-- Selector de días de la semana -->
        <div style="display: flex; gap: 5px; margin-bottom: 8px; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <span class="m-btn m-btn-sky" style="font-size: 7pt; padding: 4px 10px;">Día 1: Fuerza y Tren Inferior</span>
          <span class="m-btn m-btn-slate" style="font-size: 7pt; padding: 4px 10px;">Día 2: Potencia y Tren Superior</span>
          <span class="m-btn m-btn-slate" style="font-size: 7pt; padding: 4px 10px;">Día 3: Capacidad Anaeróbica</span>
          <span class="m-btn m-btn-slate" style="font-size: 7pt; padding: 4px 8px;">+ Nuevo Día</span>
        </div>

        <!-- Bloque 1 Movilidad -->
        <div style="background: #031024; border: 1px solid #0284c7; border-radius: 6px; padding: 6px; margin-bottom: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 7pt; font-weight: 800; color: #38bdf8;">BLOQUE 1: MOVILIDAD ARTICULAR (1 Ejercicio)</span>
            <span class="m-btn m-btn-slate" style="font-size: 6pt;">+ Agregar Ejercicio</span>
          </div>
          <div style="background: #061633; border: 1px solid #1e293b; border-radius: 4px; padding: 5px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: #fff; font-size: 7.5pt;">90/90 Hip Flow + Movilidad de Tobillo</strong>
              <div style="font-size: 6pt; color: #94a3b8;">Indicación: 2 rondas de 8 repeticiones lentas por pierna, haciendo foco en apertura profunda.</div>
            </div>
            <span class="m-tag m-tag-blue">🎬 Video cargado</span>
          </div>
        </div>

        <!-- Bloque 2 Activación -->
        <div style="background: #031820; border: 1px solid #06b6d4; border-radius: 6px; padding: 6px; margin-bottom: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 7pt; font-weight: 800; color: #22d3ee;">BLOQUE 2: ACTIVACIÓN &amp; CORE (1 Ejercicio)</span>
            <span class="m-btn m-btn-slate" style="font-size: 6pt;">+ Agregar Ejercicio</span>
          </div>
          <div style="background: #06222b; border: 1px solid #1e293b; border-radius: 4px; padding: 5px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: #fff; font-size: 7.5pt;">Plancha Copenhague + Saltos al Cajón con Pausa</strong>
              <div style="font-size: 6pt; color: #94a3b8;">Indicación: 3 series de 20s de plancha y 4 saltos con recepción amortiguada.</div>
            </div>
            <span class="m-tag m-tag-blue">🎬 Video cargado</span>
          </div>
        </div>

        <!-- Bloque 3 Desarrollo -->
        <div style="background: #201402; border: 1px solid #f59e0b; border-radius: 6px; padding: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 7pt; font-weight: 800; color: #fbbf24;">BLOQUE 3: DESARROLLO PRINCIPAL (Series y Cargas)</span>
            <span class="m-btn m-btn-slate" style="font-size: 6pt;">+ Agregar Ejercicio</span>
          </div>
          <div style="background: #2d1e05; border: 1px solid #1e293b; border-radius: 4px; padding: 5px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #fff; font-size: 7.5pt;">Sentadilla Trasera con Barra (Back Squat)</strong>
                <div style="font-size: 6pt; color: #fde68a;">Indicación: 4 series de 6 reps | RIR Objetivo: 2 | Tempo 3010 | 2.5 min descanso</div>
              </div>
              <div style="display: flex; gap: 4px;">
                <span class="m-tag m-tag-amber">4 Series</span>
                <span class="m-tag m-tag-blue">🎬 Video</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PÁGINA 6: PROTOCOLO DE DECISIÓN DEL ENTRENADOR -->
    <div class="page-break"></div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      ${LOGO_SVG_LIGHT}
      <span style="font-size: 7.5pt; color: #64748b; font-weight: 700;">MANUAL DEL ENTRENADOR • PARTE 5</span>
    </div>

    <h1 class="sec-title">
      <span>5. Protocolo de Acción y Buenas Prácticas</span>
      <span class="badge badge-blue">Guía Rápida</span>
    </h1>

    <h2 class="sub-title">5.1. Matriz de Reacción ante Estados y Alertas</h2>
    <table class="doc-table">
      <thead>
        <tr>
          <th style="width: 20%;">Evento Detectado</th>
          <th style="width: 25%;">Señal en el Panel</th>
          <th style="width: 55%;">Acción Recomendada para Matías</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Nuevo alumno registrado</strong></td>
          <td>Badge naranja <code>PENDIENTE</code> en la tabla.</td>
          <td>Revisar el objetivo y responder el mensaje automático que llega a WhatsApp para coordinar el pago. Una vez confirmado, presionar el botón para pasar a <code>ACTIVO</code>.</td>
        </tr>
        <tr>
          <td><strong>🚨 Alerta Roja de Fatiga</strong></td>
          <td>Badge rojo parpadeante en columna Bienestar.</td>
          <td>Abrir la ficha del alumno, chequear el historial de check-ins y programar una <strong>semana de descarga (Deload)</strong> bajando volumen y exigencia.</td>
        </tr>
        <tr>
          <td><strong>⚠️ Alerta Amarilla de Estrés</strong></td>
          <td>Badge amarillo en tabla y ficha técnica.</td>
          <td>El deportista tuvo una sesión con estrés o cansancio reciente. Mantener la intensidad pero recordar pautas de hidratación y sueño.</td>
        </tr>
        <tr>
          <td><strong>Alerta en Test de Bienestar</strong></td>
          <td>Nivel <em>En Alerta</em> (&lt;50 puntos en bienestar mental).</td>
          <td>Revisar los comentarios que dejó el alumno al pie del test. Ofrecerle una charla breve de apoyo o flexibilizar los días de entreno.</td>
        </tr>
        <tr>
          <td><strong>Alumno inactivo (En desuso)</strong></td>
          <td>Filtro <em>En Desuso</em> en la barra de herramientas.</td>
          <td>Si el alumno ya no entrena, Matías puede archivar sus rutinas o purgar el usuario para mantener la base de datos limpia.</td>
        </tr>
      </tbody>
    </table>

    <div class="footer-bar">
      <span>MOTION LAB • Manual de Operaciones del Personal Trainer</span>
      <span>Página de Cierre Administrativo</span>
    </div>
  `;
}
