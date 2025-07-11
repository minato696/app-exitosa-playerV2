// src/app/api/live-metadata/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener metadata actual de una estación
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');
    
    if (!stationId) {
      return NextResponse.json(
        { success: false, error: 'ID de estación requerido' },
        { status: 400 }
      );
    }
    
    // Obtener la hora actual
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    const currentDay = now.getDay(); // 0 = Domingo, 6 = Sábado
    
    let dayType = 'weekday';
    if (currentDay === 0) dayType = 'sunday';
    else if (currentDay === 6) dayType = 'saturday';
    
    // Buscar el programa actual basado en la hora
    const programResult = await db.execute({
      sql: `SELECT * FROM programs 
            WHERE station_id = ? 
            AND day_type = ? 
            AND start_time <= ? 
            AND end_time > ?
            ORDER BY start_time DESC 
            LIMIT 1`,
      args: [stationId, dayType, currentTime, currentTime]
    });
    
    // Obtener metadata en vivo si existe
    const liveResult = await db.execute({
      sql: 'SELECT * FROM live_metadata WHERE station_id = ? ORDER BY updated_at DESC LIMIT 1',
      args: [stationId]
    });
    
    const currentProgram = programResult.rows[0] || null;
    const liveMetadata = liveResult.rows[0] || null;
    
    return NextResponse.json({
      success: true,
      data: {
        currentProgram,
        liveMetadata,
        currentTime,
        dayType
      }
    });
  } catch (error) {
    console.error('Error al obtener metadata:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener metadata' },
      { status: 500 }
    );
  }
}

// POST - Actualizar metadata en vivo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { station_id, program_name, host, description, start_time, end_time, listeners_count } = body;
    
    if (!station_id) {
      return NextResponse.json(
        { success: false, error: 'ID de estación requerido' },
        { status: 400 }
      );
    }
    
    // Verificar si ya existe metadata para esta estación
    const existing = await db.execute({
      sql: 'SELECT id FROM live_metadata WHERE station_id = ?',
      args: [station_id]
    });
    
    if (existing.rows.length > 0) {
      // Actualizar registro existente
      await db.execute({
        sql: `UPDATE live_metadata 
              SET program_name = ?, host = ?, description = ?, start_time = ?, 
                  end_time = ?, listeners_count = ?, updated_at = CURRENT_TIMESTAMP
              WHERE station_id = ?`,
        args: [program_name, host, description, start_time, end_time, listeners_count || 0, station_id]
      });
    } else {
      // Crear nuevo registro
      await db.execute({
        sql: `INSERT INTO live_metadata 
              (station_id, program_name, host, description, start_time, end_time, listeners_count) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [station_id, program_name, host, description, start_time, end_time, listeners_count || 0]
      });
    }
    
    return NextResponse.json({
      success: true,
      data: body
    });
  } catch (error) {
    console.error('Error al actualizar metadata:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar metadata' },
      { status: 500 }
    );
  }
}