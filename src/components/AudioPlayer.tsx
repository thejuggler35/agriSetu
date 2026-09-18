import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Loader2,
  Sparkles,
  Radio,
} from 'lucide-react';
import { Language } from '../types';

interface AudioPlayerProps {
  textToRead: string;
  language: Language;
  title?: string;
  audioUrl?: string;
  compact?: boolean;
  autoPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  textToRead,
  language,
  title,
  audioUrl,
  compact = false,
  autoPlay = false,
}) => {
  const isHi = language === 'hi' || /[\u0900-\u097F]/.test(textToRead);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1.0);
  const [audioSource, setAudioSource] = useState<'server_ai' | 'browser_tts'>('server_ai');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fallbackTimeoutRef = useRef<number | null>(null);

  // Clean text of markdown and non-speech symbols
  const cleanSpeechText = (raw: string) => {
    return (raw || '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s+/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[-*•]\s+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const resolvedText = cleanSpeechText(textToRead);

  // Construct target audio endpoint
  const targetAudioUrl =
    audioUrl ||
    `/api/audio-speech?text=${encodeURIComponent(resolvedText.slice(0, 320))}&lang=${isHi ? 'hi' : 'en'}`;

  // Reset playback when text or audioUrl changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
    setCurrentTime(0);
    setDuration(0);

    if (autoPlay && resolvedText) {
      const t = setTimeout(() => {
        handlePlay();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [resolvedText, targetAudioUrl, autoPlay]);

  // Clean up on unmount & warm up voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = onVoicesChanged;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
    };
  }, []);

  // Web Speech Fallback Method
  const playWithSpeechSynthesis = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsLoading(false);
      setIsPlaying(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(resolvedText);
      utteranceRef.current = utterance;

      utterance.lang = isHi ? 'hi-IN' : 'en-IN';
      utterance.rate = rate;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const targetLangPrefix = isHi ? 'hi' : 'en';
        const matchedVoice =
          voices.find(
            (v) =>
              v.lang.toLowerCase().startsWith(`${targetLangPrefix}-in`) ||
              v.lang.toLowerCase().startsWith(targetLangPrefix) ||
              (isHi &&
                (v.name.toLowerCase().includes('hindi') ||
                  v.name.toLowerCase().includes('lekha') ||
                  v.name.toLowerCase().includes('kalpana') ||
                  v.name.includes('हिन्दी')))
          ) ||
          voices.find((v) => v.lang.toLowerCase().startsWith('en-in')) ||
          voices[0];

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      utterance.onstart = () => {
        setIsLoading(false);
        setIsPlaying(true);
        setIsPaused(false);
        setAudioSource('browser_tts');
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onerror = () => {
        setIsLoading(false);
        setIsPlaying(false);
        setIsPaused(false);
      };

      // Chrome keeps utterance alive workaround
      const keepAlive = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          clearInterval(keepAlive);
        }
      }, 10000);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis fallback error:', e);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const handlePlay = () => {
    if (!resolvedText) return;

    // If currently paused in HTML5 audio
    if (isPaused && audioRef.current && audioSource === 'server_ai') {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsPaused(false);
        })
        .catch(() => {
          playWithSpeechSynthesis();
        });
      return;
    }

    // If currently paused in SpeechSynthesis
    if (isPaused && audioSource === 'browser_tts' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Stop any existing sound
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setIsLoading(true);

    // Initialize or reuse Audio element
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'auto';

      audio.onplay = () => {
        setIsLoading(false);
        setIsPlaying(true);
        setIsPaused(false);
        setAudioSource('server_ai');
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentTime(0);
      };

      audio.onerror = (e) => {
        console.warn('Audio element error, triggering fallback:', e);
        setIsLoading(false);
        playWithSpeechSynthesis();
      };

      audioRef.current = audio;
    }

    const audio = audioRef.current;
    audio.playbackRate = rate;

    // Load target URL if changed or unset
    if (audio.src !== targetAudioUrl) {
      audio.src = targetAudioUrl;
    }

    // Safeguard timeout: If audio loading takes > 2.5s, fallback gracefully to browser speech
    fallbackTimeoutRef.current = window.setTimeout(() => {
      if (isLoading && !isPlaying) {
        console.warn('Audio loading timeout, switching to browser voice fallback');
        playWithSpeechSynthesis();
      }
    }, 2500);

    audio
      .play()
      .then(() => {
        if (fallbackTimeoutRef.current) {
          clearTimeout(fallbackTimeoutRef.current);
        }
        setIsLoading(false);
        setIsPlaying(true);
        setIsPaused(false);
        setAudioSource('server_ai');
      })
      .catch((err) => {
        console.warn('Audio play rejection, trying speech synthesis fallback:', err);
        if (fallbackTimeoutRef.current) {
          clearTimeout(fallbackTimeoutRef.current);
        }
        playWithSpeechSynthesis();
      });
  };

  const handlePause = () => {
    if (audioSource === 'server_ai' && audioRef.current) {
      audioRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
    } else if (audioSource === 'browser_tts' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
  };

  const toggleRate = () => {
    const nextRate = rate === 1.0 ? 1.2 : rate === 1.2 ? 0.9 : 1.0;
    setRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
    if (audioSource === 'browser_tts' && isPlaying) {
      handleStop();
      setTimeout(() => handlePlay(), 80);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current && audioSource === 'server_ai') {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      id="agrisetu-audio-player"
      className="bg-[#181c24] border border-[#252c39] rounded-xl p-3 sm:p-3.5 shadow-sm transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Title and Voice Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : isPlaying ? (
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200 truncate">
                {title || (isHi ? 'सलाह को बोलकर सुनें' : 'Listen to Agronomy Advisory')}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isHi ? 'एआई हिन्दी वाणी' : 'AI Voice'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {isPlaying
                ? isHi
                  ? 'ध्वनि प्रसारण सक्रिय...'
                  : 'Audio stream playing...'
                : isHi
                ? 'स्पष्ट उच्चारण एवं किसान-अनुकूल गति'
                : 'Clear pronunciation with natural rural cadence'}
            </p>
          </div>
        </div>

        {/* Audio Wave Visualizer (When Playing) */}
        {isPlaying && (
          <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-[#13161d] rounded-lg border border-[#232936]">
            {[40, 75, 100, 60, 90, 45, 80].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-emerald-400 rounded-full animate-pulse"
                style={{
                  height: `${Math.max(6, (h * 0.18))}px`,
                  animationDuration: `${0.4 + (i % 3) * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* Speed Selector */}
          <button
            id="audio-speed-button"
            type="button"
            onClick={toggleRate}
            title={isHi ? 'बोलने की गति बदलें' : 'Change playback speed'}
            className="px-2 py-1.5 text-xs font-mono text-slate-300 bg-[#13161d] border border-[#2b3342] rounded-lg hover:bg-[#202634] hover:text-white cursor-pointer transition-colors"
          >
            {rate}x
          </button>

          {/* Play / Pause Main Button */}
          {!isPlaying ? (
            <button
              id="audio-play-button"
              type="button"
              onClick={handlePlay}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isHi ? 'तैयार हो रहा है...' : 'Buffering...'}</span>
                </>
              ) : isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isHi ? 'पुनः चलाएं' : 'Resume'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isHi ? 'हिन्दी में सुनें' : 'Listen Now'}</span>
                </>
              )}
            </button>
          ) : (
            <button
              id="audio-pause-button"
              type="button"
              onClick={handlePause}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#252c39] hover:bg-[#313a4b] active:scale-95 text-emerald-300 rounded-lg text-xs font-semibold cursor-pointer border border-[#3b465a] transition-all"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>{isHi ? 'रोकें' : 'Pause'}</span>
            </button>
          )}

          {/* Reset / Stop */}
          {(isPlaying || isPaused) && (
            <button
              id="audio-stop-button"
              type="button"
              onClick={handleStop}
              title={isHi ? 'प्रारंभ से शुरू करें' : 'Restart audio'}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-[#13161d] border border-[#2b3342] rounded-lg cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress & Duration Bar (Shown during or after playback) */}
      {(isPlaying || isPaused || currentTime > 0) && duration > 0 && (
        <div className="mt-2.5 pt-2 border-t border-[#232936] flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <input
            id="audio-timeline-seek"
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-[#232936] rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span>{formatTime(duration)}</span>
        </div>
      )}
    </div>
  );
};
