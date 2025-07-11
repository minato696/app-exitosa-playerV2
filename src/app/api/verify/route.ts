// src/app/api/verify/route.ts
// Script para verificar que todo esté funcionando correctamente

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { existsSync } from 'fs';
import path from 'path';

export async function GET() {
  const results = {
    database: false,
    stations: 0,
    programs: 0,
    uploads: false,
    images: false,
    errors: [] as string[]
  };

  try {
    // Verificar base de datos
    try {
      const testQuery = await db.execute('SELECT 1');
      results.database = true;
    } catch (error) {
      results.errors.push('Base de datos no inicializada');
    }

    // Contar estaciones
    if (results.database) {
      try {
        const stations = await db.execute('SELECT COUNT(*) as count FROM stations WHERE active = 1');
        results.stations = Number(stations.rows[0].count);
      } catch (error) {
        results.errors.push('Tabla de estaciones no encontrada');
      }

      // Contar programas
      try {
        const programs = await db.execute('SELECT COUNT(*) as count FROM programs');
        results.programs = Number(programs.rows[0].count);
      } catch (error) {
        results.errors.push('Tabla de programas no encontrada');
      }
    }

    // Verificar carpetas
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
    results.uploads = existsSync(uploadsPath);
    if (!results.uploads) {
      results.errors.push('Carpeta /public/uploads no existe');
    }

    const imagesPath = path.join(process.cwd(), 'public', 'radios');
    results.images = existsSync(imagesPath);
    if (!results.images) {
      results.errors.push('Carpeta /public/radios no existe');
    }

    // Resumen
    const isHealthy = results.database && 
                     results.stations > 0 && 
                     results.programs > 0 && 
                     results.uploads && 
                     results.images;

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      message: isHealthy ? 
        '✅ Todo está funcionando correctamente' : 
        '⚠️ Se encontraron problemas',
      details: results,
      recommendations: isHealthy ? [] : [
        results.database ? null : 'Ejecuta /api/init para inicializar la BD',
        results.stations === 0 ? 'Ejecuta /api/load-schedule?all=true para cargar estaciones' : null,
        results.programs === 0 ? 'Ejecuta /api/load-schedule?all=true para cargar programas' : null,
        !results.uploads ? 'Crea las carpetas: mkdir -p public/uploads/programs public/uploads/stations' : null,
        !results.images ? 'Crea la carpeta: mkdir -p public/radios' : null
      ].filter(Boolean)
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Error al verificar el sistema',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}