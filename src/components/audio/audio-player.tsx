import { Button } from "@/components/@/ui/button"
import { Play, Pause, Volume2, Heart, SkipBack, SkipForward } from 'lucide-react'
import { useAudioPlayer } from '@/contexts/audio-player-context'
import { useEffect, useState } from "react"
import { Progress } from "@/components/@/ui/progress"

export function AudioPlayer() {
  const { currentTrack, isPlaying, togglePlay, progress, duration, seek } = useAudioPlayer()
  const [volume, setVolume] = useState(100)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  
  // Format time in MM:SS format
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return
    
    const progressBar = e.currentTarget
    const rect = progressBar.getBoundingClientRect()
    const clickPosition = e.clientX - rect.left
    const percentage = clickPosition / rect.width
    const newTime = percentage * duration
    
    seek(newTime)
  }
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value)
    setVolume(newVolume)
    
    // Update actual audio volume
    const audioElement = document.querySelector('audio')
    if (audioElement) {
      audioElement.volume = newVolume / 100
    }
  }

  return (
    <div className={`fixed bottom-0 left-0 md:left-[var(--sidebar-width)] right-0 bg-background/95 backdrop-blur-sm border-t z-[50] transition-all duration-200 ease-in-out shadow-lg transform translate-z-0 ${!currentTrack ? 'translate-y-full' : 'translate-y-0'}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Track Info */}
          {currentTrack && (
            <div className="flex items-center gap-3 min-w-0 w-[200px]">
              {currentTrack.artworkUrl && (
                <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                  <img 
                    src={currentTrack.artworkUrl} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{currentTrack.title}</p>
                {currentTrack.projectTitle && (
                  <p className="text-xs text-muted-foreground truncate">
                    {currentTrack.projectTitle}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Playback Controls */}
          <div className="flex flex-col items-center gap-1 flex-1 max-w-md">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button 
                variant="default" 
                size="icon" 
                className="h-10 w-10 rounded-full"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full flex items-center gap-2">
              <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">
                {formatTime(progress)}
              </span>
              <div 
                className="flex-1 h-1 bg-muted rounded-full cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume & Actions */}
          <div className="flex items-center gap-2 w-[200px] justify-end">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9"
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              
              {showVolumeSlider && (
                <div className="absolute bottom-full mb-2 p-2 bg-background border rounded-md shadow-md">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
            
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}