const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createPlanes() {
  console.log('📦 Creando tabla planes con Prisma en MySQL Railway...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS planes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      precio_mensual DECIMAL(10, 2) NOT NULL,
      descripcion TEXT NOT NULL,
      es_destacado BOOLEAN DEFAULT FALSE,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const planes = await prisma.$queryRawUnsafe('SELECT COUNT(*) as total FROM planes');
  const total = Number(planes[0]?.total || 0);

  if (total === 0) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO planes (nombre, precio_mensual, descripcion, es_destacado) VALUES
      ('Plan Base', 75000, 'Entrená por tu cuenta con una planificación personalizada, objetivos claros y seguimiento profesional para acompañar tu evolución.', FALSE),
      ('Plan Performance', 180000, 'Un proceso integral que combina gimnasio y campo, adaptado a tus objetivos, necesidades y deporte.', TRUE)
    `);
    console.log('✅ Tabla planes creada y datos insertados en Railway.');
  } else {
    console.log('ℹ️ Tabla planes ya cuenta con datos.');
  }
}

createPlanes()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
