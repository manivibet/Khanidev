import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw, Download } from 'lucide-react';

interface AudioPlayerProps {
  audioBase64?: string;
  mimeType?: string;
  textToRead?: string;
  language?: 'Urdu' | 'Pashto' | 'English';
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioBase64,
  mimeType = 'audio/wav',
  textToRead,
  language = 'English',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Convert base64 to Blob URL or prepare audio
  useEffect(() => {
    if (audioBase64) {
      try {
        const byteCharacters = atob(audioBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (e) {
        console.error('Error creating audio blob:', e);
      }
    }
  }, [audioBase64, mimeType]);

  const togglePlay = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else if (textToRead && 'speechSynthesis' in window) {
      // Browser SpeechSynthesis fallback
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 300));
        if (language === 'Urdu') utterance.lang = 'ur-PK';
        else if (language === 'Pashto') utterance.lang = 'ps-AF';
        else utterance.lang = 'en-US';

        utterance.rate = playbackRate;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 0.75];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="mt-3 inline-flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs shadow-inner">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold shadow transition transform active:scale-95 cursor-pointer"
          title={isPlaying ? 'Pause' : 'Play voice response'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium text-emerald-300">
            {audioBase64 ? 'Gemini AI Voice' : 'Speech Voice'}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">{language}</span>
        </div>
      </div>

      {audioUrl && (
        <div className="flex items-center gap-2 flex-1 min-w-[140px] px-1">
          <span className="text-[10px] font-mono text-slate-400">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-[10px] font-mono text-slate-400">{formatTime(duration)}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 justify-end">
        <button
          onClick={cycleSpeed}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition"
          title="Playback speed"
        >
          {playbackRate}x
        </button>

        {audioUrl && (
          <>
            <button
              onClick={handleReset}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
              title="Replay from start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <a
              href={audioUrl}
              download={`SHEZI_MANI_AI_reply.wav`}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-300 transition"
              title="Download audio WAV"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          </>
        )}
      </div>
    </div>
  );
};
