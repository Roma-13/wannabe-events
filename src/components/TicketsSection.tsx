import React from 'react';
import { ArrowRight, Check, Copy, Landmark, Minus, Plus, Ticket } from 'lucide-react';
import { BANK_ACCOUNTS, MAIN_EVENT } from '../data/events';
import { Gel } from './Gel';

interface TicketsSectionProps {
  quantity: number;
  onSetQuantity: (qty: number) => void;
  onOpenCheckout: () => void;
  onNotify: (msg: string) => void;
}

export const TicketsSection: React.FC<TicketsSectionProps> = ({
  quantity,
  onSetQuantity,
  onOpenCheckout,
  onNotify,
}) => {
  const effectiveQty = Math.max(1, quantity);
  const totalOnline = effectiveQty * MAIN_EVENT.onlinePrice;

  const handleCopyIban = async (bankName: string, iban: string) => {
    try {
      await navigator.clipboard.writeText(iban);
      onNotify(`${bankName}-ის ანგარიში დაკოპირდა: ${iban}`);
    } catch {
      onNotify(`${bankName}: ${iban}`);
    }
  };

  return (
    <section
      id="tickets"
      className="relative scroll-mt-20 bg-[#130409] text-white border-t border-white/10 py-14 lg:py-20 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute top-1/4 -left-32 w-[520px] h-[520px] rounded-full opacity-20 blur-[130px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #751435 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-2">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-[1.06] text-white">
              ბილეთი — <span className="text-poster-yellow">ერთიანი შესვლა</span>
            </h2>
            <p className="text-sm sm:text-base text-white/65 max-w-xl">
              მოქმედებს მხოლოდ 1 ტიპის ბილეთი მთელ ღამეზე. ონლაინ ყიდვისას იხდი{' '}
              <strong className="text-poster-yellow">25 ₾</strong>-ს, კარზე — 30 ₾-ს.
            </p>
          </div>
          <div className="font-mono text-xs text-poster-yellow">
            {MAIN_EVENT.dateLabel} • 20:00 • {MAIN_EVENT.venueName}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Primary Single Online Ticket Card (25 GEL) */}
          <div className="lg:col-span-7 rounded-2xl bg-gradient-to-br from-[#641230] via-[#3A0A1B] to-[#1B060E] border border-poster-yellow/60 p-6 sm:p-8 shadow-2xl flex flex-col justify-between gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="px-3.5 py-1 rounded-full bg-poster-yellow text-[#130409] font-display text-xs leading-snug">
                ონლაინ ფასი • დაზოგე 5<Gel />
              </span>
              <span className="font-mono text-xs text-white/70">
                კარზე იქნება: {MAIN_EVENT.doorPrice}
                <Gel />
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-white/15">
              <div>
                <h3 className="font-display text-3xl sm:text-4xl text-white leading-tight">
                  ერთიანი ბილეთი (ონლაინ)
                </h3>
                <p className="text-sm text-white/75 mt-1">
                  სრული წვდომა ბარ „წრეში“ — Metrono, stringless და DJ Nosse (till end)
                </p>
              </div>

              <div className="sm:text-right shrink-0">
                <div className="font-display text-5xl text-poster-yellow leading-none">
                  {MAIN_EVENT.onlinePrice}
                  <Gel />
                </div>
                <div className="text-xs text-white/60 mt-1">1 სტუმარი • კარზე 30<Gel /></div>
              </div>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-white/85">
              {[
                'კარის გახსნა 20:00-დან',
                'Metrono (21:00 – 22:00)',
                'stringless (22:30 – 00:30)',
                'დიჯეი Nosse (01:00 – till end)',
              ].map((perk) => (
                <li key={perk} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-poster-yellow shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            {/* Quantity Stepper + Buy CTA */}
            <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/80 font-display">რაოდენობა:</span>
                <div className="inline-flex items-center rounded-full bg-[#130409] border border-white/25 p-1">
                  <button
                    type="button"
                    disabled={effectiveQty <= 1}
                    onClick={() => onSetQuantity(Math.max(1, effectiveQty - 1))}
                    aria-label="რაოდენობის შემცირება"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-poster-yellow hover:text-[#130409] disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-mono text-base font-bold">
                    {effectiveQty}
                  </span>
                  <button
                    type="button"
                    disabled={effectiveQty >= 6}
                    onClick={() => onSetQuantity(Math.min(6, effectiveQty + 1))}
                    aria-label="რაოდენობის გაზრდა"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-poster-yellow hover:text-[#130409] disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenCheckout}
                className="pill-yellow px-7 py-3.5 text-base inline-flex items-center justify-center gap-2.5"
              >
                <Ticket className="w-4 h-4 shrink-0" />
                <span>
                  ყიდვა — {totalOnline}
                  <Gel />
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>

          {/* Right Column: Door Price Info & Bank Transfer IBANs */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5">
            <div className="glass-card p-6 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-xl text-white leading-snug">
                  კარზე შეძენა
                </span>
                <span className="font-display text-2xl text-poster-yellow">
                  {MAIN_EVENT.doorPrice}
                  <Gel />
                </span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                ივენთის დღეს, 11 დეკემბერს 20:00-დან შესასვლელში ბილეთის ფასი იქნება 30 ₾.
                წინასწარ ონლაინ გადმორიცხვით იხდი 25 ₾-ს.
              </p>
            </div>

            <div className="glass-card p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-display text-lg text-poster-yellow leading-snug">
                  <Landmark className="w-5 h-5 shrink-0" />
                  <span>გადარიცხვის ანგარიშები (IBAN)</span>
                </div>

                <div className="space-y-3">
                  {BANK_ACCOUNTS.map((acc) => (
                    <div
                      key={acc.id}
                      className="rounded-xl bg-[#130409] border border-white/15 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="min-w-0">
                        <div className="text-xs text-white/65">{acc.bankName}</div>
                        <div className="font-mono text-xs sm:text-[13px] text-poster-yellow font-bold break-all mt-0.5 select-all">
                          {acc.iban}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyIban(acc.bankName, acc.iban)}
                        aria-label={`${acc.bankName} IBAN კოპირება`}
                        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/20 text-xs font-display text-white hover:border-poster-yellow hover:text-poster-yellow inline-flex items-center gap-1.5 shrink-0 self-start sm:self-center transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>კოპირება</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-white/60 leading-relaxed">
                დანიშნულებაში აუცილებლად მიუთითე შენი სახელი და გვარი. სრული გაფორმებისთვის
                დააჭირე „ყიდვას“.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
