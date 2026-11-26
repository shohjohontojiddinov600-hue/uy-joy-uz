"use client";

import React from "react";
import { GraduationCap, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { CITIES, ROOM_OPTIONS, UZBEKISTAN_REGIONS } from "@/data/mockListings";
import { FilterState, StudentGender } from "@/types/listing";

export interface ExtendedFilterState extends FilterState {
  studentGender: "all" | StudentGender;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ExtendedFilterState;
  onChangeFilters: (next: ExtendedFilterState) => void;
  onResetFilters: () => void;
  resultCount: number;
}

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onChangeFilters,
  onResetFilters,
  resultCount,
}: FilterModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#1D61E7]">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Qidiruv filtri
              </h2>
              <p className="text-xs text-slate-500">
                Viloyat, narx, xonalar va talabalar parametrlari
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Viloyat / Shahar */}
          <div>
            <label className="text-xs font-bold text-slate-700">
              Viloyat / Shahar (14 ta hudud)
            </label>
            <select
              value={filters.city}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  city: e.target.value,
                  district: "Barcha tumanlar",
                })
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 focus:border-[#1D61E7] focus:bg-white focus:outline-none"
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city === "Barchasi" ? "Barcha viloyatlar" : city}
                </option>
              ))}
            </select>
          </div>

          {/* Tuman (Cascading Select) */}
          {filters.city !== "Barchasi" && (
            <div>
              <label className="text-xs font-bold text-slate-700">
                Tuman / Shahar
              </label>
              <select
                value={filters.district || "Barcha tumanlar"}
                onChange={(e) =>
                  onChangeFilters({ ...filters, district: e.target.value })
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 focus:border-[#1D61E7] focus:bg-white focus:outline-none"
              >
                <option value="Barcha tumanlar">Barcha tumanlar</option>
                {(UZBEKISTAN_REGIONS[filters.city] || []).map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Narx oralig'i */}
          <div>
            <label className="text-xs font-bold text-slate-700">
              Narx oralig&apos;i (min — max)
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <input
                type="number"
                min={0}
                value={filters.minPrice}
                onChange={(e) =>
                  onChangeFilters({ ...filters, minPrice: e.target.value })
                }
                placeholder="Dan (mas: 300)"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 focus:border-[#1D61E7] focus:bg-white focus:outline-none"
              />
              <input
                type="number"
                min={0}
                value={filters.maxPrice}
                onChange={(e) =>
                  onChangeFilters({ ...filters, maxPrice: e.target.value })
                }
                placeholder="Gacha (mas: 120000)"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 focus:border-[#1D61E7] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Xonalar soni */}
          <div>
            <label className="text-xs font-bold text-slate-700">
              Xonalar soni
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ROOM_OPTIONS.map((opt) => {
                const active = filters.rooms === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      onChangeFilters({ ...filters, rooms: opt.value })
                    }
                    className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                      active
                        ? "border-[#1D61E7] bg-[#1D61E7] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Talabalar filtri */}
          <div className="rounded-2xl border border-blue-100 bg-[#F4F7FC] p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1D61E7]">
              <GraduationCap className="h-4 w-4" />
              <span>Talabalar uchun filtr</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { value: "all", label: "Barchasi" },
                { value: "boys", label: "O'g'il bolalar" },
                { value: "girls", label: "Qiz bolalar" },
                { value: "any", label: "Farqi yo'q" },
              ].map((opt) => {
                const active = filters.studentGender === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      onChangeFilters({
                        ...filters,
                        category:
                          opt.value === "all"
                            ? filters.category
                            : "student_dorm",
                        studentGender: opt.value as "all" | StudentGender,
                      })
                    }
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? "border-[#1D61E7] bg-[#1D61E7] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => {
              onResetFilters();
              onClose();
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Tozalash</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl bg-[#1D61E7] py-3 text-sm font-bold text-white shadow-md shadow-[#1D61E7]/25 hover:bg-[#1751c4]"
          >
            Natijalarni ko&apos;rish ({resultCount})
          </button>
        </div>
      </div>
    </div>
  );
}

