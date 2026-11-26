"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, LogOut, Menu, Plus, User, X } from "lucide-react";
import { ListingCategory } from "@/types/listing";

interface NavbarProps {
  activeCategory: ListingCategory;
  onSelectCategory: (category: ListingCategory) => void;
  onOpenPostModal: () => void;
  onOpenAuthModal: () => void;
  userEmail?: string | null;
  userName?: string | null;
  onSignOut?: () => void;
}

const NAV_ITEMS: { label: string; value: ListingCategory }[] = [
  { label: "Barchasi", value: "all" },
  { label: "Sotiladigan uylar", value: "sale" },
  { label: "Kvartira ijarasi", value: "rent" },
  { label: "Talabalar yotoqxonasi", value: "student_dorm" },
];

export default function Navbar({
  activeCategory,
  onSelectCategory,
  onOpenPostModal,
  onOpenAuthModal,
  userEmail,
  userName,
  onSignOut,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCategoryClick = (value: ListingCategory) => {
    onSelectCategory(value);
    setMobileMenuOpen(false);
  };

  const displayName = userName || userEmail;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          type="button"
          onClick={() => handleCategoryClick("all")}
          className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F2942] text-white shadow-sm">
            <Building2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-[#0F2942] leading-none">
              UyJoy<span className="text-emerald-600">.uz</span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 tracking-wide mt-0.5">
              UY-JOY & TALABALAR IJARASI
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeCategory === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleCategoryClick(item.value)}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#0F2942]/8 text-[#0F2942] font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-[#0F2942]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {displayName ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                title="Shaxsiy kabinet"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs font-semibold text-[#0F2942] transition-colors hover:bg-emerald-100"
              >
                <User className="h-4 w-4 text-emerald-600" />
                <span className="max-w-[130px] truncate">{displayName}</span>
              </Link>
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Chiqish"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-[#0F2942] transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <User className="h-4 w-4 text-slate-500" />
              <span>Kirish / Profil</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPostModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-500/25 transition-all hover:bg-emerald-600 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>E&apos;lon joylash</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={onOpenPostModal}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>E&apos;lon</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Menyuni ochish"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeCategory === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleCategoryClick(item.value)}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#0F2942] text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
            {displayName ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-[#0F2942]">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="truncate font-semibold hover:underline"
                >
                  {displayName} (Kabinet)
                </Link>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignOut();
                    }}
                    className="text-xs font-semibold text-rose-600"
                  >
                    Chiqish
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-[#0F2942]"
              >
                <User className="h-4 w-4 text-slate-500" />
                <span>Kirish / Profil</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
