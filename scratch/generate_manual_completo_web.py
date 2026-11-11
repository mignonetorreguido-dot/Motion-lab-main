import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

PDF_FILENAME = "Manual_Completo_Oficial_Motion_Lab.pdf"

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
        self.setFillColor(colors.HexColor("#0284c7"))
        self.drawString(54, 32, "MOTION LAB")
        
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(115, 32, "|   Manual Integral de la Plataforma Web   |   FLEG TECH (2026)")
        
        page_str = f"Página {self._pageNumber} de {total_pages}"
        self.drawRightString(612 - 54, 32, page_str)

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 792 - 38, 612 - 54, 792 - 38)
            
            self.setFont("Helvetica-Bold", 7.5)
            self.setFillColor(colors.HexColor("#0284c7"))
            self.drawString(54, 792 - 32, "FLEG TECH  ·  MOTION LAB v1.0")
            self.setFont("Helvetica", 7.5)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawRightString(612 - 54, 792 - 32, "MANUAL OFICIAL DE OPERACIONES (ENTRENADOR & ALUMNO)")

        self.restoreState()

def build_pdf():
    doc = SimpleDocTemplate(
        PDF_FILENAME,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()
    
    title_cover = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=6
    )

    subtitle_cover = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=colors.HexColor("#0284c7"),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#0284c7"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    box_text = ParagraphStyle(
        'BoxText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=12,
        textColor=colors.HexColor("#1e293b")
    )

    story = []

    # =========================================================================
    # PORTADA
    # =========================================================================
    story.append(Spacer(1, 15))
    badge_cover = Table(
        [[Paragraph("<b>ECOSISTEMA INTEGRAL DE RENDIMIENTO & PREPARACIÓN FÍSICA</b>", ParagraphStyle('Bdg', fontName='Helvetica-Bold', fontSize=8, textColor=colors.HexColor("#0284c7")))]],
        colWidths=[504]
    )
    badge_cover.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#e0f2fe")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(badge_cover)
    story.append(Spacer(1, 12))

    story.append(Paragraph("MOTION LAB", title_cover))
    story.append(Paragraph("Manual Completo de Operaciones de Toda la Plataforma Web", subtitle_cover))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0284c7"), spaceAfter=12))

    meta_table = Table([
        [Paragraph("<b>Cliente / Entrenador Principal:</b>", body_style), Paragraph("Prof. Matías (Preparador Físico de Alto Rendimiento)", body_style)],
        [Paragraph("<b>Firma de Desarrollo:</b>", body_style), Paragraph("FLEG TECH (Luciano Molina, Elías Baltazar, Guido Mignone, Facundo Romero)", body_style)],
        [Paragraph("<b>Arquitectura Tecnológica:</b>", body_style), Paragraph("Next.js 14 (App Router), Tailwind CSS, PostgreSQL, Prisma ORM, Auth.js", body_style)],
        [Paragraph("<b>Versión & Estado:</b>", body_style), Paragraph("Versión 1.0 Oficial · Producción Activa", body_style)],
        [Paragraph("<b>Despliegue Web Oficial:</b>", body_style), Paragraph("motion-lab-preparacion-fisica-y-rendimiento.vercel.app", body_style)]
    ], colWidths=[160, 344])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    aviso_box = Table([[
        Paragraph(
            "<b>Aviso Médico & Marco de Seguridad Legal:</b> Motion Lab es un sistema digital de prescripción deportiva y monitoreo biométrico. El uso de la plataforma requiere que cada atleta cuente con apto médico vigente. La dosificación de cargas, intensidades y descansos son responsabilidad técnica del entrenador profesional a cargo.",
            box_text
        )
    ]], colWidths=[504])
    aviso_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#fef2f2")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#fecaca")),
        ('PADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(aviso_box)
    story.append(Spacer(1, 15))

    # =========================================================================
    # ÍNDICE GENERAL DEL MANUAL
    # =========================================================================
    story.append(Paragraph("Estructura General de la Plataforma", h1_style))
    indice_data = [
        [Paragraph("<b>Módulo 1: Portada Institucional y Landing (/)</b>", body_style), Paragraph("Presentación del método de Matías, propuesta de valor y planes.", body_style)],
        [Paragraph("<b>Módulo 2: Autenticación & Seguridad Oficial (/login)</b>", body_style), Paragraph("Acceso blindado, Google OAuth, credenciales sin cuentas demo.", body_style)],
        [Paragraph("<b>Módulo 3: Panel del Entrenador (/admin)</b>", body_style), Paragraph("Dashboard central, gestión de alumnos, altas, cobros y perfiles.", body_style)],
        [Paragraph("<b>Módulo 4: Constructor Táctico de Rutinas (RoutineBuilder)</b>", body_style), Paragraph("Grilla de 5 días, flujo desacoplado, combobox predictivo y dosificación.", body_style)],
        [Paragraph("<b>Módulo 5: Portal del Alumno / Atleta (/entrenamiento)</b>", body_style), Paragraph("Entrenamiento interactivo en vivo, check-in, series, RIR y videos.", body_style)],
        [Paragraph("<b>Módulo 6: Módulo de Bienestar Integral (/bienestar)</b>", body_style), Paragraph("Sincronización con Apple Health y Google Fit, sueño, fatiga y DOMS.", body_style)],
        [Paragraph("<b>Módulo 7: Onboarding Inicial del Deportista (/onboarding)</b>", body_style), Paragraph("Ficha deportiva, antecedentes clínicos y objetivos antropométricos.", body_style)],
        [Paragraph("<b>Módulo 8: Footer Global FLEG TECH & Respaldo Legal</b>", body_style), Paragraph("Identidad corporativa, términos, privacidad y advertencia médica.", body_style)]
    ]
    indice_table = Table(indice_data, colWidths=[200, 304])
    indice_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(indice_table)

    # =========================================================================
    # SECCIÓN 1: LANDING & PRESENTACIÓN
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("1. Portada Institucional y Landing Page (/)", h1_style))
    story.append(Paragraph(
        "La página principal de Motion Lab actúa como la tarjeta de presentación digital de máxima categoría para Matías, proyectando seriedad atlética y rigor científico.",
        body_style
    ))
    story.append(Paragraph("<b>• Hero Section & Filosofía:</b> Destaca el lema de alto rendimiento, el enfoque en biomecánica aplicada y la diferenciación del método de Matías frente al fitness convencional.", bullet_style))
    story.append(Paragraph("<b>• Presentación de Planes:</b> Sección de membresías y programas personalizados con detalle de servicios (rutinas a medida, seguimiento continuo y control biométrico).", bullet_style))
    story.append(Paragraph("<b>• Llamada a la Acción (CTA):</b> Enlaces directos para que los prospectos soliciten su evaluación o inicien sesión si ya son miembros registrados.", bullet_style))
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECCIÓN 2: AUTENTICACIÓN Y SEGURIDAD OFICIAL
    # =========================================================================
    story.append(Paragraph("2. Autenticación y Seguridad Oficial (/login)", h1_style))
    story.append(Paragraph(
        "Motion Lab cuenta con un sistema de autenticación libre de credenciales simuladas o accesos ficticios. Solo se permiten métodos legítimos que protegen la privacidad de los atletas.",
        body_style
    ))
    story.append(Paragraph("<b>• Acceso por Email & Contraseña Encriptada:</b> Almacenamiento seguro bajo hash <code>bcrypt</code>.", bullet_style))
    story.append(Paragraph("<b>• Google OAuth Oficial:</b> Inicio de sesión en un click mediante cuentas verificadas de Google.", bullet_style))
    story.append(Paragraph("<b>• Detección Automática de Roles:</b> El sistema reconoce instantáneamente si el usuario es el <b>Profesor Matías</b> (redirigiéndolo a <code>/admin</code>) o un <b>Alumno</b> (redirigiéndolo a <code>/entrenamiento</code>).", bullet_style))
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECCIÓN 3: PANEL DEL ENTRENADOR
    # =========================================================================
    story.append(Paragraph("3. Panel de Control del Entrenador (/admin)", h1_style))
    story.append(Paragraph(
        "El centro de comando exclusivo de Matías para monitorear la salud deportiva y comercial de su cartera de atletas.",
        body_style
    ))
    story.append(Paragraph("<b>• Directorio de Atletas:</b> Visualización en tarjetas de cada deportista con foto/avatar, nivel deportivo, objetivo prioritario y estado de suscripción.", bullet_style))
    story.append(Paragraph("<b>• Control de Estado de Pago:</b> Semáforo de facturación (Al día / Pendiente / Vencido) para mantener orden en la cobranza de cuotas sin fricciones.", bullet_style))
    story.append(Paragraph("<b>• Ficha Clínica & Deportiva:</b> Registro de historial de lesiones, rangos articulares limitados y observaciones específicas por alumno.", bullet_style))
    story.append(Paragraph("<b>• Botón 'Planificar Rutina':</b> Acceso con 1 click al Constructor de Rutinas con los datos del alumno precargados.", bullet_style))

    # =========================================================================
    # SECCIÓN 4: CONSTRUCTOR TÁCTICO DE RUTINAS
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("4. Constructor Táctico de Rutinas (RoutineBuilder)", h1_style))
    story.append(Paragraph(
        "El corazón de Motion Lab. Diseñado bajo un <b>flujo desacoplado en dos vistas</b> que acelera la carga de microciclos de 1 hora a menos de 5 minutos.",
        body_style
    ))
    
    story.append(Paragraph("4.1 Vista Cuadrícula (Dashboard de 5 Días)", h2_style))
    story.append(Paragraph("<b>• Grid Horizontal Fijo de 5 Columnas:</b> En desktop grande, los días de entrenamiento se alinean en 5 columnas fijas (<code>lg:grid-cols-5</code>). Si se supera esa cantidad, los días adicionales bajan a las siguientes filas.", bullet_style))
    story.append(Paragraph("<b>• Tarjeta '+ AÑADIR DÍA':</b> Siempre situada en la última posición del grid layout con borde punteado y botón circular para crear días contiguos con un solo toque.", bullet_style))
    story.append(Paragraph("<b>• Herramientas en Cada Tarjeta:</b> Grip para reordenar por arrastre, botón de duplicar día completo (clonación instantánea de bloques), botón de eliminar y contador de ejercicios.", bullet_style))
    story.append(Paragraph("<b>• Indicadores de Bloques (3 Puntos):</b> Punto azul (Movilidad), cian (Activación) y ámbar (Fuerza), permitiendo saber qué bloques ya fueron cargados.", bullet_style))

    story.append(Paragraph("4.2 Vista Edición de Día Desacoplada", h2_style))
    story.append(Paragraph("<b>• Botón de Retorno Permanente:</b> <code>← Volver a la cuadrícula de días</code> en la parte superior izquierda, regresando al dashboard sin perder datos.", bullet_style))
    story.append(Paragraph("<b>• Formulario Superior:</b> Inputs para 'Nombre del Día' y 'Enfoque / Descripción' (ej: 'Dominante de cadera y potencia').", bullet_style))
    story.append(Paragraph("<b>• 3 Bloques Metodológicos Estructurados:</b>", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;- <i>Bloque 1: MOVILIDAD</i> (Rango articular, tobillo, cadera 90/90, descompresión).", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;- <i>Bloque 2: ACTIVACIÓN</i> (Core antirrotacional, glúteo medio, copenhague, pliometría baja).", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;- <i>Bloque 3: FUERZA / DESARROLLO</i> (Sobrecarga progresiva, básicos pesados, accesorios de hipertrofia).", bullet_style))
    story.append(Paragraph("<b>• Cabecera Limpia:</b> Título del bloque con contador a la izquierda y botón <code>+ Añadir Vacío</code> a la derecha (sin barras laterales ni inyecciones molestas).", bullet_style))

    story.append(Paragraph("4.3 Buscador Predictivo Creatable (ExerciseCombobox)", h2_style))
    story.append(Paragraph("<b>• Dropdown Flotante en Focus:</b> Despliega los ejercicios frecuentes con su badge correspondiente.", bullet_style))
    story.append(Paragraph("<b>• Filtrado Reactivo con Resaltado en Cyan:</b> Al tipear 'Pre...', resalta en celeste las letras coincidentes (Prensa, Press militar, Press banca).", bullet_style))
    story.append(Paragraph("<b>• Opción Creatable:</b> Si el ejercicio no existe en catálogo, muestra <code>+ Asignar '[Texto escrito]' como nuevo ejercicio</code>. Al pulsar Enter, se asigna y se memoriza en la sesión para futuros usos.", bullet_style))
    story.append(Paragraph("<b>• Parámetros de Carga:</b> Inputs de SERIES, REPS, campo de indicación técnica (tempo, RIR, descansos) y botón <code>Video</code> para adjuntar enlaces demostrativos de YouTube.", bullet_style))

    # =========================================================================
    # SECCIÓN 5: PORTAL DEL ALUMNO / ATLETA
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("5. Portal del Alumno / Atleta (/entrenamiento)", h1_style))
    story.append(Paragraph(
        "Diseñado con filosofía 100% Mobile-First para que el deportista interactúe directamente desde su celular mientras entrena en el gimnasio.",
        body_style
    ))
    story.append(Paragraph("<b>• Check-In Diario de Disposición:</b> Escala visual para que el alumno reporte su nivel de energía, dolor muscular y horas de sueño previas a la sesión.", bullet_style))
    story.append(Paragraph("<b>• Visualización del Entrenamiento del Día:</b> Desglose secuencial de los 3 bloques con los ejercicios programados por Matías.", bullet_style))
    story.append(Paragraph("<b>• Registro Interactivo de Cargas:</b> Checkboxes para marcar cada serie cumplida, campos numéricos para anotar el peso real utilizado y el RIR percibido.", bullet_style))
    story.append(Paragraph("<b>• Reproductor de Video & Notas Técnicas:</b> Botón para ver el video explicativo y leer las indicaciones tácticas de Matías.", bullet_style))
    story.append(Paragraph("<b>• Feedback en Vivo:</b> Campo de observaciones para dejar comentarios al entrenador por ejercicio.", bullet_style))
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECCIÓN 6: BIENESTAR INTEGRAL Y WEARABLES
    # =========================================================================
    story.append(Paragraph("6. Módulo de Bienestar Integral y Wearables (/bienestar)", h1_style))
    story.append(Paragraph(
        "Permite cruzar el rendimiento del gimnasio con la recuperación biológica real del atleta fuera del entrenamiento.",
        body_style
    ))
    story.append(Paragraph("<b>• Métricas de Recuperación:</b> Registro de calidad de sueño (horas y descanso profundo), índice de fatiga percibida y nivel de dolor (DOMS).", bullet_style))
    story.append(Paragraph("<b>• Sincronización con Relojes Inteligentes:</b> Integración con Apple Health (exportación XML vía <code>fflate</code>) y Google Fit para lectura de pasos, calorías activas y pulso.", bullet_style))
    story.append(Paragraph("<b>• Detección de Sobreentrenamiento:</b> Gráficos de tendencia que alertan a Matías cuando un alumno acumula fatiga excesiva.", bullet_style))
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECCIÓN 7: ONBOARDING Y FOOTER INSTITUCIONAL
    # =========================================================================
    story.append(Paragraph("7. Onboarding Inicial y Footer Institucional FLEG TECH", h1_style))
    story.append(Paragraph("<b>• Onboarding del Alumno (/onboarding):</b> Cuestionario guiado donde el atleta carga su peso, altura, experiencia previa, lesiones pasadas y objetivos para que Matías diseñe su plan con precisión.", bullet_style))
    story.append(Paragraph("<b>• Footer Global FLEG TECH:</b> Presente obligatoriamente en todas las pantallas del sistema, garantizando identidad tecnológica de vanguardia y blindaje médico legal.", bullet_style))
    story.append(Spacer(1, 15))

    # CUADRO DE CIERRE
    cierre_table = Table([[
        Paragraph(
            "<b>PLATAFORMA OFICIAL MOTION LAB · v1.0 PRODUCCIÓN (2026)</b><br/>"
            "Desarrollada exclusivamente a medida para el <b>Prof. Matías</b> por la firma de ingeniería <b>FLEG TECH</b>.<br/>"
            "Equipo responsable: <b>Luciano Molina · Elías Baltazar · Guido Mignone · Facundo Romero</b>.<br/>"
            "Soporte continuo y evolutivo garantizado. Todos los derechos reservados.",
            box_text
        )
    ]], colWidths=[504])
    cierre_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0fdf4")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#86efac")),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(cierre_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Manual integral generado exitosamente: {PDF_FILENAME}")

if __name__ == "__main__":
    build_pdf()
