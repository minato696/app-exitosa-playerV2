// src/components/ControlsBar.tsx
import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Loader } from 'lucide-react';

interface Station {
  id: string;
  name: string;
  city: string;
  image?: string;
}

interface ProgramInfo {
  title: string;
  subtitle: string;
  image: string | null;
}

interface CurrentProgram {
  image?: string;
  start_time?: string;
  end_time?: string;
}

interface ControlsBarProps {
  station: Station;
  programInfo: ProgramInfo;
  currentProgram: CurrentProgram | null;
  currentStationId: string;
  isPlaying: boolean;
  isBuffering: boolean;
  programProgress: number;
  onTogglePlay: () => void;
  onPrevStation: () => void;
  onNextStation: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  station,
  programInfo,
  currentProgram,
  currentStationId,
  isPlaying,
  isBuffering,
  programProgress,
  onTogglePlay,
  onPrevStation,
  onNextStation
}) => {
  const currentProgramImage = currentProgram?.image || programInfo.image;
  const stationImage = station?.image;

  return (
    <div className="controls-bar">
      <div className="controls-container">
        {/* Información del programa a la izquierda */}
        <div className="now-playing-info">
          <div className="now-playing-cover">
            {(currentProgramImage || stationImage) && (
              <img 
                src={currentProgramImage || stationImage} 
                alt={programInfo.title}
                key={`controls-${currentStationId}-${currentProgramImage || stationImage}`}
              />
            )}
          </div>
          <div className="now-playing-text">
            <p className="now-playing-title">{programInfo.title}</p>
            <p className="now-playing-artist">{programInfo.subtitle}</p>
          </div>
        </div>
        
        {/* Controles de reproducción */}
        <div className="player-controls">
          <button 
            className="player-control-button" 
            onClick={onPrevStation}
            disabled={isBuffering}
            title="Estación anterior"
          >
            <SkipBack size={20} />
          </button>
          <button 
            className="player-control-button play" 
            onClick={onTogglePlay}
            disabled={isBuffering}
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isBuffering ? (
              <Loader size={20} className="buffering-spinner" />
            ) : isPlaying ? (
              <Pause size={20} />
            ) : (
              <Play size={20} />
            )}
          </button>
          <button 
            className="player-control-button" 
            onClick={onNextStation}
            disabled={isBuffering}
            title="Siguiente estación"
          >
            <SkipForward size={20} />
          </button>
        </div>
        
        {/* Hora de inicio */}
        <div className="time-start">
          {currentProgram?.start_time || '00:00'}
        </div>
        
        {/* Progress bar del programa */}
        <div className="program-progress-section">
          {currentProgram?.start_time && currentProgram?.end_time && isPlaying ? (
            <div className="program-progress-bar">
              <div 
                className="program-progress-fill" 
                style={{ width: `${programProgress}%` }}
              ></div>
            </div>
          ) : (
            <div className="simple-progress-bar">
              <div 
                className="progress-bar-fill" 
                style={{ width: isPlaying ? '100%' : '0%' }}
              ></div>
            </div>
          )}
        </div>
        
        {/* Hora de fin */}
        <div className="time-end">
          {currentProgram?.end_time || '00:00'}
        </div>
      </div>
    </div>
  );
};