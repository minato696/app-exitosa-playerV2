// src/app/api/manual-setup/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const steps = {
    dropTables: { success: false, error: null },
    createStations: { success: false, error: null },
    createPrograms: { success: false, error: null },
    createSocialLinks: { success: false, error: null },
    createLiveMetadata: { success: false, error: null },
    insertStations: { success: false, error: null, count: 0 }
  };

  try {
    // Paso 1: Eliminar tablas existentes
    try {
      await db.execute('DROP TABLE IF EXISTS live_metadata');
      await db.execute('DROP TABLE IF EXISTS social_links');
      await db.execute('DROP TABLE IF EXISTS programs');
      await db.execute('DROP TABLE IF EXISTS stations');
      steps.dropTables.success = true;
    } catch (error: any) {
      steps.dropTables.error = error.message;
    }

    // Paso 2: Crear tabla stations
    try {
      await db.execute(`
        CREATE TABLE stations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          url TEXT NOT NULL,
          image TEXT,
          description TEXT,
          region TEXT NOT NULL,
          city TEXT NOT NULL,
          active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      steps.createStations.success = true;
    } catch (error: any) {
      steps.createStations.error = error.message;
    }

    // Paso 3: Crear tabla programs
    try {
      await db.execute(`
        CREATE TABLE programs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          station_id TEXT NOT NULL,
          name TEXT NOT NULL,
          host TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          image TEXT,
          description TEXT,
          day_type TEXT NOT NULL,
          active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (station_id) REFERENCES stations(id)
        )
      `);
      steps.createPrograms.success = true;
    } catch (error: any) {
      steps.createPrograms.error = error.message;
    }

    // Paso 4: Crear tabla social_links
    try {
      await db.execute(`
        CREATE TABLE social_links (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          station_id TEXT NOT NULL,
          facebook TEXT,
          youtube TEXT,
          tiktok TEXT,
          instagram TEXT,
          twitter TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (station_id) REFERENCES stations(id)
        )
      `);
      steps.createSocialLinks.success = true;
    } catch (error: any) {
      steps.createSocialLinks.error = error.message;
    }

    // Paso 5: Crear tabla live_metadata
    try {
      await db.execute(`
        CREATE TABLE live_metadata (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          station_id TEXT NOT NULL,
          program_name TEXT,
          host TEXT,
          description TEXT,
          start_time TEXT,
          end_time TEXT,
          listeners_count INTEGER DEFAULT 0,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (station_id) REFERENCES stations(id)
        )
      `);
      steps.createLiveMetadata.success = true;
    } catch (error: any) {
      steps.createLiveMetadata.error = error.message;
    }

    // Paso 6: Insertar estaciones
    if (steps.createStations.success) {
      const stations = [
        ['lima', 'Exitosa Lima', 'https://aacplus.rstreaming.net:7190/stream', '/radios/LIMA.jpg', 'La radio más escuchada del Perú', 'lima', 'Lima'],
        ['arequipa', 'Exitosa Arequipa', 'https://aacplus.rstreaming.net:7790/stream', '/radios/AREQUIPA.jpg', 'Exitosa en la Ciudad Blanca', 'arequipa', 'Arequipa'],
        ['chiclayo', 'Exitosa Chiclayo', 'https://aacplus.rstreaming.net:7490/stream', '/radios/CHICLAYO.jpg', 'Exitosa en la Capital de la Amistad', 'chiclayo', 'Chiclayo'],
        ['trujillo', 'Exitosa Trujillo', 'https://aacplus.rstreaming.net:7590/stream', '/radios/TRUJILLO.jpg', 'Exitosa en la Ciudad de la Eterna Primavera', 'trujillo', 'Trujillo']
      ];

      let count = 0;
      for (const station of stations) {
        try {
          await db.execute(
            'INSERT INTO stations (id, name, url, image, description, region, city) VALUES (?, ?, ?, ?, ?, ?, ?)',
            station
          );
          count++;
        } catch (error: any) {
          steps.insertStations.error = error.message;
        }
      }
      steps.insertStations.count = count;
      steps.insertStations.success = count > 0;
    }

    // Verificar resultados
    const allSuccess = Object.values(steps).every(step => step.success);

    return NextResponse.json({
      success: allSuccess,
      message: allSuccess ? 'Setup completado exitosamente' : 'Setup completado con algunos errores',
      steps,
      nextStep: allSuccess ? 'Ahora ejecuta /api/load-schedule?all=true para cargar los programas' : 'Revisa los errores e intenta nuevamente'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error general en setup',
      details: error instanceof Error ? error.message : 'Error desconocido',
      steps
    }, { status: 500 });
  }
}