// scripts/test-connection.js
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔄 Probando conexión a Railway PostgreSQL...');
  console.log('📍 Host:', process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'No configurado');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL no está configurado en .env.local');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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
    
    // Verificar versión de PostgreSQL
    const version = await pool.query('SELECT version()');
    console.log('\n🔧 Versión de PostgreSQL:');
    console.log(' ', version.rows[0].version.split(',')[0]);
    
    await pool.end();
    console.log('\n✅ Prueba completada exitosamente');
    
  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  }
}

testConnection();