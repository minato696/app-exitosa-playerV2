// src/components/LoadingScreenPremium.tsx - Exports corregidos para TypeScript
import React, { useState, useEffect } from 'react';
import '../styles/loading-screen-premium.css';

interface LoadingScreenPremiumProps {
  message?: string;
  isExiting?: boolean;
  onExitComplete?: () => void;
}

export const LoadingScreenPremium: React.FC<LoadingScreenPremiumProps> = ({ 
  message = "Cargando",
  isExiting = false,
  onExitComplete
}) => {
  const [logoError, setLogoError] = useState(false);
  const [isExitingState, setIsExitingState] = useState(false);

  useEffect(() => {
    if (isExiting) {
      setIsExitingState(true);
      // Llamar onExitComplete después de la transición
      const timer = setTimeout(() => {
        onExitComplete?.();
      }, 500); // Duración de la transición CSS
      
      return () => clearTimeout(timer);
    }
  }, [isExiting, onExitComplete]);

  const handleLogoError = () => {
    setLogoError(true);
  };

  return (
    <div className={`premium-loading-container ${isExitingState ? 'fade-out' : ''}`}>
      {/* Grid de noticias en el fondo */}
      <div className="news-grid" />

      {/* Líneas de datos/transmisión en el fondo */}
      <div className="news-data-lines">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="data-line" />
        ))}
      </div>

      {/* Ondas de radio */}
      <div className="radio-waves">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="radio-wave" />
        ))}
      </div>

      <div className="premium-loading-content">
        <div className="premium-logo-wrapper">
          {/* Resplandor de fondo */}
          <div className="premium-logo-glow" />
          
          {/* Líneas de señal alrededor del logo */}
          <div className="signal-lines">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="signal-line" />
            ))}
          </div>
          
          {/* Logo real con fallback */}
          {!logoError ? (
            <img 
              src="https://statics.exitosanoticias.pe/exitosa/img/global/exitosa.svg"
              alt="Radio Exitosa"
              className="premium-logo"
              onError={handleLogoError}
              onLoad={() => console.log('Logo cargado exitosamente')}
            />
          ) : (
            <div className="premium-logo-fallback">
              EXITOSA
            </div>
          )}
        </div>
        
        <h2 className="premium-loading-text">{message}</h2>
        <p className="premium-loading-subtitle">
          LA VOZ DE LOS QUE NO TIENEN VOZ
        </p>
        
        {/* Barra de progreso profesional */}
        <div className="premium-progress-bar">
          <div className="premium-progress-fill" />
        </div>
      </div>
    </div>
  );
};

// Export por defecto también para dynamic import
export default LoadingScreenPremium;