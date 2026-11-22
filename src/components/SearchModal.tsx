import React, { useEffect, useState } from 'react';
import { Clock, Landmark, MapPin, Search, X } from 'lucide-react';
import { BANK_ACCOUNTS, FAQ_ITEMS, LINEUP_SLOTS, MAIN_EVENT } from '../data/events';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingSlots = LINEUP_SLOTS.filter((slot) => {
    if (!q) return true;
    return (
      slot.artist.toLowerCase().includes(q) ||
      slot.role.toLowerCase().includes(q) ||
      slot.timeRange.toLowerCase().includes(q) ||
      slot.description.toLowerCase().includes(q)
    );
  });

  const matchingFaqs = q
    ? FAQ_ITEMS.filter(
        (f) =>
          f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const jumpTo = (sectionId: string) => {
    onClose();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-[#130409]/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="სწრაფი ძებნა"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl glass-card bg-[#1B060E]/95 p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-display text-lg text-poster-yellow">
            <Search className="w-5 h-5" />
            <span>ძებნა საიტზე</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="დახურვა"
            className="w-9 h-9 rounded-full border border-white/15 text-white/80 hover:border-poster-yellow hover:text-poster-yellow flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-poster-yellow/75 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="მაგ: Metrono, stringless, Nosse, წრე, თიბისი..."
            className="w-full pl-11 pr-4 py-3 rounded-full bg-[#130409] border border-white/20 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-poster-yellow"
          />
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {matchingSlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => jumpTo('events')}
              className="w-full text-left p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-poster-yellow/50 hover:bg-burgundy-700/40 flex items-center justify-between gap-4 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-poster-yellow font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{slot.timeRange}</span>
                </div>
                <div className="font-display text-lg text-white leading-snug mt-0.5">
                  {slot.artist} • {slot.role}
                </div>
                <div className="text-xs text-white/65 truncate">
                  {slot.description}
                </div>
              </div>
            </button>
          ))}

          {(!q || 'ბარი წრე წინამძღვრიშვილის 133'.includes(q)) && (
            <button
              type="button"
              onClick={() => jumpTo('location')}
              className="w-full text-left p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-poster-yellow/50 flex items-center justify-between gap-4 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-poster-yellow font-mono">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>ლოკაცია</span>
                </div>
                <div className="font-display text-lg text-white mt-0.5">
                  {MAIN_EVENT.venueName} — {MAIN_EVENT.address}
                </div>
              </div>
            </button>
          )}

          {(!q ||
            'თიბისი საქართველოს ბანკი tbc bog iban 25 30'.includes(q)) && (
            <button
              type="button"
              onClick={() => jumpTo('tickets')}
              className="w-full text-left p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-poster-yellow/50 flex items-center justify-between gap-4 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-poster-yellow font-mono">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>ბილეთი: 25 ₾ ონლაინ / 30 ₾ კარზე</span>
                </div>
                <div className="text-xs text-white/75 font-mono mt-1">
                  {BANK_ACCOUNTS.map((b) => `${b.shortName}: ${b.iban}`).join(' • ')}
                </div>
              </div>
            </button>
          )}

          {matchingFaqs.map((faq) => (
            <button
              key={faq.id}
              type="button"
              onClick={() => jumpTo('faq')}
              className="w-full text-left p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-poster-yellow/50 transition-colors"
            >
              <div className="text-[11px] font-mono text-poster-yellow">
                კითხვა • {faq.category}
              </div>
              <div className="font-display text-base text-white mt-0.5">
                {faq.question}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
