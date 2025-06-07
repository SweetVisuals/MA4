import { useState, useRef, useEffect } from 'react'
import { Avatar } from "@/components/@/ui/avatar"
import { Button } from "@/components/@/ui/button"
import {
  Card,
  CardContent,
} from "@/components/@/ui/card"
import { Play, Pause, SkipBack, SkipForward, Sparkles, Heart, MessageCircle, Bookmark } from "lucide-react"

export function AudioPlayerCard() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause()
    } else {
      audioRef.current?.play()
    }
    setIsPlaying(!isPlaying)
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return
    
    const progressBar = e.currentTarget
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left
    const progressBarWidth = progressBar.clientWidth
    const seekPercentage = clickPosition / progressBarWidth
    const seekTime = duration * seekPercentage
    
    audioRef.current.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  return (
    <Card className="h-full data-[slot=card]:shadow-xs data-[slot=card]:bg-gradient-to-t data-[slot=card]:from-primary/5 data-[slot=card]:to-card dark:data-[slot=card]:bg-card">
      {/* User Info Card */}
      <div className="m-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-gray-300 rounded-full h-8 w-8" />
          <div className="ml-2">
            <p className="text-gray-900 dark:text-white text-[9px] font-medium">username</p>
            <p className="text-gray-500 dark:text-gray-400 text-[9px] font-medium">Producer</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-900 dark:text-white text-[9px] font-medium">1.2K Followers</p>
          <p className="text-gray-500 dark:text-gray-400 text-[9px] font-medium">Project Name</p>
        </div>
      </div>
      
      <CardContent className="flex flex-col items-center p-2">
        {/* Track Title */}
        <p className="text-center text-sm font-bold text-gray-900 dark:text-white truncate w-full mb-2">
          Midnight Serenade
        </p>

        {/* Hidden Audio Element */}
        <audio ref={audioRef} src="/audio/sample.mp3" preload="metadata" />

        {/* Progress Bar */}
        <div className="w-full space-y-1 mb-2">
          <div 
            className="flex h-1 items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full rounded-full bg-blue-500 dark:bg-blue-400" 
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} 
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-medium text-gray-500 dark:text-gray-400">
            <p>{formatTime(currentTime)}</p>
            <p>{formatTime(duration)}</p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex justify-center items-center gap-1 w-full mb-2">
          <Button variant="ghost" size="icon" className="rounded-full size-6">
            <SkipBack className="h-3 w-3" />
          </Button>
          <Button 
            variant="default" 
            size="icon" 
            className="rounded-full size-8 bg-blue-500 dark:bg-blue-400 text-white dark:text-gray-900 hover:bg-blue-600 dark:hover:bg-blue-500"
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full size-6">
            <SkipForward className="h-3 w-3" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-1 w-full mb-2">
          <Button variant="secondary" className="w-full h-6 px-1 rounded-full text-[9px] font-bold">
            Buy
          </Button>
          <Button variant="secondary" className="w-full h-6 px-1 rounded-full text-[9px] font-bold">
            Lease
          </Button>
          <Button variant="secondary" className="w-full h-6 px-1 rounded-full text-[9px] font-bold">
            Message
          </Button>
        </div>

        {/* Social Interactions */}
        <div className="flex items-center justify-around w-full px-1 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Button variant="ghost" className="gap-0.5 px-0.5 py-0.5 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
            <Sparkles className="h-2.5 w-2.5" />
            <p className="text-[9px] font-bold">12</p>
          </Button>
          <Button variant="ghost" className="gap-0.5 px-0.5 py-0.5 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
            <Heart className="h-2.5 w-2.5" />
            <p className="text-[9px] font-bold">34</p>
          </Button>
          <Button variant="ghost" className="gap-0.5 px-0.5 py-0.5 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
            <MessageCircle className="h-2.5 w-2.5" />
            <p className="text-[9px] font-bold">56</p>
          </Button>
          <Button variant="ghost" className="gap-0.5 px-0.5 py-0.5 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
            <Bookmark className="h-2.5 w-2.5" />
            <p className="text-[9px] font-bold">7</p>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
