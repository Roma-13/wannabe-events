import React from 'react';
import { ArrowRight, Copy, Landmark } from 'lucide-react';
import { BANK_ACCOUNTS, HOW_TO_BUY_STEPS } from '../data/events';

interface HowToBuyProps {
  onStartBuy: () => void;
  onNotify: (msg: string) => void;
}

export const HowToBuy: React.FC<HowToBuyProps> = ({ onStartBuy, onNotify }) => {
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
      id="how-to-buy"
      className="relative scroll-mt-20 bg-[#17050C] text-white border-t border-white/10 py-14 lg:py-20"
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-2">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-[1.06] text-white">
              როგორ <span className="text-poster-yellow">ვიყიდო</span> ბილეთი
            </h2>
            <p className="text-sm sm:text-base text-white/65 max-w-xl">
              მარტივი საბანკო გადმორიცხვა თიბისიზე ან საქართველოს ბანკზე — ონლაინ
              ფასია 25 ₾, კარზე 30 ₾.
            </p>
          </div>

          <button
            type="button"
            onClick={onStartBuy}
            className="pill-yellow px-5 py-3 text-sm sm:text-base inline-flex items-center gap-2 self-start md:self-auto"
          >
            <span>ბილეთის გაფორმება</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW_TO_BUY_STEPS.map((item) => (
            <div
              key={item.step}
              className="glass-card p-6 flex flex-col justify-between gap-6 hover:border-poster-yellow/45 transition-colors"
            >
              <div className="space-y-4">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-poster-yellow text-[#130409] font-display text-xl leading-none">
                  {item.step}
                </span>
                <h3 className="font-display text-xl sm:text-2xl leading-snug text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 font-mono text-xs text-poster-yellow/85">
                {item.meta}
              </div>
            </div>
          ))}
        </div>

        {/* Real Bank Accounts Copy Panel */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#5C102B] via-[#3B0A1B] to-[#1D070F] border border-poster-yellow/35 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <div className="inline-flex items-center gap-2 text-poster-yellow font-display text-lg leading-snug">
              <Landmark className="w-5 h-5 shrink-0" />
              <span>საბანკო რეკვიზიტები</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              გადმორიცხვისას დანიშნულებაში ჩაწერე შენი{' '}
              <strong className="text-poster-yellow">სახელი და გვარი</strong>, რათა
              კარზე მარტივად მოხდეს სიაში გადამოწმება.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 max-w-2xl">
            {BANK_ACCOUNTS.map((acc) => (
              <div
                key={acc.id}
                className="rounded-xl bg-[#130409]/80 border border-poster-yellow/25 p-4 flex items-center justify-between gap-3"
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
                  aria-label={`${acc.bankName} ანგარიშის კოპირება`}
                  className="p-2 rounded-full bg-white/5 border border-white/15 text-poster-yellow hover:bg-poster-yellow hover:text-[#130409] transition-colors shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
