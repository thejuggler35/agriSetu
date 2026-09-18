import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Search,
  Crosshair,
  Layers,
  Check,
  X,
  Loader2,
  AlertCircle,
  Navigation,
} from 'lucide-react';
import { Language } from '../types';

interface LocationMapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLon?: number;
  onConfirmLocation: (location: {
    lat: number;
    lon: number;
    district: string;
    state: string;
    displayName: string;
  }) => void;
  language: Language;
}

export const LocationMapPicker: React.FC<LocationMapPickerProps> = ({
  isOpen,
  onClose,
  initialLat,
  initialLon,
  onConfirmLocation,
  language,
}) => {
  const isHi = language === 'hi';

  const defaultCenterLat = initialLat && !isNaN(initialLat) ? initialLat : 22.9734;
  const defaultCenterLon = initialLon && !isNaN(initialLon) ? initialLon : 78.6569;
  const defaultZoom = initialLat && initialLon ? 12 : 5;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const streetLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number }>({
    lat: defaultCenterLat,
    lon: defaultCenterLon,
  });
  const [locationDetails, setLocationDetails] = useState<{
    district: string;
    state: string;
    displayName: string;
  }>({
    district: '',
    state: '',
    displayName: '',
  });

  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite'>('streets');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{ lat: number; lon: number; displayName: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Reverse geocode selected coordinates
  const resolveLocation = async (lat: number, lon: number) => {
    setIsResolvingLocation(true);
    try {
      const resp = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
      if (resp.ok) {
        const data = await resp.json();
        setLocationDetails({
          district: data.district || '',
          state: data.state || '',
          displayName: data.displayName || `${data.district}, ${data.state}`,
        });
      }
    } catch (err) {
      console.warn('Failed to reverse geocode:', err);
    } finally {
      setIsResolvingLocation(false);
    }
  };

  // Custom emerald pin icon
  const createCustomIcon = () => {
    return L.divIcon({
      className: 'agrisetu-map-pin',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; background: rgba(16, 185, 129, 0.25); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 28px; height: 28px; background: #059669; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 28],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [defaultCenterLat, defaultCenterLon],
        zoom: defaultZoom,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap street layer
      const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      });

      // Esri World Imagery satellite layer
      const satellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
          maxZoom: 18,
        }
      );

      streets.addTo(map);
      streetLayerRef.current = streets;
      satelliteLayerRef.current = satellite;

      // Marker setup
      const marker = L.marker([defaultCenterLat, defaultCenterLon], {
        icon: createCustomIcon(),
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const latlng = marker.getLatLng();
        setSelectedCoords({ lat: latlng.lat, lon: latlng.lng });
        resolveLocation(latlng.lat, latlng.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        setSelectedCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
        resolveLocation(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Initial reverse geocode
      resolveLocation(defaultCenterLat, defaultCenterLon);
    }

    // Force map resize recalculation
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  }, [isOpen]);

  // Toggle map layer (Streets vs Satellite)
  const handleLayerToggle = (layer: 'streets' | 'satellite') => {
    if (!mapInstanceRef.current) return;
    setMapLayer(layer);

    if (layer === 'satellite') {
      streetLayerRef.current?.remove();
      satelliteLayerRef.current?.addTo(mapInstanceRef.current);
    } else {
      satelliteLayerRef.current?.remove();
      streetLayerRef.current?.addTo(mapInstanceRef.current);
    }
  };

  // Search places
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const resp = await fetch(`/api/search-location?q=${encodeURIComponent(searchQuery.trim())}`);
      if (resp.ok) {
        const data = await resp.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.warn('Location search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: { lat: number; lon: number; displayName: string }) => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    mapInstanceRef.current.flyTo([result.lat, result.lon], 13, { duration: 1.2 });
    markerRef.current.setLatLng([result.lat, result.lon]);
    setSelectedCoords({ lat: result.lat, lon: result.lon });
    setSearchResults([]);
    setSearchQuery('');
    resolveLocation(result.lat, result.lon);
  };

  // GPS Locate inside map
  const handleLocateMe = () => {
    setIsLocatingGPS(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError(isHi ? 'ब्राउज़र में GPS समर्थित नहीं है' : 'GPS not supported by browser');
      setIsLocatingGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 14, { duration: 1.2 });
          markerRef.current.setLatLng([latitude, longitude]);
          setSelectedCoords({ lat: latitude, lon: longitude });
          resolveLocation(latitude, longitude);
        }
        setIsLocatingGPS(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setGpsError(
          error.code === 1
            ? isHi
              ? 'स्थान अनुमति अस्वीकृत की गई। आप मानचित्र पर क्लिक कर सकते हैं।'
              : 'Location permission denied. You can click on the map directly.'
            : isHi
            ? 'सटीक स्थान प्राप्त नहीं हो सका। मानचित्र पर पिन रखें।'
            : 'Could not acquire precise location. Please click on map.'
        );
        setIsLocatingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleConfirm = () => {
    onConfirmLocation({
      lat: Number(selectedCoords.lat.toFixed(4)),
      lon: Number(selectedCoords.lon.toFixed(4)),
      district: locationDetails.district || 'Local Farm Area',
      state: locationDetails.state || 'India',
      displayName: locationDetails.displayName || `${selectedCoords.lat.toFixed(2)}°N, ${selectedCoords.lon.toFixed(2)}°E`,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#12161f] border border-[#232a39] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-[#1e2533] flex items-center justify-between bg-[#151923]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-100">
                {isHi ? 'मानचित्र पर अपने खेत का स्थान चुनें' : 'Pinpoint Your Farm on Map'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isHi
                  ? 'मानचित्र पर क्लिक करें या पिन को अपने खेत पर खींचें'
                  : 'Click anywhere or drag the pin to set your exact farm location'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1f2533] rounded-lg transition-colors cursor-pointer"
            aria-label="Close map"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Layer Controls */}
        <div className="p-3 bg-[#161a24] border-b border-[#1f2533] flex flex-col sm:flex-row gap-2 items-center justify-between">
          <form onSubmit={handleSearch} className="relative w-full sm:max-w-md">
            <input
              type="text"
              placeholder={
                isHi
                  ? 'जिला, तहसील, गाँव या पिनकोड खोजें...'
                  : 'Search village, district, tehsil or pincode...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1b202c] border border-[#293243] text-slate-100 text-xs rounded-xl pl-8 pr-16 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
            >
              {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : isHi ? 'खोजें' : 'Search'}
            </button>

            {/* Search Suggestions Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1.5 bg-[#171b26] border border-[#2a3344] rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                {searchResults.map((res, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-[#202636] border-b border-[#212837] last:border-0 flex items-start gap-2 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="truncate">{res.displayName}</span>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Quick Actions: Locate Me & Satellite Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocatingGPS}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1b202c] hover:bg-[#222838] border border-[#2a3344] text-slate-200 rounded-xl text-xs font-medium cursor-pointer transition-colors"
            >
              {isLocatingGPS ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              ) : (
                <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>{isHi ? 'मेरा GPS' : 'My GPS'}</span>
            </button>

            <div className="inline-flex rounded-xl bg-[#1b202c] border border-[#2a3344] p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => handleLayerToggle('streets')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  mapLayer === 'streets'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isHi ? 'मानक' : 'Map'}
              </button>
              <button
                type="button"
                onClick={() => handleLayerToggle('satellite')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  mapLayer === 'satellite'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isHi ? 'सैटेलाइट' : 'Satellite'}
              </button>
            </div>
          </div>
        </div>

        {/* GPS Error notice */}
        {gpsError && (
          <div className="px-4 py-2 bg-amber-950/40 border-b border-amber-900/40 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>{gpsError}</span>
          </div>
        )}

        {/* Map Stage Container */}
        <div className="relative flex-1 min-h-[340px] sm:min-h-[420px] w-full bg-[#0e1117]">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Quick guidance floating pill */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none bg-[#121620]/90 backdrop-blur-xs border border-[#232a39] px-3 py-1.5 rounded-xl text-[11px] text-slate-300 shadow-lg flex items-center gap-1.5">
            <Navigation className="w-3 h-3 text-emerald-400" />
            <span>
              {isHi ? 'खेत चुनने के लिए कहीं भी टैप करें' : 'Tap anywhere to drop farm pin'}
            </span>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-3 sm:p-4 bg-[#141822] border-t border-[#1e2533] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex items-center gap-2.5 text-xs text-slate-300">
            <div className="p-1.5 bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 rounded-lg shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100 truncate max-w-[280px] sm:max-w-md">
                  {locationDetails.district || 'Selected Location'}
                  {locationDetails.state ? `, ${locationDetails.state}` : ''}
                </span>
                {isResolvingLocation && (
                  <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                )}
              </div>
              <p className="text-[11px] font-mono text-emerald-400/90">
                {selectedCoords.lat.toFixed(4)}° N, {selectedCoords.lon.toFixed(4)}° E
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-[#1b202c] hover:bg-[#232938] text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="button"
              id="btn-confirm-map-location"
              onClick={handleConfirm}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isHi ? 'यह स्थान चुनें' : 'Confirm Location'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
