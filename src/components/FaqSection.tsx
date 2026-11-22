import React, { useState } from 'react';
import { Mail, Phone, Plus } from 'lucide-react';
import { FAQ_ITEMS } from '../data/events';
import type { FaqItem } from '../types';

const CATEGORIES: Array<'ყველა' | FaqItem['category']> = [
  'ყველა',
  'ბილეთები',
  'ლაინაფი',
  'ლოკაცია',
  'შესვლა',
];

export const FaqSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'ყველა' | FaqItem['category']>('ყველა');
  const [openId, setOpenId] = useState<string>(FAQ_ITEMS[0].id);

  const visibleItems =
    selectedCategory === 'ყველა'
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <section
      id="faq"
      className="relative scroll-mt-20 bg-[#17050C] text-white border-t border-white/10 py-14 lg:py-20"
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Sticky Column */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="space-y-2">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-[1.06] text-white">
                ხშირი <span className="text-poster-yellow">კითხვები</span>
              </h2>
              <p className="text-sm text-white/65 leading-relaxed">
                პასუხები 25 ₾ ონლაინ ბილეთზე, საბანკო გადმორიცხვაზე, ბარ „წრეზე“ და
                11 დეკემბრის განრიგზე.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      const first =
                        cat === 'ყველა'
                          ? FAQ_ITEMS[0]
                          : FAQ_ITEMS.find((f) => f.category === cat);
                      if (first) setOpenId(first.id);
                    }}
                    className={`px-3.5 py-2 rounded-full font-display text-sm leading-snug transition-colors ${
                      active
                        ? 'bg-poster-yellow text-[#130409]'
                        : 'bg-white/5 border border-white/15 text-white/75 hover:border-poster-yellow/50 hover:text-poster-yellow'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#5C102B] to-[#260914] border border-poster-yellow/35 p-5 sm:p-6 space-y-3">
              <div className="font-display text-lg text-poster-yellow leading-snug">
                კითხვა გაქვს გადმორიცხვაზე?
              </div>
              <div className="space-y-2 text-sm text-white/85">
                <a
                  href="mailto:hello@wannabe.ge"
                  className="flex items-center gap-2.5 hover:text-poster-yellow transition-colors"
                >
                  <Mail className="w-4 h-4 text-poster-yellow shrink-0" />
                  <span>hello@wannabe.ge</span>
                </a>
                <a
                  href="tel:+995599004707"
                  className="flex items-center gap-2.5 hover:text-poster-yellow transition-colors"
                >
                  <Phone className="w-4 h-4 text-poster-yellow shrink-0" />
                  <span>+995 599 00 47 07</span>
                </a>
                <div className="text-xs font-mono text-poster-yellow/80 pt-1">
                  Instagram: @wannabe.events
                </div>
              </div>
            </div>
          </div>

          {/* Right Glass Accordion Cards */}
          <div className="lg:col-span-8 space-y-3">
            {visibleItems.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-colors ${
                    isOpen
                      ? 'bg-[#260914]/90 border-poster-yellow/50'
                      : 'bg-[#1D070F]/80 border-white/12 hover:border-white/25'
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenId(isOpen ? '' : item.id)}
                    className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1 pr-2">
                      <span className="font-mono text-xs text-poster-yellow/85">
                        {item.category}
                      </span>
                      <h3 className="font-display text-lg sm:text-xl leading-snug text-white">
                        {item.question}
                      </h3>
                    </div>

                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all mt-0.5 ${
                        isOpen
                          ? 'bg-poster-yellow text-[#130409] rotate-45'
                          : 'bg-white/5 border border-white/15 text-poster-yellow'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-0 text-sm sm:text-base text-white/75 leading-relaxed border-t border-white/10 pt-4">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
