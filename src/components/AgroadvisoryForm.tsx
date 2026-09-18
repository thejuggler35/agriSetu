import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { DistrictInfo, Language, WeatherData } from '../types';
import { LocationWidget, CustomFarmLocation } from './LocationWidget';

interface AgroadvisoryFormProps {
  districts: DistrictInfo[];
  selectedDistrictId: string;
  onDistrictChange: (id: string) => void;
  selectedCrop: string;
  onCropChange: (crop: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  language: Language;
  customLocation: CustomFarmLocation | null;
  weather: WeatherData | null;
  isLoadingWeather: boolean;
  onLocationSelected: (location: CustomFarmLocation) => void;
  onResetToDistrict: () => void;
}

export const AgroadvisoryForm: React.FC<AgroadvisoryFormProps> = ({
  districts,
  selectedDistrictId,
  onDistrictChange,
  selectedCrop,
  onCropChange,
  onSubmit,
  isLoading,
  language,
  customLocation,
  weather,
  isLoadingWeather,
  onLocationSelected,
  onResetToDistrict,
}) => {
  const isHi = language === 'hi';

  const currentDistrict = districts.find((d) => d.id === selectedDistrictId) || districts[0];
  const [selectedState, setSelectedState] = useState<string>(
    currentDistrict ? currentDistrict.state : 'Punjab'
  );
  const [isCustomCrop, setIsCustomCrop] = useState(false);
  const [customCropInput, setCustomCropInput] = useState('');

  const uniqueStates = Array.from(new Set(districts.map((d) => d.state)));
  const availableDistricts = districts.filter((d) => d.state === selectedState);

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    const firstDistrict = districts.find((d) => d.state === state);
    if (firstDistrict) {
      onDistrictChange(firstDistrict.id);
      onCropChange(firstDistrict.major_crops[0]);
      setIsCustomCrop(false);
    }
  };

  const handleDistrictSelect = (districtId: string) => {
    onDistrictChange(districtId);
    const dist = districts.find((d) => d.id === districtId);
    if (dist && dist.major_crops.length > 0) {
      onCropChange(dist.major_crops[0]);
      setIsCustomCrop(false);
    }
  };

  useEffect(() => {
    if (currentDistrict && currentDistrict.state !== selectedState) {
      setSelectedState(currentDistrict.state);
    }
  }, [currentDistrict]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCustomCrop && customCropInput.trim()) {
      onCropChange(customCropInput.trim());
    }
    onSubmit();
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Figure to set current location & display live weather figure */}
      <LocationWidget
        currentDistrict={currentDistrict}
        customLocation={customLocation}
        weather={weather}
        isLoadingWeather={isLoadingWeather}
        onLocationSelected={onLocationSelected}
        onResetToDistrict={onResetToDistrict}
        language={language}
      />

      {/* District & Crop Selector Form */}
      <div className="bg-[#13161d] rounded-2xl border border-[#222835] p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* State Selection Pills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400">
                {isHi ? 'मानक कृषि क्षेत्र / राज्य' : 'Agricultural Zones / States'}
              </label>
              {customLocation && (
                <span className="text-[11px] text-emerald-400 font-medium">
                  {isHi ? 'वर्तमान में चयनित: ' : 'Active: '} {customLocation.district}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {uniqueStates.map((st) => {
                const isSelected = selectedState === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStateSelect(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-500 text-white font-semibold'
                        : 'bg-[#181c24] border-[#252c39] text-slate-300 hover:bg-[#202634]'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

        {/* District and Crop Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* District Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              {isHi ? 'जिला' : 'District'}
            </label>
            <div className="relative">
              <select
                id="district-select"
                value={selectedDistrictId}
                onChange={(e) => handleDistrictSelect(e.target.value)}
                className="w-full bg-[#181c24] border border-[#2b3342] text-slate-100 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden cursor-pointer appearance-none transition-colors"
              >
                {availableDistricts.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#181c24] text-slate-100">
                    {d.district} {isHi ? `(${d.district_hi})` : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              {isHi ? 'फसल' : 'Crop'}
            </label>
            {!isCustomCrop ? (
              <div className="relative">
                <select
                  id="crop-select"
                  value={selectedCrop}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomCrop(true);
                      setCustomCropInput('');
                    } else {
                      onCropChange(e.target.value);
                    }
                  }}
                  className="w-full bg-[#181c24] border border-[#2b3342] text-slate-100 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden cursor-pointer appearance-none transition-colors"
                >
                  {currentDistrict?.major_crops.map((c, idx) => (
                    <option key={c} value={c} className="bg-[#181c24] text-slate-100">
                      {c} {isHi && currentDistrict.major_crops_hi?.[idx] ? `(${currentDistrict.major_crops_hi[idx]})` : ''}
                    </option>
                  ))}
                  <option value="__custom__" className="bg-[#181c24] text-emerald-400">
                    {isHi ? '+ अन्य फसल लिखें...' : '+ Other crop...'}
                  </option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={isHi ? 'फसल का नाम दर्ज करें' : 'Enter crop name'}
                  value={customCropInput}
                  onChange={(e) => {
                    setCustomCropInput(e.target.value);
                    onCropChange(e.target.value);
                  }}
                  className="w-full bg-[#181c24] border border-[#2b3342] text-slate-100 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCrop(false);
                    if (currentDistrict?.major_crops[0]) {
                      onCropChange(currentDistrict.major_crops[0]);
                    }
                  }}
                  className="px-3 py-2 text-xs bg-[#222835] hover:bg-[#2b3342] text-slate-300 rounded-xl font-medium cursor-pointer transition-colors"
                >
                  {isHi ? 'सूची' : 'List'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            id="btn-get-advisory"
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isHi ? 'विश्लेषण...' : 'Analyzing...'}</span>
              </>
            ) : (
              <>
                <span>{isHi ? 'सलाह देखें' : 'Get Advisory'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);
};
