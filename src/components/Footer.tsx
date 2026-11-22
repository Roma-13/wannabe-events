import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Mail } from 'lucide-react';
import { MAIN_EVENT } from '../data/events';

interface FooterProps {
  onOpenCheckout: () => void;
  onOpenAuth: () => void;
  onNotify: (msg: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCheckout,
  onOpenAuth,
  onNotify,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      onNotify('გთხოვ მიუთითე სწორი ელ-ფოსტა ანონსებისთვის');
      return;
    }
    setSubscribed(true);
    setEmail('');
    onNotify('გამოწერილია! მომდევნო ივენთების შესახებ პირველი შეიტყობ.');
  };

  return (
    <footer className="bg-[#130409] text-white border-t border-white/10 pt-14 pb-8 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/wannabe-logo.png"
                alt="Wannabe Events ლოგო"
                className="w-14 h-14 object-contain"
              />
              <div>
                <div className="font-display text-xl text-poster-yellow uppercase leading-none">
                  WANNABE
                </div>
                <div className="font-mono text-[10px] tracking-[0.25em] text-white/65 uppercase mt-1">
                  EVENTS • TBILISI
                </div>
              </div>
            </div>
            <p className="text-sm text-white/65 leading-relaxed max-w-sm">
              11 დეკემბერი, 2026 • {MAIN_EVENT.venueName} — Metrono, stringless და დიჯეი
              Nosse (till end).
            </p>
            <div className="text-xs font-mono text-poster-yellow/80">
              {MAIN_EVENT.venueName} • {MAIN_EVENT.address}
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <div className="font-display text-base text-poster-yellow leading-snug">
              სექციები
            </div>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a href="#events" className="hover:text-poster-yellow transition-colors">
                  ივენთები და ლაინაფი
                </a>
              </li>
              <li>
                <a href="#tickets" className="hover:text-poster-yellow transition-colors">
                  ბილეთები (25 ₾ / 30 ₾)
                </a>
              </li>
              <li>
                <a href="#how-to-buy" className="hover:text-poster-yellow transition-colors">
                  როგორ ვიყიდო
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-poster-yellow transition-colors">
                  ლოკაცია (ბარი „წრე“)
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-poster-yellow transition-colors">
                  ხშირი კითხვები
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenCheckout}
                  className="text-poster-yellow font-display hover:underline"
                >
                  ბილეთის ყიდვა →
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="hover:text-poster-yellow transition-colors"
                >
                  ანგარიშზე შესვლა
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <div className="font-display text-base text-poster-yellow leading-snug">
              ახალი ივენთების ანონსი
            </div>
            <p className="text-sm text-white/65">
              მიიღე შემდეგი კონცერტების შესახებ შეტყობინება პირველმა.
            </p>

            {subscribed ? (
              <div className="p-3.5 rounded-xl bg-burgundy-700/60 border border-poster-yellow/35 text-poster-yellow text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>მეილი დამატებულია ანონსების სიაში.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <label htmlFor="footer-email" className="sr-only">
                  შენი ელ-ფოსტა
                </label>
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-poster-yellow/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="footer-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.ge"
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/5 border border-white/15 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-poster-yellow"
                  />
                </div>
                <button type="submit" className="pill-yellow px-5 py-2.5 text-sm">
                  გამოწერა
                </button>
              </form>
            )}

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-white/60">
              {['Instagram', 'Facebook', 'Bandcamp', 'YouTube'].map((net) => (
                <a
                  key={net}
                  href="#top"
                  onClick={(e) => {
                    e.preventDefault();
                    onNotify(`${net} — @wannabe.events`);
                  }}
                  className="inline-flex items-center gap-0.5 hover:text-poster-yellow transition-colors"
                >
                  <span>{net}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 pb-4 select-none">
          <div className="font-display text-[clamp(2.25rem,8.5vw,6.75rem)] leading-[0.88] tracking-tight text-poster-yellow uppercase text-center">
            WANNABE EVENTS
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-white/45">
          <span>© 2026 WANNABE EVENTS TBILISI</span>
          <span>11.12.2026 • ბარი „წრე“ • წინამძღვრიშვილის 133</span>
        </div>
      </div>
    </footer>
  );
};
