"use client";

import React from "react";
import {
  BedDouble,
  Building,
  GraduationCap,
  KeyRound,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { CITIES, ROOM_OPTIONS } from "@/data/mockListings";
import { FilterState, ListingCategory } from "@/types/listing";

interface HeroFilterProps {
  filters: FilterState;
  onChangeFilters: (next: FilterState) => void;
  onResetFilters: () => void;
  totalCount: number;
}

const TYPE_TABS: {
  label: string;
  value: ListingCategory;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { label: "Barchasi", value: "all", icon: Building },
  { label: "Sotuv", value: "sale", icon: ShieldCheck },
  { label: "Ijara", value: "rent", icon: KeyRound },
  { label: "Talabalar uchun", value: "student_dorm", icon: GraduationCap },
];

export default function HeroFilter({
  filters,
  onChangeFilters,
  onResetFilters,
  totalCount,
}: HeroFilterProps) {
  const updateField = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onChangeFilters({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.city !== "Barchasi" ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.rooms !== "all" ||
    filters.searchQuery.trim() !== "";

  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-50 via-white to-white">
      {/* Subtle decorative background accents */}
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-emerald-500/8 blur-3xl" />
      <div className="pointer-events-none absolute top-12 -left-24 h-72 w-72 rounded-full bg-[#0F2942]/6 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-12 sm:px-6 lg:px-8 lg:pt-14 lg:pb-14">
        {/* Hero Copy */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            O&apos;zbekiston bo&apos;ylab ishonchli uy-joy va talabalar turar joyi
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0F2942] sm:text-4xl lg:text-5xl">
            Orzungizdagi uy yoki{" "}
            <span className="text-emerald-600">qulay talaba ijarasi</span> bir
            joyda
          </h1>

          <p className="mt-3.5 text-base text-slate-600 sm:text-lg">
            Sotiladigan xonadonlar, oilaviy kvartiralar va universitetlarga yaqin
            talabalar yotoqxonalarini vositachilarsiz, tez va oson toping.
          </p>
        </div>

        {/* Search & Quick Filter Card */}
        <div className="mx-auto mt-8 max-w-6xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/50 sm:p-6">
          {/* Top row: Listing type pills + Search input */}
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {TYPE_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = filters.category === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => updateField("category", tab.value)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
                      isActive
                        ? "bg-[#0F2942] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-[#0F2942]"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-emerald-400" : "text-slate-500"
                      }`}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => updateField("searchQuery", e.target.value)}
                placeholder="Tuman, ko'cha yoki OTM nomi..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pr-4 pl-10 text-sm text-[#0F2942] placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Filter Grid */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
            {/* City / Region */}
            <div className="lg:col-span-3">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                Viloyat / Shahar
              </label>
              <select
                value={filters.city}
                onChange={(e) => updateField("city", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-[#0F2942] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range: Min - Max */}
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Wallet className="h-3.5 w-3.5 text-emerald-600" />
                Narx oralig&apos;i (dan — gacha)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  value={filters.minPrice}
                  onChange={(e) => updateField("minPrice", e.target.value)}
                  placeholder="Dan (mas. 500)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#0F2942] placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
                <input
                  type="number"
                  min={0}
                  value={filters.maxPrice}
                  onChange={(e) => updateField("maxPrice", e.target.value)}
                  placeholder="Gacha (mas. 120000)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#0F2942] placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Rooms */}
            <div className="lg:col-span-3">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <BedDouble className="h-3.5 w-3.5 text-emerald-600" />
                Xonalar soni
              </label>
              <select
                value={filters.rooms}
                onChange={(e) => updateField("rooms", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-[#0F2942] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              >
                {ROOM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action / Reset */}
            <div className="flex items-center gap-2 lg:col-span-2">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Tozalash</span>
                </button>
              ) : (
                <div className="flex w-full items-center justify-center rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700 border border-emerald-200/70">
                  {totalCount} ta e&apos;lon mavjud
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

