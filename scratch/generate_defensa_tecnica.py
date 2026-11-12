import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

PDF_FILENAME = "Defensa_Tecnica_Codigo_Motion_Lab.pdf"

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
        self.drawString(50, 28, "MOTION LAB")
        
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(110, 28, "·   Guía Maestra de Defensa Técnica de Código & Arquitectura   ·   FLEG TECH (2026)")
        
        page_str = f"Página {self._pageNumber} de {total_pages}"
        self.drawRightString(612 - 50, 28, page_str)

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(50, 792 - 32, 612 - 50, 792 - 32)
            
            self.setFont("Helvetica-Bold", 7.5)
            self.setFillColor(colors.HexColor("#0284c7"))
            self.drawString(50, 792 - 26, "DEFENSA DE PROYECTO FINAL  ·  NEXT.JS & POSTGRESQL")
            self.setFont("Helvetica", 7.5)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawRightString(612 - 50, 792 - 26, "ARQUITECTURA, CARPETAS Y RESPUESTAS A LA PROFESORA")

        self.restoreState()

def build_defense_pdf():
    doc = SimpleDocTemplate(
        PDF_FILENAME,
        pagesize=letter,
        leftMargin=50,
        rightMargin=50,
        topMargin=42,
        bottomMargin=42
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DefTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=4
    )

    sub_style = ParagraphStyle(
        'DefSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=15,
        textColor=colors.HexColor("#0284c7"),
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'DefH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=11,
        spaceAfter=5,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'DefH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#0369a1"),
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'DefBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'DefCode',
        parent=body_style,
        fontName='Courier',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#0f172a")
    )

    qa_q = ParagraphStyle(
        'DefQAQ',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#0f172a")
    )

    qa_a = ParagraphStyle(
        'DefQAA',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#1e293b")
    )

    story = []

    # =========================================================================
    # PORTADA / ENCABEZADO
    # =========================================================================
    tag_table = Table(
        [[Paragraph("<b>🎓 GUÍA DE DEFENSA TÉCNICA · PROYECTO FINAL MOTION LAB</b>", ParagraphStyle('Tag', fontName='Helvetica-Bold', fontSize=8, textColor=colors.HexColor("#0284c7")))]],
        colWidths=[512]
    )
    tag_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#e0f2fe")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(tag_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Manual de Defensa Técnica de Código y Arquitectura", title_style))
    story.append(Paragraph("Estructura de Carpetas, Flujo de Datos, Decisiones de Diseño y Respuestas Clave", sub_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284c7"), spaceAfter=10))

    meta_table = Table([
        [Paragraph("<b>Alumno / Expositor:</b>", body_style), Paragraph("Luciano Molina (Equipo FLEG TECH: Luciano, Elías, Guido, Facundo)", body_style)],
        [Paragraph("<b>Stack Tecnológico:</b>", body_style), Paragraph("Next.js 14 (App Router), React 18, Tailwind CSS, PostgreSQL, Prisma ORM, Auth.js (NextAuth), bcryptjs", body_style)],
        [Paragraph("<b>Arquitectura:</b>", body_style), Paragraph("Full-Stack Monolito Modular con Server & Client Components, Route Handlers y Middleware perimetral", body_style)],
        [Paragraph("<b>Base de Datos:</b>", body_style), Paragraph("PostgreSQL Relacional en Vercel Postgres con pooling de conexiones y esquemas declarativos Prisma", body_style)],
        [Paragraph("<b>Producción:</b>", body_style), Paragraph("motion-lab-preparacion-fisica-y-rendimiento.vercel.app", body_style)]
    ], colWidths=[140, 372])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECCIÓN 1: QUÉ HACE CADA CARPETA
    # =========================================================================
    story.append(Paragraph("1. Mapa del Proyecto: ¿Para qué sirve cada carpeta?", h1_style))
    story.append(Paragraph(
        "El proyecto sigue la convención estándar de <b>Next.js 14 App Router</b>. A continuación se desglosa el rol de cada directorio raíz y subdirectorio:",
        body_style
    ))

    folders_data = [
        [Paragraph("<b>Carpeta / Archivo</b>", ParagraphStyle('FTh', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
         Paragraph("<b>Propósito y Justificación Técnica en la Defensa</b>", ParagraphStyle('FTh2', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white))],
        
        [Paragraph("<b>/app</b>", qa_q),
         Paragraph("<b>Cerebro del Enrutamiento:</b> Contiene todas las rutas y páginas de la app. Utiliza el sistema de carpetas de Next.js (cada carpeta es una URL). Incluye <code>layout.js</code> (layout global con ThemeProvider y Footer FLEG TECH), <code>page.js</code> (landing) y <code>globals.css</code>.", body_style)],
        
        [Paragraph("<b>/app/api</b>", qa_q),
         Paragraph("<b>Backend Integrado (Route Handlers):</b> Reemplaza a un servidor Express independiente. Acá residen los endpoints HTTP (POST, GET, PATCH, DELETE) que interactúan con Prisma y la base de datos:", body_style)],
        
        [Paragraph("&nbsp;&nbsp;• <code>/api/auth/[...nextauth]</code>", code_style),
         Paragraph("Configuración del motor de autenticación (Google OAuth, Credenciales email/password y PIN privado del entrenador con JWT).", body_style)],
        
        [Paragraph("&nbsp;&nbsp;• <code>/api/rutinas</code>", code_style),
         Paragraph("Crea, lee y actualiza rutinas completas en cascada (Días, Bloques y Ejercicios).", body_style)],
        
        [Paragraph("&nbsp;&nbsp;• <code>/api/entrenador</code>", code_style),
         Paragraph("Endpoints protegidos para listar alumnos, ver fichas y conmutar estado de pago.", body_style)],
        
        [Paragraph("&nbsp;&nbsp;• <code>/api/entrenamiento</code>", code_style),
         Paragraph("Control de check-in de atletas y guardado interactivo de series en tiempo real.", body_style)],
        
        [Paragraph("&nbsp;&nbsp;• <code>/api/bienestar & /reloj</code>", code_style),
         Paragraph("Recepción y parseo de datos de wearables (Apple Health XML y Google Fit API).", body_style)],
        
        [Paragraph("<b>/app/admin</b>", qa_q),
         Paragraph("<b>Vista del Entrenador:</b> Panel privado de Matías. Renderiza <code>AdminShell.js</code> y el Constructor de Rutinas.", body_style)],
        
        [Paragraph("<b>/app/entrenamiento</b>", qa_q),
         Paragraph("<b>Vista del Alumno:</b> Portal mobile-first para marcar series, ver videos técnicos y leer indicaciones.", body_style)],
        
        [Paragraph("<b>/app/bienestar</b>", qa_q),
         Paragraph("<b>Salud & Recuperación:</b> Dashboard de sueño, fatiga, DOMS y sincronización de relojes.", body_style)],
        
        [Paragraph("<b>/app/login & /onboarding</b>", qa_q),
         Paragraph("Pantalla de inicio de sesión seguro y asistente de ficha médica/deportiva inicial.", body_style)],
        
        [Paragraph("<b>/components</b>", qa_q),
         Paragraph("<b>Capa de Presentación (UI Modular):</b> Componentes React reutilizables organizados por dominio funcional:", body_style)],
        
        [Paragraph("&nbsp;&nbsp;• <code>/components/admin</code>", code_style),
         Paragraph("<code>RoutineBuilder.js</code> (constructor en 2 vistas), <code>ExerciseCombobox.js</code> (autocomplete creatable), <code>DashboardTrainer.js</code>.", body_style)],
        
        [Paragraph("&nbsp;&nbsp;• <code>/components/training</code>", code_style),
         Paragraph("<code>WorkoutView.js</code>, <code>ExerciseCard.js</code>, <code>PreWorkoutModal.js</code>, <code>PostWorkoutModal.js</code>.", body_style)],
        
        [Paragraph("&nbsp;&nbsp;• <code>/components/bienestar</code>", code_style),
         Paragraph("Widgets de gráficos, tarjetas de Apple Health y sincronizador de Google Fit.", body_style)],
        
        [Paragraph("&nbsp;&nbsp;• Raíz de components", code_style),
         Paragraph("<code>Navbar.js</code>, <code>Footer.js</code> (branding FLEG TECH), <code>Hero.js</code>, <code>PricingSection.js</code>.", body_style)],
        
        [Paragraph("<b>/lib</b>", qa_q),
         Paragraph("<b>Lógica de Negocio y Singletons:</b><br/>"
                   "- <code>prisma.js</code>: Cliente Singleton de Prisma ORM para reutilizar conexiones.<br/>"
                   "- <code>exercisesLibrary.js</code>: Catálogo técnico de ejercicios (Movilidad, Activación, Fuerza).<br/>"
                   "- <code>trainerPin.js</code>: Validador de credenciales y PIN exclusivo del entrenador.<br/>"
                   "- <code>appleHealthParser.js</code>: Parser de exports Apple Health descomprimiendo con <code>fflate</code>.<br/>"
                   "- <code>googleFit.js</code>: Cliente OAuth y consultas a Google Fitness REST API.<br/>"
                   "- <code>requireTrainer.js</code>: Middleware de servidor para autorizar solo al rol ENTRENADOR.", body_style)],
        
        [Paragraph("<b>/prisma</b>", qa_q),
         Paragraph("<b>Capa de Datos Declarativa:</b> <code>schema.prisma</code> define los modelos relacionales, enums y migraciones en PostgreSQL. <code>seed.js</code> permite poblar datos de prueba.", body_style)],
        
        [Paragraph("<b>middleware.js</b>", qa_q),
         Paragraph("<b>Guardián Perimetral (Edge Middleware):</b> Intercepta cada request antes de que toque una página. Verifica el token JWT de NextAuth: si alguien no autenticado quiere entrar a <code>/admin</code> o <code>/entrenamiento</code>, lo rebota a <code>/login</code>.", body_style)]
    ]

    t_folders = Table(folders_data, colWidths=[150, 362])
    t_folders.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")])
    ]))
    story.append(t_folders)

    # =========================================================================
    # SECCIÓN 2: BASE DE DATOS Y MODELADO RELACIONAL
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("2. Base de Datos y Modelo Relacional (Prisma + PostgreSQL)", h1_style))
    story.append(Paragraph(
        "Uno de los puntos más fuertes que debes destacar ante la profesora es la <b>normalización e integridad referencial</b> de la base de datos:",
        body_style
    ))

    schema_data = [
        [Paragraph("<b>Modelo Prisma</b>", qa_q), Paragraph("<b>Campos Clave</b>", qa_q), Paragraph("<b>Relación y Propósito en el Negocio</b>", qa_q)],
        [Paragraph("<b>Usuario</b>", body_style), Paragraph("id, email, passwordHash, rol (ALUMNO/ENTRENADOR), estadoPago", code_style), Paragraph("Entidad central. Administra credenciales y estado de suscripción de atletas.", body_style)],
        [Paragraph("<b>PerfilDeportivo</b>", body_style), Paragraph("usuarioId (1:1), objetivo, deporte, nivel, focos, disponibilidad", code_style), Paragraph("Datos antropométricos y deportivos recopilados en el Onboarding.", body_style)],
        [Paragraph("<b>Rutina</b>", body_style), Paragraph("id, alumnoId, entrenadorId, nombre, estado (ACTIVA/COMPLETADA)", code_style), Paragraph("El plan asignado. Conecta al alumno con el entrenador y tiene fecha de vigencia.", body_style)],
        [Paragraph("<b>Bloque</b>", body_style), Paragraph("id, rutinaId, tipo (MOVILIDAD, ACTIVACION, DESARROLLO), orden", code_style), Paragraph("Divide cada día en los 3 pilares metodológicos de Motion Lab.", body_style)],
        [Paragraph("<b>EjercicioRealizado</b>", body_style), Paragraph("id, bloqueId, nombre, indicacionProfe, videoUrl, series", code_style), Paragraph("Cada ejercicio dentro del bloque, con sus series, repeticiones y notas técnicas.", body_style)],
        [Paragraph("<b>RutinaRealizada</b>", body_style), Paragraph("id, alumnoId, energiaInicial, esfuerzoFinal (RPE), alertaFatiga", code_style), Paragraph("Registro histórico de ejecución del alumno con métricas de esfuerzo percibido.", body_style)]
    ]
    t_schema = Table(schema_data, colWidths=[90, 180, 242])
    t_schema.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0284c7")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")])
    ]))
    story.append(t_schema)
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECCIÓN 3: PREGUNTAS CLAVE DE LA PROFESORA Y CÓMO RESPONDERLAS
    # =========================================================================
    story.append(Paragraph("3. Preguntas Típicas de la Profesora y Cómo Responderlas (Cheat Sheet)", h1_style))
    story.append(Paragraph(
        "En la defensa, la profesora evaluará si entiendes las decisiones de arquitectura que tomaste. Usa estas respuestas exactas:",
        body_style
    ))

    faqs = [
        ("¿Por qué usaron Next.js App Router en vez de un backend separado en Express y un frontend con React Vite?",
         "Porque Next.js 14 nos da una arquitectura Full-Stack unificada: elimina la necesidad de configurar servidores de backend separados, evita problemas de CORS y latencia de red innecesaria, permite tipado compartido entre cliente y servidor, y optimiza el rendimiento combinando Server Components (para carga rápida sin Javascript extra) con Client Components interactivos donde se necesita estado en React."),

        ("¿Cómo protegen las rutas para que un alumno no pueda entrar al panel de administración?",
         "Aplicamos seguridad en dos capas independientes: 1) A nivel perimetral mediante 'middleware.js', que intercepta las peticiones en el Edge y verifica el JWT de la sesión. Si el rol no es 'ENTRENADOR', lo redirige a /login. 2) A nivel de API en el backend mediante 'requireTrainer.js', que valida la sesión en el servidor antes de ejecutar cualquier consulta crítica a la base de datos."),

        ("¿Por qué eligieron PostgreSQL con Prisma ORM en lugar de una base de datos NoSQL como MongoDB?",
         "Porque el dominio del entrenamiento físico es estrictamente relacional: un Usuario tiene Perfil Deportivo, tiene Rutinas; cada Rutina tiene Bloques ordenados; cada Bloque tiene Ejercicios; y cada Ejercicio tiene Series. En MongoDB habríamos tenido redundancia de datos o documentos embebidos gigantes. Con PostgreSQL y Prisma garantizamos integridad referencial, claves foráneas, eliminaciones en cascada (onDelete: Cascade) y consistencia transaccional ACID."),

        ("¿Cómo funciona el Combobox del constructor de rutinas y por qué lo hicieron a medida?",
         "Lo implementamos en 'ExerciseCombobox.js' como un componente Autocomplete Creatable. Al escribir, filtra letra por letra en tiempo real (case-insensitive) y resalta las coincidencias en celeste con un helper de manipulación de strings. Si el entrenador inventa un ejercicio nuevo, la opción '+ Asignar como nuevo ejercicio' lo agrega a un Set en memoria a nivel de módulo, persistiendo las sugerencias en la sesión sin recargar la página y protegiendo el valor en 'onBlur'."),

        ("¿Cómo gestionan las conexiones a la base de datos para no agotar el pool en entornos Serverless?",
         "En Next.js las funciones serverless pueden reconectarse en cada llamada. Para evitar agotar las conexiones a PostgreSQL, implementamos el patrón Singleton en 'lib/prisma.js': guardamos la instancia de Prisma en 'globalThis.prisma' durante el entorno de desarrollo para reutilizar el cliente entre hot-reloads."),

        ("¿Cómo manejan la seguridad de las contraseñas?",
         "Las contraseñas nunca se guardan en texto plano. Usamos 'bcryptjs' con un factor de salteo (salt rounds) de 10 para hashear las contraseñas antes de guardarlas en PostgreSQL y validarlas en el login con 'bcrypt.compare()'.")
    ]

    for q, a in faqs:
        f_box = Table([
            [Paragraph(f"<b>❓ Profesora: {q}</b>", qa_q)],
            [Paragraph(f"<b>💡 Tu Respuesta:</b> {a}", qa_a)]
        ], colWidths=[512])
        f_box.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
            ('LINEBELOW', (0,0), (-1,0), 0.5, colors.HexColor("#e2e8f0")),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(f_box)
        story.append(Spacer(1, 6))

    # =========================================================================
    # SECCIÓN 4: CHECKLIST FINAL PARA EL DÍA DE LA DEFENSA
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("4. Checklist y Consejos Prácticos para la Exposición", h1_style))

    tips_data = [
        [Paragraph("<b>1. Comenzá con el 'Por Qué'</b>", qa_q),
         Paragraph("Explicá que Motion Lab no es una app de juguete, sino un software real desarrollado a medida para un cliente real (Prof. Matías) que necesitaba digitalizar su metodología deportiva.", body_style)],
        
        [Paragraph("<b>2. Hacé una demo fluida</b>", qa_q),
         Paragraph("Mostrá el login, entrá a <code>/admin</code>, abrí el Constructor de Rutinas, tipeá 'Pre...' en el Combobox para mostrar la reactividad en tiempo real y mostrá cómo se ve en modo celular.", body_style)],
        
        [Paragraph("<b>3. Mostrá el código con orgullo</b>", qa_q),
         Paragraph("Si te piden abrir el editor: mostrá <code>schema.prisma</code> (para hablar de la base de datos), <code>middleware.js</code> (para hablar de seguridad) y <code>ExerciseCombobox.js</code> (para mostrar lógica de componentes en React).", body_style)],
        
        [Paragraph("<b>4. Destacá el despliegue</b>", qa_q),
         Paragraph("Mencioná que la web está en producción real en Vercel con integración continua (CI/CD) ante cada push a GitHub y conectada a PostgreSQL en la nube.", body_style)]
    ]
    t_tips = Table(tips_data, colWidths=[150, 362])
    t_tips.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0fdf4")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#bbf7d0")),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_tips)
    story.append(Spacer(1, 15))

    cierre_table = Table([[
        Paragraph(
            "<b>¡Mucho éxito en tu defensa, Luciano!</b><br/>"
            "El proyecto Motion Lab cuenta con una arquitectura moderna, escalable, con patrones de diseño sólidos y código limpio. Tenés todo el respaldo técnico para obtener la máxima calificación.<br/>"
            "<i>Desarrollado con el equipo de FLEG TECH (Luciano Molina, Elías Baltazar, Guido Mignone, Facundo Romero).</i>",
            qa_a
        )
    ]], colWidths=[512])
    cierre_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#e0f2fe")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#0284c7")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(cierre_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generado: {PDF_FILENAME}")

if __name__ == "__main__":
    build_defense_pdf()
