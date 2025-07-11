// src/app/api/init/route.ts
import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initDatabase();
    return NextResponse.json({
      success: true,
      message: 'Base de datos inicializada correctamente'
    });
  } catch (error) {
    console.error('Error al inicializar base de datos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al inicializar base de datos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}