// src/hooks/useRadioPlayer.ts
import { useState, useRef, useEffect, useCallback } from 'react';
import { useLiveMetadata } from './useLiveMetadata';

interface Station {
  id: string;
  name: string;
  url: string;
  image?: string;
  description?: string;
  city: string;
  region: string;
  active: boolean;
}

interface ProgramInfo {
  title: string;
  subtitle: string;
  image: string | null;
}

export const useRadioPlayer = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [currentStation, setCurrentStation] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [programProgress, setProgramProgress] = useState<number>(0);
  const [programInfo, setProgramInfo] = useState<ProgramInfo>({
    title: 'Haz clic en reproducir',
    subtitle: '',
    image: null
  });
  const [hasAutoPlayed, setHasAutoPlayed] = useState<boolean>(false);
  const [userPaused, setUserPaused] = useState<boolean>(false);
  const [isChangingStation, setIsChangingStation] = useState<boolean>(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Hook de metadatos
  const currentStationId = stations[currentStation]?.id || '';
  const { currentProgram, liveMetadata, isLoading: metadataLoading, refetch } = useLiveMetadata(currentStationId);

  // Fetch de estaciones
  const fetchStations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stations?active=true');
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setStations(data.data);
        const limaIndex = data.data.findIndex((station: Station) => station.id === 'lima');
        setCurrentStation(limaIndex !== -1 ? limaIndex : 0);
      } else {
        console.error('No se encontraron estaciones activas');
      }
    } catch (error) {
      console.error('Error al cargar estaciones:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cálculo del progreso del programa
  const calculateProgramProgress = useCallback((now: Date, startTime: string, endTime: string): number => {
    try {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const start = new Date(now);
      start.setHours(startHour, startMinute, 0, 0);
      
      const end = new Date(now);
      end.setHours(endHour, endMinute, 0, 0);
      
      if (end < start) {
        end.setDate(end.getDate() + 1);
      }
      
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      
      if (elapsed >= 0 && elapsed <= totalDuration) {
        return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      }
      
      return 0;
    } catch (error) {
      console.error('Error calculating program progress:', error);
      return 0;
    }
  }, []);

  // Actualizar información del programa
  const updateProgramInfo = useCallback((currentProgram: any, liveMetadata: any) => {
    const program = liveMetadata?.program_name ? liveMetadata : currentProgram;
    
    if (program) {
      const programName = program.name || program.program_name || 'En vivo';
      const hostName = program.host || program.conductor || 'Radio Exitosa';
      
      setProgramInfo({
        title: programName,
        subtitle: hostName,
        image: program.image || null
      });
      
      setTimeout(() => updateMediaSession(), 100);
    }
  }, []);

  // Media Session API
  const setupMediaSession = useCallback(() => {
    if (!('mediaSession' in navigator)) return;
    
    navigator.mediaSession.setActionHandler('play', () => {
      if (!isPlaying) togglePlay();
    });
    
    navigator.mediaSession.setActionHandler('pause', () => {
      if (isPlaying) togglePlay();
    });
    
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      prevStation();
    });
    
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      nextStation();
    });
    
    navigator.mediaSession.setActionHandler('stop', () => {
      if (isPlaying) togglePlay();
    });
  }, [isPlaying]);

  const updateMediaSession = useCallback(() => {
    if (!('mediaSession' in navigator) || !stations[currentStation]) return;
    
    const station = stations[currentStation];
    const currentProgramImage = currentProgram?.image || programInfo.image;
    const fallbackImage = station.image || '/favicon.ico';
    
    let title, artist, album;
    
    if (isPlaying && currentProgram && currentProgram.name && currentProgram.name !== station.name) {
      title = currentProgram.name;
      artist = currentProgram.host || 'Radio Exitosa';
      album = `Exitosa ${station.city}`;
    } else if (isPlaying && liveMetadata && liveMetadata.program_name) {
      title = liveMetadata.program_name;
      artist = liveMetadata.host || 'Radio Exitosa';
      album = `Exitosa ${station.city}`;
    } else {
      title = `${station.name}`;
      artist = `Exitosa ${station.city}`;
      album = 'Radio Exitosa';
    }
    
    const artwork = [];
    
    if (currentProgramImage && currentProgramImage !== fallbackImage) {
      artwork.push({ 
        src: currentProgramImage, 
        sizes: '500x500', 
        type: 'image/jpeg' 
      });
    }
    
    if (station.image) {
      artwork.push({ 
        src: station.image, 
        sizes: '256x256', 
        type: 'image/png' 
      });
    }
    
    artwork.push({ 
      src: '/favicon.ico', 
      sizes: '64x64', 
      type: 'image/x-icon' 
    });
    
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title,
      artist: artist,
      album: album,
      artwork: artwork
    });
  }, [stations, currentStation, currentProgram, liveMetadata, programInfo.image, isPlaying]);

  // Cambiar estación
  const changeStation = useCallback(async (index: number) => {
    if (!audioRef.current || !stations[index] || index === currentStation) return;
    
    const wasPlaying = isPlaying;
    setIsChangingStation(true);
    setUserPaused(false);
    setIsBuffering(true);
    
    setProgramInfo({
      title: 'Cambiando estación...',
      subtitle: `Exitosa ${stations[index].city}`,
      image: null
    });

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);

      audioRef.current.src = stations[index].url;
      audioRef.current.load();
      setCurrentStation(index);
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout loading station')), 10000);
        
        const handleCanPlay = () => {
          clearTimeout(timeout);
          audioRef.current?.removeEventListener('canplay', handleCanPlay);
          audioRef.current?.removeEventListener('error', handleError);
          resolve(true);
        };
        
        const handleError = (e: Event) => {
          clearTimeout(timeout);
          audioRef.current?.removeEventListener('canplay', handleCanPlay);
          audioRef.current?.removeEventListener('error', handleError);
          reject(e);
        };
        
        audioRef.current?.addEventListener('canplay', handleCanPlay);
        audioRef.current?.addEventListener('error', handleError);
      });
      
      if (wasPlaying) {
        setIsPlaying(true);
        await audioRef.current.play();
        setIsBuffering(false);
      } else {
        setIsBuffering(false);
        setProgramInfo({
          title: stations[index].name,
          subtitle: `Exitosa ${stations[index].city}`,
          image: null
        });
      }
      
      setTimeout(() => updateMediaSession(), 100);
      
    } catch (error) {
      console.error('Error al cambiar estación:', error);
      setIsPlaying(false);
      setIsBuffering(false);
      setProgramInfo({
        title: 'Error al cargar',
        subtitle: `Exitosa ${stations[index].city}`,
        image: null
      });
    } finally {
      setIsChangingStation(false);
    }
  }, [stations, currentStation, isPlaying, updateMediaSession]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current || !stations[currentStation]) return;
    
    if (isPlaying) {
      setUserPaused(true);
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsBuffering(false);
    } else {
      setUserPaused(false);
      setIsBuffering(true);
      setIsPlaying(true);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsBuffering(false);
          setTimeout(() => updateMediaSession(), 100);
        }).catch(e => {
          console.error('Error al reproducir:', e);
          setIsBuffering(false);
          setIsPlaying(false);
        });
      }
    }
  }, [isPlaying, stations, currentStation, updateMediaSession]);

  // Navegación
  const prevStation = useCallback(() => {
    const newIndex = (currentStation - 1 + stations.length) % stations.length;
    changeStation(newIndex);
  }, [currentStation, stations.length, changeStation]);

  const nextStation = useCallback(() => {
    const newIndex = (currentStation + 1) % stations.length;
    changeStation(newIndex);
  }, [currentStation, stations.length, changeStation]);

  // Effects
  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      if (currentProgram?.start_time && currentProgram?.end_time && isPlaying) {
        const progress = calculateProgramProgress(now, currentProgram.start_time, currentProgram.end_time);
        setProgramProgress(progress);
      } else {
        setProgramProgress(0);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentProgram, isPlaying, calculateProgramProgress]);

  useEffect(() => {
    if (isPlaying && (currentProgram || liveMetadata)) {
      updateProgramInfo(currentProgram, liveMetadata);
    } else if (stations[currentStation]) {
      setProgramInfo({
        title: isPlaying ? 'En vivo' : stations[currentStation].name,
        subtitle: `Exitosa ${stations[currentStation].city}`,
        image: null
      });
    }
    
    if (isPlaying) {
      setTimeout(() => updateMediaSession(), 150);
    }
  }, [currentProgram, liveMetadata, isPlaying, stations, currentStation, currentStationId, updateProgramInfo, updateMediaSession]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      setupMediaSession();
    }
  }, [setupMediaSession]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // Auto-play Lima
  useEffect(() => {
    if (
      stations.length > 0 && 
      stations[currentStation] && 
      stations[currentStation].id === 'lima' && 
      !isPlaying && 
      !isLoading && 
      !hasAutoPlayed &&
      !userPaused &&
      !isChangingStation && 
      audioRef.current
    ) {
      const timer = setTimeout(() => {
        setIsBuffering(true);
        setIsPlaying(true);
        audioRef.current!.play().then(() => {
          setIsBuffering(false);
          setHasAutoPlayed(true);
          setTimeout(() => updateMediaSession(), 200);
        }).catch(e => {
          console.error('Error al reproducir automáticamente:', e);
          setIsBuffering(false);
          setIsPlaying(false);
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [stations, currentStation, isLoading, isPlaying, hasAutoPlayed, userPaused, isChangingStation, updateMediaSession]);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => setIsBuffering(true);
    const handleLoadedData = () => setIsBuffering(false);
    const handleCanPlay = () => setIsBuffering(false);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    
    const handleError = (e: Event) => {
      console.error('Error de audio:', e);
      setIsBuffering(false);
      setIsPlaying(false);
    };

    const handlePlay = (e: Event) => {
      if (isChangingStation) {
        return true;
      }
      
      if (!isPlaying || userPaused) {
        e.preventDefault();
        audio.pause();
        audio.currentTime = 0;
        return false;
      }
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
    };
  }, [isPlaying, userPaused, isChangingStation]);

  return {
    // Estado
    stations,
    currentStation,
    isPlaying,
    isLoading,
    isBuffering,
    currentTime,
    programProgress,
    programInfo,
    audioRef,
    
    // Metadatos
    currentProgram,
    liveMetadata,
    metadataLoading,
    
    // Acciones
    togglePlay,
    changeStation,
    prevStation,
    nextStation,
    refetch
  };
};