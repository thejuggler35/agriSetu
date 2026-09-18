import React from 'react';
import { Sprout, Compass, Stethoscope, Mic, Video } from 'lucide-react';
import { Language } from '../types';

export type NavTab = 'advisory' | 'whisper' | 'disease' | 'demo';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  systemStatus: {
    geminiConfigured: boolean;
    openWeatherConfigured: boolean;
  };
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  activeTab,
  onTabChange,
}) => {
  const isHi = language === 'hi';

  return (
    <header className="sticky top-0 z-40 bg-[#0f1217]/90 backdrop-blur-md border-b border-[#1e2430]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          {/* Logo & Name */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-white">
              AgriSetu
            </span>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center bg-[#161a23] p-1 rounded-xl text-xs sm:text-sm font-medium overflow-x-auto max-w-[60vw] sm:max-w-none border border-[#222835]">
            <button
              id="tab-advisory"
              type="button"
              onClick={() => onTabChange('advisory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'advisory'
                  ? 'bg-[#242c3b] text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHi ? 'सलाह' : 'Advisory'}</span>
            </button>

            <button
              id="tab-whisper"
              type="button"
              onClick={() => onTabChange('whisper')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'whisper'
                  ? 'bg-[#242c3b] text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHi ? 'व्हिस्पर AI' : 'Whisper AI'}</span>
            </button>

            <button
              id="tab-disease"
              type="button"
              onClick={() => onTabChange('disease')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'disease'
                  ? 'bg-[#242c3b] text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHi ? 'फसल डॉक्टर' : 'Crop Doctor'}</span>
            </button>

            <button
              id="tab-demo"
              type="button"
              onClick={() => onTabChange('demo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'demo'
                  ? 'bg-[#242c3b] text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHi ? 'डेमो वीडियो' : 'Demo Video'}</span>
            </button>
          </nav>

          {/* Right: Language switch */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-[#161a23] p-0.5 rounded-lg text-xs font-medium border border-[#222835]">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 sm:px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#242c3b] text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`px-2 sm:px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  language === 'hi'
                    ? 'bg-[#242c3b] text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
