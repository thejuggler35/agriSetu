import React from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  TestTube2,
  TreeDeciduous,
  Info,
} from 'lucide-react';
import { DailyWeatherForecast, SoilHealthData, NdviData, Language } from '../types';

interface InputMetricsViewerProps {
  weatherDays: DailyWeatherForecast[];
  soil: SoilHealthData;
  ndvi: NdviData;
  districtName: string;
  stateName: string;
  isLiveWeather: boolean;
  language: Language;
}

export const InputMetricsViewer: React.FC<InputMetricsViewerProps> = ({
  weatherDays,
  soil,
  ndvi,
  districtName,
  stateName,
  isLiveWeather,
  language,
}) => {
  const isHi = language === 'hi';

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('low') || s.includes('deficient')) {
      return 'bg-amber-950/50 text-amber-300 border-amber-800/40';
    }
    if (s.includes('high') || s.includes('excess')) {
      return 'bg-blue-950/50 text-blue-300 border-blue-800/40';
    }
    return 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40';
  };

  return (
    <div className="space-y-4 mb-6">
      {/* 5-Day Weather Forecast */}
      <div className="bg-[#13161d] rounded-2xl border border-[#222835] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              {isHi ? '5-दिवसीय मौसम' : '5-Day Weather'}
            </h3>
            <p className="text-xs text-slate-500">
              {districtName}, {stateName}
            </p>
          </div>
          {isLiveWeather && (
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-full">
              {isHi ? 'लाइव' : 'Live'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {weatherDays.map((day, idx) => {
            const dateObj = new Date(day.date);
            const dayName = isHi ? day.day_name_hi || day.day_name : day.day_name;
            const monthDay = dateObj.toLocaleDateString(isHi ? 'hi-IN' : 'en-US', {
              day: 'numeric',
              month: 'short',
            });
            const hasRain = day.rain_probability_percent >= 30;

            return (
              <div
                key={day.date}
                className={`p-3 rounded-xl border text-left transition-all ${
                  idx === 0
                    ? 'bg-[#1b2230] border-emerald-700/40'
                    : 'bg-[#181c24] border-[#242b38]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-200">
                    {idx === 0 ? (isHi ? 'आज' : 'Today') : dayName}
                  </span>
                  <span className="text-[10px] text-slate-500">{monthDay}</span>
                </div>

                <div className="text-xs text-slate-400 capitalize truncate mb-2">
                  {day.weather_description || day.weather_main}
                </div>

                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-base font-bold text-slate-100">
                    {Math.round(day.temp_max)}°
                  </span>
                  <span className="text-xs text-slate-500">
                    / {Math.round(day.temp_min)}°C
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#252c3a]">
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-sky-400" />
                    <span className={hasRain ? 'font-semibold text-sky-300' : ''}>
                      {day.rain_probability_percent}%
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-slate-500" />
                    <span>{day.wind_speed_kmh} km/h</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Soil Health & Satellite Greenness */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* NPK Nutrients Card */}
        <div className="md:col-span-2 bg-[#13161d] rounded-2xl border border-[#222835] p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                {isHi ? 'मृदा स्वास्थ्य' : 'Soil Health'}
              </h3>
              <p className="text-xs text-slate-500">
                {soil.soil_type} • pH {soil.ph}
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              #{soil.shc_sample_id}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#181c24] p-3 rounded-xl border border-[#242b38]">
              <span className="text-xs text-slate-400 block">
                {isHi ? 'नाइट्रोजन (N)' : 'Nitrogen (N)'}
              </span>
              <span className="text-base font-bold text-slate-100 block mt-0.5">
                {soil.nitrogen_kg_ha}{' '}
                <span className="text-xs font-normal text-slate-500">kg/ha</span>
              </span>
              <span
                className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusBadge(
                  soil.nitrogen_status
                )}`}
              >
                {soil.nitrogen_status}
              </span>
            </div>

            <div className="bg-[#181c24] p-3 rounded-xl border border-[#242b38]">
              <span className="text-xs text-slate-400 block">
                {isHi ? 'फास्फोरस (P)' : 'Phosphorus (P)'}
              </span>
              <span className="text-base font-bold text-slate-100 block mt-0.5">
                {soil.phosphorus_kg_ha}{' '}
                <span className="text-xs font-normal text-slate-500">kg/ha</span>
              </span>
              <span
                className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusBadge(
                  soil.phosphorus_status
                )}`}
              >
                {soil.phosphorus_status}
              </span>
            </div>

            <div className="bg-[#181c24] p-3 rounded-xl border border-[#242b38]">
              <span className="text-xs text-slate-400 block">
                {isHi ? 'पोटाश (K)' : 'Potassium (K)'}
              </span>
              <span className="text-base font-bold text-slate-100 block mt-0.5">
                {soil.potassium_kg_ha}{' '}
                <span className="text-xs font-normal text-slate-500">kg/ha</span>
              </span>
              <span
                className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusBadge(
                  soil.potassium_status
                )}`}
              >
                {soil.potassium_status}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-[#222835] text-xs text-slate-400">
            <span>Org. Carbon: {soil.organic_carbon_percent}%</span>
            <span>Zinc: {soil.zinc_ppm} ppm</span>
            <span>Iron: {soil.iron_ppm} ppm</span>
          </div>
        </div>

        {/* Satellite Greenness (NDVI) */}
        <div className="bg-[#13161d] rounded-2xl border border-[#222835] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-200">
                {isHi ? 'फसल आवरण (NDVI)' : 'Canopy Health (NDVI)'}
              </h3>
              <span className="text-xs font-mono text-slate-500">
                {ndvi.acquisition_date}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2 mt-3">
              <span className="text-3xl font-bold text-slate-100">
                {ndvi.mean_ndvi.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500">/ 1.0</span>
            </div>

            <div className="w-full bg-[#1e2430] rounded-full h-2 mb-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, ndvi.mean_ndvi * 100))}%` }}
              />
            </div>

            <span className="inline-block text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-full">
              {isHi ? ndvi.vegetation_status_hi : ndvi.vegetation_status}
            </span>
          </div>

          <div className="pt-3 border-t border-[#222835] text-[11px] text-slate-500">
            Cloud cover: {ndvi.cloud_cover_percent}%
          </div>
        </div>
      </div>
    </div>
  );
};
