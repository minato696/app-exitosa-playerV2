// scripts/init-tables-simple.js
const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres:vaRoyzzbIDPomLyNxXtwNfHQyYmflCaD@tramway.proxy.rlwy.net:14988/railway';

async function initTables() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🚀 Inicializando tablas en PostgreSQL...');
    
    // 1. Crear tabla stations
    console.log('\n📋 Creando tabla stations...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stations (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        image TEXT,
        description TEXT,
        region VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Tabla stations creada');

    // 2. Crear función para actualizar updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // 3. Crear tabla programs
    console.log('📋 Creando tabla programs...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS programs (
        id SERIAL PRIMARY KEY,
        station_id VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        host VARCHAR(255) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        image TEXT,
        description TEXT,
        day_type VARCHAR(20) NOT NULL CHECK (day_type IN ('weekday', 'saturday', 'sunday')),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
      )
    `);
    console.log('   ✅ Tabla programs creada');

    // 4. Crear tabla social_links
    console.log('📋 Creando tabla social_links...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_links (
        id SERIAL PRIMARY KEY,
        station_id VARCHAR(50) NOT NULL,
        facebook TEXT,
        youtube TEXT,
        tiktok TEXT,
        instagram TEXT,
        twitter TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
      )
    `);
    console.log('   ✅ Tabla social_links creada');

    // 5. Crear tabla live_metadata
    console.log('📋 Creando tabla live_metadata...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS live_metadata (
        id SERIAL PRIMARY KEY,
        station_id VARCHAR(50) NOT NULL,
        program_name VARCHAR(255),
        host VARCHAR(255),
        description TEXT,
        start_time TIME,
        end_time TIME,
        listeners_count INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
      )
    `);
    console.log('   ✅ Tabla live_metadata creada');

    // 6. Insertar estaciones iniciales
    console.log('\n📻 Insertando estaciones...');
    const stations = [
      ['lima', 'Exitosa Lima', 'https://aacplus.rstreaming.net:7190/stream', '/radios/LIMA.jpg', 'La radio más escuchada del Perú', 'lima', 'Lima'],
      ['arequipa', 'Exitosa Arequipa', 'https://aacplus.rstreaming.net:7790/stream', '/radios/AREQUIPA.jpg', 'Exitosa en la Ciudad Blanca', 'arequipa', 'Arequipa'],
      ['chiclayo', 'Exitosa Chiclayo', 'https://aacplus.rstreaming.net:7490/stream', '/radios/CHICLAYO.jpg', 'Exitosa en la Capital de la Amistad', 'chiclayo', 'Chiclayo'],
      ['trujillo', 'Exitosa Trujillo', 'https://aacplus.rstreaming.net:7590/stream', '/radios/TRUJILLO.jpg', 'Exitosa en la Ciudad de la Eterna Primavera', 'trujillo', 'Trujillo'],
      ['piura', 'Exitosa Piura', 'https://aacplus.rstreaming.net:7890/stream', '/radios/PIURA.jpg', 'Exitosa en la Ciudad del Eterno Sol', 'piura', 'Piura'],
      ['cusco', 'Exitosa Cusco', 'https://aacplus.rstreaming.net:7990/stream', '/radios/CUSCO.jpg', 'Exitosa en la Capital Imperial', 'cusco', 'Cusco'],
      ['huancayo', 'Exitosa Huancayo', 'https://aacplus.rstreaming.net:8090/stream', '/radios/HUANCAYO.jpg', 'Exitosa en la Ciudad Incontrastable', 'huancayo', 'Huancayo'],
      ['huacho', 'Exitosa Huacho', 'https://aacplus.rstreaming.net:8190/stream', '/radios/HUACHO.jpg', 'Exitosa en Huacho', 'huacho', 'Huacho'],
      ['ica', 'Exitosa Ica', 'https://aacplus.rstreaming.net:8290/stream', '/radios/ICA.jpg', 'Exitosa en la Ciudad del Eterno Sol', 'ica', 'Ica'],
      ['iquitos', 'Exitosa Iquitos', 'https://aacplus.rstreaming.net:8390/stream', '/radios/IQUITOS.jpg', 'Exitosa en la Capital de la Amazonía Peruana', 'iquitos', 'Iquitos'],
      ['tacna', 'Exitosa Tacna', 'https://aacplus.rstreaming.net:8490/stream', '/radios/TACNA.jpg', 'Exitosa en la Ciudad Heroica', 'tacna', 'Tacna'],
      ['tarapoto', 'Exitosa Tarapoto', 'https://aacplus.rstreaming.net:8590/stream', '/radios/TARAPOTO.jpg', 'Exitosa en la Ciudad de las Palmeras', 'tarapoto', 'Tarapoto']
    ];

    for (const station of stations) {
      await pool.query(
        `INSERT INTO stations (id, name, url, image, description, region, city) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (id) DO NOTHING`,
        station
      );
    }
    console.log(`   ✅ ${stations.length} estaciones insertadas`);

    // Verificar tablas creadas
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n✅ Tablas creadas exitosamente:');
    tables.rows.forEach(row => {
      console.log('   -', row.table_name);
    });

    await pool.end();
    console.log('\n🎉 ¡Base de datos inicializada correctamente!');
    console.log('💡 Próximo paso: Cargar los programas con npm run db:load-programs');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

initTables();