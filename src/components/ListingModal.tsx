"use client";

import React, { useState } from "react";
import {
  BadgeCheck,
  BedDouble,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Layers,
  MapPin,
  Maximize2,
  Phone,
  X,
} from "lucide-react";
import { formatListingPrice } from "@/data/mockListings";
import { Listing } from "@/types/listing";

interface ListingModalProps {
  listing: Listing | null;
  onClose: () => void;
}

export default function ListingModal({ listing, onClose }: ListingModalProps) {
  const [imageIndex, setImageIndex] = useState(0);

  if (!listing) return null;

  const total = listing.images.length;
  const safeIndex = imageIndex >= total ? 0 : imageIndex;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Yopish"
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md transition-colors hover:bg-white hover:text-[#0F2942]"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image Viewer */}
        <div className="relative aspect-[16/9] w-full bg-slate-100">
          <img
            src={listing.images[safeIndex]}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setImageIndex(safeIndex === 0 ? total - 1 : safeIndex - 1)
                }
                className="absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0F2942] shadow-md hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setImageIndex(safeIndex === total - 1 ? 0 : safeIndex + 1)
                }
                className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0F2942] shadow-md hover:bg-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Details */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-2xl font-extrabold text-[#0F2942]">
              {formatListingPrice(listing)}
            </p>
            {listing.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <BadgeCheck className="h-4 w-4 text-emerald-500" />
                Tasdiqlangan e&apos;lon
              </span>
            )}
          </div>

          <h2 className="mt-2 text-xl font-bold text-slate-900">
            {listing.title}
          </h2>

          <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{listing.address || `${listing.city}, ${listing.district}`}</span>
          </div>

          {(listing.nearUniversity || listing.category === "student_dorm") && (
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm font-medium text-emerald-700">
              <GraduationCap className="h-4 w-4 shrink-0" />
              <span>
                {listing.nearUniversity || "Talabalar uchun turar joy"}
              </span>
              {listing.student_gender && (
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 border border-emerald-200">
                  {listing.student_gender === "boys"
                    ? "Faqat yigitlar"
                    : listing.student_gender === "girls"
                    ? "Faqat qizlar"
                    : "Yigitlar / Qizlar"}
                </span>
              )}
              {listing.available_spots !== null &&
                listing.available_spots !== undefined && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {listing.available_spots} ta bo&apos;sh joy
                  </span>
                )}
            </div>
          )}

          {/* Specs Grid */}
          <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                <Maximize2 className="h-3.5 w-3.5 text-emerald-600" />
                Maydoni
              </div>
              <p className="mt-1 text-sm font-bold text-[#0F2942]">
                {listing.area_sqm} m²
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                <BedDouble className="h-3.5 w-3.5 text-emerald-600" />
                Xonalar
              </div>
              <p className="mt-1 text-sm font-bold text-[#0F2942]">
                {listing.rooms} xona
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                <Layers className="h-3.5 w-3.5 text-emerald-600" />
                Qavat
              </div>
              <p className="mt-1 text-sm font-bold text-[#0F2942]">
                {listing.floor || "Ko'rsatilmagan"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-5">
            <h3 className="text-sm font-bold text-[#0F2942]">Tavsif</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {listing.description}
            </p>
          </div>

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-bold text-[#0F2942]">Qulayliklar</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {listing.amenities.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-6 flex flex-col gap-2.5 border-t border-slate-100 pt-5 sm:flex-row">
            <a
              href={
                listing.contact_phone
                  ? `tel:${listing.contact_phone.replace(/\s+/g, "")}`
                  : "#"
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
            >
              <Phone className="h-4 w-4" />
              <span>
                {listing.contact_phone
                  ? `Qo'ng'iroq qilish: ${listing.contact_phone}`
                  : "Egasi bilan bog'lanish"}
              </span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Yopish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

