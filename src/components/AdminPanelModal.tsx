import React, { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { DemoUser, PurchasedOrder } from '../types';
import { Gel } from './Gel';

interface AdminPanelModalProps {
  isOpen: boolean;
  adminUser: DemoUser | null;
  onClose: () => void;
  onOrdersChanged?: () => Promise<void> | void;
  onOpenTicketPass?: (orderCode: string) => void;
  onNotify: (msg: string) => void;
}

type StatusFilter = 'pending' | 'confirmed' | 'cancelled' | 'all';

function mapOrderRow(row: Record<string, unknown>): PurchasedOrder {
  const createdRaw = row.created_at ? String(row.created_at) : '';
  const reviewedRaw = row.reviewed_at ? String(row.reviewed_at) : null;
  const checkedRaw = row.checked_in_at ? String(row.checked_in_at) : null;
  return {
    id: String(row.id ?? ''),
    userId: String(row.user_id ?? ''),
    orderCode: String(row.order_code ?? ''),
    createdAt: createdRaw ? new Date(createdRaw).toLocaleString('ka-GE') : '',
    eventTitle: String(row.event_title ?? ''),
    eventDate: String(row.event_date ?? ''),
    venueName: String(row.venue_name ?? ''),
    address: String(row.address ?? ''),
    buyerName: String(row.buyer_name ?? ''),
    buyerEmail: String(row.buyer_email ?? ''),
    buyerPhone: String(row.buyer_phone ?? ''),
    quantity: Number(row.quantity ?? 1),
    unitPrice: Number(row.unit_price ?? 25),
    totalAmount: Number(row.total_amount ?? 25),
    bankName: String(row.bank_name ?? ''),
    bankIban: String(row.bank_iban ?? ''),
    transferNote: String(row.transfer_note ?? ''),
    status: (row.status as PurchasedOrder['status']) ?? 'pending',
    reviewedAt: reviewedRaw ? new Date(reviewedRaw).toLocaleString('ka-GE') : null,
    adminNote: String(row.admin_note ?? ''),
    checkedInAt: checkedRaw ? new Date(checkedRaw).toLocaleString('ka-GE') : null,
  };
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  adminUser,
  onClose,
  onOrdersChanged,
  onOpenTicketPass,
  onNotify,
}) => {
  const [orders, setOrders] = useState<PurchasedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [search, setSearch] = useState('');
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAllOrders = useCallback(async () => {
    if (!adminUser || adminUser.role !== 'admin') return;
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setErrorMsg(`შეკვეთების წამოღება ვერ მოხერხდა: ${error.message}`);
        return;
      }

      const mapped = (data ?? []).map((row) =>
        mapOrderRow(row as Record<string, unknown>)
      );
      setOrders(mapped);
      setNoteDrafts((prev) => {
        const next = { ...prev };
        for (const o of mapped) {
          if (o.id && next[o.id] === undefined) {
            next[o.id] = o.adminNote ?? '';
          }
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  }, [adminUser]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || adminUser?.role !== 'admin') return;
    void fetchAllOrders();

    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          void fetchAllOrders();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isOpen, adminUser, fetchAllOrders]);

  if (!isOpen || !adminUser || adminUser.role !== 'admin') return null;

  const handleUpdateStatus = async (
    ord: PurchasedOrder,
    nextStatus: 'confirmed' | 'cancelled' | 'pending'
  ) => {
    if (!ord.id || updatingId) return;
    setUpdatingId(ord.id);
    const adminNote = (noteDrafts[ord.id] ?? '').trim();
    const reviewedAt = nextStatus === 'pending' ? null : new Date().toISOString();
    const reviewedBy = nextStatus === 'pending' ? null : adminUser.id;

    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: nextStatus,
          admin_note: adminNote,
          reviewed_at: reviewedAt,
          reviewed_by: reviewedBy,
        })
        .eq('id', ord.id)
        .select()
        .single();

      if (error) {
        onNotify(`შეცდომა სტატუსის განახლებისას: ${error.message}`);
        return;
      }

      if (data) {
        const updated = mapOrderRow(data as Record<string, unknown>);
        setOrders((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      }

      const msg =
        nextStatus === 'confirmed'
          ? `#${ord.orderCode} დადასტურდა — QR ბილეთი გაეხსნა მომხმარებელს!`
          : nextStatus === 'cancelled'
          ? `#${ord.orderCode} უარყოფილია.`
          : `#${ord.orderCode} დაბრუნდა მოლოდინის სტატუსში.`;

      onNotify(msg);
      await onOrdersChanged?.();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCheckInOrder = async (ord: PurchasedOrder) => {
    if (!ord.id || updatingId) return;
    setUpdatingId(ord.id);
    try {
      const { error } = await supabase.rpc('check_in_ticket', {
        p_order_code: ord.orderCode,
      });
      if (error) {
        onNotify(`Check-In შეცდომა: ${error.message}`);
        return;
      }
      onNotify(`ბილეთი #${ord.orderCode} გატარდა კარზე (Check-In)!`);
      await fetchAllOrders();
      await onOrdersChanged?.();
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const confirmedList = orders.filter((o) => o.status === 'confirmed');
  const confirmedTicketsCount = confirmedList.reduce(
    (sum, o) => sum + o.quantity,
    0
  );
  const confirmedRevenue = confirmedList.reduce(
    (sum, o) => sum + o.totalAmount,
    0
  );
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  const q = search.trim().toLowerCase();
  const visibleOrders = orders.filter((o) => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (!q) return true;
    return (
      o.orderCode.toLowerCase().includes(q) ||
      o.buyerName.toLowerCase().includes(q) ||
      o.buyerEmail.toLowerCase().includes(q) ||
      o.buyerPhone.toLowerCase().includes(q) ||
      o.transferNote.toLowerCase().includes(q) ||
      o.bankName.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#130409]/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="ადმინ პანელი"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-6xl max-h-[92vh] glass-card bg-[#16050B] text-white overflow-hidden shadow-2xl flex flex-col border border-poster-yellow/35">
        {/* Header */}
        <div className="bg-[#130409] border-b border-white/10 px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-poster-yellow text-[#130409] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-white leading-none">
                ადმინ პანელი — მოთხოვნების მართვა
              </h2>
              <div className="font-mono text-xs text-poster-yellow mt-1">
                ADMIN: {adminUser.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void fetchAllOrders()}
              disabled={loading}
              className="pill-glass px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-poster-yellow ${
                  loading ? 'animate-spin' : ''
                }`}
              />
              <span>განახლება</span>
            </button>

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

        {/* KPI Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-5 sm:px-6 py-4 bg-[#1B060E] border-b border-white/10">
          <div className="rounded-xl bg-[#130409] border border-poster-yellow/35 p-3.5">
            <div className="text-xs text-white/65">მოლოდინში მოთხოვნა</div>
            <div className="font-display text-3xl text-poster-yellow mt-1 tabular-nums">
              {pendingCount}
            </div>
          </div>

          <div className="rounded-xl bg-[#130409] border border-white/12 p-3.5">
            <div className="text-xs text-white/65">დადასტურებული ბილეთი</div>
            <div className="font-display text-3xl text-white mt-1 tabular-nums">
              {confirmedTicketsCount}
            </div>
          </div>

          <div className="rounded-xl bg-[#130409] border border-white/12 p-3.5">
            <div className="text-xs text-white/65">დადასტურებული თანხა</div>
            <div className="font-display text-3xl text-poster-yellow mt-1 tabular-nums">
              {confirmedRevenue}
              <Gel />
            </div>
          </div>

          <div className="rounded-xl bg-[#130409] border border-white/12 p-3.5">
            <div className="text-xs text-white/65">უარყოფილი</div>
            <div className="font-display text-3xl text-white/75 mt-1 tabular-nums">
              {cancelledCount}
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#130409]/80 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'pending', label: `მოლოდინში (${pendingCount})` },
                {
                  id: 'confirmed',
                  label: `დადასტურებული (${confirmedList.length})`,
                },
                { id: 'cancelled', label: `უარყოფილი (${cancelledCount})` },
                { id: 'all', label: `ყველა (${orders.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full font-display text-xs transition-colors ${
                  filter === tab.id
                    ? 'bg-poster-yellow text-[#130409]'
                    : 'bg-white/5 border border-white/15 text-white/80 hover:border-poster-yellow hover:text-poster-yellow'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative lg:w-80">
            <Search className="w-4 h-4 text-poster-yellow/75 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ძებნა: სახელი, კოდი, ტელეფონი..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-[#130409] border border-white/20 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-poster-yellow"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5">
          {errorMsg && (
            <div className="rounded-xl bg-red-500/15 border border-red-400/40 p-4 text-xs text-red-200">
              {errorMsg}
            </div>
          )}

          {loading && orders.length === 0 ? (
            <div className="text-center py-12 text-sm text-white/60">
              იტვირთება მოთხოვნები...
            </div>
          ) : visibleOrders.length === 0 ? (
            <div className="rounded-2xl bg-[#1B060E] border border-white/10 p-10 text-center space-y-2">
              <Clock className="w-8 h-8 text-poster-yellow mx-auto opacity-80" />
              <div className="font-display text-xl text-white">
                ამ ფილტრში მოთხოვნები არ არის
              </div>
              <p className="text-xs text-white/60">
                როცა მომხმარებელი გააგზავნის ბილეთის ყიდვის მოთხოვნას, აქ გამოჩნდება
                დასადასტურებლად.
              </p>
            </div>
          ) : (
            visibleOrders.map((ord) => {
              const rowKey = ord.id ?? ord.orderCode;
              const isUpdating = updatingId === ord.id;
              return (
                <article
                  key={rowKey}
                  className="rounded-2xl bg-[#1B060E] border border-white/15 p-4 sm:p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-poster-yellow">
                          #{ord.orderCode}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            ord.status === 'confirmed'
                              ? 'bg-poster-yellow text-[#130409]'
                              : ord.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-200 border border-red-400/35'
                              : 'bg-burgundy-600 text-poster-yellow border border-poster-yellow/40'
                          }`}
                        >
                          {ord.status === 'confirmed'
                            ? 'დადასტურებული'
                            : ord.status === 'cancelled'
                            ? 'უარყოფილი'
                            : 'მოლოდინში'}
                        </span>
                        <span className="font-mono text-[11px] text-white/55">
                          {ord.createdAt}
                        </span>
                      </div>

                      <div className="font-display text-xl text-white">
                        {ord.buyerName}
                      </div>
                      <div className="font-mono text-xs text-white/75">
                        {ord.buyerEmail} • {ord.buyerPhone}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="font-display text-2xl text-poster-yellow leading-none">
                        {ord.totalAmount}
                        <Gel />
                      </div>
                      <div className="text-xs text-white/70 mt-1">
                        {ord.quantity} ბილეთი × {ord.unitPrice} ₾
                      </div>
                      <div className="font-mono text-[11px] text-white/60 mt-0.5">
                        {ord.bankName}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#130409] border border-white/10 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-white/70">
                      გადარიცხვის დანიშნულება:{' '}
                      <strong className="text-poster-yellow font-mono">
                        {ord.transferNote}
                      </strong>
                    </span>
                    <span className="font-mono text-[11px] text-white/55">
                      {ord.bankIban}
                    </span>
                  </div>

                  {/* Admin Comment + Status Actions */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 pt-1">
                    <input
                      type="text"
                      value={noteDrafts[rowKey] ?? ''}
                      onChange={(e) =>
                        setNoteDrafts((prev) => ({
                          ...prev,
                          [rowKey]: e.target.value,
                        }))
                      }
                      placeholder="ადმინის შენიშვნა (არასავალდებულო)..."
                      className="flex-1 px-3.5 py-2 rounded-full bg-[#130409] border border-white/15 text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-poster-yellow"
                    />

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {ord.status === 'confirmed' && ord.checkedInAt && (
                        <span className="px-3 py-1.5 rounded-full bg-burgundy-600 text-poster-yellow border border-poster-yellow/40 font-mono text-[11px] font-bold">
                          შემოსულია • {ord.checkedInAt}
                        </span>
                      )}

                      {ord.status === 'confirmed' && !ord.checkedInAt && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => void handleCheckInOrder(ord)}
                          className="pill-yellow px-3.5 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Check-In</span>
                        </button>
                      )}

                      {ord.status === 'confirmed' && onOpenTicketPass && (
                        <button
                          type="button"
                          onClick={() => onOpenTicketPass(ord.orderCode)}
                          className="pill-glass px-3.5 py-2 text-xs inline-flex items-center gap-1.5"
                        >
                          <span>ბილეთის გახსნა</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {ord.status !== 'confirmed' && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => void handleUpdateStatus(ord, 'confirmed')}
                          className="pill-yellow px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>დადასტურება (QR გახსნა)</span>
                        </button>
                      )}

                      {ord.status !== 'cancelled' && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => void handleUpdateStatus(ord, 'cancelled')}
                          className="px-4 py-2 rounded-full border border-red-400/45 text-red-200 hover:bg-red-500/20 font-display text-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>უარყოფა</span>
                        </button>
                      )}

                      {ord.status !== 'pending' && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => void handleUpdateStatus(ord, 'pending')}
                          className="pill-glass px-3.5 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>მოლოდინში დაბრუნება</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
