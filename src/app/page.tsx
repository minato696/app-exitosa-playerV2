// src/app/page.tsx - Final optimizado con transiciones
import React from 'react';
import RadioPlayer from '../components/RadioPlayer';
import { AppLoadingWrapper } from '../components/AppLoadingWrapper';

export default function HomePage() {
  return (
    <AppLoadingWrapper minLoadingTime={2500}>
      <div className="app-content-enter">
        <RadioPlayer />
      </div>
    </AppLoadingWrapper>
  );
}