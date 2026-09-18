import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  Video,
  Download,
  AlertCircle,
  CheckCircle2,
  Maximize2,
  Minimize2,
  SkipForward,
  SkipBack,
  HelpCircle,
  Leaf,
  CloudSun,
  Camera,
  Mic,
  Activity,
  Cpu,
} from 'lucide-react';
import { Language, DemoVideoScene } from '../types';

interface FarmerDemoVideoProps {
  language: Language;
}

const DEMO_SCENES: { [key in Language]: DemoVideoScene[] } = {
  hi: [
    {
      id: 'scene-1',
      title: '1. उपग्रह द्वारा फसल स्वास्थ्य निगरानी (NDVI)',
      durationSeconds: 12,
      caption:
        'एग्रीसेतु सेंटिनल-2 उपग्रह से आपके खेत के हर हिस्से का एनडीवीआई (NDVI) स्तर मापता है, जिससे पता चलता है कि फसल हरी-भरी है या पानी की कमी है।',
      visualDescription:
        'अंतरिक्ष से खेत का सैटेलाइट स्कैन, हरी फसल की मैपिंग और 0.68 स्वस्थ वनस्पति सूचकांक।',
      keyTakeaway: 'खेत में बिना पैदल घूमे उपग्रह से पूरी फसल की सेहत की सटीक जानकारी मिलती है।',
      actionableTip: '0.60 से कम NDVI वाले हिस्सों में तुरंत सिंचाई व जैविक पोषण दें।',
    },
    {
      id: 'scene-2',
      title: '2. सटीक मौसम व वर्षा पूर्वानुमान',
      durationSeconds: 12,
      caption:
        'मौसम विभाग के 5-दिवसीय पूर्वानुमान से जानें कि कब बारिश होगी। बारिश से ठीक पहले यूरिया डालने से बचें ताकि खाद बहकर बर्बाद न हो।',
      visualDescription:
        'मौसम रडार, 78% बारिश की संभावना, तापमान 26°C और सिंचाई रोकने की चेतावनी।',
      keyTakeaway: 'बारिश के पहले सिंचाई और रासायनिक खाद का छिड़काव 48 घंटे के लिए टालें।',
      actionableTip: 'बारिश के पानी की निकासी के लिए खेत की नालियों को खुला रखें।',
    },
    {
      id: 'scene-3',
      title: '3. प्राकृतिक जीवामृत खाद निर्माण विधि',
      durationSeconds: 14,
      caption:
        '10 किलो गोबर, 10 लीटर गोमूत्र, 2 किलो गुड़ और 2 किलो बेसन को 200 लीटर पानी में मिलाकर 48 घंटे में जीवामृत तैयार करें। यह मिट्टी की उर्वरता दोगुनी करता है।',
      visualDescription:
        'लकड़ी के डंडे से ड्रम में जीवामृत घोलना, सूक्ष्म जीवाणुओं की वृद्धि और सिंचाई जल में प्रयोग।',
      keyTakeaway: 'जीवामृत रासायनिक यूरिया की जरूरत को 30% से 40% तक कम कर देता है।',
      actionableTip: 'तैयार होने के 7 दिनों के भीतर इसे सिंचाई पानी के साथ खेत में दें।',
    },
    {
      id: 'scene-4',
      title: '4. फसल डॉक्टर - पत्ती की फोटो से रोग पहचान',
      durationSeconds: 12,
      caption:
        'खेत में किसी भी रोगग्रस्त पत्ती की फोटो खींचें। एआई तुरंत पीला रतुआ, माहू या झुलसा रोग पहचानकर सटीक दवा और जैविक उपचार बताता है।',
      visualDescription:
        'मोबाइल कैमरे से गेहूं की पत्ती की स्कैनिंग, 94% सटीकता और प्रोपिकोनाजोल स्प्रे की मात्रा।',
      keyTakeaway: 'शुरुआती लक्षण दिखते ही फोटो खींचें और सही दवा की मात्रा जानें।',
      actionableTip: 'कीटनाशक के छिड़काव के साथ हमेशा स्टीकर या लिक्विड साबुन मिलाएं।',
    },
    {
      id: 'scene-5',
      title: '5. व्हिस्पर एआई - हाथ गंदे हों तो बोलकर पूछें',
      durationSeconds: 12,
      caption:
        'खेत में काम करते समय टाइप करने की जरूरत नहीं। माइक दबाकर अपनी भाषा में सवाल बोलें, व्हिस्पर एआई सुनकर बोलकर ही जवाब देगा।',
      visualDescription:
        'ध्वनि तरंगों का विश्लेषण, त्वरित आवाज पहचान और हिन्दी में बोलकर परामर्श सुनाना।',
      keyTakeaway: 'किसान मित्र बिना किसी जटिलता के अपनी मातृभाषा में तकनीकी सलाह ले सकते हैं।',
      actionableTip: 'माइक चालू करके फसल का नाम और समस्या साफ आवाज में बताएं।',
    },
  ],
  en: [
    {
      id: 'scene-1',
      title: '1. Satellite Crop Health & NDVI Telemetry',
      durationSeconds: 12,
      caption:
        'AgriSetu connects with Sentinel-2 multispectral satellites to map crop chlorophyll and vegetative canopy index (NDVI) across every acre.',
      visualDescription:
        'High-resolution satellite pass over farm parcels, color-coded vegetative vigor at 0.68 healthy rating.',
      keyTakeaway: 'Instant panoramic view of crop health without walking through muddy fields.',
      actionableTip: 'Prioritize soil testing and organic mulch on zones with NDVI < 0.55.',
    },
    {
      id: 'scene-2',
      title: '2. Hyper-Local Weather & Irrigation Coordination',
      durationSeconds: 12,
      caption:
        '5-day meteorological telemetry alerts you ahead of precipitation. Suspend urea top-dressing before rain to stop chemical runoff and nitrate loss.',
      visualDescription:
        'Doppler rain radar, 78% precipitation probability, ambient 26°C and irrigation pause signal.',
      keyTakeaway: 'Never broadcast synthetic fertilizers within 48 hours of heavy rain.',
      actionableTip: 'Keep peripheral furrows unobstructed to prevent prolonged standing water.',
    },
    {
      id: 'scene-3',
      title: '3. Regenerative Jeevamrutha Formulation',
      durationSeconds: 14,
      caption:
        'Combine 10kg indigenous cow dung, 10L cow urine, 2kg jaggery, and 2kg pulse flour in 200L water. Ferment for 48 hours to activate billions of beneficial microbes.',
      visualDescription:
        'Clockwise wooden agitation in farm barrel, beneficial rhizobacteria multiplying in soil.',
      keyTakeaway: 'Cuts costly synthetic nitrogen demand by up to 35% while rejuvenating soil carbon.',
      actionableTip: 'Apply via drip or flood irrigation within 7 days of active fermentation.',
    },
    {
      id: 'scene-4',
      title: '4. Crop Doctor - Optical Leaf Diagnostics',
      durationSeconds: 12,
      caption:
        'Capture a single smartphone photograph of any discolored leaf. Multimodal AI identifies Stripe Rust, Blight, or Aphid attacks with chemical & organic remedies.',
      visualDescription:
        'Smartphone camera scanning wheat blade, 94% diagnostic confidence with dosage prescription.',
      keyTakeaway: 'Immediate pathogen diagnosis prevents farm-wide spore spread early.',
      actionableTip: 'Spray fungicides in the calm late afternoon to minimize thermal drift.',
    },
    {
      id: 'scene-5',
      title: '5. Whisper AI - Hands-Free Voice Agronomist',
      durationSeconds: 12,
      caption:
        'Field farmers do not need to type with soiled hands. Simply speak into the microphone in Hindi or English, and Whisper AI responds with clear spoken audio.',
      visualDescription:
        'Soundwave frequency visualization, speech-to-text transcription and audio voice playback.',
      keyTakeaway: 'Empowers any farmer regardless of technical literacy or field conditions.',
      actionableTip: 'Tap the microphone icon, state your crop and question, and listen to the advice.',
    },
  ],
};

const VEO_PRESETS = [
  {
    title: '🌾 Punjab Wheat Precision Scouting',
    prompt:
      'A cinematic instructional video of an Indian farmer in Punjab walking through golden green wheat fields, using a digital smartphone to scan leaf health and soil sensors under soft morning sunlight, documentary style 4K.',
  },
  {
    title: '🌿 Preparing Organic Jeevamrutha',
    prompt:
      'A close-up documentary guide of an Indian farmer preparing natural organic Jeevamrutha bio-fertilizer in a blue barrel under shade, mixing cow dung, cow urine, and pulse flour with a wooden paddle, ultra-realistic.',
  },
  {
    title: '💧 Solar Drip Irrigation Setup',
    prompt:
      'High quality cinematic demonstration of modern solar-powered micro-irrigation lines delivering precision water and nutrient drops to crop roots in an Indian organic farm, clear blue sky.',
  },
  {
    title: '🛰️ Drone Surveying Farm Parcels',
    prompt:
      'Cinematic aerial drone footage surveying lush agricultural farmlands in India, displaying gentle camera movement over irrigated fields, rivers, and crop boundaries at golden hour.',
  },
];

export const FarmerDemoVideo: React.FC<FarmerDemoVideoProps> = ({ language }) => {
  const isHi = language === 'hi';
  const scenes = DEMO_SCENES[language] || DEMO_SCENES.en;

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Veo Generation State
  const [veoPrompt, setVeoPrompt] = useState(VEO_PRESETS[0].prompt);
  const [isGeneratingVeo, setIsGeneratingVeo] = useState(false);
  const [veoOperationName, setVeoOperationName] = useState<string | null>(null);
  const [veoStatus, setVeoStatus] = useState<string | null>(null);
  const [veoVideoBlobUrl, setVeoVideoBlobUrl] = useState<string | null>(null);
  const [veoError, setVeoError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const demoAudioRef = useRef<HTMLAudioElement | null>(null);
  const sceneStartTimeRef = useRef<number>(Date.now());

  const activeScene = scenes[currentSceneIndex] || scenes[0];

  // Canvas Animated Scene Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;

    const render = () => {
      frameCount++;
      const width = canvas.width;
      const height = canvas.height;

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0f291e'); // deep forest
      bgGrad.addColorStop(1, '#081710'); // night farm
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid lines (farm field plots)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Scene-Specific Animations
      const t = frameCount * 0.03;

      if (currentSceneIndex === 0) {
        // Scene 1: Satellite Scanning & NDVI Map
        // Satellite orbital beam
        const beamX = (width * 0.3 + Math.sin(t * 0.5) * (width * 0.25)) % width;
        const beamGrad = ctx.createRadialGradient(beamX, 100, 10, beamX, 260, 220);
        beamGrad.addColorStop(0, 'rgba(52, 211, 153, 0.45)');
        beamGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(beamX, 50);
        ctx.lineTo(beamX - 160, height - 60);
        ctx.lineTo(beamX + 160, height - 60);
        ctx.closePath();
        ctx.fill();

        // Satellite icon badge
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(beamX, 50, 10, 0, Math.PI * 2);
        ctx.fill();

        // Farm Field patches
        const patches = [
          { x: width * 0.15, y: height * 0.55, w: 120, h: 70, ndvi: '0.72' },
          { x: width * 0.4, y: height * 0.52, w: 140, h: 85, ndvi: '0.68' },
          { x: width * 0.68, y: height * 0.58, w: 110, h: 65, ndvi: '0.61' },
        ];
        patches.forEach((p, idx) => {
          ctx.fillStyle = idx === 1 ? 'rgba(16, 185, 129, 0.35)' : 'rgba(5, 150, 105, 0.25)';
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 1.5;
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.strokeRect(p.x, p.y, p.w, p.h);

          ctx.fillStyle = '#ecfdf5';
          ctx.font = '12px sans-serif';
          ctx.fillText(`Plot ${idx + 1}: NDVI ${p.ndvi}`, p.x + 10, p.y + 25);
          ctx.fillStyle = '#6ee7b7';
          ctx.font = '10px sans-serif';
          ctx.fillText('Healthy Canopy', p.x + 10, p.y + 45);
        });
      } else if (currentSceneIndex === 1) {
        // Scene 2: Weather Doppler & Soil Moisture
        // Weather radar sweep circle
        const cx = width * 0.5;
        const cy = height * 0.45;
        const radius = 100;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        // Sweep line
        const sweepAngle = t % (Math.PI * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sweepAngle) * radius, cy + Math.sin(sweepAngle) * radius);
        ctx.stroke();

        // Rain particles
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.6)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 24; i++) {
          const rx = (width * 0.2 + (i * 35 + t * 40)) % (width * 0.6) + width * 0.2;
          const ry = (height * 0.2 + (i * 20 + t * 120)) % (height * 0.6) + height * 0.2;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 4, ry + 12);
          ctx.stroke();
        }

        // Weather banner
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(width * 0.25, height * 0.72, width * 0.5, 42);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(width * 0.25, height * 0.72, width * 0.5, 42);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('⚡ 78% Rain Forecast in 48h - Withhold Urea', width * 0.27, height * 0.81);
      } else if (currentSceneIndex === 2) {
        // Scene 3: Bio-fertilizer Jeevamrutha Barrel
        const bx = width * 0.5;
        const by = height * 0.5;

        // Barrel outline
        ctx.fillStyle = '#1e3a8a';
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx - 60, by - 60, 120, 130, [10, 10, 30, 30]);
        ctx.fill();
        ctx.stroke();

        // Wooden stirring paddle
        const paddleAngle = Math.sin(t * 1.5) * 0.25;
        ctx.save();
        ctx.translate(bx, by - 50);
        ctx.rotate(paddleAngle);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-6, -40, 12, 100);
        ctx.restore();

        // Fermenting bubbles
        ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
        for (let i = 0; i < 6; i++) {
          const bbx = bx - 40 + (i * 16 + Math.sin(t + i) * 6);
          const bby = by + 30 - ((t * 25 + i * 15) % 70);
          ctx.beginPath();
          ctx.arc(bbx, bby, 3 + (i % 3), 0, Math.PI * 2);
          ctx.fill();
        }

        // Ingredients overlay badge
        ctx.fillStyle = 'rgba(6, 78, 59, 0.9)';
        ctx.fillRect(bx - 140, height * 0.76, 280, 36);
        ctx.strokeStyle = '#34d399';
        ctx.strokeRect(bx - 140, height * 0.76, 280, 36);
        ctx.fillStyle = '#ecfdf5';
        ctx.font = '11px sans-serif';
        ctx.fillText('10kg Cow Dung + 10L Urine + 2kg Jaggery', bx - 125, height * 0.84);
      } else if (currentSceneIndex === 3) {
        // Scene 4: Crop Doctor Camera Scan
        // Camera viewfinder brackets
        const fx = width * 0.5;
        const fy = height * 0.45;
        const fw = 180;
        const fh = 120;

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5;

        // Leaf outline in center
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.beginPath();
        ctx.ellipse(fx, fy, 60, 30, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Fungal yellow rust spots
        ctx.fillStyle = '#eab308';
        [-15, 0, 18, 28].forEach((offset, idx) => {
          ctx.beginPath();
          ctx.arc(fx + offset, fy + offset * 0.5, 4 + (idx % 2), 0, Math.PI * 2);
          ctx.fill();
        });

        // Laser scan line
        const scanY = fy - fh / 2 + ((t * 60) % fh);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fx - fw / 2, scanY);
        ctx.lineTo(fx + fw / 2, scanY);
        ctx.stroke();

        // Diagnostic badge
        ctx.fillStyle = 'rgba(24, 24, 27, 0.85)';
        ctx.fillRect(fx - 130, height * 0.75, 260, 42);
        ctx.strokeStyle = '#22c55e';
        ctx.strokeRect(fx - 130, height * 0.75, 260, 42);
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Diagnosis: Yellow Rust (94% Match)', fx - 110, height * 0.82);
        ctx.fillStyle = '#a7f3d0';
        ctx.font = '10px sans-serif';
        ctx.fillText('Action: Propiconazole 25% EC @ 1ml/L', fx - 110, height * 0.9);
      } else {
        // Scene 5: Whisper AI Voice Soundwaves
        const wx = width * 0.5;
        const wy = height * 0.46;

        // Glowing center mic orb
        const pulse = 24 + Math.sin(t * 3) * 6;
        const orbGrad = ctx.createRadialGradient(wx, wy, 5, wx, wy, pulse);
        orbGrad.addColorStop(0, '#10b981');
        orbGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(wx, wy, pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(wx, wy, 16, 0, Math.PI * 2);
        ctx.fill();

        // Equalizer sound bars left and right
        const numBars = 16;
        ctx.fillStyle = '#34d399';
        for (let i = 0; i < numBars; i++) {
          const barH = 15 + Math.abs(Math.sin(t * 4 + i * 0.4)) * 45;
          const barW = 5;
          const spacing = 12;

          // left side
          ctx.fillRect(wx - 40 - i * spacing, wy - barH / 2, barW, barH);
          // right side
          ctx.fillRect(wx + 35 + i * spacing, wy - barH / 2, barW, barH);
        }

        // Transcription banner
        ctx.fillStyle = 'rgba(6, 78, 59, 0.85)';
        ctx.fillRect(wx - 150, height * 0.75, 300, 40);
        ctx.strokeStyle = '#34d399';
        ctx.strokeRect(wx - 150, height * 0.75, 300, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px sans-serif';
        ctx.fillText('Whisper: "Wheat rust treatment & organic spray"', wx - 135, height * 0.83);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentSceneIndex]);

  // Audio Narration Voiceover Controller
  const speakCurrentScene = (scene: DemoVideoScene) => {
    if (isMuted) return;

    const rawText = `${scene.title}. ${scene.caption}. ${scene.keyTakeaway}`;
    const cleanText = rawText
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/#{1,6}\s+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Stop existing audio or speech
    if (demoAudioRef.current) {
      demoAudioRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    try {
      const audioUrl = `/api/audio-speech?text=${encodeURIComponent(cleanText.slice(0, 300))}&lang=${isHi ? 'hi' : 'en'}`;
      if (!demoAudioRef.current) {
        demoAudioRef.current = new Audio();
      }
      demoAudioRef.current.src = audioUrl;
      demoAudioRef.current.playbackRate = 0.95;
      demoAudioRef.current.play().catch(() => {
        // Fallback to speech synthesis if audio play fails
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = isHi ? 'hi-IN' : 'en-IN';
          utterance.rate = 0.95;
          speechUtteranceRef.current = utterance;
          window.speechSynthesis.speak(utterance);
        }
      });
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Playback timer & progress
  useEffect(() => {
    let interval: number | null = null;

    if (isPlaying) {
      sceneStartTimeRef.current = Date.now();
      speakCurrentScene(activeScene);

      interval = window.setInterval(() => {
        const elapsed = (Date.now() - sceneStartTimeRef.current) / 1000;
        const total = activeScene.durationSeconds;
        const pct = Math.min(100, (elapsed / total) * 100);
        setProgressPercent(pct);

        if (elapsed >= total) {
          if (currentSceneIndex < scenes.length - 1) {
            setCurrentSceneIndex((prev) => prev + 1);
            sceneStartTimeRef.current = Date.now();
          } else {
            // Loop back to start
            setCurrentSceneIndex(0);
            sceneStartTimeRef.current = Date.now();
          }
        }
      }, 100);
    } else {
      if (demoAudioRef.current) {
        demoAudioRef.current.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      if (interval) clearInterval(interval);
      if (demoAudioRef.current) {
        demoAudioRef.current.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying, currentSceneIndex, scenes, isMuted, isHi]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextScene = () => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex((prev) => prev + 1);
      setProgressPercent(0);
      sceneStartTimeRef.current = Date.now();
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex((prev) => prev - 1);
      setProgressPercent(0);
      sceneStartTimeRef.current = Date.now();
    }
  };

  const handleSeekScene = (index: number) => {
    setCurrentSceneIndex(index);
    setProgressPercent(0);
    sceneStartTimeRef.current = Date.now();
  };

  // --------------------------------------------------------------------------
  // Veo 3-Step POST API Integration (Start, Poll, Download)
  // --------------------------------------------------------------------------
  const handleStartVeoGeneration = async () => {
    setIsGeneratingVeo(true);
    setVeoError(null);
    setVeoVideoBlobUrl(null);
    setVeoStatus('Submitting generation task to Google Veo model...');

    try {
      // Step 1: Start generation
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: veoPrompt,
          resolution: '720p',
          aspectRatio: '16:9',
        }),
      });

      if (!startRes.ok) {
        const errData = await startRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to initialize video generation');
      }

      const { operationName } = await startRes.json();
      setVeoOperationName(operationName);
      setVeoStatus('Veo model is rendering video frames (polling status)...');

      // Step 2: Poll operation until completed
      let isDone = false;
      let attempts = 0;
      const maxAttempts = 30; // 30 * 5s = 150s max

      while (!isDone && attempts < maxAttempts) {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const statusRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });

        if (!statusRes.ok) {
          throw new Error('Failed to check video generation status');
        }

        const statusData = await statusRes.json();
        isDone = statusData.done;
        setVeoStatus(`Rendering in progress... (${attempts * 5}s elapsed)`);
      }

      if (!isDone) {
        throw new Error('Video generation timed out. Please try a simpler prompt.');
      }

      // Step 3: Download finished video binary stream
      setVeoStatus('Downloading completed MP4 video...');
      const downloadRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });

      if (!downloadRes.ok) {
        throw new Error('Failed to retrieve finished video file');
      }

      const videoBlob = await downloadRes.blob();
      const blobUrl = URL.createObjectURL(videoBlob);
      setVeoVideoBlobUrl(blobUrl);
      setVeoStatus('Video generation complete!');
    } catch (err: any) {
      console.error('Veo video error:', err);
      setVeoError(err.message || 'Video generation error');
      setVeoStatus(null);
    } finally {
      setIsGeneratingVeo(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Header */}
      <div className="bg-[#13161d] rounded-2xl border border-[#222835] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 tracking-tight">
                {isHi ? 'किसान एआई वीडियो गाइड' : 'AI Farmer Video Guide'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-[#181c24] border-[#252c39] text-slate-400'
                  : 'bg-emerald-950/60 border-emerald-800/50 text-emerald-400'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span>{isMuted ? (isHi ? 'म्यूट' : 'Muted') : isHi ? 'आवाज' : 'Audio'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Video Display Screen */}
      <div
        ref={playerContainerRef}
        className="bg-black rounded-2xl border border-[#222835] overflow-hidden shadow-lg"
      >
        {/* Widescreen 16:9 Canvas Video Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={854}
            height={480}
            className="w-full h-full object-contain"
          />

          {/* Subtitle / Closed Caption Overlay */}
          {showCaptions && (
            <div className="absolute bottom-16 inset-x-4 sm:inset-x-12 pointer-events-none flex justify-center">
              <div className="bg-black/80 backdrop-blur-xs border border-white/10 rounded-xl px-4 py-2 text-center max-w-2xl shadow-lg">
                <span className="text-xs sm:text-sm font-medium text-white leading-snug">
                  {activeScene.caption}
                </span>
              </div>
            </div>
          )}

          {/* Big Center Play/Pause button on screen overlay */}
          {!isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              className="absolute w-16 h-16 rounded-full bg-white/90 hover:bg-white text-stone-900 flex items-center justify-center shadow-2xl transition-transform hover:scale-105 cursor-pointer"
              title="Play Video"
            >
              <Play className="w-7 h-7 fill-stone-900 translate-x-0.5" />
            </button>
          )}

          {/* Top Scene Marker Pill */}
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs px-3 py-1 rounded-lg text-xs font-semibold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{activeScene.title}</span>
          </div>

          {/* Live Progress Bar along video bottom */}
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-stone-900">
            <div
              className="h-full bg-emerald-500 transition-all duration-100 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Video Player Control Bar */}
        <div className="p-3 sm:p-4 bg-[#13161d] text-slate-300 flex flex-wrap items-center justify-between gap-3 border-t border-[#222835]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevScene}
              disabled={currentSceneIndex === 0}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Scene"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              id="demo-video-play-btn"
              type="button"
              onClick={togglePlay}
              className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white translate-x-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleNextScene}
              disabled={currentSceneIndex === scenes.length - 1}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Next Scene"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="text-xs text-slate-400 ml-2">
              <span className="text-slate-200 font-medium">
                {currentSceneIndex + 1} / {scenes.length}
              </span>{' '}
              ({Math.round((progressPercent / 100) * activeScene.durationSeconds)}s /{' '}
              {activeScene.durationSeconds}s)
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => setShowCaptions(!showCaptions)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer border ${
                showCaptions
                  ? 'bg-[#181c24] border-[#2b3342] text-slate-100 font-medium'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              CC {showCaptions ? (isHi ? 'चालू' : 'ON') : isHi ? 'बंद' : 'OFF'}
            </button>

            <button
              type="button"
              onClick={() => {
                if (playerContainerRef.current) {
                  if (!document.fullscreenElement) {
                    playerContainerRef.current.requestFullscreen().catch(() => {});
                    setIsFullscreen(true);
                  } else {
                    document.exitFullscreen().catch(() => {});
                    setIsFullscreen(false);
                  }
                }
              }}
              className="p-2 text-slate-400 hover:text-white cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Chapter Navigation Selector */}
      <div className="bg-[#13161d] rounded-2xl border border-[#222835] p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {isHi ? 'वीडियो अध्याय:' : 'Chapters:'}
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {scenes.map((scene, idx) => {
            const isSelected = idx === currentSceneIndex;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => handleSeekScene(idx)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300 font-semibold shadow-xs'
                    : 'bg-[#181c24] hover:bg-[#202634] border-[#252c39] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Part {idx + 1}</span>
                  <span>{scene.durationSeconds}s</span>
                </div>
                <div className="text-xs font-medium line-clamp-2">{scene.title}</div>
              </button>
            );
          })}
        </div>

        {/* Actionable tip for current scene */}
        <div className="mt-2 pt-2 border-t border-[#222835] flex items-start gap-2.5 text-xs text-slate-300 bg-[#181c24] p-3 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-100 font-semibold">
              {isHi ? 'टिप:' : 'Tip:'}{' '}
            </strong>
            <span>{activeScene.actionableTip}</span>
          </div>
        </div>
      </div>

      {/* Google Veo Video Generation Studio (Prompt-to-Video Engine) */}
      <div className="bg-[#13161d] rounded-2xl border border-[#222835] p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-950/50 border border-purple-800/40 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                {isHi ? 'गूगल वीओ (Veo 3.1) वीडियो जनरेटर' : 'Google Veo AI Video Generator'}
              </h4>
            </div>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-950/50 text-purple-300 border border-purple-800/40">
            veo-3.1-lite
          </span>
        </div>

        {/* Presets */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {VEO_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setVeoPrompt(preset.prompt)}
                className="p-2.5 bg-[#181c24] hover:bg-[#202634] border border-[#252c39] rounded-xl text-left text-xs text-slate-300 transition-colors cursor-pointer"
              >
                <div className="font-semibold text-slate-200 mb-0.5">{preset.title}</div>
                <div className="text-[11px] text-slate-400 line-clamp-2">{preset.prompt}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input & Generate Button */}
        <div className="space-y-2">
          <textarea
            value={veoPrompt}
            onChange={(e) => setVeoPrompt(e.target.value)}
            rows={2}
            className="w-full p-2.5 bg-[#181c24] border border-[#2b3342] rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
            placeholder={
              isHi
                ? 'वीओ वीडियो के लिए विवरण लिखें...'
                : 'Describe the farming scene to generate with Google Veo...'
            }
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400">
              {veoStatus || (isHi ? '720p HD • 16:9' : '720p HD • 16:9')}
            </div>

            <button
              id="generate-veo-video-btn"
              type="button"
              disabled={isGeneratingVeo || !veoPrompt.trim()}
              onClick={handleStartVeoGeneration}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              {isGeneratingVeo ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isHi ? 'वीडियो तैयार हो रहा है...' : 'Generating Video...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isHi ? 'एआई वीडियो बनाएं' : 'Generate AI Video'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Veo Error or Notice */}
        {veoError && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold">
                {isHi ? 'सूचना:' : 'Notice:'}
              </span>
              <p>{veoError}</p>
            </div>
          </div>
        )}

        {/* Completed Generated Video Display */}
        {veoVideoBlobUrl && (
          <div className="mt-4 pt-4 border-t border-[#222835] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {isHi ? 'जनरेटेड वीडियो तैयार है!' : 'Generated AI Video is Ready!'}
                </span>
              </span>
              <a
                href={veoVideoBlobUrl}
                download="agrisetu-veo-demo.mp4"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#181c24] hover:bg-[#202634] border border-[#252c39] text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isHi ? 'डाउनलोड करें' : 'Download MP4'}</span>
              </a>
            </div>
            <video
              src={veoVideoBlobUrl}
              controls
              autoPlay
              className="w-full aspect-video rounded-xl bg-black shadow-md"
            />
          </div>
        )}
      </div>
    </div>
  );
};
