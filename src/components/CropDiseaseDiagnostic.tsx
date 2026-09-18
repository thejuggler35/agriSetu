import React, { useState, useRef } from 'react';
import {
  Upload,
  FlaskConical,
  Sprout,
  Loader2,
  Stethoscope,
} from 'lucide-react';
import { DiseaseDiagnosisResponse, Language } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface CropDiseaseDiagnosticProps {
  language: Language;
}

const PRESET_SAMPLES = [
  {
    id: 'sample-tomato-blight',
    crop: 'Tomato',
    crop_hi: 'टमाटर',
    name: 'Early Blight',
    name_hi: 'अगेती झुलसा',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23e7efe9"/><ellipse cx="150" cy="100" rx="110" ry="70" fill="%234d7c5f"/><circle cx="120" cy="90" r="22" fill="%23382519"/><circle cx="120" cy="90" r="14" fill="%235a3922"/><circle cx="180" cy="115" r="18" fill="%23382519"/><circle cx="180" cy="115" r="10" fill="%236e4b2d"/><text x="150" y="175" font-family="sans-serif" font-size="12" fill="%231c1917" text-anchor="middle">Tomato Early Blight Lesions</text></svg>',
  },
  {
    id: 'sample-rice-blast',
    crop: 'Rice',
    crop_hi: 'धान',
    name: 'Rice Blast',
    name_hi: 'धान का झोंका',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23e7efe9"/><polygon points="40,160 150,30 260,160" fill="%234d7c5f"/><ellipse cx="150" cy="95" rx="35" ry="15" fill="%236d4c41" transform="rotate(30 150 95)"/><ellipse cx="125" cy="130" rx="25" ry="10" fill="%235d4037" transform="rotate(25 125 130)"/><text x="150" y="180" font-family="sans-serif" font-size="12" fill="%231c1917" text-anchor="middle">Rice Blast Spindle Lesions</text></svg>',
  },
  {
    id: 'sample-wheat-rust',
    crop: 'Wheat',
    crop_hi: 'गेहूं',
    name: 'Yellow Rust',
    name_hi: 'पीला रतुआ',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23e7efe9"/><rect x="70" y="20" width="160" height="160" rx="10" fill="%23588157"/><line x1="100" y1="30" x2="100" y2="170" stroke="%23e67e22" stroke-width="8" stroke-dasharray="8,4"/><line x1="130" y1="40" x2="130" y2="160" stroke="%23d35400" stroke-width="7" stroke-dasharray="10,5"/><line x1="160" y1="35" x2="160" y2="165" stroke="%23f39c12" stroke-width="8" stroke-dasharray="6,3"/><text x="150" y="190" font-family="sans-serif" font-size="12" fill="%231c1917" text-anchor="middle">Wheat Stripe Rust</text></svg>',
  },
];

export const CropDiseaseDiagnostic: React.FC<CropDiseaseDiagnosticProps> = ({ language }) => {
  const isHi = language === 'hi';
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiseaseDiagnosisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (!file) return;
    setErrorMsg(null);
    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: (typeof PRESET_SAMPLES)[0]) => {
    setImagePreview(preset.dataUrl);
    setMimeType('image/svg+xml');
    setSelectedCrop(preset.crop);
    setErrorMsg(null);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) {
      setErrorMsg(isHi ? 'कृपया पहले फसल की पत्ती की फोटो चुनें।' : 'Please upload or select a leaf photo first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const base64Data = imagePreview.includes(',') ? imagePreview.split(',')[1] : imagePreview;
      const resp = await fetch('/api/diagnose-disease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType || 'image/jpeg',
          crop: selectedCrop,
          language: language,
        }),
      });

      if (!resp.ok) {
        throw new Error('Failed to analyze image');
      }

      const data: DiseaseDiagnosisResponse = await resp.json();
      setDiagnosis(data);
    } catch (err) {
      console.error('Diagnosis error:', err);
      setErrorMsg(
        isHi
          ? 'फोटो विश्लेषण में समस्या आई। कृपया पुनः प्रयास करें।'
          : 'Could not diagnose image. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getUrgencyBadge = (urg: string) => {
    switch (urg?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-red-950/40 text-red-400 border-red-800/50';
      case 'moderate':
        return 'bg-amber-950/40 text-amber-400 border-amber-800/50';
      default:
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50';
    }
  };

  return (
    <div className="space-y-4 mb-10">
      {/* Upload and Input Card */}
      <div className="bg-[#13161d] rounded-2xl border border-[#222835] p-5 sm:p-6">
        {/* Crop Selection */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            {isHi ? 'लक्षित फसल' : 'Target Crop'}
          </label>
          <div className="flex flex-wrap gap-2">
            {['Tomato', 'Rice', 'Wheat', 'Cotton', 'Potato'].map((crop) => (
              <button
                key={crop}
                type="button"
                onClick={() => setSelectedCrop(crop)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedCrop === crop
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-[#181c24] border border-[#252c39] text-slate-300 hover:bg-[#202634] hover:text-slate-100'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Zone & Quick Samples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upload Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              {isHi ? 'पत्ती की फोटो अपलोड करें' : 'Upload Leaf Photo'}
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#2b3342] hover:border-emerald-500 rounded-xl p-5 text-center cursor-pointer transition-colors bg-[#181c24]/50 hover:bg-[#181c24] flex flex-col items-center justify-center min-h-[150px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {imagePreview ? (
                <div className="relative w-full max-h-36 flex items-center justify-center overflow-hidden rounded-lg">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-36 rounded-lg object-contain"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg text-white text-xs font-medium">
                    {isHi ? 'फोटो बदलें' : 'Change photo'}
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    {isHi ? 'फोटो चुनें' : 'Upload photo'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    PNG, JPG, WebP
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Preset Samples */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              {isHi ? 'या नमूना चुनें' : 'Or Try Sample Leaf'}
            </label>
            <div className="space-y-2">
              {PRESET_SAMPLES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="w-full p-2 rounded-xl border border-[#252c39] bg-[#181c24] hover:bg-[#202634] flex items-center gap-3 text-left transition-colors cursor-pointer"
                >
                  <img
                    src={preset.dataUrl}
                    alt={preset.name}
                    className="w-9 h-9 rounded-lg object-cover border border-[#2b3342]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      {preset.crop} — {isHi ? preset.name_hi : preset.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Diagnose Action Button */}
        <div className="mt-4 pt-3 border-t border-[#222835] flex justify-end">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !imagePreview}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-40 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isHi ? 'विश्लेषण जारी है...' : 'Diagnosing...'}</span>
              </>
            ) : (
              <>
                <Stethoscope className="w-4 h-4" />
                <span>{isHi ? 'रोग का पता लगाएँ' : 'Diagnose Disease'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Diagnosis Results Card */}
      {diagnosis && (
        <div className="bg-[#13161d] rounded-2xl border border-[#222835] p-5 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222835]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100 tracking-tight">
                  {diagnosis.diseaseName}
                </h3>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getUrgencyBadge(
                    diagnosis.urgency
                  )}`}
                >
                  {diagnosis.urgency}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {diagnosis.diseaseNameLocal} • {diagnosis.confidencePercent}% • {diagnosis.pathogenType}
              </p>
            </div>
          </div>

          {/* Audio Player for Diagnosis */}
          {diagnosis.audioText && (
            <div className="my-2">
              <AudioPlayer
                textToRead={diagnosis.audioText}
                language={language}
                audioUrl={diagnosis.audioUrl}
                title={isHi ? 'सलाह सुनें' : 'Listen'}
              />
            </div>
          )}

          {/* Symptoms List */}
          {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#181c24] border border-[#252c39]">
              <span className="text-xs font-semibold text-slate-300 block mb-1">
                {isHi ? 'लक्षण' : 'Symptoms'}
              </span>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                {diagnosis.symptoms.map((sym: string, idx: number) => (
                  <li key={idx}>{sym}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Treatment Options: Organic vs Chemical */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-2">
            {/* Organic Treatment */}
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
              <div className="flex items-center gap-2 mb-1.5">
                <Sprout className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {isHi ? 'जैविक उपचार' : 'Organic Remedy'}
                </h4>
              </div>
              <p className="text-xs font-semibold text-slate-100 mb-1">
                {diagnosis.organicTreatment.remedyName}
              </p>
              <div className="text-xs text-slate-300 space-y-1">
                <p>
                  <strong className="text-slate-200">Ingredients:</strong> {diagnosis.organicTreatment.ingredients}
                </p>
                <p>
                  <strong className="text-slate-200">Method:</strong> {diagnosis.organicTreatment.applicationMethod}
                </p>
                <p className="text-slate-400">
                  <strong className="text-slate-300">Timing:</strong> {diagnosis.organicTreatment.timing}
                </p>
              </div>
            </div>

            {/* Chemical Treatment */}
            <div className="p-3.5 rounded-xl bg-[#181c24] border border-[#252c39]">
              <div className="flex items-center gap-2 mb-1.5">
                <FlaskConical className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {isHi ? 'रासायनिक उपचार' : 'Chemical Treatment'}
                </h4>
              </div>
              <p className="text-xs font-semibold text-slate-100 mb-1">
                {diagnosis.chemicalTreatment.chemicalName}
              </p>
              <div className="text-xs text-slate-300 space-y-1">
                <p>
                  <strong className="text-slate-200">Dosage:</strong> {diagnosis.chemicalTreatment.dosagePerAcre}
                </p>
                <p>
                  <strong className="text-slate-200">Safety:</strong> {diagnosis.chemicalTreatment.safetyPrecautions}
                </p>
                <p className="text-slate-400">
                  <strong className="text-slate-300">Wait:</strong> {diagnosis.chemicalTreatment.waitingPeriodDays} days
                </p>
              </div>
            </div>
          </div>

          {/* Prevention Rules */}
          {diagnosis.prevention && diagnosis.prevention.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#181c24] border border-[#252c39]">
              <span className="text-xs font-semibold text-slate-300 block mb-1">
                {isHi ? 'रोकथाम' : 'Prevention'}
              </span>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                {diagnosis.prevention.map((tip: string, idx: number) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
