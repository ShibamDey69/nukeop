import React, { createContext, useContext, useState } from 'react';
import { Track } from '../data';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  currentIndex: number;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlayPause: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const currentTrack = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  const playTrack = (track: Track, newQueue?: Track[]) => {
    const activeQueue = newQueue || queue;
    if (newQueue) setQueue(newQueue);

    const idx = activeQueue.findIndex(t => t.id === track.id);
    if (idx !== -1) {
      setCurrentIndex(idx);
    } else {
      setQueue([...activeQueue, track]);
      setCurrentIndex(activeQueue.length);
    }
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (!currentTrack && queue.length > 0) {
      setCurrentIndex(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying(prev => !prev);
  };

  const skipNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(true);
    }
  };

  const skipPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  };

  return (
    <PlayerContext.Provider value={{ 
      currentTrack, isPlaying, queue, currentIndex, playTrack, togglePlayPause, skipNext, skipPrevious 
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
