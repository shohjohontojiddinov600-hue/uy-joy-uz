"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import {
  ArrowRight,
  Bell,
  Building2,
  GraduationCap,
  Home,
  KeyRound,
  MapPin,
  Moon,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Tag,
  User as UserIcon,
  X,
} from "lucide-react";
import AppListingCard from "@/components/AppListingCard";
import AuthModal from "@/components/AuthModal";
import BottomNav from "@/components/BottomNav";
import FilterModal, { ExtendedFilterState } from "@/components/FilterModal";
import { ListingCardSkeleton } from "@/components/Skeletons";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/components/ToastProvider";
import { MOCK_LISTINGS, UZBEKISTAN_REGIONS } from "@/data/mockListings";
import { fetchActiveListings } from "@/lib/listingsApi";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Listing, ListingCategory } from "@/types/listing";

const INITIAL_FILTERS: ExtendedFilterState = {
  category: "all",
  city: "Barchasi",
  district: "Barcha tumanlar",
  minPrice: "",
  maxPrice: "",
  rooms: "all",
  searchQuery: "",
  studentGender: "all",
};

const REGION_PILLS: { label: string; value: string }[] = [
  { label: "Barchasi", value: "Barchasi" },
  { label: "Toshkent", value: "Toshkent shahri" },
  { label: "Namangan", value: "Namangan viloyati" },
  { label: "Samarqand", value: "Samarqand viloyati" },
  { label: "Andijon", value: "Andijon viloyati" },
  { label: "Farg'ona", value: "Farg'ona viloyati" },
  { label: "Buxoro", value: "Buxoro viloyati" },
  { label: "Xorazm", value: "Xorazm viloyati" },
  { label: "Qashqadaryo", value: "Qashqadaryo viloyati" },
  { label: "Surxondaryo", value: "Surxondaryo viloyati" },
  { label: "Jizzax", value: "Jizzax viloyati" },
  { label: "Sirdaryo", value: "Sirdaryo viloyati" },
  { label: "Navoiy", value: "Navoiy viloyati" },
  { label: "Qoraqalpog'iston", value: "Qoraqalpog'iston" },
];

const PROMO_SLIDES = [
  {
    title: "Orzuyingizdagi uyni toping!",
    subtitle: "Siz uchun eng yaxshi variantlar bir joyda",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Talabalar uchun qulay joylar",
    subtitle: "OTM yaqinidagi tekshirilgan yotoqxona va kvartiralar",
    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Xavfsiz va tez bitimlar",
    subtitle: "Uy egalari bilan vositachilarsiz to'g'ridan-to'g'ri aloqa",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [filters, setFilters] =
    useState<ExtendedFilterState>(INITIAL_FILTERS);
  const [loadingListings, setLoadingListings] =
    useState(isSupabaseConfigured);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    fetchActiveListings()
      .then((dbListings) => {
        if (dbListings.length > 0) {
          setListings([...dbListings, ...MOCK_LISTINGS]);
        }
      })
      .finally(() => {
        setLoadingListings(false);
      });
  }, []);

  const handleSelectCategory = (category: ListingCategory) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? "all" : category,
    }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (filters.category !== "all" && item.category !== filters.category) {
        return false;
      }

      if (filters.city !== "Barchasi") {
        const cityPrefix = filters.city.split(" ")[0].toLowerCase();
        const itemCityLower = item.city.toLowerCase();
        if (
          itemCityLower !== filters.city.toLowerCase() &&
          !itemCityLower.startsWith(cityPrefix)
        ) {
          return false;
        }
      }

      if (
        filters.district &&
        filters.district !== "Barcha tumanlar" &&
        !item.district.toLowerCase().includes(filters.district.toLowerCase())
      ) {
        return false;
      }

      if (filters.rooms !== "all") {
        if (filters.rooms === "4+") {
          if (item.rooms < 4) return false;
        } else {
          if (item.rooms !== Number(filters.rooms)) return false;
        }
      }

      if (
        filters.studentGender !== "all" &&
        item.student_gender !== filters.studentGender
      ) {
        return false;
      }

      if (filters.minPrice) {
        const minVal = parseFloat(filters.minPrice);
        if (!isNaN(minVal) && item.price < minVal) return false;
      }

      if (filters.maxPrice) {
        const maxVal = parseFloat(filters.maxPrice);
        if (!isNaN(maxVal) && item.price > maxVal) return false;
      }

      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCity = item.city.toLowerCase().includes(q);
        const matchesDistrict = item.district.toLowerCase().includes(q);
        const matchesAddress = (item.address || "").toLowerCase().includes(q);
        const matchesUniv = (item.nearUniversity || "")
          .toLowerCase()
          .includes(q);

        if (
          !matchesTitle &&
          !matchesCity &&
          !matchesDistrict &&
          !matchesAddress &&
          !matchesUniv
        ) {
          return false;
        }
      }

      return true;
    });
  }, [listings, filters]);

  const citySummary = useMemo(() => {
    const regions = Object.keys(UZBEKISTAN_REGIONS).filter(
      (r) => r !== "Barchasi"
    );
    return regions.map((region) => {
      const prefix = region.split(" ")[0].toLowerCase();
      const count = listings.filter(
        (l) =>
          l.city.toLowerCase() === region.toLowerCase() ||
          l.city.toLowerCase().startsWith(prefix)
      ).length;
      return [region, count] as const;
    });
  }, [listings]);

  const activePromo = PROMO_SLIDES[promoIndex];

  const handleProfileAction = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="mx-auto max-w-6xl px-4 pt-3 sm:px-6 sm:pt-4">
        {/* 1. YUQORI HEADER (Glassmorphism Sticky Top Bar) */}
        <header className="sticky top-3 z-30 flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/75 px-3.5 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl transition-colors dark:border-slate-700/60 dark:bg-[#151F32]/80 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#081B33] to-[#0F2D54] text-[#F59E0B] shadow-md shadow-[#081B33]/25 ring-1 ring-[#F59E0B]/30">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-[#081B33] leading-tight sm:text-lg dark:text-white">
                Uy <span className="text-[#D97706] dark:text-[#F59E0B]">Joy</span>
              </h1>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Orzuyingizdagi uy shu yerda!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tungi / Kunduzgi rejim tugmasi */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Tungi/Kunduzgi rejim"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-xs ring-1 ring-slate-200/70 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:text-amber-400 dark:ring-slate-700 dark:hover:bg-slate-700"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                showToast({
                  type: "info",
                  message:
                    "Yangi talabalar yotoqxonalari va tasdiqlangan e'lonlar qo'shildi!",
                })
              }
              aria-label="Bildirishnomalar"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-xs ring-1 ring-slate-200/70 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-800" />
            </button>

            <button
              type="button"
              onClick={handleProfileAction}
              aria-label="Profil"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1D61E7] shadow-xs ring-1 ring-slate-200/70 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:text-blue-400 dark:ring-slate-700 dark:hover:bg-slate-700"
            >
              <UserIcon className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* 2. QIDIRUV VA FILTR QATORI (Search Bar) */}
        <div id="search-bar" className="mt-4">
          <div className="flex items-center rounded-2xl bg-white/95 px-4 py-2 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/70 focus-within:ring-2 focus-within:ring-[#1D61E7] dark:bg-[#151F32] dark:ring-slate-700/70">
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  searchQuery: e.target.value,
                }))
              }
              placeholder="Viloyat, tuman yoki uylarni qidiring..."
              className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, searchQuery: "" }))
                }
                aria-label="Qidiruvni tozalash"
                className="mr-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <span className="h-5 w-px shrink-0 bg-slate-200 dark:bg-slate-700" />
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              aria-label="Filtr"
              className="ml-2.5 flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-bold text-[#1D61E7] transition-colors hover:bg-[#EAF2FF] dark:text-blue-400 dark:hover:bg-blue-500/15"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filtr</span>
            </button>
          </div>

          {filters.city !== "Barchasi" && (
            <div className="mt-2.5 flex items-center justify-between rounded-xl bg-[#EAF2FF] px-3.5 py-2 text-xs font-medium text-[#1D61E7] dark:bg-blue-500/15 dark:text-blue-300">
              <span>
                Hudud: <strong>{filters.city}</strong>
                {filters.district &&
                  filters.district !== "Barcha tumanlar" &&
                  `, ${filters.district}`}
              </span>
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    city: "Barchasi",
                    district: "Barcha tumanlar",
                  }))
                }
                className="font-bold underline"
              >
                Tozalash
              </button>
            </div>
          )}
        </div>

        {/* 3. ASOSIY PROMO BANNER (Navy & Gold Premium Hero Card) */}
        <section className="relative mt-5 overflow-hidden rounded-3xl bg-[#081B33] bg-[url('/images/hero-bg.jpg')] bg-cover bg-center shadow-[0_14px_40px_-8px_rgba(8,27,51,0.45)] ring-1 ring-[#F59E0B]/25">
          {/* Chap tomondan o'ngga to'q ko'k yoy/gradient qatlam — o'ngda bino ochiq ko'rinadi */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#081B33] via-[#081B33]/92 to-[#081B33]/15"
          />

          <div className="relative z-10 max-w-xl p-5 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F59E0B]/35 bg-[#F59E0B]/15 px-3 py-1 text-[11px] font-bold text-[#F59E0B]">
              <Home className="h-3.5 w-3.5" />
              <span>PREMIUM KO&apos;CHMAS MULK</span>
            </div>

            <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
              UY JOY <span className="text-[#F59E0B]">SOTUV</span>
            </h2>
            <p className="mt-1.5 text-xs font-medium text-slate-200 sm:text-sm">
              Orzudagi uy endi haqiqat bo&apos;lsin!
            </p>

            {/* 4 ta kichik ikonka-kartochka */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                {
                  label: "Domlar",
                  icon: Building2,
                  action: () => setFilters((p) => ({ ...p, category: "sale" })),
                },
                {
                  label: "Kvartiralar",
                  icon: Home,
                  action: () => setFilters((p) => ({ ...p, category: "rent" })),
                },
                {
                  label: "Talabalar joyi",
                  icon: GraduationCap,
                  action: () =>
                    setFilters((p) => ({ ...p, category: "student_dorm" })),
                },
                {
                  label: "Yer uchastkalari",
                  icon: MapPin,
                  action: () => setIsMapModalOpen(true),
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#0B1F3A]/80 px-2.5 py-2 text-left text-[11px] font-semibold text-white backdrop-blur-xs transition-colors hover:border-[#F59E0B]/60 hover:bg-[#0B1F3A]"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-[#F59E0B]" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("popular-listings")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] px-5 py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-[#F59E0B]/30 transition-all hover:brightness-110 sm:text-sm"
            >
              <span>Batafsil ma&apos;lumot / Qidirish</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* 4. 4 TA TEZKOR KATEGORIYA TUGMALARI (Quick Categories Grid) */}
        <section className="mt-5 grid grid-cols-4 gap-2.5 sm:gap-4">
          {[
            {
              key: "rent",
              label: "Ijara",
              icon: KeyRound,
              active: filters.category === "rent",
              onClick: () => handleSelectCategory("rent"),
            },
            {
              key: "sale",
              label: "Sotuv",
              icon: Tag,
              active: filters.category === "sale",
              onClick: () => handleSelectCategory("sale"),
            },
            {
              key: "student_dorm",
              label: "Talabalar",
              icon: Building2,
              active: filters.category === "student_dorm",
              onClick: () => handleSelectCategory("student_dorm"),
            },
            {
              key: "map",
              label: "Xarita",
              icon: MapPin,
              active: isMapModalOpen,
              onClick: () => setIsMapModalOpen(true),
            },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={cat.onClick}
                className={`flex flex-col items-center justify-center rounded-2xl bg-white p-3 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 sm:p-4 dark:bg-[#151F32] ${
                  cat.active
                    ? "ring-2 ring-[#1D61E7] bg-[#EAF2FF]/40 dark:ring-blue-400"
                    : "ring-1 ring-slate-200/70 hover:ring-[#1D61E7]/50 dark:ring-slate-700/60"
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${
                    cat.active
                      ? "bg-gradient-to-br from-[#1D61E7] to-[#1240A8] text-white"
                      : "bg-[#EAF2FF] text-[#1D61E7] dark:bg-blue-500/15 dark:text-blue-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="mt-2 text-xs font-bold text-slate-800 sm:text-sm dark:text-slate-100">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </section>

        {/* 4.5. HUDUDLAR BO'YICHA TEZKOR FILTR LENTASI (Horizontal Region Pills) */}
        <section className="mt-6">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
            {REGION_PILLS.map((pill) => {
              const isActive = filters.city === pill.value;
              return (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      city: pill.value,
                      district: "Barcha tumanlar",
                    }))
                  }
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#0B1F3A] to-[#153663] text-[#F59E0B] shadow-md shadow-[#0B1F3A]/25 ring-1 ring-[#F59E0B]/40"
                      : "bg-white/90 text-slate-700 shadow-xs ring-1 ring-slate-200/80 hover:bg-white dark:bg-[#151F32] dark:text-slate-200 dark:ring-slate-700/70 dark:hover:bg-slate-800"
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. "MASHHUR E'LONLAR" BO'LIMI */}
        <section id="popular-listings" className="mt-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl dark:text-white">
              🔥 Mashhur e&apos;lonlar
            </h2>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1D61E7] hover:underline sm:text-sm dark:text-blue-400"
            >
              <span>Barchasi</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {loadingListings ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <ListingCardSkeleton key={n} />
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {filteredListings.map((item) => (
                <AppListingCard key={item.id} listing={item} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-3xl bg-white p-10 text-center shadow-xs ring-1 ring-slate-200/70 dark:bg-[#151F32] dark:ring-slate-700/60">
              <RotateCcw className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
              <h3 className="mt-3 text-base font-bold text-slate-800 dark:text-white">
                Mos e&apos;lon topilmadi
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Qidiruv so&apos;zini yoki filtr parametrlarini o&apos;zgartirib
                ko&apos;ring.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 rounded-xl bg-[#1D61E7] px-4 py-2 text-xs font-bold text-white"
              >
                Filtrlarni tozalash
              </button>
            </div>
          )}
        </section>

        {/* 6. ISHONCH BANNERI (Xavfsiz bitim) */}
        <section className="mt-7">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#F59E0B]/30 bg-gradient-to-r from-[#081B33] to-[#0F2D54] p-4 shadow-md sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F59E0B]/15 text-[#F59E0B] ring-1 ring-[#F59E0B]/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-white sm:text-sm">
                  Xavfsiz bitim — Biz bilan xavfsiz xarid qiling
                </p>
                <p className="mt-0.5 text-[11px] text-slate-300 sm:text-xs">
                  E&apos;lon egalari tekshiriladi, shubhali oldindan to&apos;lovlardan
                  himoya.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSafetyModalOpen(true)}
              className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] px-3.5 py-2 text-xs font-extrabold text-slate-950 shadow-xs transition-all hover:brightness-110"
            >
              <span>Batafsil</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      </div>

      {/* 7. PASTKI NAVIGATSIYA PANELI (Glassmorphism Fixed Bottom Navigation Bar) */}
      <BottomNav
        activeTab="home"
        onSearchClick={() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }}
        onProfileClick={handleProfileAction}
      />

      {/* MODALS */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onChangeFilters={setFilters}
        onResetFilters={handleResetFilters}
        resultCount={filteredListings.length}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Xarita (Shaharlar bo'yicha ko'rish) modali */}
      {isMapModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-xs sm:items-center sm:p-4"
          onClick={() => setIsMapModalOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl dark:bg-[#151F32]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-700/70">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#1D61E7] dark:bg-blue-500/15 dark:text-blue-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Hududlar bo&apos;yicha xarita
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Shaharni tanlab e&apos;lonlarni ko&apos;ring
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {citySummary.map(([cityName, count]) => (
                <button
                  key={cityName}
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      city: cityName,
                      district: "Barcha tumanlar",
                    }));
                    setIsMapModalOpen(false);
                  }}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-[#F4F7FC] p-3 text-left transition-colors hover:border-[#1D61E7] hover:bg-[#EAF2FF] dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-blue-400"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[#1D61E7] dark:text-blue-400" />
                    <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                      {cityName}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-lg bg-white px-2 py-0.5 text-xs font-bold text-[#1D61E7] dark:bg-slate-900 dark:text-blue-400">
                    {count} ta
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Xavfsiz bitim modali */}
      {isSafetyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={() => setIsSafetyModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#151F32]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#1D61E7] dark:bg-blue-500/15 dark:text-blue-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Xavfsiz bitim qoidalari
              </h3>
            </div>
            <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <li>
                • Uyni shaxsan borib ko&apos;rmasdan turib oldindan pul (avans /
                kafolat) o&apos;tkazmang.
              </li>
              <li>
                • Kadastr va mulk egaligi hujjatlarini asl nusxada tekshiring.
              </li>
              <li>
                • Talabalar ijarasida uy egasi bilan yozma ijara shartnomasi
                tuzishni unutmang.
              </li>
            </ul>
            <button
              type="button"
              onClick={() => setIsSafetyModalOpen(false)}
              className="mt-5 w-full rounded-2xl bg-[#1D61E7] py-3 text-xs font-bold text-white"
            >
              Tushunarli
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
