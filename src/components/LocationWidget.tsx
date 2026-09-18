import React, { useState } from 'react';
import {
  MapPin,
  Crosshair,
  Map as MapIcon,
  CloudSun,
  Droplets,
  Wind,
  Umbrella,
  Loader2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { Language, WeatherData, DistrictInfo } from '../types';
import { LocationMapPicker } from './LocationMapPicker';

export interface CustomFarmLocation {
  id: string;
  district: string;
  state: string;
  lat: number;
  lon: number;
  displayName: string;
  source: 'gps' | 'map' | 'district';
}

interface LocationWidgetProps {
  currentDistrict: DistrictInfo;
  customLocation: CustomFarmLocation | null;
  weather: WeatherData | null;
  isLoadingWeather: boolean;
  onLocationSelected: (location: CustomFarmLocation) => void;
  onResetToDistrict: () => void;
  language: Language;
}

export const LocationWidget: React.FC<LocationWidgetProps> = ({
  currentDistrict,
  customLocation,
  weather,
  isLoadingWeather,
  onLocationSelected,
  onResetToDistrict,
  language,
}) => {
  const isHi = language === 'hi';
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const activeDistrictName = customLocation ? customLocation.district : currentDistrict?.district;
  const activeStateName = customLocation ? customLocation.state : currentDistrict?.state;
  const activeLat = customLocation ? customLocation.lat : currentDistrict?.lat;
  const activeLon = customLocation ? customLocation.lon : currentDistrict?.lon;
  const locationSource = customLocation ? customLocation.source : 'district';

  // Trigger GPS Geolocation
  const handleDetectGPS = () => {
    setIsDetectingGps(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError(
        isHi
          ? 'आपके ब्राउज़र में GPS सुविधा उपलब्ध नहीं है।'
          : 'Geolocation is not supported by your browser.'
      );
      setIsDetectingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const resp = await fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`);
          if (!resp.ok) {
            throw new Error('Could not identify district name');
          }
          const geoData = await resp.json();
          const detectedDistrict = geoData.district || 'Local Area';
          const detectedState = geoData.state || 'India';

          onLocationSelected({
            id: `gps_${latitude.toFixed(3)}_${longitude.toFixed(3)}`,
            district: detectedDistrict,
            state: detectedState,
            lat: Number(latitude.toFixed(4)),
            lon: Number(longitude.toFixed(4)),
            displayName: geoData.displayName || `${detectedDistrict}, ${detectedState}`,
            source: 'gps',
          });
        } catch (err: any) {
          // Fallback if reverse geocode fails: still use coordinates!
          onLocationSelected({
            id: `gps_${latitude.toFixed(3)}_${longitude.toFixed(3)}`,
            district: currentDistrict?.district || 'Farm Location',
            state: currentDistrict?.state || 'India',
            lat: Number(latitude.toFixed(4)),
            lon: Number(longitude.toFixed(4)),
            displayName: `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`,
            source: 'gps',
          });
        } finally {
          setIsDetectingGps(false);
        }
      },
      (error) => {
        console.warn('GPS Geolocation error:', error);
        let msg = isHi
          ? 'GPS अनुमति प्राप्त नहीं हो सकी। कृपया मानचित्र पर अपना स्थान चुनें।'
          : 'Could not access device GPS. Please pick your location on the map.';

        if (error.code === 1) {
          msg = isHi
            ? 'स्थान अनुमति अस्वीकृत हुई। आप नीचे "मानचित्र पर चुनें" बटन से खेत चुन सकते हैं।'
            : 'Location permission was denied. You can select your farm using "Set on Map" below.';
        } else if (error.code === 3) {
          msg = isHi
            ? 'स्थान निर्धारण में समय समाप्त हो गया। कृपया पुन: प्रयास करें या मानचित्र उपयोग करें।'
            : 'Location request timed out. Please try again or use the map picker.';
        }

        setGpsError(msg);
        setIsDetectingGps(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    );
  };

  const handleMapLocationConfirmed = (loc: {
    lat: number;
    lon: number;
    district: string;
    state: string;
    displayName: string;
  }) => {
    onLocationSelected({
      id: `map_${loc.lat.toFixed(3)}_${loc.lon.toFixed(3)}`,
      district: loc.district,
      state: loc.state,
      lat: loc.lat,
      lon: loc.lon,
      displayName: loc.displayName,
      source: 'map',
    });
  };

  const currentWeather = weather?.current;
  const todayForecast = weather?.forecast_5day?.[0];

  return (
    <div className="bg-[#13161d] rounded-2xl border border-[#222835] p-4 sm:p-5 mb-5 shadow-lg">
      {/* Top Header & Mode Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2533]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100">
                {isHi ? 'खेत का स्थान एवं मौसम' : 'Farm Location & Weather'}
              </h3>
              {locationSource === 'gps' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/70 border border-emerald-700/50 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {isHi ? 'लाइव GPS' : 'Live GPS'}
                </span>
              )}
              {locationSource === 'map' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950/70 border border-blue-700/50 text-blue-300">
                  <MapIcon className="w-3 h-3" />
                  {isHi ? 'मानचित्र पिन' : 'Map Pin'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isHi
                ? 'सटीक मौसम व सलाह के लिए वर्तमान स्थान या मानचित्र का उपयोग करें'
                : 'Use current GPS or map to get hyper-local weather & crop advice'}
            </p>
          </div>
        </div>

        {/* Action Buttons: Detect GPS & Open Map */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-detect-gps-location"
            type="button"
            onClick={handleDetectGPS}
            disabled={isDetectingGps}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {isDetectingGps ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isHi ? 'GPS खोज रहे हैं...' : 'Detecting GPS...'}</span>
              </>
            ) : (
              <>
                <Crosshair className="w-3.5 h-3.5" />
                <span>{isHi ? 'वर्तमान स्थान (GPS)' : 'Set Current Location'}</span>
              </>
            )}
          </button>

          <button
            id="btn-open-map-picker"
            type="button"
            onClick={() => setIsMapOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1b202c] hover:bg-[#232938] border border-[#2a3344] text-slate-200 hover:text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            <MapIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isHi ? 'मानचित्र पर चुनें' : 'Pick on Map'}</span>
          </button>

          {customLocation && (
            <button
              type="button"
              onClick={onResetToDistrict}
              className="text-[11px] text-slate-400 hover:text-slate-300 underline underline-offset-2 px-1 cursor-pointer"
            >
              {isHi ? 'जिला रीसेट करें' : 'Reset to District'}
            </button>
          )}
        </div>
      </div>

      {/* GPS Error Banner */}
      {gpsError && (
        <div className="mt-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{gpsError}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMapOpen(true)}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 shrink-0 cursor-pointer underline"
          >
            {isHi ? 'मानचित्र खोलें' : 'Open Map'}
          </button>
        </div>
      )}

      {/* Main Location & Live Weather Figure Card */}
      <div
        id="location-weather-figure"
        className="mt-3.5 bg-[#171b24] border border-[#222937] rounded-xl p-3 sm:p-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          {/* Col 1: Active Location Details */}
          <div className="md:col-span-5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1e2432] border border-[#2c3547] text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold text-slate-100 truncate">
                  {activeDistrictName || 'Farm Location'}
                </h4>
                {activeStateName && (
                  <span className="text-xs px-2 py-0.5 bg-[#202736] border border-[#2d364a] text-slate-300 rounded-md font-medium">
                    {activeStateName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span className="font-mono text-emerald-400/90 text-[11px]">
                  {activeLat?.toFixed(4)}°N, {activeLon?.toFixed(4)}°E
                </span>
                <span>•</span>
                <span className="text-[11px]">
                  {locationSource === 'gps'
                    ? isHi
                      ? 'सटीक डिवाइस जीपीएस'
                      : 'High-Precision GPS'
                    : locationSource === 'map'
                    ? isHi
                      ? 'मानचित्र से चयनित'
                      : 'Map Coordinates'
                    : isHi
                    ? 'जिला केंद्र'
                    : 'District Center'}
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Live Weather Summary Metrics (The requested weather figure) */}
          <div className="md:col-span-7 bg-[#12151d] border border-[#1f2635] rounded-xl p-2.5 sm:p-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
            {isLoadingWeather ? (
              <div className="w-full flex items-center justify-center py-2 gap-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>{isHi ? 'लाइव मौसम डेटा लोड हो रहा है...' : 'Fetching live weather metrics...'}</span>
              </div>
            ) : currentWeather ? (
              <>
                {/* Temp & Condition */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="w-9 h-9 rounded-lg bg-amber-950/40 border border-amber-700/40 text-amber-300 flex items-center justify-center text-lg font-bold">
                    {Math.round(currentWeather.temp)}°
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100 capitalize">
                      {currentWeather.description}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isHi ? 'अनुभव' : 'Feels like'} {Math.round(currentWeather.feels_like)}°C
                    </div>
                  </div>
                </div>

                {/* Weather Badges: Humidity, Wind, Rain */}
                <div className="grid grid-cols-3 gap-2 w-full sm:w-auto text-[11px] text-slate-300">
                  {/* Humidity */}
                  <div className="bg-[#171b25] border border-[#242b39] px-2 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[9px] leading-tight">
                        {isHi ? 'नमी' : 'Humidity'}
                      </span>
                      <span className="font-semibold text-slate-200">
                        {currentWeather.humidity}%
                      </span>
                    </div>
                  </div>

                  {/* Wind */}
                  <div className="bg-[#171b25] border border-[#242b39] px-2 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[9px] leading-tight">
                        {isHi ? 'हवा' : 'Wind'}
                      </span>
                      <span className="font-semibold text-slate-200">
                        {currentWeather.wind_speed_kmh} km/h
                      </span>
                    </div>
                  </div>

                  {/* Rain Probability */}
                  <div className="bg-[#171b25] border border-[#242b39] px-2 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Umbrella className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[9px] leading-tight">
                        {isHi ? 'बारिश' : 'Rain'}
                      </span>
                      <span className="font-semibold text-slate-200">
                        {todayForecast?.rain_probability_percent ?? 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-400 py-1">
                {isHi ? 'मौसम डेटा अनुपलब्ध है' : 'Weather information unavailable'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Picker Modal */}
      <LocationMapPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        initialLat={activeLat}
        initialLon={activeLon}
        onConfirmLocation={handleMapLocationConfirmed}
        language={language}
      />
    </div>
  );
};
