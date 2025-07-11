// src/app/api/programs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener todos los programas o filtrar por estación y día
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');
    const dayType = searchParams.get('dayType');
    const active = searchParams.get('active');
    
    let query = 'SELECT p.*, s.name as station_name FROM programs p LEFT JOIN stations s ON p.station_id = s.id WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;
    
    if (stationId) {
      paramCount++;
      query += ` AND p.station_id = $${paramCount}`;
      params.push(stationId);
    }
    
    if (dayType) {
      paramCount++;
      query += ` AND p.day_type = $${paramCount}`;
      params.push(dayType);
    }
    
    if (active !== null) {
      paramCount++;
      query += ` AND p.active = $${paramCount}`;
      params.push(active === 'true');
    }
    
    query += ' ORDER BY p.start_time ASC';
    
    const result = await db.execute({
      sql: query,
      args: params
    });
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener programas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener programas' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo programa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { station_id, name, host, start_time, end_time, image, description, day_type } = body;
    
    // Validación básica
    if (!station_id || !name || !host || !start_time || !end_time || !day_type) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }
    
    // Validar que day_type sea válido
    if (!['weekday', 'saturday', 'sunday'].includes(day_type)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de día no válido' },
        { status: 400 }
      );
    }
    
    const result = await db.execute({
      sql: `INSERT INTO programs (station_id, name, host, start_time, end_time, image, description, day_type) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      args: [station_id, name, host, start_time, end_time, image || null, description || null, day_type]
    });
    
    return NextResponse.json({
      success: true,
      data: { id: result.rows[0].id, ...body }
    });
  } catch (error) {
    console.error('Error al crear programa:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear programa' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar programa
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, station_id, name, host, start_time, end_time, image, description, day_type, active } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID del programa requerido' },
        { status: 400 }
      );
    }
    
    await db.execute({
      sql: `UPDATE programs 
            SET station_id = $1, name = $2, host = $3, start_time = $4, end_time = $5, 
                image = $6, description = $7, day_type = $8, active = $9, updated_at = CURRENT_TIMESTAMP
            WHERE id = $10`,
      args: [
        station_id, 
        name, 
        host, 
        start_time, 
        end_time, 
        image, 
        description, 
        day_type, 
        active !== undefined ? active : true,
        id
      ]
    });
    
    return NextResponse.json({
      success: true,
      data: body
    });
  } catch (error) {
    console.error('Error al actualizar programa:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar programa' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar programa
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const hard = searchParams.get('hard') === 'true';
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID del programa requerido' },
        { status: 400 }
      );
    }
    
    if (hard) {
      // Obtener la imagen antes de eliminar
      const program = await db.execute({
        sql: 'SELECT image FROM programs WHERE id = $1',
        args: [id]
      });
      
      // Eliminar permanentemente
      await db.execute({
        sql: 'DELETE FROM programs WHERE id = $1',
        args: [id]
      });
      
      // Si había una imagen, podrías eliminarla del servidor aquí
    } else {
      // Soft delete
      await db.execute({
        sql: 'UPDATE programs SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        args: [id]
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Programa ${hard ? 'eliminado permanentemente' : 'desactivado'} correctamente`
    });
  } catch (error) {
    console.error('Error al eliminar programa:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar programa' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar solo la imagen del programa
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, image } = body;
    
    if (!id || !image) {
      return NextResponse.json(
        { success: false, error: 'ID y URL de imagen requeridos' },
        { status: 400 }
      );
    }
    
    await db.execute({
      sql: 'UPDATE programs SET image = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      args: [image, id]
    });
    
    return NextResponse.json({
      success: true,
      data: { id, image }
    });
  } catch (error) {
    console.error('Error al actualizar imagen:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar imagen' },
      { status: 500 }
    );
  }
}