import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { CheckCircle2, X } from 'lucide-react';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { EventsLineup } from './components/EventsLineup';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { HowToBuy } from './components/HowToBuy';
import { LocationSection } from './components/LocationSection';
import { MyTicketsModal } from './components/MyTicketsModal';
import { Navbar } from './components/Navbar';
import { TicketPassPage } from './components/TicketPassPage';
import { TicketsSection } from './components/TicketsSection';
import { MAIN_EVENT } from './data/events';
import { supabase } from './lib/supabase';
import type { DemoUser, PurchasedOrder } from './types';

const FAVS_STORAGE_KEY = 'wannabe_favs_v2';

function getTicketFromUrl(): string | null {
  try {
    const raw = new URLSearchParams(window.location.search).get('ticket');
    return raw && raw.trim() ? raw.trim() : null;
  } catch {
    return null;
  }
}

function readStoredFavs(): string[] {
  try {
    const raw = window.localStorage.getItem(FAVS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function mapSupabaseUser(
  user: User,
  profile?: {
    full_name?: string | null;
    phone?: string | null;
    role?: string | null;
  } | null
): DemoUser {
  const email = user.email ?? '';
  const metaName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name.trim()
      : '';
  const metaPhone =
    typeof user.user_metadata?.phone === 'string'
      ? user.user_metadata.phone.trim()
      : '';

  const name =
    profile?.full_name?.trim() || metaName || email.split('@')[0] || 'მომხმარებელი';
  const phone = profile?.phone?.trim() || metaPhone || '';
  const handle = `@${(email.split('@')[0] || 'member').toLowerCase()}`;
  const role = profile?.role === 'admin' ? 'admin' : 'user';

  return {
    id: user.id,
    name,
    email,
    phone,
    handle,
    role,
  };
}

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

function isMissingRelationError(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  return (
    err.code === '42P01' ||
    err.code === 'PGRST205' ||
    Boolean(err.message?.toLowerCase().includes('does not exist')) ||
    Boolean(err.message?.toLowerCase().includes('schema cache'))
  );
}

export const App: React.FC = () => {
  const [ticketQuantity, setTicketQuantity] = useState<number>(1);
  const [hasInteractedWithQty, setHasInteractedWithQty] = useState<boolean>(false);

  const [authUser, setAuthUser] = useState<DemoUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [purchasedOrders, setPurchasedOrders] = useState<PurchasedOrder[]>([]);
  const [ordersRefreshing, setOrdersRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => readStoredFavs());

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [authGateNotice, setAuthGateNotice] = useState(false);
  const [pendingCheckoutAfterAuth, setPendingCheckoutAfterAuth] = useState(false);

  const [myTicketsOpen, setMyTicketsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [scannedTicketCode, setScannedTicketCode] = useState<string | null>(() =>
    getTicketFromUrl()
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const onPopState = () => {
      setScannedTicketCode(getTicketFromUrl());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const openTicketPass = useCallback((orderCode: string) => {
    const clean = orderCode.trim();
    if (!clean) return;
    const url = `${window.location.pathname}?ticket=${encodeURIComponent(clean)}`;
    window.history.pushState(null, '', url);
    setMyTicketsOpen(false);
    setAdminOpen(false);
    setScannedTicketCode(clean);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closeTicketPass = useCallback(() => {
    const cleanUrl = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState(null, '', cleanUrl || '/');
    setScannedTicketCode(null);
  }, []);

  const pendingCheckoutRef = useRef(false);
  pendingCheckoutRef.current = pendingCheckoutAfterAuth;

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const id = window.setTimeout(() => setToastMsg(null), 4200);
    return () => window.clearTimeout(id);
  }, [toastMsg]);

  useEffect(() => {
    try {
      window.localStorage.setItem(FAVS_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore storage quota errors
    }
  }, [favorites]);

  const fetchUserOrders = useCallback(async (userId: string) => {
    setOrdersRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        setPurchasedOrders(
          data.map((row) => mapOrderRow(row as Record<string, unknown>))
        );
      }
    } finally {
      setOrdersRefreshing(false);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!authUser) return;
    await fetchUserOrders(authUser.id);
  }, [authUser, fetchUserOrders]);

  const hydrateFromSession = useCallback(
    async (user: User) => {
      setAuthUser(mapSupabaseUser(user));

      try {
        const [profileRes, ordersRes, favsRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('full_name, phone, role')
            .eq('id', user.id)
            .maybeSingle(),
          supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase.from('favorites').select('slot_id').eq('user_id', user.id),
        ]);

        if (!profileRes.error && profileRes.data) {
          const mappedUser = mapSupabaseUser(user, profileRes.data);
          setAuthUser(mappedUser);
          if (mappedUser.role === 'admin' && window.location.hash === '#admin') {
            setAdminOpen(true);
          }
        }

        if (!ordersRes.error && Array.isArray(ordersRes.data)) {
          setPurchasedOrders(
            ordersRes.data.map((row) => mapOrderRow(row as Record<string, unknown>))
          );
        } else {
          setPurchasedOrders([]);
        }

        if (!favsRes.error && Array.isArray(favsRes.data)) {
          setFavorites(favsRes.data.map((r) => r.slot_id));
        }
      } catch {
        // Keep authenticated session resilient even on transient network errors
      }

      if (pendingCheckoutRef.current) {
        setPendingCheckoutAfterAuth(false);
        setAuthGateNotice(false);
        setAuthOpen(false);
        setCheckoutOpen(true);
      }
    },
    []
  );

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!active) return;
        if (data.session?.user) {
          await hydrateFromSession(data.session.user);
        }
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session?.user) {
        void hydrateFromSession(session.user);
      } else {
        setAuthUser(null);
        setPurchasedOrders([]);
        setCheckoutOpen(false);
        setAdminOpen(false);
      }
      setAuthReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [hydrateFromSession]);

  // Listen to live status changes so admin approvals unlock the user's QR ticket automatically
  useEffect(() => {
    if (!authUser) return;

    const channel = supabase
      .channel(`user-orders-${authUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${authUser.id}`,
        },
        (payload) => {
          void fetchUserOrders(authUser.id);
          const nextRow = payload.new as Record<string, unknown> | undefined;
          if (payload.eventType === 'UPDATE' && nextRow?.status === 'confirmed') {
            showToast(
              `გილოცავ! მოთხოვნა #${String(nextRow.order_code ?? '')} დადასტურდა — QR ბილეთი გახსნილია!`
            );
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [authUser, fetchUserOrders, showToast]);

  const handleSetQuantity = (qty: number) => {
    const clamped = Math.max(1, Math.min(6, qty));
    setTicketQuantity(clamped);
    setHasInteractedWithQty(true);
  };

  const openAuthModal = (
    tab: 'login' | 'signup' = 'login',
    withGateNotice = false
  ) => {
    setAuthModalTab(tab);
    setAuthGateNotice(withGateNotice);
    setAuthOpen(true);
  };

  const requestCheckout = () => {
    if (!authUser) {
      setPendingCheckoutAfterAuth(true);
      openAuthModal('signup', true);
      showToast('ბილეთის შესაძენად ჯერ შექმენი ანგარიში ან შედი სისტემაში.');
      return;
    }
    setCheckoutOpen(true);
  };

  const openMyTickets = () => {
    if (!authUser) {
      openAuthModal('login', false);
      showToast('შენი ბილეთების სანახავად შედი ანგარიშში.');
      return;
    }
    setMyTicketsOpen(true);
    void refreshOrders();
  };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    setAuthGateNotice(false);
    if (pendingCheckoutAfterAuth) {
      setPendingCheckoutAfterAuth(false);
      setCheckoutOpen(true);
    }
  };

  const handleToggleFavorite = async (slotId: string) => {
    const exists = favorites.includes(slotId);
    const next = exists
      ? favorites.filter((id) => id !== slotId)
      : [...favorites, slotId];
    setFavorites(next);
    showToast(exists ? 'წაიშალა რჩეულებიდან.' : 'დაემატა რჩეულებში.');

    if (authUser) {
      if (exists) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', authUser.id)
          .eq('slot_id', slotId);
      } else {
        await supabase
          .from('favorites')
          .upsert(
            { user_id: authUser.id, slot_id: slotId },
            { onConflict: 'user_id,slot_id' }
          );
      }
    }
  };

  const handleOrderComplete = async (
    order: PurchasedOrder
  ): Promise<{ ok: boolean; error?: string }> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCheckoutOpen(false);
      setPendingCheckoutAfterAuth(true);
      openAuthModal('signup', true);
      return {
        ok: false,
        error: 'ბილეთის შესაძენად ჯერ შექმენი ანგარიში ან შედი სისტემაში.',
      };
    }

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_code: order.orderCode,
        event_id: MAIN_EVENT.id,
        event_title: order.eventTitle,
        event_date: order.eventDate,
        venue_name: order.venueName,
        address: order.address,
        buyer_name: order.buyerName,
        buyer_email: order.buyerEmail,
        buyer_phone: order.buyerPhone,
        quantity: order.quantity,
        unit_price: order.unitPrice,
        total_amount: order.totalAmount,
        bank_name: order.bankName,
        bank_iban: order.bankIban,
        transfer_note: order.transferNote,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      if (isMissingRelationError(error)) {
        return {
          ok: false,
          error:
            'Supabase ბაზის ცხრილი (orders) ჯერ არ არის ატვირთული — გაუშვი supabase/schema.sql Supabase SQL Editor-ში.',
        };
      }
      return {
        ok: false,
        error: `მოთხოვნის გაგზავნა ვერ მოხერხდა: ${error.message}`,
      };
    }

    const savedOrder = data
      ? mapOrderRow(data as Record<string, unknown>)
      : { ...order, status: 'pending' as const };

    setPurchasedOrders((prev) => [savedOrder, ...prev]);
    setHasInteractedWithQty(false);
    setTicketQuantity(1);
    showToast(
      `მოთხოვნა #${order.orderCode} გაგზავნილია! ადმინის დადასტურების შემდეგ გამოჩნდება QR ბილეთი.`
    );
    return { ok: true };
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#130409] text-white">
      <Navbar
        cartCount={hasInteractedWithQty ? ticketQuantity : 0}
        purchasedCount={purchasedOrders.length}
        demoUser={authUser}
        onOpenCheckout={requestCheckout}
        onOpenAuth={() => openAuthModal('login', false)}
        onOpenMyTickets={openMyTickets}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      <main className="flex-1">
        {scannedTicketCode ? (
          <TicketPassPage
            ticketCode={scannedTicketCode}
            authUser={authUser}
            authLoading={!authReady}
            onBackHome={closeTicketPass}
            onOpenAuth={() => openAuthModal('login', false)}
            onOpenAdmin={() => {
              closeTicketPass();
              setAdminOpen(true);
            }}
            onNotify={showToast}
          />
        ) : (
          <>
            <Hero
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onBuyTicket={requestCheckout}
              onSelectSlotAndScroll={() => {
                document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreLineup={() => {
                document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onNotify={showToast}
            />

            <EventsLineup
              onGoToTickets={() => {
                document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <TicketsSection
              quantity={ticketQuantity}
              onSetQuantity={handleSetQuantity}
              onOpenCheckout={requestCheckout}
              onNotify={showToast}
            />

            <HowToBuy onStartBuy={requestCheckout} onNotify={showToast} />

            <LocationSection
              onOpenCheckout={requestCheckout}
              onNotify={showToast}
            />

            <FaqSection />
          </>
        )}
      </main>

      <Footer
        onOpenCheckout={requestCheckout}
        onOpenAuth={() => openAuthModal('login', false)}
        onNotify={showToast}
      />

      <CheckoutModal
        isOpen={checkoutOpen && Boolean(authUser)}
        quantity={ticketQuantity}
        demoUser={authUser}
        onClose={() => setCheckoutOpen(false)}
        onSetQuantity={handleSetQuantity}
        onOrderComplete={handleOrderComplete}
        onRequireAuth={() => {
          setCheckoutOpen(false);
          setPendingCheckoutAfterAuth(true);
          openAuthModal('signup', true);
        }}
        onOpenMyTickets={openMyTickets}
        onNotify={showToast}
      />

      <AuthModal
        isOpen={authOpen}
        demoUser={authUser}
        purchasedCount={purchasedOrders.length}
        initialTab={authModalTab}
        authGateNotice={authGateNotice}
        onClose={() => {
          setAuthOpen(false);
          setPendingCheckoutAfterAuth(false);
          setAuthGateNotice(false);
        }}
        onOpenMyTickets={openMyTickets}
        onOpenAdmin={() => setAdminOpen(true)}
        onAuthSuccess={handleAuthSuccess}
        onNotify={showToast}
      />

      <MyTicketsModal
        isOpen={myTicketsOpen}
        orders={purchasedOrders}
        onClose={() => setMyTicketsOpen(false)}
        onGoBuy={requestCheckout}
        onRefresh={refreshOrders}
        refreshing={ordersRefreshing}
        onOpenTicketPass={authUser?.role === 'admin' ? openTicketPass : undefined}
      />

      <AdminPanelModal
        isOpen={adminOpen && authUser?.role === 'admin'}
        adminUser={authUser}
        onClose={() => setAdminOpen(false)}
        onOrdersChanged={refreshOrders}
        onOpenTicketPass={openTicketPass}
        onNotify={showToast}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-sm bg-poster-yellow text-[#130409] rounded-full px-5 py-3 shadow-2xl flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-display text-sm leading-snug flex-1">{toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            aria-label="შეტყობინების დახურვა"
            className="p-1 rounded-full hover:bg-black/15"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
