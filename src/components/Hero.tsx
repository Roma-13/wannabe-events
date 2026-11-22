import React, { useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Clock,
  Heart,
  Instagram,
  MapPin,
  Music2,
  Send,
  Ticket,
  Volume2,
  Youtube,
} from 'lucide-react';
import { HERO_CAROUSEL_SLIDES, LINEUP_SLOTS, MAIN_EVENT } from '../data/events';
import { Gel } from './Gel';

interface HeroProps {
  favorites: string[];
  onToggleFavorite: (slotId: string) => void;
  onBuyTicket: () => void;
  onSelectSlotAndScroll: () => void;
  onExploreLineup: () => void;
  onNotify: (msg: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  favorites,
  onToggleFavorite,
  onBuyTicket,
  onSelectSlotAndScroll,
  onExploreLineup,
  onNotify,
}) => {
  const [slideIdx, setSlideIdx] = useState(0);
  const activeSlide = HERO_CAROUSEL_SLIDES[slideIdx] ?? HERO_CAROUSEL_SLIDES[0];

  const stats = [
    { icon: Calendar, value: '11 დეკემბერი', label: 'კარის გახსნა 20:00' },
    {
      icon: Ticket,
      value: (
        <>
          25
          <Gel /> / 30
          <Gel />
        </>
      ),
      label: 'ონლაინ / კარზე',
    },
    { icon: Music2, value: '2 ბენდი + DJ', label: 'Metrono • stringless • Nosse' },
    { icon: MapPin, value: 'ბარი „წრე“', label: 'წინამძღვრიშვილის 133' },
  ];

  return (
    <section
      id="top"
      className="relative min-h-[calc(100svh-76px)] bg-[#130409] text-white flex flex-col justify-between overflow-hidden"
    >
      {/* Atmospheric Concert Crowd Backdrop + Deep Burgundy Stage Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/images/hero-concert.jpg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center opacity-25 saturate-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#130409]/85 via-[#1A050D]/75 to-[#130409]" />
        <div
          className="absolute -top-24 left-1/3 w-[680px] h-[440px] rounded-full opacity-30 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #751435 0%, transparent 70%)' }}
        />
      </div>

      {/* Balanced Centered Content Container */}
      <div className="relative z-10 max-w-[1280px] w-full mx-auto px-5 sm:px-8 flex-1 flex flex-col justify-center py-6 lg:py-8">
        {/* Top Split Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left Copy & Yellow Brush Underline */}
          <div className="lg:col-span-6 space-y-4">
            <div className="font-mono text-xs tracking-[0.22em] text-white/60 uppercase">
              11.12.2026 // 20:00 // TSINAMDZGVRISHVILI 133
            </div>

            <div>
              <h1 className="font-display text-[2.5rem] sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] leading-[1.04] tracking-tight text-white">
                ხმაური, რომელიც
                <span className="block text-poster-yellow mt-0.5">
                  ქალაქს აღვიძებს.
                </span>
              </h1>

              {/* Hand-brushed Yellow Stroke SVG */}
              <svg
                viewBox="0 0 320 18"
                className="w-56 sm:w-72 h-3 text-poster-yellow mt-2"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 12C65 4 195 2 315 11"
                  stroke="currentColor"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <path
                  d="M28 15C110 10 220 9 292 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeOpacity="0.6"
                />
              </svg>
            </div>

            <p className="max-w-lg text-sm sm:text-[15px] text-white/80 leading-relaxed font-body">
              <strong className="text-poster-yellow font-semibold">Wannabe Events</strong>{' '}
              — 11 დეკემბერს, 20:00-ზე ბარ „წრეში“ (მ. წინამძღვრიშვილის 133):{' '}
              <strong className="text-white">Metrono</strong>,{' '}
              <strong className="text-white">stringless</strong> და დიჯეი{' '}
              <strong className="text-white">Nosse</strong>. ონლაინ ბილეთი —{' '}
              <span className="text-poster-yellow font-semibold">25 ₾</span>, კარზე —{' '}
              <span className="text-white font-semibold">30 ₾</span>.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onBuyTicket}
                className="pill-yellow px-6 py-3 text-sm sm:text-[15px] inline-flex items-center gap-2.5 shadow-lg shadow-poster-yellow/10"
              >
                <Ticket className="w-4 h-4 shrink-0" />
                <span>
                  ბილეთის ყიდვა — {MAIN_EVENT.onlinePrice}
                  <Gel />
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <button
                type="button"
                onClick={onExploreLineup}
                className="pill-glass px-6 py-3 text-sm sm:text-[15px] inline-flex items-center gap-2.5"
              >
                <span>ნახე ლაინაფი</span>
                <ArrowRight className="w-4 h-4 text-poster-yellow shrink-0" />
              </button>
            </div>
          </div>

          {/* Right Featured Carousel Card */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-white/15 bg-[#1B060E] relative aspect-[16/9] shadow-2xl group">
              <img
                src={activeSlide.image}
                alt={activeSlide.title}
                className="w-full h-full object-cover object-[50%_24%] transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#130409] via-[#130409]/35 to-transparent" />

              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-poster-yellow text-[#130409] font-mono text-xs font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{activeSlide.badge}</span>
                </span>

                <span className="px-3 py-1 rounded-full bg-[#130409]/70 backdrop-blur-md border border-white/25 font-mono text-[11px] text-white uppercase tracking-wider">
                  {activeSlide.tag}
                </span>
              </div>

              <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 right-4 sm:right-5 flex items-end justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="font-mono text-[11px] text-poster-yellow uppercase tracking-wider">
                    {activeSlide.eyebrow}
                  </div>
                  <div className="font-display text-2xl sm:text-3xl text-white leading-tight truncate">
                    {activeSlide.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/75">
                    <MapPin className="w-3.5 h-3.5 text-poster-yellow shrink-0" />
                    <span>{activeSlide.meta}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onBuyTicket}
                  aria-label="ბილეთის ყიდვა — 25 ლარი"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-poster-yellow/75 bg-[#130409]/65 text-poster-yellow hover:bg-poster-yellow hover:text-[#130409] flex items-center justify-center transition-colors shrink-0"
                >
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* 3 Carousel Dots */}
            <div className="flex items-center justify-center gap-2 mt-2.5">
              {HERO_CAROUSEL_SLIDES.map((s, idx) => {
                const active = idx === slideIdx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSlideIdx(idx)}
                    aria-label={`სლაიდი ${idx + 1}: ${s.title}`}
                    className={`rounded-full transition-all ${
                      active
                        ? 'w-2.5 h-2.5 bg-poster-yellow'
                        : 'w-2 h-2 bg-white/25 hover:bg-white/50'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Full-Width Glass Metrics Strip */}
        <div className="glass-card mt-5 lg:mt-6 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          {stats.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={st.label}
                className={`py-3.5 px-4 sm:px-5 flex items-center justify-center gap-3 ${
                  idx < 2 ? 'border-white/10' : ''
                }`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-poster-yellow shrink-0" />
                <div className="min-w-0">
                  <div className="font-display text-lg sm:text-xl text-white leading-tight truncate">
                    {st.value}
                  </div>
                  <div className="text-xs text-white/60 truncate">{st.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4-Card Lineup Grid */}
        <div className="mt-5 lg:mt-6 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl sm:text-2xl text-white leading-snug">
              ღამის ლაინაფი • 11 დეკემბერი
            </h2>
            <a
              href="#events"
              onClick={(e) => {
                e.preventDefault();
                onExploreLineup();
              }}
              className="inline-flex items-center gap-1.5 font-display text-sm text-poster-yellow hover:text-poster-yellow-bright transition-colors whitespace-nowrap"
            >
              <span>სრული განრიგი</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {LINEUP_SLOTS.map((slot) => {
              const isFav = favorites.includes(slot.id);

              return (
                <article
                  key={slot.id}
                  className="rounded-2xl overflow-hidden border border-white/15 bg-[#1B060E] relative aspect-[16/9.5] group cursor-pointer hover:-translate-y-0.5 hover:border-poster-yellow/55 transition-all duration-200"
                  onClick={onSelectSlotAndScroll}
                >
                  <img
                    src={slot.image}
                    alt={`${slot.artist} — ${slot.timeRange}`}
                    className="w-full h-full object-cover object-[50%_24%] transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#130409] via-[#130409]/35 to-transparent" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-poster-yellow text-[#130409] font-mono text-[11px] font-bold">
                      <Clock className="w-3 h-3" />
                      <span>{slot.timeRange}</span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(slot.id);
                      }}
                      aria-label={isFav ? `${slot.artist} რჩეულებიდან წაშლა` : `${slot.artist} რჩეულებში დამატება`}
                      className={`w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-colors ${
                        isFav
                          ? 'bg-poster-yellow border-poster-yellow text-[#130409]'
                          : 'bg-[#130409]/55 border-white/25 text-white hover:border-poster-yellow hover:text-poster-yellow'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg text-white leading-snug group-hover:text-poster-yellow transition-colors">
                        {slot.artist}
                      </h3>
                      <div className="text-[11px] text-white/70 truncate">
                        {slot.role}
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-poster-yellow">
                      {slot.isDoors ? 'OPEN' : slot.isDj ? 'DJ SET' : 'LIVE'}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {/* Flush Edge-to-Edge Yellow Bottom Section Divider Bar */}
      <div className="relative z-10 mt-auto w-full bg-poster-yellow text-[#130409] border-t border-b border-black/20">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Volume2 className="w-4 h-4 shrink-0" />

            {/* Crisp Non-Clipping Static Line on Wide Desktop (xl+) */}
            <div className="hidden xl:flex items-center justify-between gap-5 font-display text-[13px] leading-snug w-full min-w-0">
              <span className="truncate">
                11 დეკემბერი, 20:00 — ბარი „წრე“ (წინამძღვრიშვილის 133)
              </span>
              <span className="opacity-45 font-mono shrink-0">///</span>
              <span className="truncate">
                Metrono • stringless • DJ Nosse (till end)
              </span>
              <span className="opacity-45 font-mono shrink-0">///</span>
              <span className="shrink-0">
                ბილეთი: 25
                <Gel /> ონლაინ • 30
                <Gel /> კარზე
              </span>
            </div>

            {/* Soft Edge-Faded Marquee on Smaller Screens */}
            <div className="xl:hidden overflow-hidden flex-1 [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)]">
              <div className="animate-marquee whitespace-nowrap">
                {[0, 1].map((dup) => (
                  <div
                    key={dup}
                    className="flex items-center gap-5 pr-5 font-display text-xs sm:text-sm leading-snug"
                  >
                    <span>11 დეკემბერი, 20:00 — ბარი „წრე“ (წინამძღვრიშვილის 133)</span>
                    <span className="opacity-45 font-mono">///</span>
                    <span>Metrono • stringless • DJ Nosse (01:00–till end)</span>
                    <span className="opacity-45 font-mono">///</span>
                    <span>
                      ბილეთი: 25
                      <Gel /> ონლაინ • 30
                      <Gel /> კარზე
                    </span>
                    <span className="opacity-45 font-mono">///</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-[#130409]/25 shrink-0">
            {[
              { icon: Youtube, label: 'YouTube' },
              { icon: Instagram, label: 'Instagram' },
              { icon: Music2, label: 'TikTok' },
              { icon: Send, label: 'Telegram' },
            ].map((soc) => {
              const Icon = soc.icon;
              return (
                <button
                  key={soc.label}
                  type="button"
                  onClick={() => onNotify(`${soc.label} — @wannabe.events`)}
                  aria-label={soc.label}
                  className="p-1 hover:opacity-70 transition-opacity"
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
