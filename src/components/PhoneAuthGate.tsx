"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Home,
  Loader2,
  Phone,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import {
  AUTH_CHANGED_EVENT,
  clearPhoneSession,
  formatUzPhoneDisplay,
  formatUzPhoneInput,
  getStoredPhoneSession,
  PhoneUserSession,
  savePhoneSession,
  toE164UzPhone,
  upsertUserProfile,
} from "@/lib/phoneAuth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { sanitizeText } from "@/lib/validation";

interface PhoneAuthContextValue {
  session: PhoneUserSession | null;
  signOut: () => Promise<void>;
}

const PhoneAuthContext = createContext<PhoneAuthContextValue>({
  session: null,
  signOut: async () => {},
});

export function usePhoneAuth() {
  return useContext(PhoneAuthContext);
}

export default function PhoneAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showToast } = useToast();
  const [session, setSession] = useState<PhoneUserSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  // 2-bosqichli forma holatlari
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState(""); // 9 ta raqam
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isDemoOtpMode, setIsDemoOtpMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const syncSession = useCallback(async () => {
    const stored = getStoredPhoneSession();
    if (stored) {
      setSession(stored);
      setIsReady(true);
      return;
    }

    if (isSupabaseConfigured && supabase) {
      const {
        data: { session: supaSession },
      } = await supabase.auth.getSession();

      if (supaSession?.user) {
        const user = supaSession.user;
        const phone =
          user.phone ||
          (user.user_metadata?.phone_number as string | undefined) ||
          "";
        const name =
          (user.user_metadata?.full_name as string | undefined) ||
          user.email ||
          "Foydalanuvchi";

        if (phone || user.email) {
          const restored: PhoneUserSession = {
            id: user.id,
            full_name: name,
            phone_number: phone,
            isDemo: false,
            created_at: user.created_at || new Date().toISOString(),
          };
          savePhoneSession(restored);
          setSession(restored);
          setIsReady(true);
          return;
        }
      }
    }

    setSession(null);
    setIsReady(true);
  }, []);

  useEffect(() => {
    syncSession();

    const onAuthChanged = () => {
      setSession(getStoredPhoneSession());
    };
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);

    let sub: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, supaSess) => {
        if (!supaSess && !getStoredPhoneSession()) {
          setSession(null);
        }
      });
      sub = data.subscription;
    }

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
      sub?.unsubscribe();
    };
  }, [syncSession]);

  // 60 soniyalik taymer (2-bosqichda)
  useEffect(() => {
    if (step !== 2 || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSignOut = useCallback(async () => {
    await clearPhoneSession();
    setSession(null);
    setStep(1);
    setOtpDigits(["", "", "", ""]);
    setErrorMsg(null);
    showToast({ type: "info", message: "Hisobingizdan chiqdingiz." });
  }, [showToast]);

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 9);
    setPhoneDigits(onlyDigits);
  };

  const sendOtpCode = async () => {
    setErrorMsg(null);
    const cleanName = sanitizeText(fullName);
    if (cleanName.length < 2) {
      setErrorMsg("Iltimos, ism va familiyangizni kiriting.");
      return;
    }
    if (phoneDigits.length !== 9) {
      setErrorMsg("Iltimos, 9 xonali telefon raqamingizni to'liq kiriting.");
      return;
    }

    setLoading(true);
    const e164 = toE164UzPhone(phoneDigits);
    let demoFallback = true;

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOtp({
          phone: e164,
          options: {
            data: { full_name: cleanName },
          },
        });
        if (!error) {
          demoFallback = false;
        }
      }
    } catch {
      demoFallback = true;
    } finally {
      setLoading(false);
    }

    setIsDemoOtpMode(demoFallback);
    setStep(2);
    setTimer(60);
    setOtpDigits(["", "", "", ""]);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);

    if (demoFallback) {
      showToast({
        type: "info",
        message: "Test rejimi: tasdiqlash uchun 1234 kodini kiriting.",
      });
    } else {
      showToast({
        type: "success",
        message: `${formatUzPhoneDisplay(phoneDigits)} raqamiga SMS kod yuborildi.`,
      });
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendOtpCode();
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setErrorMsg(null);

    if (digit && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    if (pasted.length === 4) {
      e.preventDefault();
      setOtpDigits(pasted.split(""));
      otpRefs.current[3]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const code = otpDigits.join("");
    if (code.length !== 4) {
      setErrorMsg("4 xonali tasdiqlash kodini to'liq kiriting.");
      return;
    }

    setLoading(true);
    const cleanName = sanitizeText(fullName);
    const formattedPhone = formatUzPhoneDisplay(phoneDigits);
    const e164 = toE164UzPhone(phoneDigits);

    try {
      if (!isDemoOtpMode && isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: e164,
          token: code,
          type: "sms",
        });

        if (error || !data.user) {
          throw new Error(
            error?.message || "SMS kod noto'g'ri yoki muddati tugagan."
          );
        }

        await upsertUserProfile(data.user.id, cleanName, formattedPhone);

        const newSession: PhoneUserSession = {
          id: data.user.id,
          full_name: cleanName,
          phone_number: formattedPhone,
          isDemo: false,
          created_at: data.user.created_at || new Date().toISOString(),
        };
        savePhoneSession(newSession);
        setSession(newSession);
        showToast({
          type: "success",
          message: `Xush kelibsiz, ${cleanName}!`,
        });
        return;
      }

      // Demo / Fallback rejimi (SMS provayder ulanmagan holatda istalgan 4 xonali kod, masalan 1234)
      const demoId = `phone-${phoneDigits}`;
      const newSession: PhoneUserSession = {
        id: demoId,
        full_name: cleanName,
        phone_number: formattedPhone,
        isDemo: true,
        created_at: new Date().toISOString(),
      };

      savePhoneSession(newSession);
      setSession(newSession);
      showToast({
        type: "success",
        message: `Xush kelibsiz, ${cleanName}!`,
      });
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Tasdiqlashda xatolik yuz berdi."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#081B33]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-slate-950 shadow-lg shadow-[#F59E0B]/25">
          <Home className="h-7 w-7" />
        </div>
        <Loader2 className="mt-4 h-6 w-6 animate-spin text-[#F59E0B]" />
      </div>
    );
  }

  if (!session) {
    const formattedTimer = `00:${String(timer).padStart(2, "0")}`;

    return (
      <div className="relative flex min-h-screen flex-col justify-end overflow-hidden bg-[#061325] px-4 py-6 md:justify-center md:px-10 lg:px-16">
        {/* Telefon uchun vertikal orqa fon */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[url('/images/hero-mobile-bg.jpg')] bg-cover bg-top md:hidden"
        />
        {/* Noutbuk / Kompyuter uchun keng gorizontal orqa fon */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden bg-[url('/images/hero-bg.jpg')] bg-cover bg-center md:block"
        />

        {/* Telefonda pastki forma uchun, noutbukda o'ng tarafdagi forma uchun silliq gradient qatlam */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#061325]/95 via-[#081B33]/55 to-transparent md:bg-gradient-to-r md:from-[#061325]/15 md:via-[#081B33]/40 md:to-[#061325]/90"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl justify-center md:justify-end">
          {/* O'ng / Pastki qism: Ro'yxatdan o'tish va kirish kartochkasi */}
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-white/20 bg-[#081B33]/80 p-6 text-white shadow-2xl backdrop-blur-xl sm:p-8">
          {/* Logo va sarlavha */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-slate-950 shadow-lg shadow-[#F59E0B]/30">
              <Home className="h-7 w-7" />
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white">
              Uy <span className="text-[#F59E0B]">Joy</span>
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
              Xush kelibsiz! Davom etish uchun telefon raqamingizni kiriting
            </p>
          </div>

          {/* Bosqich indikatori */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <span
              className={`h-1.5 w-12 rounded-full transition-colors ${
                step === 1 ? "bg-[#F59E0B]" : "bg-[#F59E0B]/40"
              }`}
            />
            <span
              className={`h-1.5 w-12 rounded-full transition-colors ${
                step === 2 ? "bg-[#F59E0B]" : "bg-white/20"
              }`}
            />
          </div>

          {errorMsg && (
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-400/40 bg-rose-500/20 p-3.5 text-xs font-medium text-rose-100">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-200">
                  Ism va familiya *
                </label>
                <div className="relative mt-1.5">
                  <UserIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#F59E0B]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masalan: Azizbek Karimov"
                    className="w-full rounded-2xl border border-white/20 bg-white/10 py-3 pr-4 pl-10 text-sm text-white placeholder:text-slate-300 focus:border-[#F59E0B] focus:bg-white/15 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200">
                  Telefon raqamingiz *
                </label>
                <div className="mt-1.5 flex items-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 focus-within:border-[#F59E0B] focus-within:bg-white/15">
                  <div className="flex items-center gap-1.5 border-r border-white/20 bg-white/10 px-3.5 py-3 text-sm font-bold text-white">
                    <Phone className="h-4 w-4 text-[#F59E0B]" />
                    <span>+998</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    value={formatUzPhoneInput(phoneDigits)}
                    onChange={handlePhoneInputChange}
                    placeholder="(90) 123-45-67"
                    className="w-full bg-transparent px-3.5 py-3 text-sm font-semibold tracking-wide text-white placeholder:font-normal placeholder:text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-[#F59E0B]/25 transition-all hover:brightness-110 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>SMS kod olish</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 text-center">
                <p className="text-xs text-slate-200">
                  Tasdiqlash kodi quyidagi raqamga yuborildi:
                </p>
                <p className="mt-1 text-sm font-extrabold text-white">
                  {formatUzPhoneDisplay(phoneDigits)}
                </p>
                {isDemoOtpMode && (
                  <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#F59E0B]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#FCD34D]">
                    <CheckCircle2 className="h-3 w-3" />
                    Test rejimi: istalgan 4 xonali kod (masalan: 1234)
                  </p>
                )}
              </div>

              {/* 4 xonali OTP katakchalar */}
              <div className="flex justify-center gap-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    aria-label={`Kod raqami ${idx + 1}`}
                    className="h-14 w-14 rounded-2xl border-2 border-white/25 bg-white/10 text-center text-xl font-extrabold text-white transition-colors focus:border-[#F59E0B] focus:bg-white/20 focus:outline-none"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-[#F59E0B]/25 transition-all hover:brightness-110 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Tasdiqlash va kirish</span>
                )}
              </button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg(null);
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-slate-200 hover:text-[#F59E0B]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Raqamni o&apos;zgartirish</span>
                </button>

                {timer > 0 ? (
                  <span className="font-medium text-slate-300">
                    Kodni qayta yuborish {formattedTimer}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={sendOtpCode}
                    className="font-bold text-[#F59E0B] hover:underline"
                  >
                    Qayta yuborish
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-white/15 pt-4 text-[11px] text-slate-300">
            <ShieldCheck className="h-4 w-4 text-[#F59E0B]" />
            <span>Ma&apos;lumotlaringiz xavfsiz himoyalangan</span>
          </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PhoneAuthContext.Provider value={{ session, signOut: handleSignOut }}>
      {children}
    </PhoneAuthContext.Provider>
  );
}

