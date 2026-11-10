/**
 * ========================================================================
 * GENERADOR MAESTRO DE MANUALES MOTION LAB (scripts/build-manuals.mjs)
 * ========================================================================
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const LOGO_SVG = `
  <div style="display: flex; align-items: center; gap: 10px;">
    <svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 38px; height: auto;">
      <path d="M18 8Q18 4 22 4H36L62 76H44Z" fill="#0B5CFF" />
      <path d="M48 8Q48 4 52 4H66L92 76H74Z" fill="#071A45" />
      <circle cx="20" cy="68" r="12" fill="#071A45" />
      <circle cx="90" cy="14" r="12" fill="#0B5CFF" />
    </svg>
    <div style="display: flex; flex-direction: column; line-height: 1;">
      <span style="font-size: 15pt; font-weight: 900; letter-spacing: 0.12em; color: #ffffff; text-transform: uppercase;">
        MOTION <span style="color: #0ea5e9; border-bottom: 2px solid #0ea5e9;">LAB</span>
      </span>
      <span style="font-size: 5.5pt; font-weight: 700; letter-spacing: 0.18em; color: #94a3b8; text-transform: uppercase; margin-top: 3px;">
        Preparación Física &amp; Rendimiento
      </span>
    </div>
  </div>
`;

const LOGO_SVG_LIGHT = `
  <div style="display: flex; align-items: center; gap: 10px;">
    <svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 36px; height: auto;">
      <path d="M18 8Q18 4 22 4H36L62 76H44Z" fill="#0B5CFF" />
      <path d="M48 8Q48 4 52 4H66L92 76H74Z" fill="#071A45" />
      <circle cx="20" cy="68" r="12" fill="#071A45" />
      <circle cx="90" cy="14" r="12" fill="#0B5CFF" />
    </svg>
    <div style="display: flex; flex-direction: column; line-height: 1;">
      <span style="font-size: 14pt; font-weight: 900; letter-spacing: 0.12em; color: #071a45; text-transform: uppercase;">
        MOTION <span style="color: #0284c7; border-bottom: 2px solid #0284c7;">LAB</span>
      </span>
      <span style="font-size: 5.5pt; font-weight: 700; letter-spacing: 0.18em; color: #64748b; text-transform: uppercase; margin-top: 3px;">
        Preparación Física &amp; Rendimiento
      </span>
    </div>
  </div>
`;

const CSS_STYLES = `
  @page {
    size: A4;
    margin: 12mm 10mm 12mm 10mm;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
    color: #0f172a;
    background-color: #ffffff;
    font-size: 9pt;
    line-height: 1.45;
  }

  .page-break { page-break-before: always; }
  .avoid-break { page-break-inside: avoid; }

  /* PORTADA */
  .cover {
    min-height: 255mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 24mm 16mm 16mm 16mm;
    background: linear-gradient(145deg, #020617 0%, #071530 50%, #032050 100%);
    color: #ffffff;
    border-radius: 10px;
    position: relative;
    overflow: hidden;
  }

  .cover-glow {
    position: absolute;
    top: -100px;
    right: -100px;
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, rgba(2, 6, 23, 0) 70%);
  }

  .badge-pill {
    display: inline-block;
    padding: 5px 12px;
    background: rgba(14, 165, 233, 0.15);
    border: 1px solid rgba(14, 165, 233, 0.4);
    color: #38bdf8;
    border-radius: 999px;
    font-size: 8pt;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  .cover-title {
    font-size: 25pt;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin-bottom: 12px;
  }

  .cover-subtitle {
    font-size: 11pt;
    color: #94a3b8;
    font-weight: 500;
    max-width: 540px;
    line-height: 1.4;
  }

  .cover-meta {
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    padding-top: 12px;
    display: flex;
    justify-content: space-between;
    font-size: 8pt;
    color: #94a3b8;
  }

  /* ENCABEZADOS */
  h1.sec-title {
    font-size: 15pt;
    font-weight: 900;
    color: #071a45;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 5px;
    margin-top: 4px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h2.sub-title {
    font-size: 11pt;
    font-weight: 800;
    color: #0f172a;
    margin-top: 12px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  p {
    margin-bottom: 7px;
    color: #334155;
    text-align: justify;
  }

  /* CAJAS CALLOUT */
  .callout {
    padding: 8px 12px;
    border-radius: 6px;
    margin: 8px 0;
    font-size: 8.5pt;
    line-height: 1.4;
    border-left: 3.5px solid;
    page-break-inside: avoid;
  }

  .callout-info { background: #f0f9ff; border-color: #0284c7; color: #0369a1; }
  .callout-warn { background: #fffbeb; border-color: #f59e0b; color: #b45309; }
  .callout-alert { background: #fef2f2; border-color: #ef4444; color: #b91c1c; }
  .callout-success { background: #f0fdf4; border-color: #10b981; color: #047857; }

  /* TABLAS */
  table.doc-table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 8pt;
    page-break-inside: avoid;
  }

  table.doc-table th {
    background: #0f172a;
    color: #ffffff;
    font-weight: 700;
    text-align: left;
    padding: 6px 8px;
    font-size: 7.5pt;
    text-transform: uppercase;
  }

  table.doc-table td {
    padding: 5px 8px;
    border-bottom: 1px solid #e2e8f0;
    color: #334155;
    vertical-align: top;
  }

  table.doc-table tr:nth-child(even) td {
    background-color: #f8fafc;
  }

  /* BADGES */
  .badge {
    display: inline-block;
    padding: 1.5px 6px;
    border-radius: 4px;
    font-size: 7pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .badge-blue { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
  .badge-green { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
  .badge-amber { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
  .badge-red { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }

  /* MOCKUPS VECTORIALES */
  .mockup-box {
    background: #080e1a;
    border: 1px solid #1e293b;
    border-radius: 8px;
    margin: 8px 0 12px 0;
    overflow: hidden;
    color: #f8fafc;
    page-break-inside: avoid;
    box-shadow: 0 4px 14px rgba(0,0,0,0.2);
  }

  .mockup-topbar {
    background: #030712;
    padding: 5px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #1e293b;
    font-size: 7pt;
    color: #94a3b8;
  }

  .mockup-dots { display: flex; gap: 4px; }
  .mockup-dot { width: 7px; height: 7px; border-radius: 50%; }
  .dot-r { background: #ef4444; }
  .dot-y { background: #f59e0b; }
  .dot-g { background: #10b981; }

  .mockup-inner { padding: 10px; font-size: 7.5pt; }

  .m-row { display: flex; gap: 8px; align-items: center; }
  .m-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .m-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .m-grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px; }
  .m-grid-5 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr; gap: 5px; }

  .m-card {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 6px;
    padding: 6px 8px;
  }

  .m-tag {
    font-size: 6.5pt;
    padding: 1px 5px;
    border-radius: 3px;
    font-weight: 700;
    text-transform: uppercase;
  }
  .m-tag-blue { background: rgba(14,165,233,0.15); color: #38bdf8; border: 1px solid rgba(14,165,233,0.3); }
  .m-tag-green { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
  .m-tag-amber { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
  .m-tag-red { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }

  .m-btn {
    padding: 3px 7px;
    border-radius: 4px;
    font-size: 6.8pt;
    font-weight: 800;
    text-align: center;
    display: inline-block;
  }
  .m-btn-sky { background: #0284c7; color: #ffffff; }
  .m-btn-green { background: #10b981; color: #ffffff; }
  .m-btn-amber { background: #f59e0b; color: #020617; }
  .m-btn-slate { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; }
  .m-btn-red { background: #dc2626; color: #ffffff; }

  .m-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 6px;
    font-size: 7pt;
  }
  .m-table th {
    background: #090f1d;
    color: #94a3b8;
    text-transform: uppercase;
    font-size: 6pt;
    padding: 4px 6px;
    text-align: left;
    border-bottom: 1px solid #1e293b;
  }
  .m-table td {
    padding: 5px 6px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    color: #e2e8f0;
  }

  /* LISTA DE PASOS */
  .step-row {
    display: flex;
    gap: 8px;
    margin-bottom: 6px;
    page-break-inside: avoid;
  }

  .step-num {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #0284c7;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 7.5pt;
    font-weight: 800;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .step-text { flex: 1; font-size: 8.5pt; }

  /* FOOTER PAGINA */
  .page-footer {
    border-top: 1px solid #e2e8f0;
    padding-top: 5px;
    margin-top: 14px;
    display: flex;
    justify-content: space-between;
    font-size: 7pt;
    color: #94a3b8;
  }
`;

export { EDGE_PATH, LOGO_SVG, LOGO_SVG_LIGHT, CSS_STYLES };
