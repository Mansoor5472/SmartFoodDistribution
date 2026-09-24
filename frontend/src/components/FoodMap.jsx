import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths in Vite/Webpack bundles
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored SVG pin generator
const createPinIcon = (color, label = '', isPulse = false) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        ${isPulse ? `<div style="position: absolute; top: -4px; width: 34px; height: 34px; border-radius: 50%; background: ${color}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50% 50% 50% 0;
          background: ${color};
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 2px solid #ffffff;
        ">
          <span style="transform: rotate(45deg); font-size: 11px; font-weight: 800; color: white;">${label}</span>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
};

export const FoodMap = ({
  center = [28.6139, 77.2090], // Default: Delhi NCR
  zoom = 12,
  items = [], // Array of { id, title, type: 'donation' | 'ngo' | 'beneficiary', latitude, longitude, servings, distance_km, match_score, urgency, address }
  height = '420px',
  onMarkerClick = null
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map once
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
        attributionControl: true
      });

      // Free OpenStreetMap CartoDB Dark Matter / Positron or Standard OSM
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when items or center change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const bounds = [];

    items.forEach((item) => {
      const lat = item.latitude || (item.donation && item.donation.latitude);
      const lon = item.longitude || (item.donation && item.donation.longitude);
      if (!lat || !lon) return;

      bounds.push([lat, lon]);

      // Determine pin color based on item type and urgency
      let color = '#737373'; // Default node
      let label = 'N';
      let isPulse = false;

      const urgency = item.urgency || (item.donation && item.donation.urgency);
      const type = item.type || (item.donation ? 'donation' : 'ngo');

      if (type === 'donation') {
        if (urgency === 'CRITICAL' || urgency === 'HIGH') {
          color = '#FF6B35';
          label = '⚡';
          isPulse = true;
        } else {
          color = '#E8E8E8';
          label = 'D';
        }
      } else if (type === 'beneficiary') {
        color = '#FF6B35';
        label = 'B';
      }

      const marker = L.marker([lat, lon], {
        icon: createPinIcon(color, label, isPulse)
      });

      // Rich popup content
      const title = item.food_name || item.title || (item.donation && item.donation.food_name) || item.ngo_name || 'Location Point';
      const servings = item.servings || item.required_servings || (item.donation && item.donation.servings);
      const distance = item.distance_km !== undefined ? `${item.distance_km} km away` : '';
      const matchScore = item.match_score ? `${item.match_score}% Match` : '';
      const address = item.pickup_address || item.address || (item.donation && item.donation.pickup_address) || '';
      const deadline = item.pickup_deadline || '';

      const popupHtml = `
        <div style="font-family: inherit; font-size: 13px; color: #1e293b; min-width: 190px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <strong style="font-size: 14px; color: #0f172a;">${title}</strong>
            ${matchScore ? `<span style="background: #10b98115; color: #059669; font-weight: 700; font-size: 11px; padding: 2px 6px; border-radius: 4px; border: 1px solid #10b98130;">${matchScore}</span>` : ''}
          </div>
          ${urgency ? `<div style="margin-bottom: 6px;"><span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${color};">${urgency} PRIORITY</span></div>` : ''}
          ${servings ? `<div style="margin-bottom: 3px; font-weight: 600; color: #334155;">🍲 ${servings} Servings Available</div>` : ''}
          ${distance ? `<div style="margin-bottom: 3px; color: #64748b;">📍 ${distance} (Haversine)</div>` : ''}
          ${address ? `<div style="margin-bottom: 4px; color: #64748b; font-size: 11px;">🏢 ${address}</div>` : ''}
          ${deadline ? `<div style="color: #d97706; font-size: 11px; font-weight: 600;">⏱️ ${deadline}</div>` : ''}
        </div>
      `;

      marker.bindPopup(popupHtml);

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(item));
      }

      markersLayer.addLayer(marker);
    });

    // Auto-fit bounds if multiple markers exist
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], zoom);
    }
  }, [items]);

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
      {/* Map Header Legend */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '6px',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '11px',
        fontWeight: 600,
        color: '#f8fafc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
          Donation
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>
          NGO Depot
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
          Critical (&lt;3h)
        </div>
      </div>

      <div ref={mapContainerRef} style={{ width: '100%', height: height }} />
    </div>
  );
};
