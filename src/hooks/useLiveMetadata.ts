// src/hooks/useLiveMetadata.ts
import { useState, useEffect, useCallback } from 'react';

interface LiveMetadata {
  currentProgram: {
    name: string;
    host: string;
    start_time: string;
    end_time: string;
    image?: string;
    description?: string;
  } | null;
  liveMetadata: {
    program_name?: string;
    host?: string;
    description?: string;
    listeners_count?: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

export function useLiveMetadata(stationId: string, refreshInterval = 60000) {
  const [data, setData] = useState<LiveMetadata>({
    currentProgram: null,
    liveMetadata: null,
    isLoading: true,
    error: null
  });

  const fetchMetadata = useCallback(async (station: string) => {
    if (!station) return;

    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(`/api/live-metadata?stationId=${station}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener metadata');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData({
          currentProgram: result.data.currentProgram,
          liveMetadata: result.data.liveMetadata,
          isLoading: false,
          error: null
        });
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al obtener metadata'
      }));
    }
  }, []);

  useEffect(() => {
    console.log('useLiveMetadata: Station changed to', stationId);
    
    // ✅ Limpiar metadatos anteriores inmediatamente
    setData({
      currentProgram: null,
      liveMetadata: null,
      isLoading: true,
      error: null
    });

    // ✅ Fetch inmediato para la nueva estación
    fetchMetadata(stationId);

    // ✅ Configurar intervalo de actualización
    const interval = setInterval(() => {
      fetchMetadata(stationId);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [stationId, refreshInterval, fetchMetadata]);

  // ✅ Función para refrescar manualmente
  const refetch = useCallback(() => {
    fetchMetadata(stationId);
  }, [stationId, fetchMetadata]);

  return { ...data, refetch };
}