import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Lock,
  LogIn,
  Printer,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { DemoUser, VerifiedTicket } from '../types';
import { BarcodeSvg, Gel, QrCodeSvg, buildTicketUrl } from './Gel';

interface TicketPassPageProps {
  ticketCode: string;
  authUser: DemoUser | null;
  authLoading?: boolean;
  onBackHome: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onNotify: (msg: string) => void;
}

function mapRpcTicket(row: Record<string, unknown>): VerifiedTicket {
  const createdRaw = row.created_at ? String(row.created_at) : '';
  const checkedRaw = row.checked_in_at ? String(row.checked_in_at) : null;
  return {
    orderCode: String(row.order_code ?? ''),
    eventTitle: String(row.event_title ?? ''),
    eventDate: String(row.event_date ?? ''),
    venueName: String(row.venue_name ?? ''),
    address: String(row.address ?? ''),
    buyerName: String(row.buyer_name ?? ''),
    quantity: Number(row.quantity ?? 1),
    unitPrice: Number(row.unit_price ?? 25),
    totalAmount: Number(row.total_amount ?? 25),
    status: (row.status as VerifiedTicket['status']) ?? 'pending',
    checkedInAt: checkedRaw
      ? new Date(checkedRaw).toLocaleString('ka-GE')
      : null,
    createdAt: createdRaw ? new Date(createdRaw).toLocaleString('ka-GE') : '',
    adminNote: String(row.admin_note ?? ''),
  };
}

export const TicketPassPage: React.FC<TicketPassPageProps> = ({
  ticketCode,
  authUser,
  authLoading = false,
  onBackHome,
  onOpenAuth,
  onOpenAdmin,
  onNotify,
}) => {
  const [ticket, setTicket] = useState<VerifiedTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  const isAdmin = authUser?.role === 'admin';

  const loadTicket = useCallback(async () => {
    if (!isAdmin) {
      setTicket(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase.rpc('verify_ticket', {
        p_order_code: ticketCode,
      });

      if (error) {
        setErrorMsg(`შემოწმება ვერ მოხერხდა: ${error.message}`);
        setTicket(null);
        return;
      }

      const row = Array.isArray(data) ? data[0] : data;
      if (!row) {
        setTicket(null);
        return;
      }

      setTicket(mapRpcTicket(row as Record<string, unknown>));
    } finally {
      setLoading(false);
    }
  }, [ticketCode, isAdmin]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      setTicket(null);
      setLoading(false);
      return;
    }
    void loadTicket();
  }, [authLoading, isAdmin, loadTicket]);

  const handleCheckIn = async () => {
    if (!isAdmin || !ticket || checkingIn) return;
    setCheckingIn(true);
    try {
      const { data, error } = await supabase.rpc('check_in_ticket', {
        p_order_code: ticket.orderCode,
      });

      if (error) {
        onNotify(`Check-In შეცდომა: ${error.message}`);
        return;
      }

      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        setTicket(mapRpcTicket(row as Record<string, unknown>));
      } else {
        await loadTicket();
      }
      onNotify(`ბილეთი #${ticket.orderCode} გატარდა კარზე (Check-In)!`);
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-76px)] bg-[#130409] text-white py-10 sm:py-16 px-4 sm:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Top Navigation Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackHome}
            className="pill-glass px-4 py-2 text-xs sm:text-sm inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 text-poster-yellow" />
            <span>მთავარ გვერდზე დაბრუნება</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => void loadTicket()}
              disabled={loading}
              className="pill-glass px-4 py-2 text-xs sm:text-sm inline-flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-poster-yellow ${
                  loading ? 'animate-spin' : ''
                }`}
              />
              <span>განახლება</span>
            </button>
          )}
        </div>

        {/* Checking Auth / Loading State */}
        {(authLoading || (isAdmin && loading)) && (
          <div className="glass-card p-10 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-poster-yellow mx-auto animate-spin" />
            <div className="font-display text-2xl text-white">
              {authLoading ? 'ანგარიშის შემოწმება...' : 'ბილეთის გადამოწმება...'}
            </div>
            <div className="font-mono text-xs text-poster-yellow">
              #{ticketCode}
            </div>
          </div>
        )}

        {/* Guest / Stranger Blocked (Not Logged In) */}
        {!authLoading && !authUser && (
          <div className="glass-card border-poster-yellow/45 p-7 sm:p-10 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-poster-yellow/15 border border-poster-yellow/45 text-poster-yellow flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-2xl sm:text-3xl text-white leading-tight">
                წვდომა შეზღუდულია — მხოლოდ ადმინისთვის
              </h1>
              <p className="text-sm text-white/75 max-w-md mx-auto leading-relaxed">
                ამ QR ბილეთის ნახვა და შემოწმება შესაძლებელია მხოლოდ
                ავტორიზებული ადმინის ანგარიშით. უცხო ვიზიტორისთვის ბილეთის
                დეტალები დაფარულია.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={onOpenAuth}
                className="pill-yellow px-6 py-3 text-sm sm:text-base inline-flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>ადმინის ანგარიშზე შესვლა</span>
              </button>

              <button
                type="button"
                onClick={onBackHome}
                className="pill-glass px-6 py-3 text-sm sm:text-base"
              >
                მთავარი გვერდი
              </button>
            </div>
          </div>
        )}

        {/* Logged In Non-Admin Blocked */}
        {!authLoading && authUser && !isAdmin && (
          <div className="glass-card border-red-400/45 p-7 sm:p-10 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-400/45 text-red-300 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-2xl sm:text-3xl text-white leading-tight">
                QR სკანერი მხოლოდ ადმინისთვისაა
              </h1>
              <p className="text-sm text-white/75 max-w-md mx-auto leading-relaxed">
                შესული ხარ როგორც{' '}
                <strong className="text-poster-yellow">{authUser.email}</strong>
                , მაგრამ ამ ანგარიშს ადმინის უფლება არ აქვს. სკანირებით
                ბილეთის გახსნა მხოლოდ ადმინისტრატორებისთვისაა დაშვებული.
              </p>
            </div>

            <button
              type="button"
              onClick={onBackHome}
              className="pill-yellow px-6 py-3 text-sm sm:text-base"
            >
              მთავარ გვერდზე დაბრუნება
            </button>
          </div>
        )}

        {/* Admin Error State */}
        {!authLoading && isAdmin && !loading && errorMsg && (
          <div className="glass-card border-red-400/40 p-8 text-center space-y-4">
            <XCircle className="w-10 h-10 text-red-400 mx-auto" />
            <div className="font-display text-2xl text-white">
              შემოწმების შეცდომა
            </div>
            <p className="text-sm text-red-200">{errorMsg}</p>
          </div>
        )}

        {/* Admin View: Not Found or Cancelled */}
        {!authLoading &&
          isAdmin &&
          !loading &&
          !errorMsg &&
          (!ticket || ticket.status === 'cancelled') && (
            <div className="glass-card border-red-400/45 p-8 text-center space-y-4">
              <XCircle className="w-12 h-12 text-red-400 mx-auto" />
              <div className="font-display text-2xl sm:text-3xl text-white">
                {ticket?.status === 'cancelled'
                  ? 'ბილეთი გაუქმებულია / უარყოფილია'
                  : 'ბილეთი ვერ მოიძებნა ან არავალიდურია'}
              </div>
              <div className="inline-block font-mono text-xs px-3 py-1 rounded-full bg-black/40 border border-white/15 text-white/80">
                #{ticketCode}
              </div>
              {ticket?.adminNote && (
                <p className="text-sm text-red-200">მიზეზი: {ticket.adminNote}</p>
              )}
            </div>
          )}

        {/* Admin View: Pending Verification */}
        {!authLoading &&
          isAdmin &&
          !loading &&
          !errorMsg &&
          ticket &&
          ticket.status === 'pending' && (
            <div className="glass-card border-poster-yellow/50 p-6 sm:p-8 space-y-5">
              <div className="flex items-start gap-3 rounded-2xl bg-poster-yellow text-[#130409] p-4">
                <Clock className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <div className="font-display text-xl leading-snug">
                    ბილეთი ჯერ არ არის დადასტურებული
                  </div>
                  <div className="text-xs font-medium mt-0.5">
                    მოთხოვნა მოლოდინშია — შეამოწმე გადმორიცხვა ადმინ პანელში.
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[#130409] border border-white/10 p-4 space-y-2 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-poster-yellow">
                    #{ticket.orderCode}
                  </span>
                  <span className="text-xs text-white/60">
                    {ticket.createdAt}
                  </span>
                </div>
                <div className="text-white">
                  მფლობელი: <strong>{ticket.buyerName}</strong>
                </div>
                <div className="font-display text-lg text-poster-yellow">
                  მოთხოვნილი: {ticket.quantity} ბილეთი ({ticket.totalAmount}
                  <Gel />)
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenAdmin}
                className="pill-yellow w-full py-3 text-base inline-flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ადმინ პანელში დადასტურება</span>
              </button>
            </div>
          )}

        {/* Admin View: Confirmed Valid / Already Checked-In Pass */}
        {!authLoading &&
          isAdmin &&
          !loading &&
          !errorMsg &&
          ticket &&
          ticket.status === 'confirmed' && (
            <div className="space-y-5">
              {ticket.checkedInAt ? (
                <div className="flex items-start gap-3 rounded-2xl bg-red-600/90 text-white border border-red-300/40 p-4 shadow-xl">
                  <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5 text-poster-yellow" />
                  <div>
                    <div className="font-display text-xl leading-snug">
                      უკვე გამოყენებულია (Check-In: {ticket.checkedInAt})
                    </div>
                    <div className="text-xs text-white/90 mt-0.5">
                      ეს QR ბილეთი უკვე გატარებულია კარზე.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-2xl bg-poster-yellow text-[#130409] p-4 shadow-xl">
                  <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-display text-xl leading-snug">
                      ვალიდური ბილეთი — შესვლა დაშვებულია
                    </div>
                    <div className="text-xs font-medium mt-0.5">
                      გადახდა დადასტურებულია • {ticket.venueName}
                    </div>
                  </div>
                </div>
              )}

              {/* Printable Pass Card */}
              <article className="printable-ticket rounded-2xl overflow-hidden bg-poster-cream text-[#130409] border border-poster-yellow/60 shadow-2xl">
                <div className="bg-burgundy-600 text-poster-yellow px-5 py-3.5 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2.5 font-display text-lg uppercase">
                    <img
                      src="/images/wannabe-logo.png"
                      alt=""
                      className="w-8 h-8 object-contain shrink-0"
                    />
                    <span>WANNABE EVENTS • E-TICKET</span>
                  </span>
                  <span className="font-mono text-xs font-bold">
                    #{ticket.orderCode}
                  </span>
                </div>

                <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-center">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-burgundy-700 font-semibold">
                        ივენთი
                      </div>
                      <h1 className="font-display text-2xl sm:text-3xl leading-tight text-[#130409]">
                        {ticket.eventTitle}
                      </h1>
                      <div className="text-sm font-medium text-burgundy-800 mt-1">
                        {ticket.eventDate}
                      </div>
                      <div className="text-xs text-burgundy-700">
                        {ticket.venueName} • {ticket.address}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-black/15 space-y-1 text-sm">
                      <div>
                        <span className="text-burgundy-700 font-semibold">
                          მფლობელი:
                        </span>{' '}
                        <strong className="text-[#130409]">
                          {ticket.buyerName}
                        </strong>
                      </div>
                      <div className="font-display text-lg text-[#130409]">
                        ონლაინ ბილეთი × {ticket.quantity} ({ticket.totalAmount}
                        <Gel />)
                      </div>
                    </div>

                    <div className="pt-2 border-t border-black/15 text-xs text-burgundy-800">
                      კარი 20:00 • Metrono 21:00–22:00 • stringless 22:30–00:30
                      • დიჯეი Nosse 01:00–till end
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-black/15 shrink-0">
                    <QrCodeSvg
                      value={buildTicketUrl(ticket.orderCode)}
                      className="w-36 h-36"
                    />
                    <span className="font-mono text-[10px] font-bold mt-2 tracking-wider">
                      {ticket.orderCode}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-3 bg-poster-yellow flex items-center justify-between gap-4">
                  <div className="w-36 text-[#130409]">
                    <BarcodeSvg seed={ticket.orderCode} className="w-full h-5" />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase text-[#130409]">
                    {ticket.checkedInAt
                      ? 'CHECKED IN'
                      : 'METRONO • STRINGLESS • NOSSE'}
                  </span>
                </div>
              </article>

              {/* Admin Check-In + Print Actions */}
              <div className="flex flex-wrap gap-3">
                {!ticket.checkedInAt && (
                  <button
                    type="button"
                    disabled={checkingIn}
                    onClick={() => void handleCheckIn()}
                    className="flex-1 pill-yellow py-3.5 px-5 text-base inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {checkingIn
                        ? 'ფიქსირდება...'
                        : 'შემოსვლის დაფიქსირება (Check-In)'}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 pill-glass py-3.5 px-5 text-base inline-flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>ბეჭდვა / შენახვა</span>
                </button>
              </div>
            </div>
          )}
      </div>
    </section>
  );
};
