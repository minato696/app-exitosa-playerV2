// src/components/StationSelector.tsx
import React from 'react';
import '@/styles/station-selector.css';

interface Station {
  id: string;
  name: string;
  fullName: string;
  frequency: string;
  url: string;
  type: string;
  host: string;
  time: string;
  image?: string;
}

interface StationSelectorProps {
  stations: Station[];
  currentStation: number;
  onChangeStation: (index: number) => void;
}

const StationSelector: React.FC<StationSelectorProps> = ({ 
  stations, 
  currentStation, 
  onChangeStation
}) => {
  
  // ✅ Función mejorada para cambio de estación
  const handleStationChange = (index: number) => {
    console.log('StationSelector: Changing station to index', index, stations[index]?.id);
    onChangeStation(index);
  };

  return (
    <div className="station-selector">
      <div className="selector-container">
        {stations.map((station, index) => (
          <button
            key={station.id}
            className={`station-button ${index === currentStation ? 'active' : ''}`}
            onClick={() => handleStationChange(index)}
          >
            <div className="station-button-inner">
              <span className="station-name">{station.name}</span>
              <span className="station-frequency">{station.frequency}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StationSelector;