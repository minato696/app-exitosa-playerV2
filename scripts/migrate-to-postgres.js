// scripts/migrate-to-postgres.js
const { createClient } = require('@libsql/client');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Configuración SQLite (origen)
const sqliteDb = createClient({
  url: 'file:local.db',
});

// Configuración PostgreSQL (destino)
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  try {
    console.log('Iniciando migración de SQLite a PostgreSQL...');
    
    // 1. Migrar estaciones
    console.log('Migrando estaciones...');
    const stations = await sqliteDb.execute('SELECT * FROM stations');
    
    for (const station of stations.rows) {
      await pgPool.query(
        `INSERT INTO stations (id, name, url, image, description, region, city, active, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         ON CONFLICT (id) DO UPDATE SET 
         name = EXCLUDED.name, 
         url = EXCLUDED.url, 
         image = EXCLUDED.image, 
         description = EXCLUDED.description, 
         region = EXCLUDED.region, 
         city = EXCLUDED.city, 
         active = EXCLUDED.active, 
         updated_at = CURRENT_TIMESTAMP`,
        [
          station.id, 
          station.name, 
          station.url, 
          station.image, 
          station.description, 
          station.region, 
          station.city, 
          station.active === 1, 
          station.created_at, 
          station.updated_at
        ]
      );
    }
    console.log(`✓ ${stations.rows.length} estaciones migradas`);
    
    // 2. Migrar programas
    console.log('Migrando programas...');
    const programs = await sqliteDb.execute('SELECT * FROM programs');
    
    for (const program of programs.rows) {
      const result = await pgPool.query(
        `INSERT INTO programs (station_id, name, host, start_time, end_time, image, description, day_type, active, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         RETURNING id`,
        [
          program.station_id,
          program.name,
          program.host,
          program.start_time,
          program.end_time,
          program.image,
          program.description,
          program.day_type,
          program.active === 1,
          program.created_at,
          program.updated_at
        ]
      );
      console.log(`  Programa ${program.name} migrado con ID ${result.rows[0].id}`);
    }
    console.log(`✓ ${programs.rows.length} programas migrados`);
    
    // 3. Migrar social links
    console.log('Migrando redes sociales...');
    const socialLinks = await sqliteDb.execute('SELECT * FROM social_links');
    
    for (const social of socialLinks.rows) {
      await pgPool.query(
        `INSERT INTO social_links (station_id, facebook, youtube, tiktok, instagram, twitter, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          social.station_id,
          social.facebook,
          social.youtube,
          social.tiktok,
          social.instagram,
          social.twitter,
          social.created_at,
          social.updated_at
        ]
      );
    }
    console.log(`✓ ${socialLinks.rows.length} enlaces sociales migrados`);
    
    // 4. Migrar live metadata
    console.log('Migrando metadata en vivo...');
    const liveMetadata = await sqliteDb.execute('SELECT * FROM live_metadata');
    
    for (const metadata of liveMetadata.rows) {
      await pgPool.query(
        `INSERT INTO live_metadata (station_id, program_name, host, description, start_time, end_time, listeners_count, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          metadata.station_id,
          metadata.program_name,
          metadata.host,
          metadata.description,
          metadata.start_time,
          metadata.end_time,
          metadata.listeners_count,
          metadata.updated_at
        ]
      );
    }
    console.log(`✓ ${liveMetadata.rows.length} registros de metadata migrados`);
    
    console.log('\n✓ Migración completada exitosamente!');
    
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    await pgPool.end();
  }
}

// Ejecutar migración
migrate();