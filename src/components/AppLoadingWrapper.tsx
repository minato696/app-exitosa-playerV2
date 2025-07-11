// src/components/AppLoadingWrapper.tsx - Simple y directo como antes
'use client';

import React, { useState, useEffect } from 'react';
import { LoadingScreenPremium } from './LoadingScreenPremium';

interface AppLoadingWrapperProps {
  children: React.ReactNode;
  minLoadingTime?: number;
}

export const AppLoadingWrapper: React.FC<AppLoadingWrapperProps> = ({ 
  children, 
  minLoadingTime = 200 // ✅ MÁS RÁPIDO: 0.2 segundos
}) => {
  const [loadingState, setLoadingState] = useState<'loading' | 'exiting' | 'complete'>('loading');
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Agregar clase al body para evitar scroll durante carga
    document.body.classList.add('loading');
    
    const timer = setTimeout(() => {
      // Iniciar transición de salida
      setLoadingState('exiting');
    }, minLoadingTime);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove('loading');
    };
  }, [minLoadingTime]);

  const handleExitComplete = () => {
    // Completar la transición y mostrar el contenido
    setLoadingState('complete');
    setShowContent(true);
    document.body.classList.remove('loading');
  };

  // Si estamos cargando o en transición de salida, mostrar loading
  if (loadingState !== 'complete') {
    return (
      <LoadingScreenPremium 
        message="Cargando" 
        isExiting={loadingState === 'exiting'}
        onExitComplete={handleExitComplete}
      />
    );
  }

  // Una vez completado, mostrar el contenido
  return (
    <div style={{ 
      opacity: showContent ? 1 : 0, 
      transition: 'opacity 0.3s ease-in-out' 
    }}>
      {children}
    </div>
  );
};