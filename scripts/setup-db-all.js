// scripts/setup-db-all.js
// Script todo-en-uno para configurar la base de datos
const { Pool } = require('pg');

// Configuración directa
const DATABASE_URL = 'postgresql://postgres:vaRoyzzbIDPomLyNxXtwNfHQyYmflCaD@tramway.proxy.rlwy.net:14988/railway';

// Configurar para el módulo db.ts
process.env.DATABASE_URL = DATABASE_URL;
process.env.NODE_ENV = 'development';

async function setupDatabase() {
  console.log('🚀 Configuración completa de la base de datos');
  console.log('📍 Proyecto: efficient-cat');
  console.log('='.repeat(50));
  
  try {
    // Paso 1: Probar conexión
    console.log('\n1️⃣ Probando conexión...');
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    const test = await pool.query('SELECT NOW()');
    console.log('   ✅ Conexión exitosa');
    await pool.end();
    
    // Paso 2: Inicializar base de datos
    console.log('\n2️⃣ Inicializando tablas...');
    const { initDatabase, closeConnection } = require('../src/lib/db');
    await initDatabase();
    console.log('   ✅ Tablas creadas');
    
    // Paso 3: Cargar programas
    console.log('\n3️⃣ Cargando programación...');
    const { loadProgramsForAllStations } = require('../src/lib/loadScheduleData');
    const result = await loadProgramsForAllStations();
    
    if (result.success) {
      console.log('   ✅ Programación cargada');
      console.log('\n📊 Resumen:');
      result.stations.forEach(station => {
        console.log(`   📻 ${station.stationName}: ${station.count} programas`);
      });
    }
    
    await closeConnection();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ ¡TODO LISTO! Tu base de datos está configurada.');
    console.log('🎉 Ahora puedes ejecutar: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar
setupDatabase();