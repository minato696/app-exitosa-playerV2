// src/app/api/stations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener todas las estaciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    
    let query = 'SELECT * FROM stations';
    const params: any[] = [];
    
    if (active !== null) {
      query += ' WHERE active = $1';
      params.push(active === 'true');
    }
    
    query += ' ORDER BY name ASC';
    
    const result = await db.execute({
      sql: query,
      args: params
    });
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener estaciones:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener estaciones' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva estación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, url, image, description, region, city } = body;
    
    // Validación básica
    if (!id || !name || !url || !region || !city) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }
    
    // Verificar si el ID ya existe
    const existing = await db.execute({
      sql: 'SELECT id FROM stations WHERE id = $1',
      args: [id]
    });
    
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una estación con ese ID' },
        { status: 400 }
      );
    }
    
    const result = await db.execute({
      sql: `INSERT INTO stations (id, name, url, image, description, region, city) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      args: [id, name, url, image || null, description || null, region, city]
    });
    
    return NextResponse.json({
      success: true,
      data: { id, ...body }
    });
  } catch (error) {
    console.error('Error al crear estación:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear estación' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar estación
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, url, image, description, region, city, active } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de la estación requerido' },
        { status: 400 }
      );
    }
    
    await db.execute({
      sql: `UPDATE stations 
            SET name = $1, url = $2, image = $3, description = $4, region = $5, 
                city = $6, active = $7, updated_at = CURRENT_TIMESTAMP
            WHERE id = $8`,
      args: [name, url, image, description, region, city, active !== undefined ? active : true, id]
    });
    
    return NextResponse.json({
      success: true,
      data: body
    });
  } catch (error) {
    console.error('Error al actualizar estación:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar estación' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar estación (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const hard = searchParams.get('hard') === 'true';
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de la estación requerido' },
        { status: 400 }
      );
    }
    
    if (hard) {
      // Eliminar permanentemente - primero eliminar dependencias
      await db.execute({
        sql: 'DELETE FROM live_metadata WHERE station_id = $1',
        args: [id]
      });
      
      await db.execute({
        sql: 'DELETE FROM social_links WHERE station_id = $1',
        args: [id]
      });
      
      await db.execute({
        sql: 'DELETE FROM programs WHERE station_id = $1',
        args: [id]
      });
      
      await db.execute({
        sql: 'DELETE FROM stations WHERE id = $1',
        args: [id]
      });
    } else {
      // Soft delete
      await db.execute({
        sql: 'UPDATE stations SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        args: [id]
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Estación ${hard ? 'eliminada permanentemente' : 'desactivada'} correctamente`
    });
  } catch (error) {
    console.error('Error al eliminar estación:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar estación' },
      { status: 500 }
    );
  }
}