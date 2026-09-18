import React, { useState } from 'react';
import {
  Sprout,
  Droplets,
  FlaskConical,
  AlertTriangle,
  Copy,
  Check,
  Printer,
} from 'lucide-react';
import { AdvisoryResponse, Language } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface AdvisoryCardProps {
  advisory: AdvisoryResponse;
  language: Language;
}

export const AdvisoryCard: React.FC<AdvisoryCardProps> = ({ advisory, language }) => {
  const isHi = language === 'hi';
  const [activeTab, setActiveTab] = useState<'rotation' | 'soil' | 'water' | 'risk'>('rotation');
  const [copied, setCopied] = useState(false);

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-red-950/60 text-red-300 border-red-800/50';
      case 'moderate':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/50';
      default:
        return 'bg-blue-950/60 text-blue-300 border-blue-800/50';
    }
  };

  const handleCopy = () => {
    const textToCopy = `${advisory.crop} Advisory - ${advisory.district}\n\nSummary:\n${advisory.summary}\n\nRotation:\n${advisory.regenerativeRecommendation.plantingRotationStrategy}\n\nFertilizer:\n${advisory.soilAmendments.npkAdjustment}\n\nWatering:\n${advisory.irrigationSchedule.wateringAction}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#13161d] rounded-2xl border border-[#222835] p-5 sm:p-7 shadow-xs mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#222835]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-100 tracking-tight">
              {advisory.crop} {isHi ? 'परामर्श' : 'Advisory'}
            </h3>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-full">
              {advisory.district}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#181c24] hover:bg-[#222835] border border-[#2b3342] rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isHi ? 'कॉपी हुआ' : 'Copied') : (isHi ? 'कॉपी' : 'Copy')}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#181c24] hover:bg-[#222835] border border-[#2b3342] rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isHi ? 'प्रिंट' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* Summary Box */}
      <div className="my-4 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-slate-200">
        <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
          {isHi ? 'मुख्य सारांश' : 'Summary'}
        </h4>
        <p className="text-sm text-slate-300 leading-relaxed">
          {advisory.summary}
        </p>
      </div>

      {/* Audio Player */}
      <div className="mb-6">
        <AudioPlayer
          textToRead={advisory.audioText}
          language={language}
          audioUrl={advisory.audioUrl}
          title={isHi ? 'यह सम्पूर्ण सलाह सुनें' : 'Listen to advisory'}
        />
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#181c24] border border-[#252c39] rounded-xl mb-5 text-xs font-medium overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('rotation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'rotation'
              ? 'bg-[#242b38] text-white border border-[#343d4f] font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sprout className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isHi ? 'फसल चक्र' : 'Crop & Rotation'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('soil')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'soil'
              ? 'bg-[#242b38] text-white border border-[#343d4f] font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isHi ? 'उर्वरक एवं खाद' : 'Soil & Fertilizer'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('water')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'water'
              ? 'bg-[#242b38] text-white border border-[#343d4f] font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Droplets className="w-3.5 h-3.5 text-sky-400" />
          <span>{isHi ? 'सिंचाई सलाह' : 'Irrigation'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('risk')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'risk'
              ? 'bg-[#242b38] text-white border border-[#343d4f] font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>{isHi ? 'मौसम व कीट जोखिम' : 'Risks & Alerts'}</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'rotation' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-[#181c24] border border-[#252c39]">
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  {isHi ? 'फसल चक्र रणनीति' : 'Crop Rotation Strategy'}
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {advisory.regenerativeRecommendation.plantingRotationStrategy}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#181c24] border border-[#252c39]">
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  {isHi ? 'हरी खाद / अंतर्वर्ती फसल' : 'Cover Crop & Intercropping'}
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {advisory.regenerativeRecommendation.coverCropIntercrop}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#181c24] border border-[#252c39]">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                {isHi ? 'जैव विविधता एवं लाभ' : 'Biodiversity & Benefits'}
              </span>
              <p className="text-sm text-slate-200 leading-relaxed">
                {advisory.regenerativeRecommendation.biodiversityBenefit}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'soil' && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[#181c24] border border-[#252c39]">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                {isHi ? 'NPK उर्वरक समायोजन' : 'NPK Nutrient Adjustment'}
              </span>
              <p className="text-sm text-slate-200 leading-relaxed">
                {advisory.soilAmendments.npkAdjustment}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-[#181c24] border border-[#252c39]">
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  {isHi ? 'जैविक खाद योजना' : 'Organic Matter & Compost'}
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {advisory.soilAmendments.organicMatterPlan}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#181c24] border border-[#252c39]">
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  {isHi ? 'सूक्ष्म पोषक तत्व एवं pH' : 'Micronutrients & pH Care'}
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {advisory.soilAmendments.micronutrientsAndPhCare}
                </p>
              </div>
            </div>

            {advisory.soilAmendments.bioFertilizers && (
              <div className="p-4 rounded-xl bg-[#181c24] border border-[#252c39]">
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  {isHi ? 'जैव उर्वरक सिफारिश' : 'Bio-Fertilizer Recommendation'}
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {advisory.soilAmendments.bioFertilizers}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'water' && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[#181c24] border border-[#252c39]">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                {isHi ? 'सिंचाई सलाह' : 'Watering Action'}
              </span>
              <p className="text-sm text-slate-200 leading-relaxed">
                {advisory.irrigationSchedule.wateringAction}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-[#181c24] border border-[#252c39]">
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  {isHi ? 'मौसम विश्लेषण' : 'Weather Forecast Analysis'}
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {advisory.irrigationSchedule.forecastAnalysis}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#181c24] border border-[#252c39]">
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  {isHi ? 'जल संरक्षण सुझाव' : 'Moisture Conservation Tip'}
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {advisory.irrigationSchedule.moistureConservationTip}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="space-y-3">
            {advisory.climateRiskFlags && advisory.climateRiskFlags.length > 0 ? (
              advisory.climateRiskFlags.map((risk, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#181c24] border border-[#252c39]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-100">
                      {risk.title}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getSeverityBadge(
                        risk.severity
                      )}`}
                    >
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{risk.description}</p>
                  <p className="text-xs text-slate-300 bg-[#12151c] p-2.5 rounded-lg border border-[#252c39]">
                    <strong className="text-emerald-400">{isHi ? 'उपाय:' : 'Action:'}</strong> {risk.mitigation}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-[#181c24] border border-[#252c39] text-xs text-slate-500">
                {isHi ? 'वर्तमान पूर्वानुमान में कोई गंभीर जोखिम नहीं है।' : 'No major climate risks identified for the coming 5 days.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
