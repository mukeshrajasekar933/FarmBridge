import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Circle } from '@react-google-maps/api';
import { Crosshair, Layers } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DeliveryMapPickerProps {
  latitude: number;
  longitude: number;
  gpsLocation?: { latitude: number; longitude: number; accuracy: number } | null;
  onLocationChange: (lat: number, lng: number) => void;
  onRecenter?: () => void;
  height?: string;
  zoom?: number;
}

export const MAPS_LIBRARIES: "places"[] = ['places'];
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const DeliveryMapPicker: React.FC<DeliveryMapPickerProps> = ({
  latitude,
  longitude,
  gpsLocation,
  onLocationChange,
  onRecenter,
  height = '100%',
  zoom = 16,
}) => {
  const [center, setCenter] = useState({ lat: latitude, lng: longitude });
  const [mapType, setMapType] = useState<'satellite' | 'street'>('street');

  // Google Maps Loader (Only activated when API_KEY is provided)
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY,
    libraries: MAPS_LIBRARIES,
    region: 'IN'
  });

  const gMapRef = useRef<google.maps.Map | null>(null);
  const leafletContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (Math.abs(center.lat - latitude) > 0.0001 || Math.abs(center.lng - longitude) > 0.0001) {
      setCenter({ lat: latitude, lng: longitude });
      if (API_KEY && gMapRef.current) {
        gMapRef.current.panTo({ lat: latitude, lng: longitude });
      }
      if (leafletMapRef.current) {
        leafletMapRef.current.panTo([latitude, longitude]);
      }
    }
  }, [latitude, longitude]);

  // Leaflet Satellite fallback when API_KEY is not configured
  useEffect(() => {
    if (API_KEY && isLoaded) return;
    if (!leafletContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const map = L.map(leafletContainerRef.current, {
      center: [latitude, longitude],
      zoom: zoom,
      zoomControl: false,
    });
    leafletMapRef.current = map;

    // High resolution Satellite Hybrid Tile Layer
    const tileUrl = mapType === 'satellite'
      ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 20,
      attribution: mapType === 'satellite' ? 'Satellite Imagery' : 'OpenStreetMap'
    }).addTo(map);

    // Accuracy Circle
    if (gpsLocation && gpsLocation.accuracy > 0) {
      accuracyCircleRef.current = L.circle([gpsLocation.latitude, gpsLocation.longitude], {
        radius: gpsLocation.accuracy,
        color: '#1F6B45',
        fillColor: '#3C9B62',
        fillOpacity: 0.15,
        weight: 1.5,
      }).addTo(map);
    }

    map.on('move', () => {
      const c = map.getCenter();
      setCenter({ lat: c.lat, lng: c.lng });
    });

    map.on('moveend', () => {
      const c = map.getCenter();
      onLocationChange(c.lat, c.lng);
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [API_KEY, isLoaded, mapType]);

  const onGMapLoad = useCallback((map: google.maps.Map) => {
    gMapRef.current = map;
  }, []);

  const onGMapUnmount = useCallback(() => {
    gMapRef.current = null;
  }, []);

  const handleGMapCenterChanged = () => {
    if (!gMapRef.current) return;
    const newCenter = gMapRef.current.getCenter();
    if (newCenter) {
      const lat = newCenter.lat();
      const lng = newCenter.lng();
      if (lat !== center.lat || lng !== center.lng) {
        setCenter({ lat, lng });
      }
    }
  };

  const handleGMapDragEnd = () => {
    if (!gMapRef.current) return;
    const newCenter = gMapRef.current.getCenter();
    if (newCenter) {
      onLocationChange(newCenter.lat(), newCenter.lng());
    }
  };

  const toggleLayer = () => {
    setMapType(prev => prev === 'satellite' ? 'street' : 'satellite');
  };

  const containerStyle = {
    width: '100%',
    height: height,
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-inner h-full w-full bg-slate-900">
      {/* If Google Maps API Key is valid and loaded, render Google Maps in Satellite/Hybrid view */}
      {API_KEY && isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={zoom}
          mapTypeId={mapType === 'satellite' ? 'hybrid' : 'roadmap'}
          onLoad={onGMapLoad}
          onUnmount={onGMapUnmount}
          onDragEnd={handleGMapDragEnd}
          onCenterChanged={handleGMapCenterChanged}
          options={{
            disableDefaultUI: true,
            zoomControl: false,
            gestureHandling: 'greedy',
          }}
        >
          {gpsLocation && (
            <Circle
              center={{ lat: gpsLocation.latitude, lng: gpsLocation.longitude }}
              radius={gpsLocation.accuracy}
              options={{
                strokeColor: '#1F6B45',
                strokeOpacity: 0.8,
                strokeWeight: 1.5,
                fillColor: '#1F6B45',
                fillOpacity: 0.18,
              }}
            />
          )}
        </GoogleMap>
      ) : (
        /* Seamless High-Resolution Leaflet Satellite Map without requiring API Key */
        <div ref={leafletContainerRef} className="w-full h-full" style={{ minHeight: '300px' }} />
      )}

      {/* Satellite / Street Layer Toggle Button */}
      <button
        type="button"
        onClick={toggleLayer}
        className="absolute top-4 right-4 z-[400] px-3 py-1.5 bg-black/75 hover:bg-black/90 backdrop-blur-md rounded-xl text-[11px] font-bold text-white shadow-lg transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
        title="Toggle Satellite / Map"
      >
        <Layers className="w-3.5 h-3.5 text-[#75A85A]" />
        <span>{mapType === 'satellite' ? '🛰️ Satellite' : '🗺️ Standard'}</span>
      </button>

      {/* Re-center / Locate Me Button */}
      {onRecenter && (
        <button
          type="button"
          onClick={onRecenter}
          className="absolute bottom-6 right-4 z-[400] px-3.5 py-2.5 bg-[#245C3A] hover:bg-[#1B4B2E] text-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.3)] flex items-center gap-2 font-bold text-xs border border-emerald-400/40 cursor-pointer active:scale-95 transition-all"
          title="Detect and Pin Live GPS Location"
        >
          <span>📍</span>
          <span>Locate Me</span>
        </button>
      )}

      {/* Fixed Center Marker Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[400] pointer-events-none pb-2">
        <div className="relative transform transition-transform animate-bounce-short">
          <div className="w-10 h-10 bg-[#245C3A] text-white rounded-full rounded-br-none -rotate-45 flex items-center justify-center border-[3px] border-white shadow-[0_4px_14px_rgba(0,0,0,0.4)]">
            <div className="w-3 h-3 bg-[#75A85A] rounded-full"></div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/50 rounded-full blur-[2px]"></div>
        </div>
      </div>
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-bold text-white shadow-lg pointer-events-none transition-all flex items-center gap-1.5 border border-white/10">
        <span className="w-2 h-2 rounded-full bg-[#75A85A] animate-pulse"></span>
        <span>Drag map to pin your location</span>
      </div>
    </div>
  );
};
