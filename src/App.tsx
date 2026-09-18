import React, { useState, useEffect, useRef } from 'react';
import { AgroadvisoryForm } from './components/AgroadvisoryForm';
import { CustomFarmLocation } from './components/LocationWidget';
import { InputMetricsViewer } from './components/InputMetricsViewer';
import { AdvisoryCard } from './components/AdvisoryCard';
import { CropDiseaseDiagnostic } from './components/CropDiseaseDiagnostic';
import { WhisperVoiceAssistant } from './components/WhisperVoiceAssistant';
import { FarmerDemoVideo } from './components/FarmerDemoVideo';
import { Header, NavTab } from './components/Header';
import { DistrictInfo, WeatherData, AdvisoryResponse, Language } from './types';
import { Sprout, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<NavTab>('advisory');
  const [districts, setDistricts] = useState<DistrictInfo[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [customLocation, setCustomLocation] = useState<CustomFarmLocation | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [advisory, setAdvisory] = useState<AdvisoryResponse | null>(null);
  const [isLoadingAdvisory, setIsLoadingAdvisory] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    geminiConfigured: false,
    openWeatherConfigured: false,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const advisoryCardRef = useRef<HTMLDivElement>(null);

  // Initial Load: Fetch Districts and System Status
  useEffect(() => {
    async function initData() {
      try {
        const statusResp = await fetch('/api/system-status');
        if (statusResp.ok) {
          const statusData = await statusResp.json();
          setSystemStatus({
            geminiConfigured: statusData.geminiConfigured,
            openWeatherConfigured: statusData.openWeatherConfigured,
          });
        }

        const distResp = await fetch('/api/districts');
        if (distResp.ok) {
          const distData: DistrictInfo[] = await distResp.json();
          setDistricts(distData);
          if (distData.length > 0) {
            const initialDist = distData[0];
            setSelectedDistrictId(initialDist.id);
            setSelectedCrop(initialDist.major_crops[0] || 'Wheat');
            loadWeather(initialDist.id);
          }
        }
      } catch (err) {
        console.error('Failed to initialize AgriSetu data:', err);
      }
    }

    initData();
  }, []);

  // Fetch Weather for Selected District
  const loadWeather = async (districtId: string) => {
    setIsLoadingWeather(true);
    try {
      const resp = await fetch(`/api/weather?districtId=${districtId}`);
      if (resp.ok) {
        const weatherData = await resp.json();
        setWeather(weatherData);
      }
    } catch (err) {
      console.error('Failed to fetch weather:', err);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Fetch Weather for Coordinates (GPS or Map Pin)
  const loadWeatherForCoords = async (
    lat: number,
    lon: number,
    districtName?: string,
    stateName?: string
  ) => {
    setIsLoadingWeather(true);
    try {
      const q = `/api/weather?lat=${lat}&lon=${lon}&districtName=${encodeURIComponent(
        districtName || ''
      )}&stateName=${encodeURIComponent(stateName || '')}`;
      const resp = await fetch(q);
      if (resp.ok) {
        const weatherData = await resp.json();
        setWeather(weatherData);
      }
    } catch (err) {
      console.error('Failed to fetch weather for coordinates:', err);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleLocationSelected = (loc: CustomFarmLocation) => {
    setCustomLocation(loc);
    loadWeatherForCoords(loc.lat, loc.lon, loc.district, loc.state);

    // Map to nearest district in soil/NDVI database for agricultural characteristics
    if (districts.length > 0) {
      let nearest = districts[0];
      let minDistance = Infinity;
      for (const d of districts) {
        const dist = Math.hypot(d.lat - loc.lat, d.lon - loc.lon);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = d;
        }
      }
      setSelectedDistrictId(nearest.id);
      if (nearest.major_crops.length > 0 && !nearest.major_crops.includes(selectedCrop)) {
        setSelectedCrop(nearest.major_crops[0]);
      }
    }
  };

  const handleResetToDistrict = () => {
    setCustomLocation(null);
    if (selectedDistrictId) {
      loadWeather(selectedDistrictId);
    }
  };

  const handleDistrictChange = (id: string) => {
    setCustomLocation(null);
    setSelectedDistrictId(id);
    loadWeather(id);
    const d = districts.find((dist) => dist.id === id);
    if (d && d.major_crops.length > 0 && !d.major_crops.includes(selectedCrop)) {
      setSelectedCrop(d.major_crops[0]);
    }
  };

  // Generate Advisory
  const handleGenerateAdvisory = async () => {
    if (!selectedDistrictId && !customLocation) return;

    setIsLoadingAdvisory(true);
    setErrorMessage(null);

    try {
      const resp = await fetch('/api/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          districtId: selectedDistrictId,
          crop: selectedCrop,
          language,
          customLocation: customLocation
            ? {
                lat: customLocation.lat,
                lon: customLocation.lon,
                district: customLocation.district,
                state: customLocation.state,
              }
            : undefined,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'Failed to generate advisory');
      }

      const data: AdvisoryResponse = await resp.json();
      setAdvisory(data);

      setTimeout(() => {
        advisoryCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      console.error('Error generating advisory:', err);
      setErrorMessage(err.message || 'An error occurred while communicating with the advisory service.');
    } finally {
      setIsLoadingAdvisory(false);
    }
  };

  // Auto-regenerate advisory when language changes if an advisory is already shown
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    if (advisory && !isLoadingAdvisory) {
      fetch('/api/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          districtId: selectedDistrictId,
          crop: selectedCrop,
          language: newLang,
          customLocation: customLocation
            ? {
                lat: customLocation.lat,
                lon: customLocation.lon,
                district: customLocation.district,
                state: customLocation.state,
              }
            : undefined,
        }),
      })
        .then((res) => res.json())
        .then((data) => setAdvisory(data))
        .catch((err) => console.error('Language update error:', err));
    }
  };

  const baseDistrict = districts.find((d) => d.id === selectedDistrictId) || districts[0];
  const selectedDistrict: DistrictInfo | undefined =
    customLocation && baseDistrict
      ? {
          ...baseDistrict,
          id: customLocation.id,
          district: customLocation.district,
          district_hi: customLocation.district,
          state: customLocation.state,
          state_hi: customLocation.state,
          lat: customLocation.lat,
          lon: customLocation.lon,
        }
      : baseDistrict;

  const isHi = language === 'hi';
  const weatherDays = weather?.forecast_5day || [];
  const isLiveWeather = !!weather?.is_live;

  return (
    <div className="min-h-screen bg-[#0c0e12] text-slate-100 flex flex-col font-sans">
      {/* Clean Navigation Bar */}
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        systemStatus={systemStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-7">
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
            >
              {isHi ? 'बंद करें' : 'Dismiss'}
            </button>
          </div>
        )}

        {/* Tab 1: Advisory */}
        {activeTab === 'advisory' && (
          <div>
            <AgroadvisoryForm
              districts={districts}
              selectedDistrictId={selectedDistrictId}
              onDistrictChange={handleDistrictChange}
              selectedCrop={selectedCrop}
              onCropChange={setSelectedCrop}
              onSubmit={handleGenerateAdvisory}
              isLoading={isLoadingAdvisory}
              language={language}
              customLocation={customLocation}
              weather={weather}
              isLoadingWeather={isLoadingWeather}
              onLocationSelected={handleLocationSelected}
              onResetToDistrict={handleResetToDistrict}
            />

            {selectedDistrict && (
              <InputMetricsViewer
                weatherDays={weatherDays}
                soil={selectedDistrict.soil_health}
                ndvi={selectedDistrict.ndvi}
                districtName={selectedDistrict.district}
                stateName={selectedDistrict.state}
                isLiveWeather={isLiveWeather}
                language={language}
              />
            )}

            <div ref={advisoryCardRef}>
              {advisory ? (
                <AdvisoryCard advisory={advisory} language={language} />
              ) : (
                <div className="bg-[#14171f] rounded-2xl border border-[#222835] p-8 text-center text-slate-400 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-slate-200">
                    {isHi
                      ? 'सलाह देखने के लिए ऊपर फसल चुनें'
                      : 'Select crop above to view advisory'}
                  </h4>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Whisper AI Voice Assistant */}
        {activeTab === 'whisper' && (
          <WhisperVoiceAssistant
            language={language}
            selectedDistrictName={selectedDistrict?.district}
            selectedCrop={selectedCrop}
            selectedDistrictId={selectedDistrictId}
          />
        )}

        {/* Tab 3: Crop Doctor (Disease Diagnosis) */}
        {activeTab === 'disease' && <CropDiseaseDiagnostic language={language} />}

        {/* Tab 4: AI Farmer Demo Video */}
        {activeTab === 'demo' && <FarmerDemoVideo language={language} />}
      </main>

      {/* Clean, Simple Footer */}
      <footer className="border-t border-[#1e2430] bg-[#0c0e12] py-4 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-300">AgriSetu</span>
          </div>
          <span className="text-slate-600">AI Agricultural Platform</span>
        </div>
      </footer>
    </div>
  );
}
