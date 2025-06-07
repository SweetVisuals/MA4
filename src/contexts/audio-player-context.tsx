import { createContext, useContext, useState, useRef, useEffect } from 'react';

export type Track = {
  id: string;
  title: string;
  duration: string;
  artworkUrl?: string;
  artist?: string;
  projectTitle?: string;
  audioUrl?: string; // URL to the audio file
  file_url?: string; // Alternative URL field from database
};

type AudioPlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  progress: number;
  duration: number;
  seek: (time: number) => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType>({
  currentTrack: null,
  isPlaying: false,
  playTrack: () => {},
  togglePlay: () => {},
  progress: 0,
  duration: 0,
  seek: () => {},
});

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    
    // Set up event listeners
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);
  
  // Update audio source when track changes
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      // Use the track's audio URL or file_url as fallback
      const audioSource = currentTrack.audioUrl || currentTrack.file_url || '';
      
      if (!audioSource) {
        console.error('No audio source available for track:', currentTrack);
        return;
      }
      
      audioRef.current.src = audioSource;
      
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrack]);
  
  const updateProgress = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };
  
  const updateDuration = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };
  
  const handleError = (e: Event) => {
    console.error('Error playing audio:', e);
    setIsPlaying(false);
  };

  const playTrack = (track: Track) => {
    // If it's the same track, just toggle play/pause
    if (currentTrack && currentTrack.id === track.id) {
      togglePlay();
      return;
    }
    
    // Otherwise, set the new track and start playing
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  return (
    <AudioPlayerContext.Provider 
      value={{ 
        currentTrack, 
        isPlaying, 
        playTrack, 
        togglePlay,
        progress,
        duration,
        seek
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export const useAudioPlayer = () => useContext(AudioPlayerContext);