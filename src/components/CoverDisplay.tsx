// src/components/CoverDisplay.tsx
import React from 'react';
import { Play, Radio, Loader } from 'lucide-react';

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
}

interface CoverDisplayProps {
  station: Station;
  programInfo: ProgramInfo;
  currentProgram: CurrentProgram | null;
  currentStationId: string;
  isPlaying: boolean;
  isBuffering: boolean;
  onTogglePlay: () => void;
}

export const CoverDisplay: React.FC<CoverDisplayProps> = ({
  station,
  programInfo,
  currentProgram,
  currentStationId,
  isPlaying,
  isBuffering,
  onTogglePlay
}) => {
  const currentProgramImage = currentProgram?.image || programInfo.image;
  const stationImage = station?.image;
  const displayImage = isPlaying && currentProgramImage ? currentProgramImage : stationImage;

  return (
    <div className="cover-container">
      {displayImage ? (
        <img 
          src={displayImage} 
          alt={isPlaying ? programInfo.title : station.name} 
          className="cover-image"
          key={`${currentStationId}-${displayImage}`}
        />
      ) : (
        <div className="placeholder">
          <Radio size={48} />
          <span className="station-placeholder-name">{station.city}</span>
          <span className="station-placeholder-frequency">Radio Exitosa</span>
        </div>
      )}
      
      {!isPlaying && !isBuffering && (
        <button onClick={onTogglePlay} className="play-button">
          <Play size={32} />
        </button>
      )}
      
      {isBuffering && (
        <div className="buffering-overlay">
          <Loader size={32} className="buffering-spinner" />
        </div>
      )}
    </div>
  );
};