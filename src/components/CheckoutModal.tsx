import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Clock,
  Copy,
  Landmark,
  Minus,
  Plus,
  Ticket,
  X,
} from 'lucide-react';
import { BANK_ACCOUNTS, MAIN_EVENT } from '../data/events';
import type { DemoUser, PurchasedOrder } from '../types';
import { Gel } from './Gel';

interface CheckoutModalProps {
  isOpen: boolean;
  quantity: number;
  demoUser: DemoUser | null;
  onClose: () => void;
  onSetQuantity: (qty: number) => void;
  onOrderComplete: (
    order: PurchasedOrder
  ) => Promise<{ ok: boolean; error?: string }>;
  onRequireAuth?: () => void;
  onOpenMyTickets?: () => void;
  onNotify: (msg: string) => void;
}

type CheckoutStep = 1 | 2 | 3 | 4;

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  quantity,
  demoUser,
  onClose,
  onSetQuantity,
  onOrderComplete,
  onRequireAuth,
  onOpenMyTickets,
  onNotify,
}) => {
  const [step, setStep] = useState<CheckoutStep>(1);

  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [detailsErrors, setDetailsErrors] = useState<Record<string, string>>({});

  const [selectedBankId, setSelectedBankId] = useState<'tbc' | 'bog'>('tbc');
  const [copiedField, setCopiedField] = useState<'iban' | 'note' | null>(null);
  const [confirmedTransfer, setConfirmedTransfer] = useState(true);
  const [transferError, setTransferError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [completedOrder, setCompletedOrder] = useState<PurchasedOrder | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCompletedOrder(null);
      setDetailsErrors({});
      setTransferError('');
      setCopiedField(null);
      setIsSubmitting(false);
      if (demoUser) {
        setBuyerName((prev) => prev || demoUser.name);
        setBuyerEmail((prev) => prev || demoUser.email);
        setBuyerPhone((prev) => prev || demoUser.phone);
      }
    }
  }, [isOpen, demoUser]);

  if (!isOpen || !demoUser) return null;

  const qty = Math.max(1, Math.min(6, quantity));
  const totalAmount = qty * MAIN_EVENT.onlinePrice;
  const activeBank =
    BANK_ACCOUNTS.find((b) => b.id === selectedBankId) ?? BANK_ACCOUNTS[0];
  const transferNote = `Wannabe 11.12 - ${buyerName.trim() || 'სახელი გვარი'}`;

  const handleCopy = async (text: string, field: 'iban' | 'note', label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      onNotify(`${label} დაკოპირდა!`);
      window.setTimeout(() => setCopiedField(null), 2200);
    } catch {
      onNotify(`${label}: ${text}`);
    }
  };

  const handleStep2Next = () => {
    const errs: Record<string, string> = {};
    if (buyerName.trim().length < 2) {
      errs.buyerName = 'მიუთითე სახელი და გვარი (მინიმუმ 2 სიმბოლო)';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail.trim())) {
      errs.buyerEmail = 'მიუთითე მოქმედი ელ-ფოსტის მისამართი';
    }
    if (buyerPhone.replace(/\D/g, '').length < 9) {
      errs.buyerPhone = 'მიუთითე სწორი ტელეფონის ნომერი (მაგ: +995 599 12 34 56)';
    }
    if (!acceptedTerms) {
      errs.terms = 'გაგრძელებამდე დაადასტურე მონაცემების სისწორე';
    }
    setDetailsErrors(errs);
    if (Object.keys(errs).length === 0) {
      setStep(3);
    }
  };

  const handleCompleteOrder = async () => {
    if (!demoUser) {
      setTransferError('ბილეთის გასაფორმებლად აუცილებელია ანგარიშში შესვლა.');
      onRequireAuth?.();
      return;
    }

    if (!confirmedTransfer) {
      setTransferError(
        'დაადასტურე საბანკო გადმორიცხვა მითითებულ თიბისის ან საქართველოს ბანკის ანგარიშზე.'
      );
      return;
    }

    if (isSubmitting) return;

    setTransferError('');
    setIsSubmitting(true);
    try {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const order: PurchasedOrder = {
        orderCode: `WNB-TSRE-${randomNum}`,
        createdAt: new Date().toLocaleString('ka-GE'),
        eventTitle: MAIN_EVENT.title,
        eventDate: `${MAIN_EVENT.dateLabel} • ${MAIN_EVENT.doorsTime}`,
        venueName: MAIN_EVENT.venueName,
        address: MAIN_EVENT.address,
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
        buyerPhone: buyerPhone.trim(),
        quantity: qty,
        unitPrice: MAIN_EVENT.onlinePrice,
        totalAmount,
        bankName: activeBank.bankName,
        bankIban: activeBank.iban,
        transferNote,
        status: 'pending',
      };

      const res = await onOrderComplete(order);
      if (!res.ok) {
        setTransferError(res.error || 'შეკვეთის შენახვა ვერ მოხერხდა.');
        return;
      }

      setCompletedOrder(order);
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#130409]/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="ბილეთის ყიდვა"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-[#16050B] text-white border-l border-white/15 h-full flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#130409] border-b border-white/10 px-5 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/wannabe-logo.png"
              alt="Wannabe Events"
              className="w-9 h-9 object-contain shrink-0"
            />
            <h2 className="font-display text-xl sm:text-2xl leading-tight text-white">
              ბილეთის შეძენა
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="დახურვა"
            className="w-9 h-9 rounded-full border border-white/15 text-white/80 hover:border-poster-yellow hover:text-poster-yellow flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-[#130409]/70 border-b border-white/10 px-5 sm:px-6 py-3 grid grid-cols-4 gap-2 text-xs">
          {[
            { num: 1, label: 'რაოდენობა' },
            { num: 2, label: 'მონაცემები' },
            { num: 3, label: 'გადარიცხვა' },
            { num: 4, label: 'მოთხოვნა' },
          ].map((s) => {
            const active = step === s.num;
            const done = step > s.num;
            return (
              <div
                key={s.num}
                className={`px-2 py-1.5 rounded-full text-center font-display leading-snug transition-colors ${
                  active
                    ? 'bg-poster-yellow text-[#130409]'
                    : done
                    ? 'bg-burgundy-700 text-poster-yellow'
                    : 'bg-white/5 text-white/45'
                }`}
              >
                {s.num}. {s.label}
              </div>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 space-y-6">
          {/* STEP 1: Single Ticket Quantity */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-1">
                <div className="font-display text-lg text-poster-yellow leading-snug">
                  {MAIN_EVENT.title}
                </div>
                <div className="text-xs text-white/75">
                  {MAIN_EVENT.dateLabel} • {MAIN_EVENT.doorsTime} • {MAIN_EVENT.address}
                </div>
                <div className="text-xs text-white/60 pt-1">
                  Metrono (21:00–22:00) • stringless (22:30–00:30) • DJ Nosse (01:00–till end)
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-[#641230] via-[#3A0A1B] to-[#1B060E] border border-poster-yellow/55 p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-poster-yellow text-[#130409] font-display text-xs">
                    ერთიანი ონლაინ ბილეთი
                  </span>
                  <span className="font-mono text-xs text-white/75">
                    კარზე: {MAIN_EVENT.doorPrice}
                    <Gel />
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-display text-2xl text-white leading-snug">
                      სრული საღამოს ბილეთი
                    </div>
                    <div className="text-xs text-white/70 mt-0.5">
                      დაზოგე {MAIN_EVENT.doorPrice - MAIN_EVENT.onlinePrice}
                      <Gel /> ონლაინ შეძენით
                    </div>
                  </div>

                  <div className="font-display text-4xl text-poster-yellow leading-none">
                    {MAIN_EVENT.onlinePrice}
                    <Gel />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/15 flex items-center justify-between gap-4">
                  <span className="font-display text-sm text-white/85">
                    აირჩიე რაოდენობა (მაქს. 6):
                  </span>
                  <div className="inline-flex items-center rounded-full bg-[#130409] border border-white/25 p-1">
                    <button
                      type="button"
                      disabled={qty <= 1}
                      onClick={() => onSetQuantity(Math.max(1, qty - 1))}
                      aria-label="რაოდენობის შემცირება"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-poster-yellow hover:text-[#130409] disabled:opacity-30"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-mono text-base font-bold">
                      {qty}
                    </span>
                    <button
                      type="button"
                      disabled={qty >= 6}
                      onClick={() => onSetQuantity(Math.min(6, qty + 1))}
                      aria-label="რაოდენობის გაზრდა"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-poster-yellow hover:text-[#130409] disabled:opacity-30"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Buyer Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="rounded-xl bg-white/5 border border-white/12 p-4 flex items-center justify-between gap-3 text-sm">
                <span>
                  <strong className="text-poster-yellow">{qty} × ონლაინ ბილეთი</strong>{' '}
                  (ბარი „წრე“)
                </span>
                <span className="font-display text-xl text-poster-yellow">
                  {totalAmount}
                  <Gel />
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="buyer-name"
                    className="block font-display text-sm text-poster-yellow mb-1.5"
                  >
                    სახელი და გვარი (გადარიცხვის დასადასტურებლად) *
                  </label>
                  <input
                    id="buyer-name"
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="მაგ: გიორგი ბერიძე"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#130409] border border-white/20 text-white placeholder:text-white/35 focus:outline-none focus:border-poster-yellow"
                  />
                  {detailsErrors.buyerName && (
                    <p className="mt-1 text-xs text-poster-yellow">
                      {detailsErrors.buyerName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="buyer-email"
                    className="block font-display text-sm text-poster-yellow mb-1.5"
                  >
                    ელ-ფოსტა *
                  </label>
                  <input
                    id="buyer-email"
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="giorgi@example.ge"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#130409] border border-white/20 text-white placeholder:text-white/35 focus:outline-none focus:border-poster-yellow"
                  />
                  {detailsErrors.buyerEmail && (
                    <p className="mt-1 text-xs text-poster-yellow">
                      {detailsErrors.buyerEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="buyer-phone"
                    className="block font-display text-sm text-poster-yellow mb-1.5"
                  >
                    მობილურის ნომერი *
                  </label>
                  <input
                    id="buyer-phone"
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+995 599 12 34 56"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#130409] border border-white/20 font-mono text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-poster-yellow"
                  />
                  {detailsErrors.buyerPhone && (
                    <p className="mt-1 text-xs text-poster-yellow">
                      {detailsErrors.buyerPhone}
                    </p>
                  )}
                </div>

                <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/12 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 accent-poster-yellow w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm text-white/80 leading-relaxed">
                    ვადასტურებ მონაცემების სისწორეს — 11 დეკემბერს, 20:00 საათზე ბარ
                    „წრეში“ (მ. წინამძღვრიშვილის 133).
                  </span>
                </label>
                {detailsErrors.terms && (
                  <p className="text-xs text-poster-yellow">{detailsErrors.terms}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Real TBC / BOG Bank Transfer */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="rounded-xl bg-burgundy-700/75 border border-poster-yellow/35 p-4 text-xs sm:text-sm flex items-start gap-2.5 text-white/90">
                <Landmark className="w-5 h-5 text-poster-yellow shrink-0 mt-0.5" />
                <span>
                  აირჩიე ბანკი, დააკოპირე IBAN ანგარიში და გადმორიცხე{' '}
                  <strong className="text-poster-yellow">{totalAmount} ₾</strong>.
                  დანიშნულებაში ჩაწერე ქვემოთ მოცემული ტექსტი.
                </span>
              </div>

              {/* Bank Selector */}
              <div className="grid grid-cols-2 gap-2.5">
                {BANK_ACCOUNTS.map((bank) => {
                  const active = selectedBankId === bank.id;
                  return (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBankId(bank.id)}
                      className={`p-3.5 rounded-xl border font-display text-sm leading-snug text-center ${
                        active
                          ? 'bg-poster-yellow text-[#130409] border-poster-yellow'
                          : 'bg-white/5 text-white/85 border-white/15 hover:border-poster-yellow/50'
                      }`}
                    >
                      {bank.shortName}
                    </button>
                  );
                })}
              </div>

              {/* IBAN Copy Card */}
              <div className="rounded-2xl bg-white/5 border border-poster-yellow/40 p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-white/70">{activeBank.bankName}</span>
                  <span className="font-mono text-xs text-poster-yellow font-bold">
                    თანხა: {totalAmount} <Gel />
                  </span>
                </div>

                <div className="rounded-xl bg-[#130409] border border-white/15 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="font-mono text-sm sm:text-base text-poster-yellow font-bold tracking-wider select-all">
                    {activeBank.iban}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(activeBank.iban, 'iban', activeBank.bankName)
                    }
                    className="pill-yellow px-4 py-2 text-xs inline-flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {copiedField === 'iban' ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {copiedField === 'iban' ? 'დაკოპირდა' : 'IBAN-ის კოპირება'}
                    </span>
                  </button>
                </div>

                {/* Transfer Reference */}
                <div className="space-y-1.5">
                  <div className="text-xs text-white/70">
                    გადარიცხვის დანიშნულება (მიუთითე აუცილებლად):
                  </div>
                  <div className="rounded-xl bg-[#130409] border border-white/15 p-3 flex items-center justify-between gap-3">
                    <span className="font-mono text-xs sm:text-sm text-white select-all truncate">
                      {transferNote}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(transferNote, 'note', 'დანიშნულება')
                      }
                      className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-display text-poster-yellow hover:bg-poster-yellow hover:text-[#130409] inline-flex items-center gap-1 shrink-0 transition-colors"
                    >
                      {copiedField === 'note' ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedField === 'note' ? 'OK' : 'კოპირება'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/12 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedTransfer}
                  onChange={(e) => setConfirmedTransfer(e.target.checked)}
                  className="mt-1 accent-poster-yellow w-4 h-4"
                />
                <span className="text-xs sm:text-sm text-white/85 leading-relaxed">
                  ვადასტურებ, რომ გადმოვრიცხე / ვრიცხავ{' '}
                  <strong className="text-poster-yellow">{totalAmount} ₾</strong>-ს{' '}
                  {activeBank.bankName}-ის ანგარიშზე დანიშნულებით „{transferNote}“.
                </span>
              </label>

              {transferError && (
                <p className="text-xs text-poster-yellow bg-burgundy-700/60 border border-poster-yellow/40 rounded-xl p-3">
                  {transferError}
                </p>
              )}

              <div className="rounded-2xl bg-white/5 border border-white/12 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ონლაინ ბილეთი × {qty}</span>
                  <span className="font-mono">
                    {MAIN_EVENT.onlinePrice}
                    <Gel /> × {qty}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/15 flex justify-between items-baseline font-display text-xl text-poster-yellow">
                  <span>სულ გადასარიცხი</span>
                  <span className="text-2xl">
                    {totalAmount}
                    <Gel />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Pending Request Confirmation (Unlocked only after Admin Verification) */}
          {step === 4 && completedOrder && (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-2xl bg-poster-yellow text-[#130409] p-4">
                <Clock className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <div className="font-display text-lg leading-snug">
                    მოთხოვნა გაგზავნილია — გადამოწმების მოლოდინში
                  </div>
                  <div className="text-xs font-medium mt-0.5 leading-relaxed">
                    ადმინი გადაამოწმებს საბანკო გადმორიცხვას. დადასტურებისთანავე QR
                    ბილეთი გამოგიჩნდება სექციაში <strong>„ჩემი ბილეთები“</strong>.
                  </div>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden bg-[#1D070F] text-white border border-poster-yellow/40 shadow-2xl">
                <div className="bg-burgundy-700/80 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/wannabe-logo.png"
                      alt=""
                      className="w-7 h-7 object-contain shrink-0"
                    />
                    <span className="font-mono text-xs font-bold text-poster-yellow">
                      #{completedOrder.orderCode}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-poster-yellow/15 border border-poster-yellow/50 text-poster-yellow text-[11px] font-bold">
                    დადასტურების მოლოდინში
                  </span>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <div className="text-xs text-white/60">ივენთი</div>
                    <h3 className="font-display text-2xl text-white leading-tight">
                      {completedOrder.eventTitle}
                    </h3>
                    <div className="text-xs text-poster-yellow mt-1">
                      {completedOrder.eventDate} • {completedOrder.address}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-white/55">მყიდველი</div>
                      <div className="font-semibold text-white">
                        {completedOrder.buyerName}
                      </div>
                      <div className="font-mono text-xs text-white/70">
                        {completedOrder.buyerPhone}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-white/55">მოთხოვნილი ბილეთი</div>
                      <div className="font-display text-xl text-poster-yellow">
                        {completedOrder.quantity} × {completedOrder.unitPrice}
                        <Gel /> = {completedOrder.totalAmount}
                        <Gel />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#130409] border border-white/10 p-3.5 space-y-1.5 text-xs">
                    <div className="text-white/65">
                      გადარიცხვის ბანკი:{' '}
                      <strong className="text-white">{completedOrder.bankName}</strong>
                    </div>
                    <div className="font-mono text-poster-yellow break-all">
                      {completedOrder.bankIban}
                    </div>
                    <div className="text-white/75">
                      დანიშნულება:{' '}
                      <strong className="text-poster-yellow">
                        {completedOrder.transferNote}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {onOpenMyTickets && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenMyTickets();
                    }}
                    className="flex-1 pill-glass py-3 text-base inline-flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4 text-poster-yellow" />
                    <span>ჩემი მოთხოვნები</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 pill-yellow py-3 text-base"
                >
                  დახურვა
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Sticky Bar */}
        {step < 4 && (
          <div className="bg-[#130409] border-t border-white/10 px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
            {step === 1 ? (
              <div>
                <div className="text-xs text-white/60">
                  {qty} ონლაინ ბილეთი ({MAIN_EVENT.onlinePrice}
                  <Gel />)
                </div>
                <div className="font-display text-2xl text-poster-yellow leading-none mt-0.5">
                  {totalAmount}
                  <Gel />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as CheckoutStep)}
                className="pill-glass px-4 py-2.5 text-sm inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>უკან</span>
              </button>
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="pill-yellow px-6 py-3 text-base inline-flex items-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>გაგრძელება →</span>
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleStep2Next}
                className="pill-yellow px-6 py-3 text-base"
              >
                ანგარიშებზე გადასვლა →
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCompleteOrder}
                className="pill-yellow px-6 py-3 text-base disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>იგზავნება...</span>
                ) : (
                  <>
                    მოთხოვნის გაგზავნა — {totalAmount}
                    <Gel />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
