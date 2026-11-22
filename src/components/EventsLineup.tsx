import React from 'react';
import { ArrowRight, Calendar, MapPin, Ticket } from 'lucide-react';
import { LINEUP_SLOTS, MAIN_EVENT } from '../data/events';
import { Gel } from './Gel';

interface EventsLineupProps {
  onGoToTickets: () => void;
}

export const EventsLineup: React.FC<EventsLineupProps> = ({ onGoToTickets }) => {
  return (
    <section
      id="events"
      className="relative scroll-mt-20 bg-[#16050B] text-white py-14 lg:py-20"
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
        {/* Clean Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-2">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-[1.06] text-white">
              ლაინაფი და{' '}
              <span className="text-poster-yellow">სცენის განრიგი</span>
            </h2>
            <p className="max-w-xl text-sm sm:text-base text-white/65">
              11 დეკემბრის სრული განრიგი ბარ „წრეში“ — კარის გახსნიდან ღამის ბოლო
              ტრეკამდე.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-poster-yellow text-[#130409] font-display text-sm self-start lg:self-auto">
            <Calendar className="w-4 h-4" />
            <span>{MAIN_EVENT.dateLabel} • 20:00</span>
          </div>
        </div>

        {/* 12-Col Equal-Height Glass Spread */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Event Card */}
          <div className="lg:col-span-5 glass-card p-5 sm:p-6 flex flex-col justify-between gap-5">
            <div className="rounded-xl overflow-hidden aspect-[16/10] bg-[#130409] relative">
              <img
                src="/images/live-stage.jpg"
                alt={`${MAIN_EVENT.title} — ლაივი`}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-poster-yellow text-[#130409] font-mono text-xs font-bold">
                {MAIN_EVENT.shortDate}
              </span>
              <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#130409]/70 backdrop-blur-md border border-white/20 text-xs text-white">
                ბარი „წრე“
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-2xl sm:text-3xl text-white leading-tight">
                {MAIN_EVENT.title}
              </h3>
              <p className="text-sm text-white/75 leading-relaxed">
                {MAIN_EVENT.manifesto}
              </p>

              <div className="pt-3 border-t border-white/10 space-y-2 text-xs sm:text-sm text-white/80">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-poster-yellow shrink-0" />
                  <span>{MAIN_EVENT.dayTimeLabel}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-poster-yellow shrink-0" />
                  <span>
                    {MAIN_EVENT.venueName} — {MAIN_EVENT.address}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Ticket className="w-4 h-4 text-poster-yellow shrink-0" />
                  <span>
                    ონლაინ ბილეთი: <strong className="text-poster-yellow">{MAIN_EVENT.onlinePrice}<Gel /></strong>{' '}
                    • კარზე: <strong>{MAIN_EVENT.doorPrice}<Gel /></strong>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onGoToTickets}
              className="pill-yellow w-full py-3.5 px-5 text-base inline-flex items-center justify-center gap-2"
            >
              <span>
                ბილეთის ყიდვა ({MAIN_EVENT.onlinePrice}
                <Gel />)
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Exact Schedule Ledger */}
          <div className="lg:col-span-7 glass-card p-5 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between gap-4 pb-4 border-b border-white/10">
                <span className="font-display text-xl sm:text-2xl text-poster-yellow leading-snug">
                  სცენის განრიგი
                </span>
                <span className="font-mono text-xs text-white/60">
                  11 დეკემბერი, 2026
                </span>
              </div>

              <div className="divide-y divide-white/10">
                {LINEUP_SLOTS.map((slot) => (
                  <div
                    key={slot.id}
                    className="py-5 px-3 -mx-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
                      <img
                        src={slot.image}
                        alt={slot.artist}
                        className="w-12 h-12 rounded-xl object-cover object-top border border-white/15 shrink-0"
                      />
                      <span className="px-3 py-1.5 rounded-full bg-white/5 border border-poster-yellow/40 font-mono text-xs font-bold text-poster-yellow sm:w-[144px] sm:text-center shrink-0">
                        {slot.timeRange}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`font-display text-2xl sm:text-[1.65rem] leading-snug ${
                              slot.isHeadliner || slot.isDj
                                ? 'text-poster-yellow'
                                : 'text-white'
                            }`}
                          >
                            {slot.artist}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-burgundy-600/80 text-white/90 font-display text-[11px] leading-snug">
                            {slot.role}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-white/65 mt-1">
                          {slot.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3-Poster Official Artist Showcase (Native 4:5 Portrait Aspect Ratio) */}
        <div className="mt-10 pt-8 border-t border-white/10 space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-display text-2xl sm:text-3xl text-white leading-snug">
              საღამოს არტისტები — <span className="text-poster-yellow">Metrono • stringless • Nosse</span>
            </h3>
            <span className="font-mono text-xs text-white/60">
              11 დეკემბერი • ბარი „წრე“
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LINEUP_SLOTS.filter((slot) => !slot.isDoors).map((slot) => (
              <article
                key={`poster-${slot.id}`}
                className="rounded-2xl overflow-hidden bg-[#1D070F] border border-white/15 hover:border-poster-yellow/60 transition-colors flex flex-col shadow-xl"
              >
                <div className="aspect-[4/5] w-full overflow-hidden bg-[#130409]">
                  <img
                    src={slot.image}
                    alt={`${slot.artist} — ${slot.role}`}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div className="p-4 sm:p-5 bg-gradient-to-b from-[#240812] to-[#16050B] border-t border-white/10 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full bg-poster-yellow text-[#130409] font-mono text-xs font-bold">
                        {slot.timeRange}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-burgundy-600/85 text-white/90 font-display text-[11px]">
                        {slot.role}
                      </span>
                    </div>
                    <h4 className="font-display text-2xl text-poster-yellow leading-tight pt-1">
                      {slot.artist}
                    </h4>
                    <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                      {slot.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
