import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Farm } from '../types';
import { Layers, Crosshair } from 'lucide-react';

interface MapLocationPickerProps {
  latitude: number;
  longitude: number;
  accuracy?: number;
  isDraggable?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
  farms?: Farm[];
  onSelectFarm?: (farm: Farm) => void;
  height?: string;
  zoom?: number;
  title?: string;
  showSatelliteByDefault?: boolean;
}

// Custom Leaflet Pin Icons
const createIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 34px;
        height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      ">
        <span style="transform: rotate(45deg); font-size: 15px;">${label}</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
};

const createUserPulseIcon = () => {
  return L.divIcon({
    className: 'custom-user-live-marker',
    html: `
      <div style="position: relative; width: 28px; height: 28px;">
        <div style="position: absolute; inset: 0; background-color: #3b82f6; border-radius: 50%; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 28px; height: 28px; background-color: #1d4ed8; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; items-center; justify-content: center; font-size: 13px; line-height: 22px; text-align: center;">📍</div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  latitude,
  longitude,
  accuracy,
  isDraggable = false,
  onLocationChange,
  farms = [],
  onSelectFarm,
  height = '380px',
  zoom = 13,
  title,
  showSatelliteByDefault = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [mapMode, setMapMode] = useState<'satellite' | 'standard'>('standard');
  const [isLocating, setIsLocating] = useState(false);

  const satelliteTileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
  const standardTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const toggleMode = () => {
    const nextMode = mapMode === 'satellite' ? 'standard' : 'satellite';
    setMapMode(nextMode);
    if (tileLayerRef.current && mapInstanceRef.current) {
      tileLayerRef.current.setUrl(nextMode === 'satellite' ? satelliteTileUrl : standardTileUrl);
    }
  };

  const recenterToUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([latitude, longitude], 15, { duration: 1.2 });
    }
  };

  const handleLocateMe = () => {
    if (!('geolocation' in navigator)) {
      recenterToUser();
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude: lat, longitude: lng } = pos.coords;
        if (onLocationChange) {
          onLocationChange(lat, lng);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
        }
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([lat, lng]);
          userMarkerRef.current.openPopup();
        }
      },
      () => {
        setIsLocating(false);
        recenterToUser();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: zoom,
      scrollWheelZoom: true,
      zoomControl: false,
    });
    mapInstanceRef.current = map;

    // High-Resolution Satellite Tile Layer by Default
    const tileLayer = L.tileLayer(
      mapMode === 'satellite' ? satelliteTileUrl : standardTileUrl,
      {
        maxZoom: 20,
        attribution: mapMode === 'satellite' ? 'Satellite Imagery' : 'OpenStreetMap'
      }
    ).addTo(map);
    tileLayerRef.current = tileLayer;

    // Accuracy Circle
    if (accuracy && accuracy > 0) {
      accuracyCircleRef.current = L.circle([latitude, longitude], {
        radius: Math.min(accuracy, 1000),
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.16,
        weight: 1.5,
      }).addTo(map);
    }

    // Live User Location Marker
    const userIcon = isDraggable
      ? createIcon('#1F6B45', '📍')
      : createUserPulseIcon();

    const marker = L.marker([latitude, longitude], {
      icon: userIcon,
      draggable: isDraggable,
    }).addTo(map);
    userMarkerRef.current = marker;

    const popupHtml = `
      <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
        <strong style="color: #1e3a8a; font-size: 13px;">📍 ${title || 'Your Live Location'}</strong>
        <p style="margin: 3px 0 0; color: #475569; font-size: 11px;">
          GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}${accuracy ? ` (±${Math.round(accuracy)}m)` : ''}
        </p>
      </div>
    `;
    marker.bindPopup(popupHtml);

    if (isDraggable && onLocationChange) {
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onLocationChange(pos.lat, pos.lng);
        if (accuracyCircleRef.current) {
          accuracyCircleRef.current.setLatLng(pos);
        }
      });
    }

    // Add Farm Markers with distances
    if (farms && farms.length > 0) {
      const farmIcon = createIcon('#1F6B45', '🌿');
      farms.forEach((farm) => {
        const fMarker = L.marker([farm.latitude, farm.longitude], { icon: farmIcon }).addTo(map);
        const distText = farm.distance_km !== undefined ? ` • <strong>${farm.distance_km.toFixed(1)} km away</strong>` : '';
        const popupContent = `
          <div style="font-family: sans-serif; font-size: 12px; min-width: 180px; padding: 2px;">
            <div style="color: #1F6B45; font-size: 13px; font-weight: 800;">${farm.farm_name}</div>
            <div style="margin: 4px 0; color: #475569; font-size: 11px;">📍 ${farm.village || farm.region || 'Pollachi'}${distText}</div>
            <div style="color: #166534; font-size: 11px; font-weight: bold; background: #eaf3e7; padding: 3px 6px; border-radius: 6px; display: inline-block;">
              🌾 ${farm.products_count || 12} Fresh Produce Listed
            </div>
          </div>
        `;
        fMarker.bindPopup(popupContent);
        if (onSelectFarm) {
          fMarker.on('click', () => onSelectFarm(farm));
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, zoom]);

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl border border-white/20 bg-slate-900" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Controls Floating Toolbar */}
      <div className="absolute top-4 right-4 z-[400] flex items-center gap-2">
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="px-3 py-1.5 rounded-full bg-[#245C3A] hover:bg-[#1B4B2E] text-white text-xs font-bold backdrop-blur-md border border-emerald-400/40 shadow-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          title="Detect and center my live location"
        >
          <span>📍</span>
          <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
        </button>

        <button
          type="button"
          onClick={toggleMode}
          className="px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <Layers className="w-3.5 h-3.5 text-[#75A85A]" />
          <span>{mapMode === 'satellite' ? '🛰️ Satellite View' : '🗺️ Standard View'}</span>
        </button>

        <button
          type="button"
          onClick={recenterToUser}
          className="w-8 h-8 rounded-full bg-white/95 hover:bg-white text-[#1F6B45] flex items-center justify-center shadow-lg border border-gray-200 cursor-pointer transition-all"
          title="Recenter to You"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Satellite Info Pill at Bottom Left */}
      <div className="absolute bottom-4 left-4 z-[400] bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-bold text-white border border-white/20 shadow-md flex items-center gap-2 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
        <span>Accurate Live Location Active</span>
      </div>
    </div>
  );
};
