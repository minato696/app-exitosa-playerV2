// src/components/ProgramInfo.tsx
import React from 'react';

interface Station {
  id: string;
  name: string;
  city: string;
}

interface ProgramInfo {
  title: string;
  subtitle: string;
  image: string | null;
}

interface CurrentProgram {
  start_time: string;
  end_time: string;
}

interface LiveMetadata {
  listeners_count?: number;
}

function formatTime(time: string | undefined): string {
  if (!time) return '';
  return time.slice(0, 5);
}

interface ProgramInfoProps {
  station: Station;
  programInfo: ProgramInfo;
  currentProgram: CurrentProgram | null;
  liveMetadata: LiveMetadata | null;
  isPlaying: boolean;
  isBuffering: boolean;
}

export const ProgramInfo: React.FC<ProgramInfoProps> = ({
  station,
  programInfo,
  currentProgram,
  liveMetadata,
  isPlaying,
  isBuffering
}) => {
  return (
    <div className="program-info-globalplayer">
      <div className="on-air-badge">
        {isBuffering ? 'CARGANDO...' : 'EN VIVO'}
      </div>
      
      <h2 className="program-title-globalplayer">
        {isPlaying ? programInfo.title : station.name}
      </h2>
      
      <p className="program-time-globalplayer">
        {isPlaying && currentProgram ? (
`${programInfo.subtitle} • ${formatTime(currentProgram.start_time)} - ${formatTime(currentProgram.end_time)}`

) : (
          station.city
        )}
      </p>
      
      {liveMetadata?.listeners_count && isPlaying && (
        <p className="listeners-count">
          👥 {liveMetadata.listeners_count} oyentes
        </p>
      )}
    </div>
  );
};