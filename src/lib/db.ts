// src/lib/db.ts
import { createClient } from '@libsql/client';

export const db = createClient({
  url: 'file:local.db',
});

// Inicializar tablas
export async function initDatabase() {
  try {
    // Tabla de estaciones mejorada
    await db.execute(`
      CREATE TABLE IF NOT EXISTS stations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        image TEXT,
        description TEXT,
        region TEXT NOT NULL,
        city TEXT NOT NULL,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de programas mejorada
    await db.execute(`
      CREATE TABLE IF NOT EXISTS programs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_id TEXT NOT NULL,
        name TEXT NOT NULL,
        host TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        image TEXT,
        description TEXT,
        day_type TEXT NOT NULL CHECK (day_type IN ('weekday', 'saturday', 'sunday')),
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
      )
    `);

    // Tabla de redes sociales por región
    await db.execute(`
      CREATE TABLE IF NOT EXISTS social_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_id TEXT NOT NULL,
        facebook TEXT,
        youtube TEXT,
        tiktok TEXT,
        instagram TEXT,
        twitter TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
      )
    `);

    // Tabla de metadata actual (programa en vivo)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS live_metadata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_id TEXT NOT NULL,
        program_name TEXT,
        host TEXT,
        description TEXT,
        start_time TEXT,
        end_time TEXT,
        listeners_count INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
      )
    `);

    console.log('Base de datos inicializada correctamente');
    
    // Insertar datos iniciales si no existen
    await seedInitialData();
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}

// Seed de datos iniciales mejorado
async function seedInitialData() {
  try {
    // Verificar si ya hay datos
    const stations = await db.execute('SELECT COUNT(*) as count FROM stations');
    if (stations.rows[0].count > 0) {
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
      await db.execute(
        'INSERT INTO stations (id, name, url, image, description, region, city) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [station.id, station.name, station.url, station.image, station.description, station.region, station.city]
      );
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
      await db.execute(
        'INSERT INTO social_links (station_id, facebook, youtube, tiktok) VALUES (?, ?, ?, ?)',
        [social.station_id, social.facebook, social.youtube, social.tiktok]
      );
    }

    console.log('Datos iniciales insertados correctamente');
  } catch (error) {
    console.error('Error al insertar datos iniciales:', error);
  }
}