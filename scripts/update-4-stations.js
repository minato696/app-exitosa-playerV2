// scripts/update-4-stations.js
const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres:vaRoyzzbIDPomLyNxXtwNfHQyYmflCaD@tramway.proxy.rlwy.net:14988/railway';

async function updateTo4Stations() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Actualizando a solo 4 estaciones...\n');
    
    // 1. Primero eliminar todos los programas de las estaciones que vamos a borrar
    console.log('🗑️  Eliminando programas de estaciones no deseadas...');
    await pool.query(`
      DELETE FROM programs 
      WHERE station_id NOT IN ('lima', 'arequipa', 'trujillo', 'chiclayo')
    `);
    
    // 2. Eliminar metadata en vivo de estaciones no deseadas
    await pool.query(`
      DELETE FROM live_metadata 
      WHERE station_id NOT IN ('lima', 'arequipa', 'trujillo', 'chiclayo')
    `);
    
    // 3. Eliminar social links de estaciones no deseadas
    await pool.query(`
      DELETE FROM social_links 
      WHERE station_id NOT IN ('lima', 'arequipa', 'trujillo', 'chiclayo')
    `);
    
    // 4. Eliminar las estaciones no deseadas
    console.log('🗑️  Eliminando estaciones no deseadas...');
    await pool.query(`
      DELETE FROM stations 
      WHERE id NOT IN ('lima', 'arequipa', 'trujillo', 'chiclayo')
    `);
    
    // 5. Actualizar las URLs de las 4 estaciones
    console.log('\n📻 Actualizando URLs de las estaciones...\n');
    
    const updates = [
      {
        id: 'lima',
        name: 'Exitosa Lima',
        url: 'https://neptuno-2-audio.mediaserver.digital/79525baf-b0f5-4013-a8bd-3c5c293c6561',
        city: 'Lima',
        region: 'lima',
        description: 'La radio más escuchada del Perú'
      },
      {
        id: 'arequipa',
        name: 'Exitosa Arequipa',
        url: 'https://neptuno-2-audio.mediaserver.digital/79525baf-b0f5-4013-a8bd-3c5c293c6561',
        city: 'Arequipa',
        region: 'arequipa',
        description: 'Exitosa en la Ciudad Blanca'
      },
      {
        id: 'trujillo',
        name: 'Exitosa Trujillo',
        url: 'https://radios-player-exitosa.mediaserver.digital/exitosa.trujillo',
        city: 'Trujillo',
        region: 'trujillo',
        description: 'Exitosa en la Ciudad de la Eterna Primavera'
      },
      {
        id: 'chiclayo',
        name: 'Exitosa Chiclayo',
        url: 'https://radios-player-exitosa.mediaserver.digital/exitosa.chiclayo',
        city: 'Chiclayo',
        region: 'chiclayo',
        description: 'Exitosa en la Capital de la Amistad'
      }
    ];
    
    for (const station of updates) {
      await pool.query(`
        UPDATE stations 
        SET url = $1, 
            name = $2,
            city = $3,
            region = $4,
            description = $5,
            image = NULL,
            active = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
      `, [station.url, station.name, station.city, station.region, station.description, station.id]);
      
      console.log(`✅ ${station.name}: ${station.url}`);
    }
    
    // 6. Verificar el resultado
    console.log('\n📊 Verificando estaciones actuales:');
    const result = await pool.query('SELECT id, name, city, url FROM stations ORDER BY id');
    
    console.log('\nEstaciones en la base de datos:');
    result.rows.forEach(row => {
      console.log(`- ${row.name} (${row.city})`);
      console.log(`  URL: ${row.url}\n`);
    });
    
    await pool.end();
    console.log('✅ ¡Actualización completada! Ahora tienes solo 4 estaciones.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

updateTo4Stations();