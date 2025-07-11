// src/lib/db.ts
import { Pool } from 'pg';
import { sql } from '@vercel/postgres';

// Configuración para Railway PostgreSQL
const connectionString = process.env.DATABASE_URL;

// Pool de conexiones para queries directas
export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helper para ejecutar queries compatibles con el código anterior
export const db = {
  execute: async ({ sql: query, args = [] }: { sql: string; args?: any[] }) => {
    try {
      // Reemplazar ? por $1, $2, etc. para PostgreSQL
      let pgQuery = query;
      let paramIndex = 1;
      while (pgQuery.includes('?')) {
        pgQuery = pgQuery.replace('?', `$${paramIndex}`);
        paramIndex++;
      }
      
      const result = await pool.query(pgQuery, args);
      return {
        rows: result.rows,
        rowCount: result.rowCount,
        lastInsertRowid: result.rows[0]?.id || null
      };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
};

// Función para cerrar la conexión (útil para scripts)
export const closeConnection = async () => {
  await pool.end();
};

// Inicializar tablas con PostgreSQL
export async function initDatabase() {
  try {
    // Tabla de estaciones mejorada para PostgreSQL
    await db.execute({
      sql: `
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
      `,
      args: []
    });

    // Crear trigger para actualizar updated_at automáticamente
    await db.execute({
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `,
      args: []
    });

    await db.execute({
      sql: `
        DROP TRIGGER IF EXISTS update_stations_updated_at ON stations;
        CREATE TRIGGER update_stations_updated_at 
        BEFORE UPDATE ON stations 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `,
      args: []
    });

    // Tabla de programas mejorada para PostgreSQL
    await db.execute({
      sql: `
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
      `,
      args: []
    });

    await db.execute({
      sql: `
        DROP TRIGGER IF EXISTS update_programs_updated_at ON programs;
        CREATE TRIGGER update_programs_updated_at 
        BEFORE UPDATE ON programs 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `,
      args: []
    });

    // Tabla de redes sociales por región
    await db.execute({
      sql: `
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
      `,
      args: []
    });

    await db.execute({
      sql: `
        DROP TRIGGER IF EXISTS update_social_links_updated_at ON social_links;
        CREATE TRIGGER update_social_links_updated_at 
        BEFORE UPDATE ON social_links 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `,
      args: []
    });

    // Tabla de metadata actual (programa en vivo)
    await db.execute({
      sql: `
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
      `,
      args: []
    });

    await db.execute({
      sql: `
        DROP TRIGGER IF EXISTS update_live_metadata_updated_at ON live_metadata;
        CREATE TRIGGER update_live_metadata_updated_at 
        BEFORE UPDATE ON live_metadata 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `,
      args: []
    });

    console.log('Base de datos PostgreSQL inicializada correctamente');
    
    // Insertar datos iniciales si no existen
    await seedInitialData();
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}

// Seed de datos iniciales mejorado para PostgreSQL
async function seedInitialData() {
  try {
    // Verificar si ya hay datos
    const stations = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM stations',
      args: []
    });
    
    if (parseInt(stations.rows[0].count) > 0) {
      console.log('La base de datos ya contiene datos');
      return;
    }

    // Insertar estaciones con más detalles
    const stationData = [
      {
        id: 'lima',
        name: 'Exitosa Lima',
        url: 'https://aacplus.rstreaming.net:7190/stream',
        image: '/radios/exitosa-lima.png',
        description: 'La radio más escuchada del Perú',
        region: 'lima',
        city: 'Lima'
      },
      {
        id: 'arequipa',
        name: 'Exitosa Arequipa',
        url: 'https://aacplus.rstreaming.net:7790/stream',
        image: '/radios/exitosa-arequipa.png',
        description: 'Exitosa en la Ciudad Blanca',
        region: 'arequipa',
        city: 'Arequipa'
      },
      {
        id: 'chiclayo',
        name: 'Exitosa Chiclayo',
        url: 'https://aacplus.rstreaming.net:7490/stream',
        image: '/radios/exitosa-chiclayo.png',
        description: 'Exitosa en la Capital de la Amistad',
        region: 'chiclayo',
        city: 'Chiclayo'
      },
      {
        id: 'trujillo',
        name: 'Exitosa Trujillo',
        url: 'https://aacplus.rstreaming.net:7590/stream',
        image: '/radios/exitosa-trujillo.png',
        description: 'Exitosa en la Ciudad de la Eterna Primavera',
        region: 'trujillo',
        city: 'Trujillo'
      },
      {
        id: 'piura',
        name: 'Exitosa Piura',
        url: 'https://aacplus.rstreaming.net:7890/stream',
        image: '/radios/exitosa-piura.png',
        description: 'Exitosa en la Ciudad del Eterno Sol',
        region: 'piura',
        city: 'Piura'
      },
      {
        id: 'cusco',
        name: 'Exitosa Cusco',
        url: 'https://aacplus.rstreaming.net:7990/stream',
        image: '/radios/exitosa-cusco.png',
        description: 'Exitosa en la Capital Imperial',
        region: 'cusco',
        city: 'Cusco'
      },
      {
        id: 'huancayo',
        name: 'Exitosa Huancayo',
        url: 'https://aacplus.rstreaming.net:8090/stream',
        image: '/radios/exitosa-huancayo.png',
        description: 'Exitosa en la Ciudad Incontrastable',
        region: 'huancayo',
        city: 'Huancayo'
      },
      {
        id: 'huacho',
        name: 'Exitosa Huacho',
        url: 'https://aacplus.rstreaming.net:8190/stream',
        image: '/radios/exitosa-huacho.png',
        description: 'Exitosa en Huacho',
        region: 'huacho',
        city: 'Huacho'
      },
      {
        id: 'ica',
        name: 'Exitosa Ica',
        url: 'https://aacplus.rstreaming.net:8290/stream',
        image: '/radios/exitosa-ica.png',
        description: 'Exitosa en la Ciudad del Eterno Sol',
        region: 'ica',
        city: 'Ica'
      },
      {
        id: 'iquitos',
        name: 'Exitosa Iquitos',
        url: 'https://aacplus.rstreaming.net:8390/stream',
        image: '/radios/exitosa-iquitos.png',
        description: 'Exitosa en la Capital de la Amazonía Peruana',
        region: 'iquitos',
        city: 'Iquitos'
      },
      {
        id: 'tacna',
        name: 'Exitosa Tacna',
        url: 'https://aacplus.rstreaming.net:8490/stream',
        image: '/radios/exitosa-tacna.png',
        description: 'Exitosa en la Ciudad Heroica',
        region: 'tacna',
        city: 'Tacna'
      },
      {
        id: 'tarapoto',
        name: 'Exitosa Tarapoto',
        url: 'https://aacplus.rstreaming.net:8590/stream',
        image: '/radios/exitosa-tarapoto.png',
        description: 'Exitosa en la Ciudad de las Palmeras',
        region: 'tarapoto',
        city: 'Tarapoto'
      }
    ];

    for (const station of stationData) {
      await db.execute({
        sql: 'INSERT INTO stations (id, name, url, image, description, region, city) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        args: [station.id, station.name, station.url, station.image, station.description, station.region, station.city]
      });
    }

    // Insertar redes sociales para las principales estaciones
    const socialData = [
      {
        station_id: 'lima',
        facebook: 'https://www.facebook.com/Exitosanoticias',
        youtube: 'https://www.youtube.com/@exitosape',
        tiktok: 'https://www.tiktok.com/@exitosanoticias'
      },
      {
        station_id: 'arequipa',
        facebook: 'https://www.facebook.com/ExitosaArequipaOficial',
        youtube: 'https://www.youtube.com/@exitosaarequipa',
        tiktok: 'https://www.tiktok.com/@exitosaarequipa'
      },
      {
        station_id: 'chiclayo',
        facebook: 'https://www.facebook.com/exitosachiclayofm',
        youtube: 'https://www.youtube.com/@exitosachiclayo',
        tiktok: 'https://www.tiktok.com/@exitosachiclayo'
      },
      {
        station_id: 'trujillo',
        facebook: 'https://www.facebook.com/ExitosaTrujillo',
        youtube: 'https://www.youtube.com/@exitosatrujillo',
        tiktok: 'https://www.tiktok.com/@exitosa.trujillo'
      }
    ];

    for (const social of socialData) {
      await db.execute({
        sql: 'INSERT INTO social_links (station_id, facebook, youtube, tiktok) VALUES ($1, $2, $3, $4)',
        args: [social.station_id, social.facebook, social.youtube, social.tiktok]
      });
    }

    console.log('Datos iniciales insertados correctamente');
  } catch (error) {
    console.error('Error al insertar datos iniciales:', error);
  }
}