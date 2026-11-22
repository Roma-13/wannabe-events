import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, ExternalLink, MapPin } from 'lucide-react';
import { VENUE_INFO } from '../data/events';

export const VenueMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      center: [VENUE_INFO.lat, VENUE_INFO.lng],
      zoom: 17,
      scrollWheelZoom: false,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: '',
      iconSize: [180, 56],
      iconAnchor: [90, 52],
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;pointer-events:auto;">
          <div style="background:#5C102B;color:#F7C616;border:2px solid #F7C616;border-radius:9999px;padding:4px 12px;font-family:'Noto Sans Georgian',sans-serif;font-weight:700;font-size:12px;line-height:1.25;white-space:nowrap;box-shadow:0 8px 20px rgba(0,0,0,0.45);">
            Bar TSRE • ბარი „წრე“
          </div>
          <div style="width:14px;height:14px;border-radius:9999px;background:#F7C616;border:3px solid #130409;margin-top:4px;box-shadow:0 3px 10px rgba(0,0,0,0.5);"></div>
        </div>
      `,
    });

    const marker = L.marker([VENUE_INFO.lat, VENUE_INFO.lng], {
      icon: pinIcon,
    }).addTo(map);

    marker.bindPopup(
      `<div style="font-family:'Noto Sans Georgian',sans-serif;color:#130409;font-size:12px;line-height:1.4;">
        <strong>Bar TSRE. ბარი „წრე“</strong><br/>
        მიხეილ წინამძღვრიშვილის 133, თბილისი
      </div>`
    );

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleRecenter = () => {
    mapRef.current?.setView([VENUE_INFO.lat, VENUE_INFO.lng], 17, {
      animate: true,
    });
  };

  return (
    <div className="relative isolate z-0 rounded-xl overflow-hidden border border-white/15 bg-[#1B060E] h-[360px] sm:h-[400px]">
      <div
        ref={containerRef}
        className="w-full h-full"
        aria-label="ბარი წრე — ინტერაქტიული რუკა (მიხეილ წინამძღვრიშვილის 133)"
      />

      {/* Top-Right Place Overlay Card */}
      <div className="absolute top-3 right-3 z-[500] max-w-[235px] rounded-xl bg-[#16050B]/95 backdrop-blur-md border border-poster-yellow/40 p-3 shadow-xl text-white">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-poster-yellow shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="font-display text-sm text-poster-yellow leading-tight">
              Bar TSRE. ბარი „წრე“
            </div>
            <div className="text-[11px] text-white/80 leading-snug mt-0.5">
              მიხეილ წინამძღვრიშვილის 133
            </div>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleRecenter}
            className="text-[11px] font-medium text-white/80 hover:text-poster-yellow inline-flex items-center gap-1 transition-colors"
          >
            <Crosshair className="w-3 h-3" />
            <span>ცენტრი</span>
          </button>

          <a
            href={VENUE_INFO.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-display text-poster-yellow hover:underline inline-flex items-center gap-1"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
