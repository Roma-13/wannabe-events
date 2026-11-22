import React, { useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  Printer,
  RefreshCw,
  Ticket,
  X,
  XCircle,
} from 'lucide-react';
import type { PurchasedOrder } from '../types';
import { BarcodeSvg, Gel, QrCodeSvg, buildTicketUrl } from './Gel';

interface MyTicketsModalProps {
  isOpen: boolean;
  orders: PurchasedOrder[];
  onClose: () => void;
  onGoBuy: () => void;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  onOpenTicketPass?: (orderCode: string) => void;
}

export const MyTicketsModal: React.FC<MyTicketsModalProps> = ({
  isOpen,
  orders,
  onClose,
  onGoBuy,
  onRefresh,
  refreshing = false,
  onOpenTicketPass,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const confirmedOrders = orders.filter((o) => o.status === 'confirmed');
  const pendingOrders = orders.filter(
    (o) => !o.status || o.status === 'pending'
  );
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#130409]/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="ჩემი ბილეთები და მოთხოვნები"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl bg-[#16050B] text-white border-l border-white/15 h-full flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-[#130409] border-b border-white/10 px-5 py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/images/wannabe-logo.png"
              alt="Wannabe Events"
              className="w-9 h-9 object-contain shrink-0"
            />
            <div className="min-w-0">
              <h2 className="font-display text-xl sm:text-2xl text-white leading-tight truncate">
                ჩემი ბილეთები ({confirmedOrders.length})
              </h2>
              {pendingOrders.length > 0 && (
                <div className="text-[11px] text-poster-yellow font-medium">
                  მოლოდინში მოთხოვნა: {pendingOrders.length}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onRefresh && (
              <button
                type="button"
                onClick={() => void onRefresh()}
                disabled={refreshing}
                aria-label="სტატუსის განახლება"
                className="px-3 h-9 rounded-full border border-white/15 text-xs font-display text-white/85 hover:border-poster-yellow hover:text-poster-yellow inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline">განახლება</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="დახურვა"
              className="w-9 h-9 rounded-full border border-white/15 text-white/80 hover:border-poster-yellow hover:text-poster-yellow flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {orders.length === 0 ? (
            <div className="glass-card p-8 text-center space-y-4">
              <Ticket className="w-10 h-10 text-poster-yellow mx-auto" />
              <div className="font-display text-2xl text-white">
                ჯერ ბილეთი ან მოთხოვნა არ გაქვს
              </div>
              <p className="text-sm text-white/70">
                11 დეკემბერს, ბარ „წრეში“ ონლაინ ბილეთის ფასია 25 ₾ (კარზე 30 ₾).
                მოთხოვნის გაგზავნისა და ადმინის მიერ დადასტურების შემდეგ QR ბილეთი
                აქ გამოგიჩნდება.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoBuy();
                }}
                className="pill-yellow px-5 py-3 text-base"
              >
                ბილეთის მოთხოვნა — 25
                <Gel />
              </button>
            </div>
          ) : (
            <>
              {/* 1. Confirmed Unlocked QR E-Tickets */}
              {confirmedOrders.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2 font-display text-lg text-poster-yellow">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>დადასტურებული QR ბილეთები ({confirmedOrders.length})</span>
                  </div>

                  {confirmedOrders.map((ord) => (
                    <article
                      key={ord.id ?? ord.orderCode}
                      className="printable-ticket rounded-2xl overflow-hidden bg-poster-cream text-[#130409] border border-poster-yellow/60 shadow-xl"
                    >
                      <div className="bg-burgundy-600 text-poster-yellow px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono font-bold">
                        <span>#{ord.orderCode}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-poster-yellow text-[#130409] font-body text-[10px] font-bold">
                            დადასტურებული
                          </span>
                          <span className="text-poster-yellow/80">{ord.createdAt}</span>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <h3 className="font-display text-xl leading-snug text-[#130409]">
                            {ord.eventTitle}
                          </h3>
                          <div className="text-xs font-medium text-burgundy-800">
                            {ord.eventDate} • {ord.venueName}
                          </div>
                          <div className="text-xs text-burgundy-800">{ord.address}</div>
                          <div className="text-xs text-burgundy-900">
                            მფლობელი: <strong>{ord.buyerName}</strong>
                          </div>
                          <div className="pt-1 text-sm font-display">
                            ონლაინ ბილეთი × {ord.quantity} ({ord.totalAmount}
                            <Gel />)
                          </div>
                          <div className="text-[11px] font-mono text-burgundy-800">
                            {ord.bankName}: {ord.bankIban}
                          </div>
                          {ord.adminNote && (
                            <div className="text-xs text-burgundy-700 font-medium pt-0.5">
                              შენიშვნა: {ord.adminNote}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-center gap-2 shrink-0 self-center sm:self-auto">
                          <div className="p-2 rounded-xl bg-white border border-black/15">
                            <QrCodeSvg
                              value={buildTicketUrl(ord.orderCode)}
                              className="w-24 h-24"
                            />
                          </div>
                          {ord.checkedInAt && (
                            <span className="px-2 py-0.5 rounded-full bg-burgundy-700 text-poster-yellow text-[10px] font-bold">
                              შემოსულია • {ord.checkedInAt}
                            </span>
                          )}
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => window.print()}
                              className="text-xs font-display text-burgundy-700 underline inline-flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>ბეჭდვა</span>
                            </button>
                            {onOpenTicketPass && (
                              <button
                                type="button"
                                onClick={() => onOpenTicketPass(ord.orderCode)}
                                className="text-xs font-display text-[#130409] underline inline-flex items-center gap-1"
                              >
                                <span>გახსნა</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-2 bg-poster-yellow flex items-center justify-between gap-3">
                        <div className="w-28 text-[#130409]">
                          <BarcodeSvg seed={ord.orderCode} className="w-full h-4" />
                        </div>
                        <span className="font-mono text-[10px] font-bold uppercase text-[#130409]">
                          VALID ACCESS • WANNABE
                        </span>
                      </div>
                    </article>
                  ))}
                </section>
              )}

              {/* 2. Pending Admin Verification Requests (NO QR Ticket Displayed!) */}
              {pendingOrders.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2 font-display text-lg text-white">
                    <Clock className="w-5 h-5 text-poster-yellow shrink-0" />
                    <span>გადამოწმების მოლოდინში ({pendingOrders.length})</span>
                  </div>

                  {pendingOrders.map((ord) => (
                    <article
                      key={ord.id ?? ord.orderCode}
                      className="rounded-2xl overflow-hidden bg-[#1D070F] text-white border border-poster-yellow/35 shadow-lg"
                    >
                      <div className="bg-burgundy-700/75 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono border-b border-white/10">
                        <span className="font-bold text-poster-yellow">
                          #{ord.orderCode}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-poster-yellow/15 text-poster-yellow border border-poster-yellow/40 font-body text-[10px] font-bold">
                          ადმინის დადასტურების მოლოდინში
                        </span>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="font-display text-lg text-white leading-snug">
                              {ord.eventTitle}
                            </h3>
                            <div className="text-xs text-white/70">
                              მფლობელი: <strong className="text-white">{ord.buyerName}</strong> •{' '}
                              {ord.createdAt}
                            </div>
                          </div>

                          <div className="font-display text-xl text-poster-yellow">
                            {ord.quantity} × {ord.unitPrice}
                            <Gel /> = {ord.totalAmount}
                            <Gel />
                          </div>
                        </div>

                        <div className="rounded-xl bg-[#130409] border border-white/10 p-3 text-xs space-y-1">
                          <div className="text-white/70">
                            ბანკი: <strong className="text-white">{ord.bankName}</strong>
                          </div>
                          <div className="font-mono text-poster-yellow break-all">
                            {ord.bankIban}
                          </div>
                          <div className="text-white/75">
                            დანიშნულება:{' '}
                            <strong className="text-poster-yellow">{ord.transferNote}</strong>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 rounded-xl bg-burgundy-700/40 border border-poster-yellow/25 px-3 py-2.5 text-xs text-white/85">
                          <Lock className="w-4 h-4 text-poster-yellow shrink-0 mt-0.5" />
                          <span>
                            QR ბილეთი და შტრიხკოდი გამოჩნდება მხოლოდ მას შემდეგ, რაც
                            ადმინი გადაამოწმებს გადმორიცხვას და დაადასტურებს შენს
                            მოთხოვნას.
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </section>
              )}

              {/* 3. Cancelled / Rejected Requests */}
              {cancelledOrders.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2 font-display text-lg text-white/70">
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <span>უარყოფილი მოთხოვნები ({cancelledOrders.length})</span>
                  </div>

                  {cancelledOrders.map((ord) => (
                    <article
                      key={ord.id ?? ord.orderCode}
                      className="rounded-2xl bg-[#19060D] border border-red-400/30 p-4 space-y-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono font-bold text-white/80">
                          #{ord.orderCode}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-400/35 font-bold">
                          უარყოფილი
                        </span>
                      </div>
                      <div className="text-white/75">
                        {ord.buyerName} • {ord.quantity} ბილეთი ({ord.totalAmount} ₾)
                      </div>
                      {ord.adminNote && (
                        <div className="rounded-lg bg-black/30 border border-white/10 p-2.5 text-red-200">
                          მიზეზი / კომენტარი: {ord.adminNote}
                        </div>
                      )}
                    </article>
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
