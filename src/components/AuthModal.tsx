"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
}: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg(
        "Supabase hali ulanmagan. .env.local fayliga NEXT_PUBLIC_SUPABASE_URL va NEXT_PUBLIC_SUPABASE_ANON_KEY qiymatlarini kiriting."
      );
      return;
    }

    setLoading(true);
    try {
      if (tab === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          throw error;
        }
        setSuccessMsg("Tizimga muvaffaqiyatli kirdingiz!");
        onAuthSuccess?.();
        setTimeout(() => {
          resetMessages();
          onClose();
        }, 700);
      } else {
        if (password.length < 6) {
          throw new Error("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone_number: phoneNumber.trim(),
            },
          },
        });
        if (error) {
          throw error;
        }

        if (data.session) {
          setSuccessMsg("Ro'yxatdan o'tish muvaffaqiyatli yakunlandi!");
          onAuthSuccess?.();
          setTimeout(() => {
            resetMessages();
            onClose();
          }, 900);
        } else {
          setSuccessMsg(
            "Hisob yaratildi! Email pochtangizga yuborilgan tasdiqlash havolasini bosing."
          );
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Kutilmagan xatolik yuz berdi.";
      if (msg.toLowerCase().includes("invalid login credentials")) {
        setErrorMsg("Email yoki parol noto'g'ri.");
      } else if (msg.toLowerCase().includes("user already registered")) {
        setErrorMsg("Bu email manzili allaqachon ro'yxatdan o'tgan.");
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Yopish"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#0F2942]">
            {tab === "login" ? "Hisobga kirish" : "Yangi hisob yaratish"}
          </h2>
          <p className="text-xs text-slate-500">
            E&apos;lon joylashtirish va boshqarish uchun tizimga kiring
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              resetMessages();
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              tab === "login"
                ? "bg-white text-[#0F2942] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Kirish
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              resetMessages();
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              tab === "register"
                ? "bg-white text-[#0F2942] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Ro&apos;yxatdan o&apos;tish
          </button>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {tab === "register" && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  To&apos;liq ismingiz *
                </label>
                <div className="relative mt-1">
                  <User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masalan: Azizbek Karimov"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pr-3 pl-9 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Telefon raqami
                </label>
                <div className="relative mt-1">
                  <Phone className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pr-3 pl-9 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Email manzili *
            </label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full rounded-xl border border-slate-200 py-2.5 pr-3 pl-9 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Parol *
            </label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kamida 6 ta belgi"
                className="w-full rounded-xl border border-slate-200 py-2.5 pr-3 pl-9 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F2942] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#163b5e] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
            ) : (
              <LogIn className="h-4 w-4 text-emerald-400" />
            )}
            <span>
              {loading
                ? "Kuting..."
                : tab === "login"
                ? "Kirish"
                : "Ro'yxatdan o'tish"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
