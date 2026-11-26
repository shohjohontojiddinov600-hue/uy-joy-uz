"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Heart,
  MapPin,
  Maximize2,
} from "lucide-react";
import { formatListingPrice } from "@/data/mockListings";
import { useToast } from "@/components/ToastProvider";
import {
  FAVORITES_CHANGED_EVENT,
  isFavoriteId,
  toggleFavoriteId,
} from "@/lib/favorites";
import { Listing, ListingType } from "@/types/listing";

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
}

const BADGE_CONFIG: Record<
  ListingType,
  { label: string; className: string }
> = {
  sale: {
    label: "Sotiladi",
    className: "bg-[#0F2942] text-white",
  },
  rent: {
    label: "Ijara",
    className: "bg-sky-600 text-white",
  },
  student_dorm: {
    label: "Talabalar uchun",
    className: "bg-emerald-500 text-white",
  },
};

const GENDER_LABEL: Record<string, string> = {
  boys: "Yigitlar uchun",
  girls: "Qizlar uchun",
  any: "Barcha talabalar",
};

export default function ListingCard({ listing, onSelect }: ListingCardProps) {
  const { showToast } = useToast();
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setIsFavorite(isFavoriteId(listing.id));
    const sync = () => setIsFavorite(isFavoriteId(listing.id));
    window.addEventListener(FAVORITES_CHANGED_EVENT, sync);
    return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, sync);
  }, [listing.id]);

  const totalImages = listing.images.length;
  const badge = BADGE_CONFIG[listing.category];

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  return (
    <article
      onClick={() => onSelect(listing)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60"
    >
      {/* Image Carousel */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {!imgError[currentImage] ? (
          <img
            src={listing.images[currentImage]}
            alt={`${listing.title} - rasm ${currentImage + 1}`}
            onError={() =>
              setImgError((prev) => ({ ...prev, [currentImage]: true }))
            }
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0F2942]/10 to-emerald-500/15 text-slate-500">
            <span className="text-sm font-medium">{listing.city}</span>
            <span className="text-xs text-slate-400">{listing.area_sqm} m²</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm ${badge.className}`}
          >
            {badge.label}
          </span>
          {listing.isVerified && (
            <span
              title="Tasdiqlangan e'lon"
              className="inline-flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm backdrop-blur-sm"
            >
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
              Tasdiqlangan
            </span>
          )}
        </div>

        {/* Favorite Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const added = toggleFavoriteId(listing.id);
            setIsFavorite(added);
            showToast({
              type: added ? "success" : "info",
              message: added
                ? "E'lon saqlanganlarga qo'shildi!"
                : "E'lon saqlanganlardan olib tashlandi.",
            });
          }}
          aria-label="Saralanganlarga qo'shish"
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-rose-500"
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>

        {/* Carousel Navigation Arrows */}
        {totalImages > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              aria-label="Oldingi rasm"
              className="absolute top-1/2 left-2.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#0F2942] opacity-90 shadow-md backdrop-blur-sm transition-all hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Keyingi rasm"
              className="absolute top-1/2 right-2.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#0F2942] opacity-90 shadow-md backdrop-blur-sm transition-all hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-900/45 px-2.5 py-1 backdrop-blur-xs">
              {listing.images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImage(idx);
                  }}
                  aria-label={`Rasm ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentImage
                      ? "w-4 bg-emerald-400"
                      : "w-1.5 bg-white/70 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Price */}
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xl font-extrabold tracking-tight text-[#0F2942]">
            {formatListingPrice(listing)}
          </p>
          {listing.floor && (
            <span className="text-xs font-medium text-slate-400">
              {listing.floor}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-1.5 line-clamp-2 text-base font-bold text-slate-800 transition-colors group-hover:text-[#0F2942]">
          {listing.title}
        </h3>

        {/* Address */}
        <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span className="line-clamp-1">
            {listing.address || `${listing.city}, ${listing.district}`}
          </span>
        </div>

        {/* Near University / Student Dorm info */}
        {(listing.nearUniversity || listing.category === "student_dorm") && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <GraduationCap className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">
              {listing.nearUniversity ||
                [
                  listing.student_gender
                    ? GENDER_LABEL[listing.student_gender]
                    : null,
                  listing.available_spots
                    ? `${listing.available_spots} ta bo'sh joy`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" • ") ||
                "Talabalar turar joyi"}
            </span>
          </div>
        )}

        {/* Key Specs + Action */}
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between border-t border-slate-100 pt-3.5">
            <div className="flex items-center gap-3.5 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Maximize2 className="h-3.5 w-3.5 text-slate-400" />
                {listing.area_sqm} m²
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BedDouble className="h-3.5 w-3.5 text-slate-400" />
                {listing.rooms} xona
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(listing);
              }}
              className="inline-flex items-center gap-1 rounded-xl bg-[#0F2942]/6 px-3.5 py-2 text-xs font-bold text-[#0F2942] transition-all hover:bg-emerald-500 hover:text-white"
            >
              <span>Batafsil</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

