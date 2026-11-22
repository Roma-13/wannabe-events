import React, { useState } from 'react';
import { ArrowRight, Check, Copy, ExternalLink, MapPin, Navigation, Ticket } from 'lucide-react';
import { MAIN_EVENT, VENUE_INFO, VENUE_ZONES } from '../data/events';
import type { VenueZone } from '../types';
import { Gel } from './Gel';
import { VenueMap } from './VenueMap';

interface LocationSectionProps {
  onOpenCheckout: () => void;
  onNotify: (msg: string) => void;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  onOpenCheckout,
  onNotify,
}) => {
  const [mapMode, setMapMode] = useState<'district' | 'floorplan'>('district');
  const [selectedZoneId, setSelectedZoneId] = useState<VenueZone['id']>('stage');
  const [copied, setCopied] = useState(false);

  const selectedZone =
    VENUE_ZONES.find((z) => z.id === selectedZoneId) ?? VENUE_ZONES[0];

  const handleCopyCoords = async () => {
    try {
      await navigator.clipboard.writeText(VENUE_INFO.coordsCopy);
      setCopied(true);
      onNotify(`კოორდინატები დაკოპირდა: ${VENUE_INFO.coordsCopy}`);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      onNotify(`კოორდინატები: ${VENUE_INFO.coordsCopy}`);
    }
  };

  return (
    <section
      id="location"
      className="relative scroll-mt-20 bg-[#130409] text-white border-t border-white/10 py-14 lg:py-20 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[140px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #751435 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-2">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-[1.06] text-white">
              ლოკაცია — <span className="text-poster-yellow">ბარი „წრე“</span>
            </h2>
            <p className="text-sm sm:text-base text-white/70">
              {VENUE_INFO.address} • {VENUE_INFO.district}
            </p>
          </div>

          <div className="inline-flex items-center p-1 rounded-full bg-white/5 border border-white/15 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setMapMode('district')}
              className={`px-4 py-2 rounded-full font-display text-sm leading-snug transition-colors ${
                mapMode === 'district'
                  ? 'bg-poster-yellow text-[#130409]'
                  : 'text-white/75 hover:text-poster-yellow'
              }`}
            >
              მისვლის რუკა
            </button>
            <button
              type="button"
              onClick={() => setMapMode('floorplan')}
              className={`px-4 py-2 rounded-full font-display text-sm leading-snug transition-colors ${
                mapMode === 'floorplan'
                  ? 'bg-poster-yellow text-[#130409]'
                  : 'text-white/75 hover:text-poster-yellow'
              }`}
            >
              სივრცის გეგმა
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Map / Floorplan */}
          <div className="lg:col-span-7 glass-card p-5 sm:p-6 space-y-5">
            {mapMode === 'district' ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/70">
                  <span>{VENUE_INFO.address}</span>
                  <span className="font-mono text-poster-yellow">{VENUE_INFO.coordsText}</span>
                </div>

                <VenueMap />

                <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                  ბარი „წრე“ მდებარეობს მიხეილ წინამძღვრიშვილის 133-ში, მეტრო სადგურის
                  მოედნიდან და თამარ მეფის გამზირიდან რამდენიმე წუთის სავალზე.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/65">
                  <span>დააკლიკე ზონაზე დეტალების სანახავად</span>
                  <span className="font-mono text-poster-yellow">ერთიანი სივრცე • 25 ₾</span>
                </div>

                <svg
                  viewBox="0 0 600 360"
                  className="w-full h-auto select-none"
                  role="img"
                  aria-label="ბარი წრე სივრცის ინტერაქტიული გეგმა"
                >
                  <rect
                    x="8"
                    y="8"
                    width="584"
                    height="344"
                    rx="14"
                    fill="#130409"
                    stroke="rgba(255,255,255,0.14)"
                    strokeWidth="1.5"
                  />

                  <g onClick={() => setSelectedZoneId('stage')} className="cursor-pointer">
                    <rect
                      x="130"
                      y="26"
                      width="340"
                      height="68"
                      rx="10"
                      fill={selectedZoneId === 'stage' ? '#F7C616' : '#5C102B'}
                      stroke="#F7C616"
                      strokeOpacity={selectedZoneId === 'stage' ? '1' : '0.45'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="300"
                      y="58"
                      textAnchor="middle"
                      fill={selectedZoneId === 'stage' ? '#130409' : '#F7C616'}
                      fontSize="16"
                      fontWeight="700"
                      fontFamily="ArchyEDT-Bold, Noto Sans Georgian, sans-serif"
                    >
                      სცენა • Metrono / stringless
                    </text>
                    <text
                      x="300"
                      y="78"
                      textAnchor="middle"
                      fill={selectedZoneId === 'stage' ? '#260914' : '#FFFFFF'}
                      opacity="0.78"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      21:00 – 00:30
                    </text>
                  </g>

                  <g onClick={() => setSelectedZoneId('hall')} className="cursor-pointer">
                    <rect
                      x="130"
                      y="106"
                      width="340"
                      height="168"
                      rx="10"
                      fill={selectedZoneId === 'hall' ? '#F7C616' : '#1E0810'}
                      stroke="#F7C616"
                      strokeOpacity={selectedZoneId === 'hall' ? '1' : '0.3'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="300"
                      y="185"
                      textAnchor="middle"
                      fill={selectedZoneId === 'hall' ? '#130409' : '#FFFFFF'}
                      fontSize="18"
                      fontWeight="700"
                      fontFamily="ArchyEDT-Bold, Noto Sans Georgian, sans-serif"
                    >
                      ბარი „წრე“ — მთავარი დარბაზი
                    </text>
                    <text
                      x="300"
                      y="208"
                      textAnchor="middle"
                      fill={selectedZoneId === 'hall' ? '#260914' : '#F7C616'}
                      opacity="0.85"
                      fontSize="10.5"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      ერთიანი შესვლა • 25 ₾ ონლაინ / 30 ₾ კარზე
                    </text>
                  </g>

                  <g onClick={() => setSelectedZoneId('dj')} className="cursor-pointer">
                    <rect
                      x="26"
                      y="106"
                      width="92"
                      height="168"
                      rx="10"
                      fill={selectedZoneId === 'dj' ? '#F7C616' : '#5C102B'}
                      stroke="#F7C616"
                      strokeOpacity={selectedZoneId === 'dj' ? '1' : '0.45'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="72"
                      y="182"
                      textAnchor="middle"
                      fill={selectedZoneId === 'dj' ? '#130409' : '#F7C616'}
                      fontSize="14"
                      fontWeight="700"
                      fontFamily="ArchyEDT-Bold, Noto Sans Georgian, sans-serif"
                    >
                      DJ Nosse
                    </text>
                    <text
                      x="72"
                      y="202"
                      textAnchor="middle"
                      fill={selectedZoneId === 'dj' ? '#260914' : '#FFFFFF'}
                      opacity="0.8"
                      fontSize="9.5"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      01:00–till end
                    </text>
                  </g>

                  <g onClick={() => setSelectedZoneId('bar')} className="cursor-pointer">
                    <rect
                      x="482"
                      y="106"
                      width="92"
                      height="168"
                      rx="10"
                      fill={selectedZoneId === 'bar' ? '#F7C616' : '#2E0A17'}
                      stroke="#F7C616"
                      strokeOpacity={selectedZoneId === 'bar' ? '1' : '0.35'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="528"
                      y="185"
                      textAnchor="middle"
                      fill={selectedZoneId === 'bar' ? '#130409' : '#FFFFFF'}
                      fontSize="15"
                      fontWeight="700"
                      fontFamily="ArchyEDT-Bold, Noto Sans Georgian, sans-serif"
                    >
                      ბარი
                    </text>
                    <text
                      x="528"
                      y="204"
                      textAnchor="middle"
                      fill={selectedZoneId === 'bar' ? '#260914' : '#F7C616'}
                      opacity="0.8"
                      fontSize="9.5"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      20:00-დან
                    </text>
                  </g>

                  <g onClick={() => setSelectedZoneId('entrance')} className="cursor-pointer">
                    <rect
                      x="130"
                      y="286"
                      width="340"
                      height="48"
                      rx="10"
                      fill={selectedZoneId === 'entrance' ? '#F7C616' : '#1E0810'}
                      stroke="#F7C616"
                      strokeOpacity={selectedZoneId === 'entrance' ? '1' : '0.35'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="300"
                      y="315"
                      textAnchor="middle"
                      fill={selectedZoneId === 'entrance' ? '#130409' : '#F7C616'}
                      fontSize="13.5"
                      fontWeight="700"
                      fontFamily="ArchyEDT-Bold, Noto Sans Georgian, sans-serif"
                    >
                      შესასვლელი • კარი 20:00 (25 ₾ / კარზე 30 ₾)
                    </text>
                  </g>
                </svg>

                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-poster-yellow">
                      {selectedZone.capacityNote}
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl text-white leading-snug">
                      {selectedZone.name}
                    </h3>
                    <p className="text-sm text-white/75 leading-relaxed max-w-lg">
                      {selectedZone.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenCheckout}
                    className="pill-yellow px-5 py-2.5 text-sm inline-flex items-center gap-2 shrink-0 self-start sm:self-center"
                  >
                    <Ticket className="w-4 h-4 shrink-0" />
                    <span>
                      ბილეთი ({MAIN_EVENT.onlinePrice}
                      <Gel />)
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right Venue Photo Card & Logistics */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl overflow-hidden border border-white/15 bg-[#1B060E] relative aspect-[16/10]">
              <img
                src="/images/venue-hall.jpg"
                alt="ბარი წრე — მიხეილ წინამძღვრიშვილის 133"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#130409] via-[#130409]/30 to-transparent" />
              <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-poster-yellow text-[#130409] font-display text-xs">
                11 დეკემბერი • 20:00
              </span>
              <div className="absolute bottom-3.5 left-4 right-4">
                <h3 className="font-display text-2xl text-white leading-tight">
                  {VENUE_INFO.name}
                </h3>
                <p className="text-xs text-white/80 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-poster-yellow shrink-0" />
                  <span>{VENUE_INFO.address}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleCopyCoords}
                className="flex-1 pill-glass px-4 py-2.5 text-sm inline-flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-poster-yellow" /> : <Copy className="w-4 h-4 text-poster-yellow" />}
                <span>{copied ? 'დაკოპირდა' : 'კოორდინატები'}</span>
              </button>

              <a
                href={VENUE_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 pill-yellow px-4 py-2.5 text-sm inline-flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="glass-card divide-y divide-white/10 px-5">
              {VENUE_INFO.logistics.map((row) => (
                <div
                  key={row.label}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm"
                >
                  <span className="font-display text-poster-yellow leading-snug">
                    {row.label}
                  </span>
                  <span className="text-white/85 sm:text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
