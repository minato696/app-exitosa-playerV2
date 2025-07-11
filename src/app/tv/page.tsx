// src/app/tv/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import SidebarMenu from '../../components/SidebarMenu';
import '../../styles/radio-player.css';
import '../../styles/tv-page.css';
import { Play, Pause, ChevronLeft, ChevronRight, Volume2, SkipBack, SkipForward } from 'lucide-react';

export default function TVPage() {
  const [currentStation, setCurrentStation] = useState(0);
  const [showTV, setShowTV] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTVPlayButton, setShowTVPlayButton] = useState(true);
  const [programInfo, setProgramInfo] = useState({
    title: 'Canal TV en vivo',
    subtitle: 'Exitosa TV'
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  
  const stations = [
    {
      id: 'tv',
      name: 'TV',
      fullName: 'Exitosa TV',
      frequency: 'Canal Digital',
      url: '',
      type: '',
      host: 'Canal TV',
      time: '24 horas',
      image: '/images/tv.jpg'
    },
    {
      id: 'lima',
      name: 'Lima',
      fullName: 'Exitosa Lima',
      frequency: '95.5 FM',
      url: 'https://neptuno-2-audio.mediaserver.digital/79525baf-b0f5-4013-a8bd-3c5c293c6561',
      type: 'audio/mpeg',
      host: 'Carlos Orozco',
      time: '7pm - 10pm',
      image: '/images/lima.jpg'
    },
    {
      id: 'arequipa',
      name: 'Arequipa',
      fullName: 'Exitosa Arequipa',
      frequency: '97.7 FM',
      url: 'https://radios-player-exitosa.mediaserver.digital/exitosa.arequipa',
      type: 'audio/mpeg',
      host: 'María Sánchez',
      time: '6pm - 9pm',
      image: '/images/arequipa.jpg'
    },
    {
      id: 'chiclayo',
      name: 'Chiclayo',
      fullName: 'Exitosa Chiclayo',
      frequency: '88.5 FM',
      url: 'https://radios-player-exitosa.mediaserver.digital/exitosa.chiclayo',
      type: 'audio/mpeg',
      host: 'Juan Mendoza',
      time: '8pm - 11pm',
      image: '/images/chiclayo.jpg'
    },
    {
      id: 'trujillo',
      name: 'Trujillo',
      fullName: 'Exitosa Trujillo',
      frequency: '104.7 FM',
      url: 'https://radios-player-exitosa.mediaserver.digital/exitosa.trujillo',
      type: 'audio/mpeg',
      host: 'Patricia Flores',
      time: '7pm - 10pm',
      image: '/images/trujillo.jpg'
    }
  ];

  const changeStation = (index: number) => {
    if (index === 0) {
      switchToTV();
      return;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = stations[index].url;
      audioRef.current.load();
    }
    
    setCurrentStation(index);
    setShowTV(false); // Cambiar a radio
    setIsPlaying(false);
    
    setProgramInfo({
      title: stations[index].host,
      subtitle: `Exitosa ${stations[index].name}`
    });
  };

  const togglePlay = () => {
    if (showTV) {
      // Si estamos en TV, cargar el iframe cuando el usuario haga clic
      setShowTVPlayButton(false);
      return;
    }
    
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setProgramInfo({
          title: stations[currentStation].host,
          subtitle: `Exitosa ${stations[currentStation].name}`
        });
      }).catch(e => {
        console.error('Error al reproducir:', e);
      });
    }
  };

  const switchToTV = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setShowTV(true);
    setCurrentStation(0);
    setIsPlaying(false);
    setShowTVPlayButton(true);
    setProgramInfo({
      title: 'Canal TV en vivo',
      subtitle: 'Exitosa TV'
    });
  };

  const prevStation = () => {
    const newIndex = (currentStation - 1 + stations.length) % stations.length;
    changeStation(newIndex);
  };

  const nextStation = () => {
    const newIndex = (currentStation + 1) % stations.length;
    changeStation(newIndex);
  };

  return (
    <div className="player-container">
      <SidebarMenu />

      <div className="main-content">
        <div className="stations-bar">
          <button className="carousel-arrow" onClick={prevStation}>
            <ChevronLeft size={24} />
          </button>
          
          {stations.map((s, i) => (
            <button 
              key={s.id} 
              onClick={() => changeStation(i)} 
              className={`station-button ${i === currentStation ? 'active' : ''}`}
            >
              <div className="station-button-inner">
                <span className="station-name">{s.name}</span>
              </div>
            </button>
          ))}
          
          <button className="carousel-arrow" onClick={nextStation}>
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="content-area">
          {/* Información del programa - estilo GlobalPlayer */}
          <div className="program-info-globalplayer">
            <div className="on-air-badge">ON AIR</div>
            <h2 className="program-title-globalplayer">
              {stations[currentStation].host}
            </h2>
            <p className="program-time-globalplayer">
              {stations[currentStation].time}
            </p>
          </div>
          
          {showTV ? (
            // Reproductor de TV
            <div className="cover-container tv-player-container">
              {showTVPlayButton ? (
                <div className="tv-placeholder">
                  <button onClick={togglePlay} className="play-button tv-play">
                    <Play size={40} />
                  </button>
                </div>
              ) : (
                <iframe 
                  ref={iframeRef}
                  src="https://luna-1-video.mediaserver.digital/exitosatv_233b-4b49-a726-5a451262/embed.html" 
                  className="tv-iframe"
                  frameBorder="0" 
                  scrolling="no" 
                  allowFullScreen={true}
                ></iframe>
              )}
            </div>
          ) : (
            // Reproductor de Radio
            <div className="cover-container">
              {stations[currentStation].image ? (
                <img 
                  src={stations[currentStation].image} 
                  alt={stations[currentStation].fullName} 
                  className="cover-image" 
                />
              ) : (
                <div className="placeholder">
                  <span className="station-placeholder-name">{stations[currentStation].name}</span>
                  <span className="station-placeholder-frequency">{stations[currentStation].frequency}</span>
                </div>
              )}
              
              <button onClick={togglePlay} className="play-button">
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              </button>
            </div>
          )}
        </div>

        {/* Barra de controles estilo GlobalPlayer */}
        <div className="controls-bar">
          <div className="controls-container">
            <div className="now-playing-info">
              <div className="now-playing-cover">
                {/* Mini cover */}
              </div>
              <div className="now-playing-text">
                <p className="now-playing-title">{programInfo.title}</p>
                <p className="now-playing-artist">{programInfo.subtitle}</p>
              </div>
            </div>
            
            {!showTV && (
              <div className="player-controls">
                <button className="player-control-button">
                  <SkipBack size={20} />
                </button>
                <button className="player-control-button play" onClick={togglePlay}>
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button className="player-control-button">
                  <SkipForward size={20} />
                </button>
              </div>
            )}
            
            <div className="time-display">23:00</div>
            
            <div className="progress-bar-container">
              <div className="progress-bar-fill"></div>
            </div>
            
            <div className="time-display">03:00</div>
            
            <div className="volume-control">
              <Volume2 size={18} />
              <input type="range" className="volume-slider" min="0" max="100" defaultValue="80" />
            </div>
          </div>
        </div>
      </div>

      <audio ref={audioRef} preload="auto" crossOrigin="anonymous">
        <source src={stations[currentStation]?.url} type={stations[currentStation]?.type} />
        Tu navegador no soporta audio.
      </audio>
    </div>
  );
}