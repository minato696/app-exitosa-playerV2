// scripts/test-connection-simple.js
const { Pool } = require('pg');

// Conexión directa sin dotenv
const DATABASE_URL = 'postgresql://postgres:vaRoyzzbIDPomLyNxXtwNfHQyYmflCaD@tramway.proxy.rlwy.net:14988/railway';

async function testConnection() {
  console.log('🔄 Probando conexión a Railway PostgreSQL...');
  console.log('📍 Proyecto: efficient-cat');
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Probar conexión básica
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa!');
    console.log('⏰ Hora del servidor:', result.rows[0].now);
    
    // Verificar tablas existentes
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tablas encontradas:');
    if (tables.rows.length === 0) {
      console.log('  (No hay tablas - base de datos vacía)');
    } else {
      tables.rows.forEach(row => {
        console.log('  -', row.table_name);
      });
    }
    
    await pool.end();
    console.log('\n✅ Prueba completada exitosamente');
    
  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message);
    process.exit(1);
  }
}

testConnection();