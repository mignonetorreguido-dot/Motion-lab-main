import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

PDF_FILENAME = "Manual_Oficial_Entrenador_Motion_Lab.pdf"

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        self.saveState()
        # Footer
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#00d2ff"))
        self.drawString(54, 34, "MOTION LAB")
        
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(115, 34, "|   Manual Oficial para el Entrenador   |   Desarrollado por FLEG TECH (2026)")
        
        page_str = f"Página {self._pageNumber} de {total_pages}"
        self.drawRightString(612 - 54, 34, page_str)

        # Header (except on page 1)
        if self._pageNumber > 1:
            self.setStrokeColor(colors.HexColor("#1e293b"))
            self.setLineWidth(0.5)
            self.line(54, 792 - 40, 612 - 54, 792 - 40)
            
            self.setFont("Helvetica-Bold", 7.5)
            self.setFillColor(colors.HexColor("#94a3b8"))
            self.drawString(54, 792 - 34, "FLEG TECH  ·  MOTION LAB v1.0")
            self.drawRightString(612 - 54, 792 - 34, "SISTEMA TÁCTICO DE PLANIFICACIÓN & ENTRENAMIENTO")

        self.restoreState()

def build_pdf():
    doc = SimpleDocTemplate(
        PDF_FILENAME,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    c_primary = colors.HexColor("#00d2ff")
    c_navy_dark = colors.HexColor("#080c14")
    c_card_bg = colors.HexColor("#0d1527")
    c_text_main = colors.HexColor("#0f172a")
    c_text_muted = colors.HexColor("#475569")
    c_border = colors.HexColor("#cbd5e1")

    title_cover = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=8
    )

    subtitle_cover = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=18,
        textColor=colors.HexColor("#0284c7"),
        spaceAfter=20
    )

    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=17,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0284c7"),
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14.5,
        textColor=c_text_main,
        spaceAfter=7
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    box_text = ParagraphStyle(
        'BoxText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=13,
        textColor=colors.HexColor("#1e293b")
    )

    story = []

    # =========================================================================
    # PORTADA
    # =========================================================================
    story.append(Spacer(1, 20))
    badge_cover = Table(
        [[Paragraph("<b>SISTEMA DE GESTIÓN & ENTRENAMIENTO DE ÉLITE</b>", ParagraphStyle('Bdg', fontName='Helvetica-Bold', fontSize=8, textColor=colors.HexColor("#0284c7")))]],
        colWidths=[504]
    )
    badge_cover.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#e0f2fe")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(badge_cover)
    story.append(Spacer(1, 15))

    story.append(Paragraph("MOTION LAB", title_cover))
    story.append(Paragraph("Manual Oficial de Operaciones para el Entrenador (Personal Trainer)", subtitle_cover))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0284c7"), spaceAfter=15))

    meta_table = Table([
        [Paragraph("<b>Cliente / Entrenador:</b>", body_style), Paragraph("Prof. Matías (Preparación Física & Rendimiento)", body_style)],
        [Paragraph("<b>Desarrollado por:</b>", body_style), Paragraph("FLEG TECH (Luciano Molina, Elías Baltazar, Guido Mignone, Facundo Romero)", body_style)],
        [Paragraph("<b>Versión del Software:</b>", body_style), Paragraph("v1.0 Producción (Next.js 14, Tailwind CSS, PostgreSQL)", body_style)],
        [Paragraph("<b>Fecha de Lanzamiento:</b>", body_style), Paragraph("Noviembre 2026", body_style)],
        [Paragraph("<b>Entorno Web:</b>", body_style), Paragraph("motion-lab-preparacion-fisica-y-rendimiento.vercel.app", body_style)]
    ], colWidths=[150, 354])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 7),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))

    aviso_box = Table([[
        Paragraph(
            "<b>Aviso Médico & Responsabilidad:</b> Motion Lab es una plataforma tecnológica de prescripción y seguimiento de entrenamiento. Las rutinas, cargas y dosificaciones son responsabilidad exclusiva del profesional a cargo. Se recomienda realizar evaluaciones médicas periódicas a todos los atletas antes de someterlos a planes de alta exigencia neuromuscular.",
            box_text
        )
    ]], colWidths=[504])
    aviso_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#fef2f2")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#fecaca")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(aviso_box)
    story.append(Spacer(1, 20))

    # =========================================================================
    # SECCIÓN 1: PRIMEROS PASOS Y AUTENTICACIÓN
    # =========================================================================
    story.append(Paragraph("1. Primeros Pasos y Autenticación Segura", h1_style))
    story.append(Paragraph(
        "Motion Lab ha sido estructurado con los más rigurosos estándares de seguridad y separación de roles. No existen accesos demo vulnerables ni credenciales expuestas en frontend.",
        body_style
    ))
    story.append(Paragraph("<b>• Acceso Oficial al Sistema:</b> Navega a la URL oficial y dirígete a la pantalla de <code>/login</code>.", bullet_style))
    story.append(Paragraph("<b>• Credenciales del Entrenador:</b> Ingreso mediante correo electrónico corporativo y contraseña encriptada con <code>bcrypt</code>, o autenticación rápida y segura con Google OAuth corporativo.", bullet_style))
    story.append(Paragraph("<b>• Rol y Permisos:</b> Al ingresar como Administrador/Entrenador, el sistema carga de forma reactiva la consola táctica de gestión deportiva y el shell de Matías.", bullet_style))
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECCIÓN 2: PANEL GENERAL Y GESTIÓN DE ATLETAS
    # =========================================================================
    story.append(Paragraph("2. Panel General y Gestión de Alumnos", h1_style))
    story.append(Paragraph(
        "El Dashboard principal proporciona una visión integral 360° del estado de todos los alumnos bajo tu supervisión.",
        body_style
    ))
    story.append(Paragraph("<b>• Lista Centralizada de Atletas:</b> Visualiza nombre, correo, fecha de inicio, objetivo principal (fuerza, hipertrofia, reacondicionamiento, etc.) y estado de actividad.", bullet_style))
    story.append(Paragraph("<b>• Alta de Nuevo Alumno:</b> Pulsa el botón de incorporación para registrar nuevos atletas, asignándoles su ficha de salud y datos antropométricos.", bullet_style))
    story.append(Paragraph("<b>• Asignación Directa de Rutinas:</b> Cada tarjeta de alumno cuenta con acceso directo al <i>Constructor de Rutinas</i>, permitiéndote abrir su microciclo actual o cargar uno nuevo en segundos.", bullet_style))
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECCIÓN 3: GUÍA MAESTRA DEL CONSTRUCTOR DE RUTINAS
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("3. Guía Maestra del Constructor de Rutinas (Flujo Desacoplado)", h1_style))
    story.append(Paragraph(
        "El núcleo operativo de Motion Lab fue rediseñado bajo una arquitectura de <b>dos vistas independientes</b> que maximiza el espacio de trabajo, elimina distracciones y acelera drásticamente la carga de entrenamientos.",
        body_style
    ))
    
    story.append(Paragraph("3.1 Dashboard de Planificación (Vista Cuadrícula de 5 Días)", h2_style))
    story.append(Paragraph("<b>• Disposición en 5 Columnas Horizontales:</b> En desktop, los días de entrenamiento se presentan en una cuadrícula fija de 5 columnas (Día 1 a Día 5). Si tu microciclo tiene 6 o 7 días, fluyen automáticamente a la siguiente fila sin alterar el espaciado.", bullet_style))
    story.append(Paragraph("<b>• Indicadores de Estado por Día:</b> Cada tarjeta exhibe:", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;- Badge de identificación (<code>DÍA 1</code>, <code>DÍA 2</code>, etc.) e ícono para reordenar por arrastre (drag-and-drop).", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;- Botones rápidos para <b>Duplicar día completo</b> (ícono copiar) o <b>Eliminar día</b> (ícono papelera).", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;- Título y enfoque técnico del día.", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;- Indicador de 3 puntos de colores (Azul: Movilidad, Cian: Activación, Ámbar: Fuerza) y contador total de ejercicios.", bullet_style))
    story.append(Paragraph("<b>• Tarjeta '+ AÑADIR DÍA':</b> Siempre ubicada en la última posición del grid, con borde punteado y botón circular para sumar un nuevo día con un solo click.", bullet_style))
    story.append(Paragraph("<b>• Apertura de Detalle:</b> Al hacer click en cualquier tarjeta de día, la cuadrícula se oculta suavemente y se abre la vista exclusiva de edición de ese día.", bullet_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph("3.2 Vista Edición de Día y Bloques de Entrenamiento", h2_style))
    story.append(Paragraph("<b>• Botón Superior de Retorno:</b> En la esquina superior izquierda se destaca el botón <code>← Volver a la cuadrícula de días</code>. Te permite regresar al dashboard general en cualquier momento, conservando el 100% de los datos ingresados en memoria.", bullet_style))
    story.append(Paragraph("<b>• Formulario Superior del Día:</b> Campos para <i>Nombre del Día</i> (ej: 'Día 1: Tren Inferior Fuerza') y <i>Enfoque / Descripción</i> (ej: 'Dominante de rodilla y activación neural'), adaptados a 2 columnas en desktop y 1 columna en móvil.", bullet_style))
    story.append(Paragraph("<b>• 3 Bloques Metodológicos Estructurados:</b>", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1. <b>Bloque 1: MOVILIDAD</b> (Amplitud articular, 90/90, tobillo, disociación torácica).", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2. <b>Bloque 2: ACTIVACIÓN</b> (Activación neural, core antirrotacional, glúteo medio, copenhague).", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3. <b>Bloque 3: FUERZA / DESARROLLO</b> (Sobrecarga progresiva, sentadillas, peso muerto, empujes, tracciones).", bullet_style))
    story.append(Paragraph("<b>• Cabecera Limpia:</b> Cada bloque muestra su título, contador de ejercicios y a la derecha el botón <code>+ Añadir Vacío</code>.", bullet_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph("3.3 Buscador Inteligente y Creatable (ExerciseCombobox)", h2_style))
    story.append(Paragraph(
        "El input de ejercicio cuenta con autocompletado predictivo de última generación:",
        body_style
    ))
    story.append(Paragraph("<b>• Despliegue Instantáneo:</b> Al hacer focus o click en el campo, se abre un menú flotante con los ejercicios sugeridos y el badge <code>Frecuente</code>.", bullet_style))
    story.append(Paragraph("<b>• Filtrado Reactivo Letra por Letra:</b> Al tipear (ej: 'Pre...'), filtra instantáneamente resaltando en cyan brillante las letras coincidentes.", bullet_style))
    story.append(Paragraph("<b>• Creación Libre al Vuelo (Creatable):</b> Si escribes un ejercicio nuevo o no catalogado, la última opción te permite hacer click en <code>+ Asignar '[Texto escrito]' como nuevo ejercicio</code> o presionar <code>Enter</code>. El sistema lo guarda en el historial en memoria para que esté disponible en todas tus rutinas.", bullet_style))
    story.append(Paragraph("<b>• Cero Pérdida de Datos:</b> Si escribes y haces click afuera, el texto no se borra ni se reinicia.", bullet_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph("3.4 Ajuste de Parámetros y Multimedia", h2_style))
    story.append(Paragraph("<b>• Series y Repeticiones:</b> Inputs numéricos directos y visibles (ej: <code>SERIES: 3</code> | <code>REPS: 10</code>).", bullet_style))
    story.append(Paragraph("<b>• Indicaciones Técnicas:</b> Campo inferior para asentar pautas tácticas: Tempo excéntrico (3010), RIR objetivo (RIR 1-2), pausas (90s) y notas de postura.", bullet_style))
    story.append(Paragraph("<b>• Video Demostrativo:</b> Botón <code>Video</code> para adjuntar enlaces de YouTube o MP4 con notas de ejecución que el alumno verá directamente en su pantalla.", bullet_style))
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECCIÓN 4: PREGUNTAS FRECUENTES Y BUENAS PRÁCTICAS
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("4. Preguntas Frecuentes y Buenas Prácticas Operativas", h1_style))
    
    faq_data = [
        [Paragraph("<b>¿Cómo duplico un día completo de entrenamiento?</b>", body_style)],
        [Paragraph("En la Vista Cuadrícula, pulsa el ícono de las dos hojas superpuestas (copiar) en la esquina superior de la tarjeta del día. Se creará un clon exacto con todos los bloques y ejercicios listos para editar.", box_text)],
        [Paragraph("<b>¿Cómo cambio el orden de los días de la semana?</b>", body_style)],
        [Paragraph("Toma la tarjeta desde el ícono de los 6 puntos (grip) y arrástrala hacia la posición deseada. El sistema recalcula la secuencia automáticamente.", box_text)],
        [Paragraph("<b>¿Qué pasa si mi atleta entrena desde el celular?</b>", body_style)],
        [Paragraph("Motion Lab está diseñado 100% Mobile-First. Tu alumno no necesita descargar nada de app stores pesadas: abre el enlace en su navegador móvil, marca series completadas y lee tus notas con total fluidez.", box_text)],
        [Paragraph("<b>¿Cómo guardo la rutina terminada?</b>", body_style)],
        [Paragraph("Al finalizar tu armado en cualquier vista, pulsa el botón principal <b>'Guardar y Asignar'</b> en el pie de página. Todos los días y bloques se almacenan en la base de datos de PostgreSQL al instante.", box_text)],
    ]
    faq_table = Table(faq_data, colWidths=[504])
    faq_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(faq_table)
    story.append(Spacer(1, 20))

    # Cierre institucional
    cierre_box = Table([[
        Paragraph(
            "<b>Soporte Técnico & Evolución Continua:</b><br/>"
            "Motion Lab es una solución tecnológica desarrollada a medida por <b>FLEG TECH</b> para la marca y metodología del Prof. Matías. Ante cualquier consulta operativa o solicitud de nuevas funcionalidades, comunícate con el equipo de ingeniería de FLEG TECH.<br/><br/>"
            "© 2026 FLEG TECH · Luciano Molina · Elías Baltazar · Guido Mignone · Facundo Romero.",
            box_text
        )
    ]], colWidths=[504])
    cierre_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0fdf4")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#bbf7d0")),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(cierre_box)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Manual generado con éxito: {PDF_FILENAME}")

if __name__ == "__main__":
    build_pdf()
