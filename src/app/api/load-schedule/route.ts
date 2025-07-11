// src/app/api/load-schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loadAllPrograms, loadProgramsForAllStations } from '@/lib/loadScheduleData';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');
    const allStations = searchParams.get('all') === 'true';
    const clearExisting = searchParams.get('clear') !== 'false'; // Default true
    
    if (allStations) {
      // Cargar para todas las estaciones
      const result = await loadProgramsForAllStations();
      return NextResponse.json(result);
    } else if (stationId) {
      // Cargar para una estación específica
      const result = await loadAllPrograms(stationId, clearExisting);
      return NextResponse.json(result);
    } else {
      // Por defecto cargar solo para Lima
      const result = await loadAllPrograms('lima', clearExisting);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error al cargar programación:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al cargar programación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}