import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Layers,
  Leaf,
  Droplets,
  CloudRain,
  Bug,
} from 'lucide-react';
import { Language, WhisperQueryResponse } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface WhisperVoiceAssistantProps {
  language: Language;
  selectedDistrictName?: string;
  selectedCrop?: string;
  selectedDistrictId?: string;
}

const PRESET_QUERIES = {
  hi: [
    {
      label: 'गेंहू में पीला रतुआ का छिड़काव',
      query: 'गेंहू की पत्तियों पर पीला रतुआ दिख रहा है, तुरंत क्या छिड़काव करें?',
      icon: Leaf,
    },
    {
      label: 'देसी जीवामृत बनाने की विधि',
      query: 'गाय के गोबर और गोमूत्र से 1 एकड़ के लिए जीवामृत कैसे बनाएं?',
      icon: Droplets,
    },
    {
      label: 'बारिश के पहले यूरिया डालें या नहीं?',
      query: 'आगामी 2 दिनों में बारिश का अनुमान है, क्या आज खेत में यूरिया डालना सुरक्षित है?',
      icon: CloudRain,
    },
    {
      label: 'माहू व रस चूसक कीटों का जैविक इलाज',
      query: 'फसल पर माहू और सफेद मक्खी का प्रकोप है, नीम तेल का प्रयोग कैसे करें?',
      icon: Bug,
    },
    {
      label: 'कपास के बाद सर्वोत्तम फसल चक्र',
      query: 'कपास की तुड़ाई के बाद कौन सी दलहनी फसल लगानी चाहिए?',
      icon: Layers,
    },
  ],
  en: [
    {
      label: 'Wheat Yellow Rust Spray',
      query: 'Yellow rust spores observed on wheat leaves. What immediate spray is recommended?',
      icon: Leaf,
    },
    {
      label: 'Organic Jeevamrutha Recipe',
      query: 'How to prepare Jeevamrutha bio-fertilizer for 1 acre using indigenous cow dung and urine?',
      icon: Droplets,
    },
    {
      label: 'Urea Application Ahead of Rain',
      query: 'Rain forecast for next 48 hours. Should I withhold or apply scheduled urea top-dressing?',
      icon: CloudRain,
    },
    {
      label: 'Aphids & Whitefly Botanical Control',
      query: 'Aphid infestation on crop foliage. What is the dilution for 1500 PPM neem oil spray?',
      icon: Bug,
    },
    {
      label: 'Post-Cotton Legume Rotation',
      query: 'Which pulse crop should I plant after cotton harvest to restore soil nitrogen?',
      icon: Layers,
    },
  ],
};

export const WhisperVoiceAssistant: React.FC<WhisperVoiceAssistantProps> = ({
  language,
  selectedDistrictName,
  selectedCrop,
  selectedDistrictId,
}) => {
  const isHi = language === 'hi';
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<WhisperQueryResponse | null>(null);
  const [history, setHistory] = useState<WhisperQueryResponse[]>([]);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const inputTextRef = useRef('');
  const pendingSubmitRef = useRef(false);

  // Keep inputTextRef synced with inputText
  useEffect(() => {
    inputTextRef.current = inputText;
  }, [inputText]);

  // Initialize Web Speech Recognition with full continuous Hindi support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = isHi ? 'hi-IN' : 'en-IN';

        recognition.onresult = (event: any) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
          }
          if (fullTranscript.trim()) {
            setInputText(fullTranscript);
            inputTextRef.current = fullTranscript;
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition notice:', e.error);
        };

        speechRecognitionRef.current = recognition;
      } catch (e) {
        console.warn('Speech recognition initialization error:', e);
      }
    }

    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (_) {}
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isHi]);

  // Core API Submission Routine
  const executeQuery = async (queryText: string, audioData?: string | null) => {
    let finalQuery = queryText.trim();
    if (!finalQuery && !audioData) {
      if (selectedCrop) {
        finalQuery = isHi
          ? `${selectedCrop} में खाद, सिंचाई व कीट रोग नियंत्रण की सलाह`
          : `Fertilizer, irrigation, and pest management advisory for ${selectedCrop}`;
      } else {
        finalQuery = isHi
          ? 'गेंहू में खाद और सिंचाई की सही सलाह बताएं'
          : 'What is the recommended fertilizer and irrigation schedule for wheat?';
      }
    }

    setIsLoading(true);
    setErrorMessage(null);
    setAutoPlayAudio(true);

    try {
      const resp = await fetch('/api/whisper-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: finalQuery,
          audioBase64: audioData || audioBase64 || undefined,
          mimeType: 'audio/webm',
          language,
          districtId: selectedDistrictId,
          crop: selectedCrop,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to process voice query');
      }

      const data: WhisperQueryResponse = await resp.json();
      setCurrentResponse(data);
      setHistory((prev) => [data, ...prev.slice(0, 8)]);
      setInputText('');
      inputTextRef.current = '';
      setAudioBase64(null);
    } catch (err: any) {
      console.error('Whisper AI error:', err);
      setErrorMessage(
        err.message ||
          (isHi
            ? 'परामर्श प्राप्त करने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
            : 'Error communicating with Whisper Assistant. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Microphone Recording
  const startRecording = async () => {
    setErrorMessage(null);
    setAudioBase64(null);
    setInputText('');
    inputTextRef.current = '';
    audioChunksRef.current = [];
    pendingSubmitRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/ogg';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach((track) => track.stop());

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setAudioBase64(base64String);

          if (pendingSubmitRef.current) {
            pendingSubmitRef.current = false;
            executeQuery(inputTextRef.current, base64String);
          }
        };
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration counter
      timerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Start SpeechRecognition for real-time preview in Hindi or English
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.lang = isHi ? 'hi-IN' : 'en-IN';
          speechRecognitionRef.current.start();
        } catch (_) {}
      }
    } catch (err: any) {
      console.error('Microphone error:', err);
      setHasMicPermission(false);
      setErrorMessage(
        isHi
          ? 'माइक्रोफोन की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में माइक्रोफोन की अनुमति दें या नीचे लिखकर पूछें।'
          : 'Microphone access was denied. Please allow microphone permission in browser settings or type your question.'
      );
    }
  };

  const stopRecording = (andSubmit = false) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (_) {}
    }

    if (andSubmit) {
      pendingSubmitRef.current = true;
    }

    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
      setIsRecording(false);
    } else {
      setIsRecording(false);
      if (andSubmit) {
        executeQuery(inputTextRef.current, audioBase64);
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stopping automatically submits query to provide seamless voice-in / voice-out experience
      stopRecording(true);
    } else {
      startRecording();
    }
  };

  // Submit Voice Query or Typed Query
  const handleSubmitQuery = async (queryToSubmit?: string) => {
    const textToSend = queryToSubmit !== undefined ? queryToSubmit : inputText;
    if (isRecording) {
      stopRecording(false);
    }
    executeQuery(textToSend, audioBase64);
  };

  const currentPresets = isHi ? PRESET_QUERIES.hi : PRESET_QUERIES.en;

  return (
    <div className="space-y-4">
      {/* Voice Input Station */}
      <div className="bg-[#13161d] rounded-2xl border border-[#222835] p-5 sm:p-6">
        {/* Microphone Big Toggle Button */}
        <div className="flex flex-col items-center justify-center text-center py-3 sm:py-5">
          <div className="relative mb-3">
            {isRecording && (
              <div className="absolute -inset-3 rounded-full bg-red-500/20 animate-ping" />
            )}
            <button
              id="whisper-mic-toggle"
              type="button"
              onClick={toggleRecording}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700 scale-105 ring-4 ring-red-500/30'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-105'
              }`}
              title={isRecording ? (isHi ? 'बोलना समाप्त करें' : 'Stop Recording') : (isHi ? 'बोलना शुरू करें' : 'Start Speaking')}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8 animate-pulse" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-semibold text-slate-200">
              {isRecording
                ? isHi
                  ? `सुन रहे हैं... (${recordingDuration}s)`
                  : `Listening... (${recordingDuration}s)`
                : isHi
                ? 'माइक दबाकर सवाल पूछें'
                : 'Tap to ask farming question'}
            </div>
            <p className="text-xs text-slate-400">
              {isRecording
                ? isHi
                  ? 'बोलने के बाद माइक पर दोबारा क्लिक करें या "उत्तर पाएं" दबाएं'
                  : 'Click mic again when done or tap "Get Answer"'
                : isHi
                ? 'हिन्दी या अंग्रेजी में बोलें (उदा: गेंहू में पीला रतुआ का उपचार)'
                : 'Speak in Hindi or English (e.g., wheat yellow rust treatment)'}
            </p>
          </div>

          {/* Real-time recognized Hindi / English speech preview */}
          {isRecording && (
            <div className="w-full max-w-md mt-3 px-4 py-2.5 rounded-xl bg-[#181c24] border border-[#2b3342] text-left">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isHi ? 'लाइव आवाज पहचान (Live Speech):' : 'Live Speech:'}</span>
              </div>
              <p className="text-xs text-slate-200 italic min-h-[1.5rem]">
                {inputText.trim() ? `"${inputText}"` : isHi ? 'बोलते रहिए, हम सुन रहे हैं...' : 'Speak now, listening...'}
              </p>
            </div>
          )}

          {/* Sound Wave Animation Indicator & Action buttons while recording */}
          {isRecording && (
            <div className="flex flex-col items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5">
                {[40, 75, 55, 90, 60, 80, 45, 70, 85, 50].map((h, idx) => (
                  <span
                    key={idx}
                    className="w-1 bg-red-400 rounded-full animate-bounce"
                    style={{
                      height: `${h * 0.3}px`,
                      animationDelay: `${idx * 0.08}s`,
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => stopRecording(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isHi ? 'उत्तर पाएं' : 'Get Answer'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => stopRecording(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#202634] hover:bg-[#283042] text-slate-300 text-xs font-medium cursor-pointer transition-colors"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Text Input / Edit Box with Send Button */}
        <div className="mt-4 pt-4 border-t border-[#222835]">
          <div className="relative flex items-center">
            <input
              id="whisper-text-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSubmitQuery();
                }
              }}
              placeholder={
                isHi
                  ? 'या सवाल टाइप करें (उदा: गेहूं में पीला रतुआ का उपचार)...'
                  : 'Or type question (e.g. wheat stripe rust treatment)...'
              }
              className="w-full pl-4 pr-24 py-2.5 bg-[#181c24] border border-[#2b3342] rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
                  title="Clear"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                id="whisper-submit-btn"
                type="button"
                disabled={isLoading}
                onClick={() => handleSubmitQuery()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                <span>{isHi ? 'पूछें' : 'Ask'}</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Preset Voice Questions */}
        <div className="mt-4 pt-4 border-t border-[#222835]">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isHi ? 'त्वरित सवाल:' : 'Quick Questions:'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentPresets.map((preset, idx) => {
              const Icon = preset.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(preset.query);
                    handleSubmitQuery(preset.query);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#181c24] hover:bg-[#202634] border border-[#242b38] hover:border-emerald-700/50 rounded-lg text-xs text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer text-left"
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
          >
            {isHi ? 'हटाएं' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-[#13161d] rounded-2xl border border-[#222835] p-6 text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-200">
            {isHi ? 'विश्लेषण हो रहा है...' : 'Processing query...'}
          </h4>
        </div>
      )}

      {/* Current Result Card */}
      {currentResponse && !isLoading && (
        <div className="bg-[#13161d] rounded-2xl border border-[#222835] p-5 sm:p-6 space-y-4">
          {/* Query Header with Spoken Audio Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#222835]">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-100">
                  "{currentResponse.transcription || currentResponse.query}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-[#181c24] border border-[#252c39] text-slate-400 capitalize">
                {currentResponse.category?.replace('_', ' ')}
              </span>
              <span className="text-[11px] text-slate-500">
                {new Date(currentResponse.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Spoken TTS Audio Player */}
          {currentResponse.audioText && (
            <AudioPlayer
              textToRead={currentResponse.audioText}
              language={language}
              audioUrl={currentResponse.audioUrl}
              title={isHi ? 'सलाह सुनें (Audio)' : 'Listen to Advisory'}
              autoPlay={autoPlayAudio}
            />
          )}

          {/* Detailed Response Content */}
          <div className="text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-line bg-[#181c24] p-4 rounded-xl border border-[#242b38]">
            {currentResponse.response}
          </div>

          {/* Action Checklist for the Field */}
          {currentResponse.keyActionPoints && currentResponse.keyActionPoints.length > 0 && (
            <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {isHi ? 'प्रमुख कदम:' : 'Action Steps:'}
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {currentResponse.keyActionPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-emerald-400">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Follow-Ups */}
          {currentResponse.suggestedFollowUps && currentResponse.suggestedFollowUps.length > 0 && (
            <div className="pt-1">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-400">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{isHi ? 'आगे पूछें:' : 'Next Questions:'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentResponse.suggestedFollowUps.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputText(q);
                      handleSubmitQuery(q);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#181c24] hover:bg-[#202634] border border-[#242b38] rounded-lg text-xs text-slate-300 transition-colors cursor-pointer text-left"
                  >
                    <span>{q}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History of Consultations */}
      {history.length > 1 && (
        <div className="bg-[#13161d] rounded-2xl border border-[#222835] p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{isHi ? 'इतिहास:' : 'History:'}</span>
          </div>
          <div className="divide-y divide-[#222835]">
            {history.slice(1).map((item, idx) => (
              <div
                key={idx}
                className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs cursor-pointer hover:bg-[#181c24] px-2 rounded-lg transition-colors"
                onClick={() => setCurrentResponse(item)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Volume2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-medium text-slate-300 truncate">
                    {item.transcription || item.query}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 shrink-0 capitalize">
                  {item.category?.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
