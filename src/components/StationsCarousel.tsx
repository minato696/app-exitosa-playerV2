// src/components/StationsCarousel.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Station {
  id: string;
  name: string;
  url: string;
  image?: string;
  city: string;
  region: string;
  active: boolean;
}

interface StationsCarouselProps {
  stations: Station[];
  currentStation: number;
  isPlaying: boolean;
  isBuffering: boolean;
  onStationChange: (index: number) => void;
  onPrevStation: () => void;
  onNextStation: () => void;
}

export const StationsCarousel: React.FC<StationsCarouselProps> = ({
  stations,
  currentStation,
  isPlaying,
  isBuffering,
  onStationChange,
  onPrevStation,
  onNextStation
}) => {
  return (
    <div className="stations-bar">
      <button 
        className="carousel-arrow" 
        onClick={onPrevStation} 
        disabled={isBuffering}
        title="Estación anterior"
      >
        <ChevronLeft size={24} />
      </button>
      
      {stations.map((station, i) => (
        <button 
          key={station.id} 
          onClick={() => onStationChange(i)} 
          className={`station-button ${i === currentStation ? 'active' : ''} ${i === currentStation && isPlaying ? 'playing' : ''}`}
          style={{
            backgroundImage: station.image ? `url(${station.image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          disabled={isBuffering}
          title={`${station.name} - ${station.city}`}
        >
          {!station.image && (
            <div className="station-button-inner">
              <span className="station-name">{station.city}</span>
            </div>
          )}
        </button>
      ))}
      
      <button 
        className="carousel-arrow" 
        onClick={onNextStation} 
        disabled={isBuffering}
        title="Siguiente estación"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};