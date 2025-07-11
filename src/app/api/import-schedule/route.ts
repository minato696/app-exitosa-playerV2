// src/app/api/import-schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { weekdaySchedule, saturdaySchedule, sundaySchedule } from '@/schedule';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId') || 'lima'; // Por defecto Lima
    
    // Limpiar programas existentes para esta estación (opcional)
    const clearExisting = searchParams.get('clear') === 'true';
    if (clearExisting) {
      await db.execute({
        sql: 'DELETE FROM programs WHERE station_id = ?',
        args: [stationId]
      });
    }
    
    // Importar programas de días de semana
    for (const program of weekdaySchedule) {
      await db.execute({
        sql: `INSERT INTO programs (station_id, name, host, start_time, end_time, image, description, day_type) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          stationId,
          program.name,
          program.host,
          program.startTime,
          program.endTime,
          program.image,
          program.description || null,
          'weekday'
        ]
      });
    }
    
    // Importar programas de sábado
    for (const program of saturdaySchedule) {
      await db.execute({
        sql: `INSERT INTO programs (station_id, name, host, start_time, end_time, image, description, day_type) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          stationId,
          program.name,
          program.host,
          program.startTime,
          program.endTime,
          program.image,
          program.description || null,
          'saturday'
        ]
      });
    }
    
    // Importar programas de domingo
    for (const program of sundaySchedule) {
      await db.execute({
        sql: `INSERT INTO programs (station_id, name, host, start_time, end_time, image, description, day_type) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          stationId,
          program.name,
          program.host,
          program.startTime,
          program.endTime,
          program.image,
          program.description || null,
          'sunday'
        ]
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Programación importada correctamente para ${stationId}`,
      data: {
        weekday: weekdaySchedule.length,
        saturday: saturdaySchedule.length,
        sunday: sundaySchedule.length
      }
    });
  } catch (error) {
    console.error('Error al importar schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Error al importar schedule' },
      { status: 500 }
    );
  }
}