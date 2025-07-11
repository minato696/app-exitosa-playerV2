// src/components/LoadingScreen.tsx
import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Cargando" 
}) => {
  return (
    <div className="loading-screen-container">
      <style jsx>{`
        .loading-screen-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: fadeIn 0.8s ease-out;
        }

        .logo-container {
          position: relative;
          margin-bottom: 32px;
          animation: logoFloat 2s ease-in-out infinite;
        }

        .logo {
          width: 120px;
          height: auto;
          filter: drop-shadow(0 8px 32px rgba(215, 0, 7, 0.2));
          transition: all 0.3s ease;
        }

        .loading-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 160px;
          height: 160px;
          border: 3px solid transparent;
          border-top: 3px solid #D70007;
          border-radius: 50%;
          animation: spin 1.2s linear infinite;
        }

        .loading-ring::before {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          border: 2px solid transparent;
          border-top: 2px solid rgba(215, 0, 7, 0.3);
          border-radius: 50%;
          animation: spin 2s linear infinite reverse;
        }

        .loading-text {
          font-size: 24px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }

        .loading-subtitle {
          font-size: 16px;
          color: #64748b;
          font-weight: 400;
          opacity: 0.8;
        }

        .loading-dots {
          display: inline-block;
          animation: dots 1.5s infinite;
        }

        .pulse-effect {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          border: 2px solid rgba(215, 0, 7, 0.1);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .pulse-effect:nth-child(2) {
          animation-delay: 0.5s;
          width: 240px;
          height: 240px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes spin {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0;
          }
        }

        @keyframes dots {
          0%, 20% {
            color: transparent;
            text-shadow: 
              .25em 0 0 transparent,
              .5em 0 0 transparent;
          }
          40% {
            color: #64748b;
            text-shadow: 
              .25em 0 0 transparent,
              .5em 0 0 transparent;
          }
          60% {
            text-shadow: 
              .25em 0 0 #64748b,
              .5em 0 0 transparent;
          }
          80%, 100% {
            text-shadow: 
              .25em 0 0 #64748b,
              .5em 0 0 #64748b;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .logo {
            width: 100px;
          }

          .loading-ring {
            width: 140px;
            height: 140px;
          }

          .loading-text {
            font-size: 20px;
          }

          .loading-subtitle {
            font-size: 14px;
          }

          .pulse-effect {
            width: 180px;
            height: 180px;
          }

          .pulse-effect:nth-child(2) {
            width: 220px;
            height: 220px;
          }
        }

        @media (max-width: 480px) {
          .logo {
            width: 80px;
          }

          .loading-ring {
            width: 120px;
            height: 120px;
          }

          .loading-text {
            font-size: 18px;
          }

          .pulse-effect {
            width: 160px;
            height: 160px;
          }

          .pulse-effect:nth-child(2) {
            width: 200px;
            height: 200px;
          }
        }
      `}</style>

      <div className="loading-content">
        <div className="logo-container">
          <div className="pulse-effect"></div>
          <div className="pulse-effect"></div>
          <div className="loading-ring"></div>
          <img 
            src="https://statics.exitosanoticias.pe/exitosa/img/global/exitosa.svg"
            alt="Radio Exitosa"
            className="logo"
            onError={(e) => {
              // Fallback si el logo no carga
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        
        <h2 className="loading-text">{message}</h2>
        <p className="loading-subtitle">
          Radio Exitosa<span className="loading-dots">...</span>
        </p>
      </div>
    </div>
  );
};