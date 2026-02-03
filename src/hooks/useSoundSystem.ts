import { useState, useEffect, useCallback } from 'react';
import { audioEngine } from '@/lib/audioEngine';
import { useLocalStorage } from './useLocalStorage';

export function useSoundSystem() {
  const [volume, setVolume] = useLocalStorage('sfx-volume', 0.5);
  const [isMuted, setIsMuted] = useLocalStorage('sfx-muted', false);

  // Sync state with engine
  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    audioEngine.toggleMute(isMuted);
  }, [isMuted]);

  const playSound = useCallback((type: 'shoot' | 'hit' | 'miss' | 'type' | 'error') => {
    // Attempt to resume context on every interaction (safest way to handle autoplay policy)
    audioEngine.resume();
    audioEngine.play(type);
  }, []);

  const handleVolumeChange = (newVolume: number[]) => {
    const val = newVolume[0];
    setVolume(val);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return {
    playSound,
    volume,
    setVolume: handleVolumeChange,
    isMuted,
    toggleMute,
  };
}
