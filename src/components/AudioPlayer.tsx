'use client';

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Trash2 } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  filename: string;
  onDelete?: () => void;
  canDelete?: boolean;
}

export const AudioPlayer = ({ src, filename, onDelete, canDelete }: AudioPlayerProps) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("ended", () => setPlaying(false));

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
      audio.removeEventListener("ended", () => setPlaying(false));
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
      <button onClick={togglePlay} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
        {playing ? <Pause size={20} /> : <Play size={20} />}
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="truncate text-sm font-medium text-white flex-1 min-w-0">{filename}</span>
          <span className="text-xs text-slate-400">{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-1.5">
          <div className="bg-rose-400 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      {canDelete && (
        <button onClick={onDelete} className="p-2 text-slate-400 hover:text-rose-400">
          <Trash2 size={18} />
        </button>
      )}
      <audio ref={audioRef} src={src} type="audio/webm" preload="metadata" className="hidden" />
    </div>
  );
};
