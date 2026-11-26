"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Clock, Heart, MapPin } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import {
  FAVORITES_CHANGED_EVENT,
  isFavoriteId,
  toggleFavoriteId,
} from "@/lib/favorites";
import { Listing, ListingType } from "@/types/listing";

interface AppListingCardProps {
  listing: Listing;
}

const CATEGORY_BADGE: Record<
  ListingType,
  { label: string; className: string }
> = {
  sale: {
    label: "Sotuv",
    className: "bg-[#1D61E7]/90 text-white",
  },
  rent: {
    label: "Ijara",
    className: "bg-emerald-500/90 text-white",
  },
  student_dorm: {
    label: "Talabalar uchun",
    className: "bg-indigo-600/90 text-white",
  },
};

function formatCompactPrice(listing: Listing): string {
  const formatted = listing.price
    .toLocaleString("ru-RU")
    .replace(/,/g, " ");
  return listing.currency === "USD" ? `$${formatted}` : `${formatted} so'm`;
}

function formatRelativeTime(createdAt?: string): string {
  if (!createdAt) return "2 soat oldin";
  const time = new Date(createdAt).getTime();
  if (isNaN(time)) return "2 soat oldin";
  const diffHours = Math.max(1, Math.floor((Date.now() - time) / 3_600_000));
  if (diffHours < 24) return `${diffHours} soat oldin`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} kun oldin`;
}

export default function AppListingCard({ listing }: AppListingCardProps) {
  const { showToast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(isFavoriteId(listing.id));
    const sync = () => setIsFavorite(isFavoriteId(listing.id));
    window.addEventListener(FAVORITES_CHANGED_EVENT, sync);
    return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, sync);
  }, [listing.id]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleFavoriteId(listing.id);
    setIsFavorite(added);
    showToast({
      type: added ? "success" : "info",
      message: added
        ? "Sevimlilarga qo'shildi!"
        : "Sevimlilardan olib tashlandi.",
    });
  };

  const rightLabel =
    listing.category === "student_dorm"
      ? `${listing.available_spots ?? 1} ta joy bor`
      : `${listing.rooms} xonali`;

  const locationText = listing.district
    ? `${listing.city}, ${listing.district}`
    : listing.city;

  const badge = CATEGORY_BADGE[listing.category];
  const photoCount = Math.max(1, listing.images.length);

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_35px_-10px_rgba(29,97,231,0.15)] dark:bg-[#151F32] dark:ring-slate-700/60 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_20px_35px_-10px_rgba(59,130,246,0.22)]"
    >
      {/* Top Image + Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Chap yuqori burchak: Kategoriya yorlig'i */}
        <span
          className={`absolute top-2.5 left-2.5 rounded-lg px-2 py-0.5 text-[10px] font-bold shadow-xs backdrop-blur-xs ${badge.className}`}
        >
          {badge.label}
        </span>

        {/* O'ng yuqori burchak: Sevimlilar yurakchasi */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label="Sevimlilar"
          className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur-xs transition-transform hover:scale-110 dark:bg-slate-900/80 dark:text-slate-200"
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite
                ? "fill-rose-500 text-rose-500"
                : "text-slate-600 dark:text-slate-200"
            }`}
          />
        </button>

        {/* Chap pastki burchak: Rasmlar soni */}
        <span className="absolute bottom-2 left-2.5 inline-flex items-center gap-1 rounded-lg bg-slate-900/65 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
          <Camera className="h-3 w-3" />
          <span>{photoCount}</span>
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-3.5">
        <div>
          <div className="flex items-baseline justify-between gap-1.5">
            <p className="truncate text-sm font-extrabold text-[#0B1F3A] sm:text-base dark:text-[#F59E0B]">
              {formatCompactPrice(listing)}
            </p>
            <span className="shrink-0 rounded-lg bg-[#0B1F3A]/8 px-2 py-0.5 text-[10px] font-bold text-[#0B1F3A] sm:text-[11px] dark:bg-[#F59E0B]/15 dark:text-[#F59E0B]">
              {rightLabel}
            </span>
          </div>

          <h3 className="mt-1 line-clamp-1 text-xs font-bold text-slate-700 sm:text-sm dark:text-slate-200">
            {listing.title}
          </h3>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-700/60 dark:text-slate-400">
          <div className="flex min-w-0 items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0 text-[#1D61E7] dark:text-blue-400" />
            <span className="truncate">{locationText}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>{formatRelativeTime(listing.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
