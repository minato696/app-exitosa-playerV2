// src/components/RadioPlayer.tsx (Refactorizado)
'use client';

import React from 'react';
import { Radio } from 'lucide-react';
import '../styles/radio-player.css';
import SidebarMenu from './SidebarMenu';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';
import { StationsCarousel } from './StationsCarousel';
import { ProgramInfo } from './ProgramInfo';
import { CoverDisplay } from './CoverDisplay';
import { ControlsBar } from './ControlsBar';

const RadioPlayer: React.FC = () => {
  const {
    // Estado
    stations,
    currentStation,
    isPlaying,
    isLoading,
    isBuffering,
    programProgress,
    programInfo,
    audioRef,
    
    // Metadatos
    currentProgram,
    liveMetadata,
    
    // Acciones
    togglePlay,
    changeStation,
    prevStation,
    nextStation
  } = useRadioPlayer();

  // Estados de carga
// Si está cargando, mostrar la interfaz normal pero vacía
if (isLoading) {
  return (
    <div className="player-container">
      <SidebarMenu />
      <div className="main-content">
        {/* La interfaz aparecerá cuando termine de cargar */}
      </div>
    </div>
  );
}

  if (stations.length === 0) {
    return (
      <div className="player-container">
        <div className="error-screen">
          <div style={{ marginBottom: '24px' }}>
            <img 
              src="https://statics.exitosanoticias.pe/exitosa/img/global/exitosa.svg"
              alt="Radio Exitosa"
              style={{ width: '120px', height: 'auto', opacity: 0.7 }}
            />
          </div>
          <Radio size={48} style={{ marginBottom: '16px', color: '#64748b' }} />
          <p style={{ fontSize: '18px', color: '#1e293b', fontWeight: '600' }}>
            No hay estaciones disponibles
          </p>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
            Inténtalo de nuevo en unos momentos
          </p>
        </div>
      </div>
    );
  }

  const currentStationData = stations[currentStation];
  const currentStationId = currentStationData?.id || '';

  return (
    <div className="player-container">
      <SidebarMenu />

      <div className="main-content">
        {/* Carrusel de estaciones */}
        <StationsCarousel
          stations={stations}
          currentStation={currentStation}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          onStationChange={changeStation}
          onPrevStation={prevStation}
          onNextStation={nextStation}
        />

        <div className="content-area">
          {/* Información del programa */}
          <ProgramInfo
            station={currentStationData}
            programInfo={programInfo}
            currentProgram={currentProgram}
            liveMetadata={liveMetadata}
            isPlaying={isPlaying}
            isBuffering={isBuffering}
          />
          
          {/* Cover/Imagen principal */}
          <CoverDisplay
            station={currentStationData}
            programInfo={programInfo}
            currentProgram={currentProgram}
            currentStationId={currentStationId}
            isPlaying={isPlaying}
            isBuffering={isBuffering}
            onTogglePlay={togglePlay}
          />
        </div>

        {/* Barra de controles FIJA en la parte inferior */}
        <ControlsBar
          station={currentStationData}
          programInfo={programInfo}
          currentProgram={currentProgram}
          currentStationId={currentStationId}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          programProgress={programProgress}
          onTogglePlay={togglePlay}
          onPrevStation={prevStation}
          onNextStation={nextStation}
        />
      </div>

      {/* Audio element */}
      <audio 
        ref={audioRef} 
        preload="none" 
        crossOrigin="anonymous"
        autoPlay={false}
        loop={false}
        controls={false}
      >
        {currentStationData && (
          <source src={currentStationData.url} type="audio/mpeg" />
        )}
        Tu navegador no soporta audio.
      </audio>
    </div>
  );
};

export default RadioPlayer;