import React, { useState } from 'react';
import {
  MapPin,
  Crosshair,
  Search,
  Check,
  X,
  AlertCircle,
  Home,
  Briefcase,
  Building,
  Navigation,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { SavedAddress } from '../types';
import { Language, translations } from '../i18n/translations';
import { MapLocationPicker } from './MapLocationPicker';

export interface LocationState {
  label: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  isApproximate?: boolean;
}

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationState;
  onSelectLocation: (loc: LocationState) => void;
  savedAddresses?: SavedAddress[];
  lang: Language;
}

const POLLACHI_PRESETS = [
  { label: 'Pollachi Central (உழவர் சந்தை)', lat: 10.6609, lng: 77.0048 },
  { label: 'Mahalingapuram (மகாலிங்கபுரம்)', lat: 10.6550, lng: 76.9980 },
  { label: 'Venkatesa Colony (வெங்கடேசா காலனி)', lat: 10.6680, lng: 77.0120 },
  { label: 'Aliyar Foothills (ஆழியார்)', lat: 10.5982, lng: 76.9721 },
  { label: 'Anaimalai (ஆனைமலை)', lat: 10.5810, lng: 76.9320 },
  { label: 'Kottur Road (கோட்டூர்)', lat: 10.5342, lng: 76.9912 },
];

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  savedAddresses = [],
  lang,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'map' | 'saved'>('map');
  const [tempLat, setTempLat] = useState(currentLocation.latitude);
  const [tempLng, setTempLng] = useState(currentLocation.longitude);
  const [tempAccuracy, setTempAccuracy] = useState<number | undefined>(currentLocation.accuracy);
  const [tempLabel, setTempLabel] = useState(currentLocation.label);
  const [detecting, setDetecting] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        setTempLat(lat);
        setTempLng(lng);
        setTempAccuracy(acc);
        setTempLabel(acc < 50 ? 'My Precise GPS Location' : 'My Current Area');
        setDetecting(false);
      },
      (err) => {
        setDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location permission denied. Please pick your location manually on the map.');
        } else if (err.code === err.TIMEOUT) {
          setGpsError('GPS request timed out. Please select your area or move the map marker.');
        } else {
          setGpsError('Could not retrieve GPS location. Please choose a nearby locality.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
    );
  };

  const handleConfirm = () => {
    onSelectLocation({
      label: tempLabel || 'Selected Location',
      latitude: tempLat,
      longitude: tempLng,
      accuracy: tempAccuracy,
      isApproximate: (tempAccuracy ?? 0) > 100,
    });
    onClose();
  };

  const handleSelectPreset = (preset: { label: string; lat: number; lng: number }) => {
    setTempLat(preset.lat);
    setTempLng(preset.lng);
    setTempLabel(preset.label);
    setTempAccuracy(undefined);
  };

  const handleSelectSaved = (addr: SavedAddress) => {
    onSelectLocation({
      label: `${addr.label} (${addr.area})`,
      latitude: addr.latitude,
      longitude: addr.longitude,
      accuracy: 10,
      isApproximate: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#1F6B45] text-white flex items-center justify-center shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {lang === 'en' ? 'Select Delivery Location' : 'டெலிவரி இடத்தை தேர்ந்தெடுக்கவும்'}
              </h3>
              <p className="text-xs text-[#1F6B45] font-semibold">
                {lang === 'en'
                  ? 'For true nearby farm discovery & fresh harvest delivery'
                  : 'அருகிலுள்ள தோட்டங்களை அறிய உண்மையான இருப்பிடத்தை குறிக்கவும்'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 px-6 pt-3 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('map')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'map'
                ? 'border-[#1F6B45] text-[#1F6B45]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>{lang === 'en' ? 'GPS & Map Pin' : 'ஜிபிஎஸ் & வரைபடம்'}</span>
          </button>

          {savedAddresses.length > 0 && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'saved'
                  ? 'border-[#1F6B45] text-[#1F6B45]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>
                {lang === 'en' ? `Saved Addresses (${savedAddresses.length})` : `சேமித்த முகவரிகள்`}
              </span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {activeTab === 'map' && (
            <>
              {/* Quick Action: Browser Geolocation Button */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={detecting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1F6B45] text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-900/10 hover:bg-[#185336] transition-all disabled:opacity-60"
                >
                  <Crosshair className={`w-4 h-4 ${detecting ? 'animate-spin' : ''}`} />
                  <span>
                    {detecting
                      ? (lang === 'en' ? 'Detecting GPS Coordinates...' : 'ஜிபிஎஸ் பெறுகிறது...')
                      : (lang === 'en' ? 'Use My Current Location' : 'எனது தற்போதைய இடத்தை அறி')}
                  </span>
                </button>
              </div>

              {/* Error Alert */}
              {gpsError && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>{gpsError}</p>
                </div>
              )}

              {/* Accuracy Notice */}
              {tempAccuracy !== undefined && tempAccuracy > 100 && (
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
                  <Navigation className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">GPS Accuracy: ±{tempAccuracy} meters</p>
                    <p className="text-[11px] text-blue-700">
                      {lang === 'en'
                        ? 'Drag the map marker to pinpoint your exact farm gate or delivery door.'
                        : 'உங்கள் வீட்டு வாசலை துல்லியமாக குறிக்க வரைபட முள்ளினை நகர்த்தவும்.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Regional Locality Presets */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {lang === 'en' ? 'Quick Pollachi Localities:' : 'பொள்ளாச்சி முக்கிய பகுதிகள்:'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {POLLACHI_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        tempLat === preset.lat && tempLng === preset.lng
                          ? 'bg-[#1F6B45] text-white border-[#1F6B45] font-bold shadow-xs'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Leaflet Map */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700">
                    {lang === 'en' ? 'Refine on Map (Draggable Marker)' : 'வரைபடத்தில் துல்லியமாக குறிக்கவும்:'}
                  </span>
                  <span className="text-[11px] font-mono text-gray-500">
                    {tempLat.toFixed(4)}, {tempLng.toFixed(4)}
                  </span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
                  <MapLocationPicker
                    latitude={tempLat}
                    longitude={tempLng}
                    accuracy={tempAccuracy}
                    isDraggable={true}
                    onLocationChange={(newLat, newLng) => {
                      setTempLat(newLat);
                      setTempLng(newLng);
                      setTempLabel('Custom Map Pinpoint');
                    }}
                    height="260px"
                    zoom={13}
                  />
                </div>
              </div>

              {/* Active Location Label Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'en' ? 'Location Label / Name' : 'இடத்தின் பெயர் / முகவரி குறிப்பு'}
                </label>
                <input
                  type="text"
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  placeholder="e.g. Venkatesa Colony, Pollachi"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1F6B45] focus:outline-hidden"
                />
              </div>
            </>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                {lang === 'en'
                  ? 'Select one of your saved delivery addresses:'
                  : 'உங்கள் சேமிக்கப்பட்ட முகவரிகளில் ஒன்றை தேர்வு செய்யவும்:'}
              </p>
              <div className="space-y-2">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectSaved(addr)}
                    className="p-4 rounded-2xl border border-gray-200 hover:border-[#1F6B45] hover:bg-emerald-50/30 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#1F6B45] flex items-center justify-center shrink-0">
                        {addr.label.toLowerCase().includes('home') ? (
                          <Home className="w-4 h-4" />
                        ) : addr.label.toLowerCase().includes('work') ? (
                          <Briefcase className="w-4 h-4" />
                        ) : (
                          <Building className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">{addr.label}</span>
                          {addr.is_default && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-[#1F6B45] px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{addr.address_line}</p>
                        <p className="text-[11px] text-gray-500">
                          {addr.area} • PIN: {addr.pincode}
                        </p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-gray-300 group-hover:text-[#1F6B45] transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-[#1F6B45] text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 hover:bg-[#185336] transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{lang === 'en' ? 'Set Active Location' : 'இடத்தை உறுதி செய்'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
