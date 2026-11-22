import React, { useEffect, useState } from 'react';
import { Menu, ShieldCheck, Ticket, User, X } from 'lucide-react';
import type { DemoUser } from '../types';

interface NavbarProps {
  cartCount: number;
  purchasedCount: number;
  demoUser: DemoUser | null;
  onOpenCheckout: () => void;
  onOpenAuth: () => void;
  onOpenMyTickets: () => void;
  onOpenAdmin?: () => void;
}

const NAV_LINKS = [
  { id: 'top', label: 'მთავარი' },
  { id: 'events', label: 'ივენთები' },
  { id: 'tickets', label: 'ბილეთები' },
  { id: 'how-to-buy', label: 'როგორ ვიყიდო' },
  { id: 'location', label: 'ლოკაცია' },
  { id: 'faq', label: 'კითხვები' },
];

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  purchasedCount,
  demoUser,
  onOpenCheckout,
  onOpenAuth,
  onOpenMyTickets,
  onOpenAdmin,
}) => {
  const [activeId, setActiveId] = useState<string>('top');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.3, 0.6] }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  const handleLinkClick = (id: string) => {
    setMobileOpen(false);
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#130409]/85 backdrop-blur-md border-b border-white/10">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 h-[76px] flex items-center justify-between gap-3">
        {/* Left Brand: Circular Transparent Logo + Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('top');
          }}
          className="flex items-center gap-2.5 group shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-poster-yellow rounded-full"
          aria-label="Wannabe Events — მთავარი"
        >
          <img
            src="/images/wannabe-logo.png"
            alt="Wannabe Events ლოგო"
            className="w-11 h-11 sm:w-12 sm:h-12 object-contain shrink-0 transition-transform duration-300 group-hover:rotate-12"
          />
          <span className="hidden sm:flex flex-col leading-none">
            <span className="font-display text-lg tracking-wider text-poster-yellow uppercase leading-none">
              WANNABE
            </span>
            <span className="font-mono text-[9px] tracking-[0.28em] text-white/75 uppercase mt-1">
              EVENTS
            </span>
          </span>
        </a>

        {/* Center Nav with Active Yellow Pill (matching reference) */}
        <nav aria-label="მთავარი ნავიგაცია" className="hidden lg:flex items-center gap-1.5">
          {NAV_LINKS.map((link) => {
            const isActive = activeId === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.id);
                }}
                className={`px-4 py-1.5 rounded-full font-display text-[14px] leading-snug transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-poster-yellow text-[#130409]'
                    : 'text-white/80 hover:text-poster-yellow'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right Icon Circles + Primary Yellow Pill */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {demoUser?.role === 'admin' && onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-poster-yellow text-[#130409] hover:bg-poster-yellow-bright font-display text-xs leading-snug transition-colors whitespace-nowrap"
              title="ადმინ პანელის გახსნა"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>ადმინი</span>
            </button>
          )}

          {purchasedCount > 0 && (
            <button
              type="button"
              onClick={onOpenMyTickets}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-burgundy-700/80 border border-poster-yellow/35 text-poster-yellow hover:bg-burgundy-600 font-display text-xs leading-snug transition-colors whitespace-nowrap"
              title="ჩემი ბილეთები და მოთხოვნები"
            >
              <Ticket className="w-3.5 h-3.5 shrink-0" />
              <span>ჩემი ({purchasedCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAuth}
            aria-label={demoUser ? `პროფილი: ${demoUser.name}` : 'ანგარიშზე შესვლა'}
            title={demoUser ? demoUser.name : 'ანგარიშზე შესვლა'}
            className={`relative w-9 h-9 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
              demoUser
                ? 'border-poster-yellow bg-burgundy-700/75 text-poster-yellow'
                : 'border-white/15 bg-white/5 text-white/85 hover:border-poster-yellow hover:text-poster-yellow'
            }`}
          >
            <User className="w-4 h-4" />
            {demoUser && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-poster-yellow border border-[#130409]" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCheckout}
            className="pill-yellow px-4 sm:px-5 py-2 text-sm inline-flex items-center gap-1.5"
          >
            <span>ბილეთები</span>
            {cartCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full bg-[#130409] text-poster-yellow font-mono text-[11px] font-bold leading-none">
                {cartCount}
              </span>
            ) : (
              <span aria-hidden="true">→</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden w-10 h-10 rounded-full border border-white/15 bg-white/5 text-white hover:border-poster-yellow hover:text-poster-yellow flex items-center justify-center transition-colors shrink-0"
            aria-label={mobileOpen ? 'მენიუს დახურვა' : 'მენიუს გახსნა'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#16050B]/95 backdrop-blur-lg border-t border-white/10 px-5 py-5 space-y-1.5">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(link.id);
              }}
              className="block py-2.5 px-3 rounded-xl font-display text-lg leading-snug text-white/90 hover:bg-burgundy-700/50 hover:text-poster-yellow"
            >
              {link.label}
            </a>
          ))}

          <div className="pt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenAuth();
              }}
              className="flex-1 pill-glass px-4 py-2.5 text-sm inline-flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-poster-yellow" />
              <span>{demoUser ? demoUser.name : 'ანგარიშზე შესვლა'}</span>
            </button>

            {purchasedCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenMyTickets();
                }}
                className="flex-1 pill-yellow px-4 py-2.5 text-sm inline-flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>ჩემი ბილეთები ({purchasedCount})</span>
              </button>
            )}

            {demoUser?.role === 'admin' && onOpenAdmin && (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenAdmin();
                }}
                className="flex-1 px-4 py-2.5 rounded-full bg-burgundy-600 border border-poster-yellow/50 text-poster-yellow font-display text-sm inline-flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ადმინ პანელი</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
