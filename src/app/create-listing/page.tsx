"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { ArrowLeft, Building2, Loader2, Lock, LogIn } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import CreateListingForm from "@/components/CreateListingForm";
import Footer from "@/components/Footer";
import { usePhoneAuth } from "@/components/PhoneAuthGate";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function CreateListingPage() {
  const { session } = usePhoneAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(isSupabaseConfigured);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setCheckingAuth(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: supaSess } }) => {
      setCurrentUser(supaSess?.user ?? null);
      setCheckingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, supaSess) => {
      setCurrentUser(supaSess?.user ?? null);
      setCheckingAuth(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isAuthorized =
    !isSupabaseConfigured || Boolean(currentUser) || Boolean(session);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/70">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#0F2942]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Bosh sahifaga</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F2942] text-white">
              <Building2 className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#0F2942]">
              UyJoy<span className="text-emerald-600">.uz</span>
            </span>
          </Link>

          <div className="w-24 text-right text-xs font-medium text-slate-500">
            {currentUser?.email ? (
              <span className="inline-block max-w-[110px] truncate text-emerald-700">
                {currentUser.email}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F2942] sm:text-3xl">
            Yangi e&apos;lon joylash
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Uy-joy sotish, ijara yoki talabalar uchun yotoqxona e&apos;lonini
            bir necha daqiqada joylang.
          </p>
        </div>

        {checkingAuth ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="mt-3 text-sm font-medium">
              Hisobingiz tekshirilmoqda...
            </p>
          </div>
        ) : !isAuthorized ? (
          <div className="rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#0F2942]">
              Tizimga kirish talab qilinadi
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              E&apos;lon joylash va rasmlarni yuklash uchun avval hisobingizga
              kiring yoki ro&apos;yxatdan o&apos;ting.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-colors hover:bg-emerald-600 sm:w-auto"
              >
                <LogIn className="h-4 w-4" />
                <span>Kirish / Ro&apos;yxatdan o&apos;tish</span>
              </button>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
              >
                Bosh sahifaga qaytish
              </Link>
            </div>
          </div>
        ) : (
          <CreateListingForm userId={currentUser?.id ?? null} />
        )}
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

