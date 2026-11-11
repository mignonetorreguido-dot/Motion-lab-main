/**
 * ========================================================================
 * COMPILADOR FINAL DE MANUALES EN PDF (scripts/compile-manuals.mjs)
 * ========================================================================
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { EDGE_PATH, LOGO_SVG, LOGO_SVG_LIGHT, CSS_STYLES } from './build-manuals.mjs';
import { getTrainerManualHTML } from './content-trainer.mjs';
import { getStudentManualHTML } from './content-student.mjs';

function buildHTML(bodyContent, title) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    ${CSS_STYLES}
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
}

function getMasterCoverHTML() {
  return `
    <div class="cover">
      <div class="cover-glow"></div>
      
      <div class="cover-logo">
        ${LOGO_SVG}
      </div>

      <div>
        <span class="badge-pill">Documentación Integral Oficial</span>
        <h1 class="cover-title">Manual Completo de la Plataforma Motion Lab</h1>
        <p class="cover-subtitle">
          Manual integral maestro que reúne la guía completa de operaciones para el Personal Trainer (Administrador) y la guía paso a paso de uso de la aplicación para el Alumno / Deportista.
        </p>
      </div>

      <div class="cover-meta">
        <div><strong>Plataforma:</strong> Motion Lab App v1.0</div>
        <div><strong>Contenido:</strong> Entrenador + Alumno (2 Manuales en 1)</div>
        <div><strong>Coach Responsable:</strong> Matías</div>
        <div><strong>Fecha:</strong> Noviembre 2026</div>
      </div>
    </div>

    <!-- PÁGINA 2: ÍNDICE GENERAL DEL MANUAL COMPLETO -->
    <div class="page-break"></div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      ${LOGO_SVG_LIGHT}
      <span style="font-size: 7.5pt; color: #64748b; font-weight: 700;">ÍNDICE GENERAL MAESTRO</span>
    </div>

    <h1 class="sec-title">
      <span>Índice General de Contenidos</span>
      <span class="badge badge-blue">Estructura Global</span>
    </h1>

    <div class="m-grid-2" style="margin-top: 14px; gap: 14px;">
      <!-- Columna 1: Entrenador -->
      <div style="background: #f8fafc; border: 1.5px solid #0284c7; border-radius: 8px; padding: 12px;">
        <span class="badge badge-blue">PARTE I: MANUAL DEL PERSONAL TRAINER</span>
        <h3 style="font-size: 11pt; color: #071a45; margin: 8px 0 6px 0;">Panel Administrativo &amp; Coaching</h3>
        <ul style="padding-left: 14px; font-size: 8.5pt; color: #334155; line-height: 1.6;">
          <li><strong>1. Resumen Ejecutivo y Seguridad:</strong> Roles, login con PIN, Modo Soleado / Noche.</li>
          <li><strong>2. Dashboard Central (/admin):</strong> Métricas en tiempo real, barra de filtros, buscador y tabla de alumnos.</li>
          <li><strong>3. Acciones Rápidas del Admin:</strong> Botón "+ Nuevo Alumno", "Limpiar Rutinas Viejas", toggle de pago (1 clic).</li>
          <li><strong>4. Ficha Técnica y Diagnóstico:</strong> RMs, lesiones previas, edición en caliente y doble verificación de eliminación.</li>
          <li><strong>5. Monitoreo Psico-Físico (UX):</strong> Alertas rojas y amarillas de fatiga, historial de check-ins.</li>
          <li><strong>6. Chequeo de Salud Mental:</strong> Gráfico de 5 dimensiones y recomendaciones.</li>
          <li><strong>7. Constructor de Rutinas (RoutineBuilder):</strong> Metodología de 3 bloques, clonar días e importar rutinas.</li>
          <li><strong>8. Protocolo de Acción:</strong> Matriz de reacción táctica para Matías.</li>
        </ul>
      </div>

      <!-- Columna 2: Alumno -->
      <div style="background: #f8fafc; border: 1.5px solid #10b981; border-radius: 8px; padding: 12px;">
        <span class="badge badge-green">PARTE II: MANUAL DEL ALUMNO</span>
        <h3 style="font-size: 11pt; color: #064e3b; margin: 8px 0 6px 0;">Guía del Deportista en la App</h3>
        <ul style="padding-left: 14px; font-size: 8.5pt; color: #334155; line-height: 1.6;">
          <li><strong>1. Onboarding en 6 Pasos (/onboarding):</strong> Diagnóstico inicial y contacto con Matías.</li>
          <li><strong>2. Ingreso y Activación:</strong> Login seguro y estado de suscripción.</li>
          <li><strong>3. Hub Semanal (/entrenamiento):</strong> Entrenamiento de hoy, selector de días y días completados.</li>
          <li><strong>4. Modo Soleado:</strong> Alto contraste para entrenar bajo la luz solar al aire libre.</li>
          <li><strong>5. Check-in Pre-Entrenamiento:</strong> Energía inicial, ánimo y descanso en 3 clics.</li>
          <li><strong>6. La Sesión en los 3 Bloques:</strong> Movilidad, Activación y registro de Kilos/Reps/RIR en Desarrollo.</li>
          <li><strong>7. Check-in Post-Entrenamiento:</strong> Esfuerzo RPE (1 al 10), sensación anímica y guardado de sesión.</li>
          <li><strong>8. Chequeo de Bienestar Semanal:</strong> Test de 10 preguntas y consejos.</li>
          <li><strong>9. Wearables y Smartwatches:</strong> Vinculación por Google Fit, Junction e importación de Apple Health.</li>
        </ul>
      </div>
    </div>

    <div class="callout callout-info" style="margin-top: 18px;">
      <strong>Orientación del Manual:</strong> Este documento unificado permite una sincronización total entre la metodología de prescripción del entrenador y la experiencia de uso del alumno en su celular o computadora.
    </div>
  `;
}

async function renderPDF(htmlPath, pdfPath) {
  const normHtml = htmlPath.replace(/\\/g, '/');
  const cmd = `"${EDGE_PATH}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "file:///${normHtml}"`;
  console.log(`Exportando PDF: ${path.basename(pdfPath)}...`);
  execSync(cmd, { stdio: 'pipe' });
  const size = fs.statSync(pdfPath).size;
  console.log(`✓ Creado: ${path.basename(pdfPath)} (${(size / 1024).toFixed(1)} KB)`);
}

async function main() {
  const outputDir = path.resolve('.');

  // 1. Manual Personal Trainer (Admin)
  const trainerHTML = buildHTML(getTrainerManualHTML(), 'Manual del Personal Trainer - Motion Lab');
  const trainerHtmlPath = path.join(outputDir, 'manual-trainer.html');
  const trainerPdfPath = path.join(outputDir, 'Manual_Personal_Trainer_Motion_Lab.pdf');
  fs.writeFileSync(trainerHtmlPath, trainerHTML, 'utf8');
  await renderPDF(trainerHtmlPath, trainerPdfPath);
  fs.unlinkSync(trainerHtmlPath);

  // 2. Manual Usuario / Alumno
  const studentHTML = buildHTML(getStudentManualHTML(), 'Manual del Alumno - Motion Lab');
  const studentHtmlPath = path.join(outputDir, 'manual-student.html');
  const studentPdfPath = path.join(outputDir, 'Manual_Usuario_Alumno_Motion_Lab.pdf');
  fs.writeFileSync(studentHtmlPath, studentHTML, 'utf8');
  await renderPDF(studentHtmlPath, studentPdfPath);
  fs.unlinkSync(studentHtmlPath);

  // 3. Manual Completo Unificado
  const unifiedBody = `
    ${getMasterCoverHTML()}
    <div class="page-break"></div>
    ${getTrainerManualHTML()}
    <div class="page-break"></div>
    ${getStudentManualHTML()}
  `;
  const masterHTML = buildHTML(unifiedBody, 'Manual Completo Motion Lab (Trainer + Alumno)');
  const masterHtmlPath = path.join(outputDir, 'manual-completo.html');
  const masterPdfPath = path.join(outputDir, 'Manual_Completo_Motion_Lab.pdf');
  fs.writeFileSync(masterHtmlPath, masterHTML, 'utf8');
  await renderPDF(masterHtmlPath, masterPdfPath);
  fs.unlinkSync(masterHtmlPath);

  console.log('\n¡Todos los manuales PDF han sido compilados con éxito!');
}

main().catch((err) => {
  console.error('Error durante la compilación:', err);
  process.exit(1);
});
