"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Plus, Search, User } from "lucide-react";

interface BottomNavProps {
  onSearchClick?: () => void;
  onProfileClick?: () => void;
  activeTab?: "home" | "search" | "favorites" | "profile";
}

export default function BottomNav({
  onSearchClick,
  onProfileClick,
  activeTab,
}: BottomNavProps) {
  const pathname = usePathname();
  const current =
    activeTab ||
    (pathname === "/dashboard"
      ? "profile"
      : pathname === "/"
      ? "home"
      : undefined);

  return (
    <nav
      aria-label="Pastki navigatsiya"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/60 bg-white/75 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl transition-colors dark:border-slate-700/60 dark:bg-[#151F32]/80 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
    >
      <div className="mx-auto grid h-16 max-w-3xl grid-cols-5 items-center px-2">
        {/* 1. Bosh sahifa */}
        <Link
          href="/"
          className={`relative flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-colors ${
            current === "home"
              ? "text-[#0B1F3A] dark:text-[#F59E0B]"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Bosh sahifa</span>
          {current === "home" && (
            <span className="absolute bottom-0.5 h-0.5 w-8 rounded-full bg-[#F59E0B]" />
          )}
        </Link>

        {/* 2. Qidirish */}
        {onSearchClick ? (
          <button
            type="button"
            onClick={onSearchClick}
            className={`relative flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-colors ${
              current === "search"
                ? "text-[#0B1F3A] dark:text-[#F59E0B]"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            <Search className="h-5 w-5" />
            <span>Qidirish</span>
            {current === "search" && (
              <span className="absolute bottom-0.5 h-0.5 w-8 rounded-full bg-[#F59E0B]" />
            )}
          </button>
        ) : (
          <Link
            href="/#search-bar"
            className="relative flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400"
          >
            <Search className="h-5 w-5" />
            <span>Qidirish</span>
          </Link>
        )}

        {/* 3. E'lon joylash (Markaziy oltin + tugma) */}
        <div className="flex items-center justify-center">
          <Link
            href="/create-listing"
            aria-label="E'lon joylash"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-slate-950 shadow-lg shadow-[#F59E0B]/35 ring-4 ring-[#EEF2F8] transition-transform hover:scale-105 active:scale-95 dark:ring-[#0B1120]"
          >
            <Plus className="h-7 w-7 stroke-[2.5]" />
          </Link>
        </div>

        {/* 4. Sevimlilar */}
        <Link
          href="/dashboard?tab=favorites"
          className={`relative flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-colors ${
            current === "favorites"
              ? "text-[#0B1F3A] dark:text-[#F59E0B]"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <Heart className="h-5 w-5" />
          <span>Sevimlilar</span>
          {current === "favorites" && (
            <span className="absolute bottom-0.5 h-0.5 w-8 rounded-full bg-[#F59E0B]" />
          )}
        </Link>

        {/* 5. Profil */}
        {onProfileClick ? (
          <button
            type="button"
            onClick={onProfileClick}
            className={`relative flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-colors ${
              current === "profile"
                ? "text-[#0B1F3A] dark:text-[#F59E0B]"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            <User className="h-5 w-5" />
            <span>Profil</span>
            {current === "profile" && (
              <span className="absolute bottom-0.5 h-0.5 w-8 rounded-full bg-[#F59E0B]" />
            )}
          </button>
        ) : (
          <Link
            href="/dashboard"
            className={`relative flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-colors ${
              current === "profile"
                ? "text-[#0B1F3A] dark:text-[#F59E0B]"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            <User className="h-5 w-5" />
            <span>Profil</span>
            {current === "profile" && (
              <span className="absolute bottom-0.5 h-0.5 w-8 rounded-full bg-[#F59E0B]" />
            )}
          </Link>
        )}
      </div>
    </nav>
  );
}

