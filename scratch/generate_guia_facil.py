import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

PDF_FILENAME = "Guia_Facil_Motion_Lab.pdf"

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
        self.drawString(54, 30, "MOTION LAB")
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(115, 30, "·   Guía Rápida y Fácil de Uso   ·   FLEG TECH (2026)")
        
        page_str = f"Página {self._pageNumber} de {total_pages}"
        self.drawRightString(612 - 54, 30, page_str)

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 792 - 35, 612 - 54, 792 - 35)
            
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#0284c7"))
            self.drawString(54, 792 - 30, "MOTION LAB  ·  CÓMO USAR LA APP")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawRightString(612 - 54, 792 - 30, "GUÍA PASO A PASO PARA ENTRENADOR Y ALUMNOS")

        self.restoreState()

def build_simple_pdf():
    doc = SimpleDocTemplate(
        PDF_FILENAME,
        pagesize=letter,
        leftMargin=50,
        rightMargin=50,
        topMargin=45,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()

    # Estilos amigables y legibles
    title_style = ParagraphStyle(
        'SimpleTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=6
    )

    sub_style = ParagraphStyle(
        'SimpleSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=colors.HexColor("#0284c7"),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'SimpleH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SimpleH2',
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
        'SimpleBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14.5,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=6
    )

    step_box = ParagraphStyle(
        'StepBox',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor("#0f172a")
    )

    tip_style = ParagraphStyle(
        'TipStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#0369a1")
    )

    story = []

    # =========================================================================
    # PORTADA AMIGABLE
    # =========================================================================
    tag_table = Table(
        [[Paragraph("<b>✨ GUÍA RÁPIDA Y VISUAL · APRENDÉ A USAR LA APP EN 5 MINUTOS</b>", ParagraphStyle('Tag', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.HexColor("#0284c7")))]],
        colWidths=[512]
    )
    tag_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#e0f2fe")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(tag_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Cómo Usar Motion Lab", title_style))
    story.append(Paragraph("Manual Sencillo y Práctico para el Entrenador (Matías) y sus Alumnos", sub_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0284c7"), spaceAfter=12))

    intro_box = Table([[
        Paragraph(
            "<b>¡Bienvenido a Motion Lab!</b><br/>"
            "Esta guía fue creada para que cualquier persona, sin importar su experiencia con la tecnología, pueda usar la plataforma de inmediato. "
            "Acá vas a encontrar cómo ingresar, cómo arma las rutinas el profe y cómo las ven y completan los alumnos desde su celular en el gimnasio.",
            body_style
        )
    ]], colWidths=[512])
    intro_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(intro_box)
    story.append(Spacer(1, 12))

    # =========================================================================
    # PARTE 1: ¿CÓMO INGRESO A LA APP?
    # =========================================================================
    story.append(Paragraph("Paso 1: ¿Cómo ingresar a la plataforma?", h1_style))
    story.append(Paragraph(
        "No hace falta descargar nada del Play Store ni del App Store. La app funciona directamente en el navegador de tu computadora, tablet o celular.",
        body_style
    ))

    login_steps = [
        [Paragraph("<b>1. Abrí el enlace oficial:</b>", step_box), Paragraph("Ingresá desde Chrome o Safari a: <b>motion-lab-preparacion-fisica-y-rendimiento.vercel.app</b>", step_box)],
        [Paragraph("<b>2. Tocá en 'Ingresar':</b>", step_box), Paragraph("Podés entrar con tu <b>correo y contraseña</b> o tocando el botón de <b>Continuar con Google</b> con un solo click.", step_box)],
        [Paragraph("<b>3. Entrada inteligente:</b>", step_box), Paragraph("Si sos el profe Matías, entrás directo a tu <b>Panel de Control</b>. Si sos alumno, se abre tu <b>Entrenamiento de hoy</b>.", step_box)]
    ]
    t_login = Table(login_steps, colWidths=[150, 362])
    t_login.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#ffffff")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_login)
    story.append(Spacer(1, 14))

    # =========================================================================
    # PARTE 2: GUÍA PARA EL ENTRENADOR (MATÍAS)
    # =========================================================================
    story.append(Paragraph("Parte 2: Para el Entrenador (¿Cómo armar rutinas rápido?)", h1_style))
    story.append(Paragraph(
        "El constructor de rutinas está pensado para que no pierdas tiempo escribiendo planillas. Todo se resuelve en dos pantallas limpias:",
        body_style
    ))

    story.append(Paragraph("A. El Cuadrante de Días (Tu semana de entrenamiento)", h2_style))
    story.append(Paragraph("• <b>Ves toda la semana junta:</b> Tenés los días ordenados de izquierda a derecha (Día 1, Día 2, Día 3...).", body_style))
    story.append(Paragraph("• <b>Semáforo de colores:</b> Cada tarjeta tiene 3 puntitos que te avisan qué bloques ya armaste (Azul para Movilidad, Cian para Activación y Amarillo para Fuerza).", body_style))
    story.append(Paragraph("• <b>¿Querés sumar otro día?</b> Al final de la fila tocás la tarjeta con el signo <b>'+ AÑADIR DÍA'</b>.", body_style))
    story.append(Paragraph("• <b>¿Querés clonar un día?</b> Tocás el ícono de las hojitas (copiar) y te duplica ese día completo en un segundo.", body_style))
    story.append(Paragraph("• <b>Para editar:</b> Hacés click en cualquier día y se abre la pantalla para cargar los ejercicios.", body_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph("B. Cargando ejercicios con el Buscador Mágico", h2_style))
    story.append(Paragraph("Cuando estás adentro de un día, ves los 3 bloques de entrenamiento (Movilidad, Activación y Fuerza):", body_style))

    rutina_steps = [
        [Paragraph("<b>1. Tocá '+ Añadir Vacío'</b>", step_box), Paragraph("Aparece una fila lista para completar el ejercicio.", step_box)],
        [Paragraph("<b>2. Empezá a escribir el nombre</b>", step_box), Paragraph("Al hacer click se abre una lista con los ejercicios más comunes. Si empezás a escribir (por ejemplo 'Pre...'), el sistema te resalta al instante opciones como <i>Prensa</i> o <i>Press de banca</i>.", step_box)],
        [Paragraph("<b>3. Elegí o creá uno nuevo</b>", step_box), Paragraph("Podés tocar el ejercicio de la lista o presionar <b>Enter</b>. Si es un ejercicio inventado o nuevo, tocás la opción verde <b>'+ Asignar como nuevo ejercicio'</b> y la app ya se lo aprende para siempre.", step_box)],
        [Paragraph("<b>4. Ajustá Series, Reps y Video</b>", step_box), Paragraph("Cambiás el número de series y repeticiones, ponés tus indicaciones (ej: 'Descansar 90 segundos') y si querés le pegás el enlace de YouTube para que el alumno vea el video.", step_box)],
        [Paragraph("<b>5. Volvé al panel</b>", step_box), Paragraph("Tocás arriba a la izquierda <b>'← Volver a la cuadrícula de días'</b> y no se pierde nada. Al terminar tocás <b>'Guardar y Asignar'</b> y listo.", step_box)]
    ]
    t_rutina = Table(rutina_steps, colWidths=[150, 362])
    t_rutina.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_rutina)

    # =========================================================================
    # PARTE 3: GUÍA PARA EL ALUMNO (EN EL GIMNASIO)
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("Parte 3: Para el Alumno (¿Cómo entrenar con la app en el gym?)", h1_style))
    story.append(Paragraph(
        "Motion Lab funciona como tu entrenador en el bolsillo. Cuando llegás al gimnasio, abrís la app en tu celular y seguís estos 4 pasos:",
        body_style
    ))

    alumno_steps = [
        [Paragraph("<b>Paso 1: Check-in rápido</b>", step_box), Paragraph("Al abrir la app, te pregunta cómo te sentís hoy (tu nivel de energía, si dormiste bien o si tenés dolores). Tocás tu estado en 5 segundos.", step_box)],
        [Paragraph("<b>Paso 2: Mirá tus ejercicios</b>", step_box), Paragraph("Tu entrenamiento viene ordenado tal cual lo armó el profe: primero la <b>Movilidad</b> para entrar en calor, después la <b>Activación</b> y por último la <b>Fuerza</b>.", step_box)],
        [Paragraph("<b>Paso 3: Marcá lo que hacés</b>", step_box), Paragraph("Por cada serie que terminás, tocás el casillero de verificación (✓). Podés anotar cuántos kilos levantaste para que el profe vea tu avance real.", step_box)],
        [Paragraph("<b>Paso 4: Mirá el video si dudás</b>", step_box), Paragraph("Si no te acordás cómo se hace un ejercicio, tocás el botón <b>Video</b> y se reproduce la técnica correcta con los consejos del profe.", step_box)]
    ]
    t_alumno = Table(alumno_steps, colWidths=[150, 362])
    t_alumno.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#ffffff")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_alumno)
    story.append(Spacer(1, 14))

    # =========================================================================
    # PARTE 4: LA SECCIÓN DE BIENESTAR (RELOJES Y SUEÑO)
    # =========================================================================
    story.append(Paragraph("Parte 4: Módulo de Bienestar (Salud y Relojes)", h1_style))
    story.append(Paragraph(
        "En la pestaña <b>'Bienestar'</b> podés conectar tu reloj inteligente (Apple Health o Google Fit) para que Matías sepa cómo venís de pasos, cuántas calorías quemaste y cuántas horas dormiste.",
        body_style
    ))
    story.append(Paragraph("• <b>¿Por qué sirve?</b> Porque si tuviste una semana con poco sueño o mucho estrés de trabajo, tu profe puede adaptarte la rutina para que no te lesiones.", body_style))
    story.append(Spacer(1, 12))

    # =========================================================================
    # PREGUNTAS FRECUENTES Y DUDAS RÁPIDAS
    # =========================================================================
    story.append(Paragraph("Preguntas Frecuentes (Dudas comunes)", h1_style))

    faq_data = [
        [Paragraph("<b>¿Se me borra lo que escribo si salgo sin querer?</b>", step_box)],
        [Paragraph("No. La app guarda en memoria lo que vas tipeando para que no pierdas nada de información.", tip_style)],
        [Paragraph("<b>¿Tengo que descargar actualizaciones?</b>", step_box)],
        [Paragraph("Tampoco. Como es una aplicación web moderna, cada vez que entrás ya tenés la versión más nueva y rápida.", tip_style)],
        [Paragraph("<b>¿Cómo sé si mi alumno pagó la cuota?</b>", step_box)],
        [Paragraph("En el panel del entrenador, cada alumno tiene una etiqueta de color verde ('Al día') o amarilla ('Pendiente') que podés cambiar con un click.", tip_style)]
    ]
    t_faq = Table(faq_data, colWidths=[512])
    t_faq.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_faq)
    story.append(Spacer(1, 16))

    # Pie de contacto
    contacto_box = Table([[
        Paragraph(
            "<b>¿Necesitás ayuda con la app?</b><br/>"
            "Podés consultar directamente al Prof. Matías en tus entrenamientos o al equipo de desarrollo de <b>FLEG TECH</b> (Luciano, Elías, Guido y Facundo).<br/>"
            "<i>Motion Lab · Entrenar con inteligencia, rendir al máximo.</i>",
            step_box
        )
    ]], colWidths=[512])
    contacto_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0fdf4")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#86efac")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(contacto_box)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generado: {PDF_FILENAME}")

if __name__ == "__main__":
    build_simple_pdf()
