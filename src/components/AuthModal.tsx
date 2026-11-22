import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  MailCheck,
  ShieldCheck,
  Ticket,
  UserCheck,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { DemoUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  demoUser: DemoUser | null;
  purchasedCount: number;
  initialTab?: 'login' | 'signup';
  authGateNotice?: boolean;
  onClose: () => void;
  onOpenMyTickets: () => void;
  onOpenAdmin?: () => void;
  onAuthSuccess?: () => void;
  onNotify: (msg: string) => void;
}

type AuthTab = 'login' | 'signup' | 'reset';

function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'ელ-ფოსტა ან პაროლი არასწორია.';
  }
  if (lower.includes('email not confirmed')) {
    return 'გთხოვ ჯერ დაადასტურო ელ-ფოსტა მეილზე მოსული ბმულით.';
  }
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'ეს ელ-ფოსტა უკვე რეგისტრირებულია — სცადე შესვლა.';
  }
  if (lower.includes('password should be at least') || lower.includes('weak_password')) {
    return 'პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს.';
  }
  if (lower.includes('email rate limit') || lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'მცდელობების ლიმიტი დროებით ამოიწურა — გთხოვ სცადო რამდენიმე წამში.';
  }
  if (lower.includes('unable to validate email')) {
    return 'მიუთითე მოქმედი ელ-ფოსტის მისამართი.';
  }
  return message || 'ავტორიზაციის შეცდომა — სცადე ხელახლა.';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  demoUser,
  purchasedCount,
  initialTab = 'login',
  authGateNotice = false,
  onClose,
  onOpenMyTickets,
  onOpenAdmin,
  onAuthSuccess,
  onNotify,
}) => {
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [showPass, setShowPass] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [formMsg, setFormMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setFormMsg('');
      setResetSent(false);
      setConfirmationEmail(null);
      setSubmitting(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg('');
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormMsg('მიუთითე სწორი ელ-ფოსტა.');
      return;
    }
    if (password.length < 6) {
      setFormMsg('პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (error) {
        setFormMsg(translateAuthError(error.message));
        return;
      }
      if (data.session) {
        setPassword('');
        onNotify('წარმატებით შეხვედი ანგარიშში!');
        if (onAuthSuccess) {
          onAuthSuccess();
        } else {
          onClose();
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg('');
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (cleanName.length < 2) {
      setFormMsg('შეიყვანე სახელი და გვარი (მინიმუმ 2 სიმბოლო).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormMsg('მიუთითე მოქმედი ელ-ფოსტის მისამართი.');
      return;
    }
    if (cleanPhone.replace(/\D/g, '').length < 9) {
      setFormMsg('მიუთითე ტელეფონის ნომერი (მაგ: +995 599 12 34 56).');
      return;
    }
    if (password.length < 6) {
      setFormMsg('პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს.');
      return;
    }
    if (password !== confirmPass) {
      setFormMsg('პაროლები ერთმანეთს არ ემთხვევა.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setFormMsg(translateAuthError(error.message));
        return;
      }

      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setFormMsg('ეს ელ-ფოსტა უკვე რეგისტრირებულია — გადადი „შესვლა“ ტაბზე.');
        return;
      }

      if (data.session) {
        setPassword('');
        setConfirmPass('');
        onNotify('ანგარიში შეიქმნა! შეგიძლია ბილეთის შეძენა.');
        if (onAuthSuccess) {
          onAuthSuccess();
        } else {
          onClose();
        }
        return;
      }

      // Confirm email is enabled in Supabase project settings
      setConfirmationEmail(cleanEmail);
      setPassword('');
      setConfirmPass('');
      onNotify(`დადასტურების ბმული გაიგზავნა მისამართზე: ${cleanEmail}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg('');
    const cleanEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormMsg('მიუთითე შენი ელ-ფოსტა აღდგენის ბმულისთვის.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin,
      });
      if (error) {
        setFormMsg(translateAuthError(error.message));
        return;
      }
      setResetSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setSubmitting(true);
    try {
      await supabase.auth.signOut();
      onNotify('ანგარიშიდან გამოხვედი.');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#130409]/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="ანგარიშზე შესვლა"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md glass-card bg-[#19060D]/95 overflow-hidden shadow-2xl">
        <div className="bg-[#130409] border-b border-white/10 px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/images/wannabe-logo.png"
              alt="Wannabe Events"
              className="w-9 h-9 object-contain shrink-0"
            />
            <h2 className="font-display text-2xl leading-tight text-white">
              {demoUser ? 'ჩემი პროფილი' : 'ანგარიში'}
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

        {!demoUser && authGateNotice && (
          <div className="bg-poster-yellow text-[#130409] px-5 py-2.5 border-b border-black/15 text-xs font-bold flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              ბილეთის შესაძენად ჯერ შექმენი ანგარიში ან შედი სისტემაში.
            </span>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-5">
          {demoUser ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/5 border border-white/15 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs bg-poster-yellow text-[#130409] px-2.5 py-0.5 rounded-full font-bold">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>VERIFIED</span>
                    </span>
                    {demoUser.role === 'admin' && (
                      <span className="inline-flex items-center gap-1 font-mono text-xs bg-burgundy-600 text-poster-yellow border border-poster-yellow/50 px-2.5 py-0.5 rounded-full font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>ADMIN</span>
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-white/60">
                    {demoUser.handle}
                  </span>
                </div>
                <div className="font-display text-2xl text-white">
                  {demoUser.name}
                </div>
                <div className="text-sm text-white/80">{demoUser.email}</div>
                {demoUser.phone && (
                  <div className="font-mono text-xs text-poster-yellow">
                    {demoUser.phone}
                  </div>
                )}
              </div>

              {demoUser.role === 'admin' && onOpenAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdmin();
                  }}
                  className="pill-yellow w-full py-3 text-base inline-flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>ადმინ პანელი</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMyTickets();
                }}
                className={`${
                  demoUser.role === 'admin' ? 'pill-glass' : 'pill-yellow'
                } w-full py-3 text-base inline-flex items-center justify-center gap-2`}
              >
                <Ticket className="w-4 h-4" />
                <span>ჩემი ბილეთები ({purchasedCount})</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleLogout}
                className="pill-glass w-full py-2.5 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>{submitting ? 'გასვლა...' : 'პროფილიდან გამოსვლა'}</span>
              </button>
            </div>
          ) : confirmationEmail ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-burgundy-700/60 border border-poster-yellow/50 p-5 space-y-3 text-center">
                <MailCheck className="w-10 h-10 text-poster-yellow mx-auto" />
                <div className="font-display text-2xl text-white">
                  დაადასტურე ელ-ფოსტა
                </div>
                <p className="text-sm text-white/85 leading-relaxed">
                  დადასტურების ბმული გაიგზავნა მისამართზე{' '}
                  <strong className="text-poster-yellow">{confirmationEmail}</strong>.
                  გახსენი მეილი, დააჭირე დადასტურების ბმულს და შემდეგ შედი ანგარიშში.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setConfirmationEmail(null);
                  setTab('login');
                }}
                className="pill-yellow w-full py-3 text-base inline-flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>შესვლაზე გადასვლა</span>
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 p-1 rounded-full bg-[#130409] border border-white/15">
                {[
                  { id: 'login' as const, label: 'შესვლა' },
                  { id: 'signup' as const, label: 'რეგისტრაცია' },
                  { id: 'reset' as const, label: 'აღდგენა' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTab(t.id);
                      setFormMsg('');
                    }}
                    className={`py-2 rounded-full font-display text-sm leading-snug transition-colors ${
                      tab === t.id
                        ? 'bg-poster-yellow text-[#130409]'
                        : 'text-white/75 hover:text-poster-yellow'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="auth-login-email"
                      className="block font-display text-sm text-poster-yellow mb-1"
                    >
                      ელ-ფოსტა
                    </label>
                    <input
                      id="auth-login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#130409] border border-white/20 text-white placeholder:text-white/35 focus:outline-none focus:border-poster-yellow"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="auth-login-pass"
                      className="block font-display text-sm text-poster-yellow mb-1"
                    >
                      პაროლი
                    </label>
                    <div className="relative">
                      <input
                        id="auth-login-pass"
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[#130409] border border-white/20 text-white placeholder:text-white/35 focus:outline-none focus:border-poster-yellow"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((p) => !p)}
                        aria-label={showPass ? 'პაროლის დამალვა' : 'პაროლის ჩვენება'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-poster-yellow/75 hover:text-poster-yellow"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setTab('reset');
                        setFormMsg('');
                      }}
                      className="text-poster-yellow hover:underline"
                    >
                      დაგავიწყდა პაროლი?
                    </button>
                  </div>

                  {formMsg && (
                    <p className="text-xs text-poster-yellow bg-burgundy-700/60 border border-poster-yellow/35 rounded-xl p-2.5">
                      {formMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="pill-yellow w-full py-3 text-base disabled:opacity-50"
                  >
                    {submitting ? 'შემოწმება...' : 'შესვლა'}
                  </button>
                </form>
              )}

              {tab === 'signup' && (
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  <div>
                    <label
                      htmlFor="auth-signup-name"
                      className="block font-display text-sm text-poster-yellow mb-1"
                    >
                      სახელი და გვარი
                    </label>
                    <input
                      id="auth-signup-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="მაგ: გიორგი ბერიძე"
                      className="w-full px-4 py-2 rounded-xl bg-[#130409] border border-white/20 text-white placeholder:text-white/35 focus:outline-none focus:border-poster-yellow"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="auth-signup-email"
                        className="block font-display text-sm text-poster-yellow mb-1"
                      >
                        ელ-ფოსტა
                      </label>
                      <input
                        id="auth-signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full px-4 py-2 rounded-xl bg-[#130409] border border-white/20 text-white text-sm focus:outline-none focus:border-poster-yellow"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="auth-signup-phone"
                        className="block font-display text-sm text-poster-yellow mb-1"
                      >
                        ტელეფონი
                      </label>
                      <input
                        id="auth-signup-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+995 599 12 34 56"
                        className="w-full px-4 py-2 rounded-xl bg-[#130409] border border-white/20 font-mono text-sm text-white focus:outline-none focus:border-poster-yellow"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="auth-signup-pass"
                        className="block font-display text-sm text-poster-yellow mb-1"
                      >
                        პაროლი
                      </label>
                      <input
                        id="auth-signup-pass"
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="მინ. 6 სიმბოლო"
                        className="w-full px-4 py-2 rounded-xl bg-[#130409] border border-white/20 text-sm text-white focus:outline-none focus:border-poster-yellow"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="auth-signup-pass2"
                        className="block font-display text-sm text-poster-yellow mb-1"
                      >
                        გაიმეორე პაროლი
                      </label>
                      <input
                        id="auth-signup-pass2"
                        type={showPass ? 'text' : 'password'}
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2 rounded-xl bg-[#130409] border border-white/20 text-sm text-white focus:outline-none focus:border-poster-yellow"
                      />
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 text-xs text-white/75 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showPass}
                      onChange={(e) => setShowPass(e.target.checked)}
                      className="accent-poster-yellow"
                    />
                    <span>პაროლის ჩვენება</span>
                  </label>

                  {formMsg && (
                    <p className="text-xs text-poster-yellow bg-burgundy-700/60 border border-poster-yellow/35 rounded-xl p-2.5">
                      {formMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="pill-yellow w-full py-3 text-base disabled:opacity-50"
                  >
                    {submitting ? 'იქმნება...' : 'ანგარიშის შექმნა'}
                  </button>
                </form>
              )}

              {tab === 'reset' && (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <p className="text-sm text-white/75 leading-relaxed">
                    მიუთითე რეგისტრირებული ელ-ფოსტა — გამოგიგზავნით პაროლის განახლების ბმულს.
                  </p>
                  <div>
                    <label
                      htmlFor="auth-reset-email"
                      className="block font-display text-sm text-poster-yellow mb-1"
                    >
                      ელ-ფოსტა
                    </label>
                    <input
                      id="auth-reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#130409] border border-white/20 text-white focus:outline-none focus:border-poster-yellow"
                    />
                  </div>
                  {formMsg && (
                    <p className="text-xs text-poster-yellow bg-burgundy-700/60 border border-poster-yellow/35 rounded-xl p-2.5">
                      {formMsg}
                    </p>
                  )}
                  {resetSent && (
                    <p className="text-xs bg-burgundy-700/60 border border-poster-yellow/35 rounded-xl text-poster-yellow p-3">
                      აღდგენის ბმული გაიგზავნა მისამართზე: {email}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="pill-yellow w-full py-3 text-base disabled:opacity-50"
                  >
                    {submitting ? 'იგზავნება...' : 'ბმულის გაგზავნა'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
