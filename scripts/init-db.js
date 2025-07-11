// scripts/init-db.js
require('dotenv').config({ path: '.env.local' });

// Verificar que tenemos la URL de la base de datos
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL no está configurado en .env.local');
  process.exit(1);
}

async function initializeDatabase() {
  try {
    console.log('🚀 Inicializando base de datos en Railway...');
    console.log('📍 Proyecto: efficient-cat');
    console.log('🔗 Host:', process.env.DATABASE_URL.split('@')[1].split(':')[0]);
    
    // Importar la función después de cargar las variables de entorno
    const { initDatabase, closeConnection } = require('../src/lib/db');
    
    console.log('\n📋 Creando tablas...');
    await initDatabase();
    
    console.log('\n✅ Base de datos inicializada correctamente');
    console.log('📝 Tablas creadas:');
    console.log('  - stations (estaciones de radio)');
    console.log('  - programs (programación)');
    console.log('  - social_links (redes sociales)');
    console.log('  - live_metadata (metadata en vivo)');
    console.log('\n🎉 ¡Listo! Puedes comenzar a trabajar localmente');
    
    // Cerrar conexión
    await closeConnection();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al inicializar la base de datos:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  }
}

// Ejecutar
initializeDatabase();