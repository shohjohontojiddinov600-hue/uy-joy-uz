"use client";

import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  BedDouble,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Droplets,
  Expand,
  GraduationCap,
  Layers,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  Send,
  Share2,
  ShieldCheck,
  Snowflake,
  Sofa,
  Sparkles,
  Tv,
  User as UserIcon,
  Users,
  Wifi,
  Wind,
  X,
} from "lucide-react";
import { formatListingPrice } from "@/data/mockListings";
import { useToast } from "@/components/ToastProvider";
import { inquiryFormSchema } from "@/lib/validation";
import { Listing, ListingType, Profile } from "@/types/listing";

interface ListingDetailViewProps {
  listing: Listing;
  owner: Pick<Profile, "full_name" | "phone_number" | "created_at"> | null;
}

const CATEGORY_BADGE: Record<
  ListingType,
  { label: string; className: string }
> = {
  sale: {
    label: "Uy / Kvartira sotiladi",
    className: "bg-[#0F2942] text-white",
  },
  rent: {
    label: "Oilaviy / Umumiy ijara",
    className: "bg-sky-600 text-white",
  },
  student_dorm: {
    label: "Talabalar uchun yotoqxona / Sheriklik",
    className: "bg-emerald-500 text-white",
  },
};

function getAmenityIcon(amenity: string) {
  const lower = amenity.toLowerCase();
  if (lower.includes("wi-fi") || lower.includes("wifi")) return Wifi;
  if (lower.includes("mebel")) return Sofa;
  if (lower.includes("muzlatkich")) return Snowflake;
  if (lower.includes("issiq suv") || lower.includes("suv")) return Droplets;
  if (lower.includes("konditsioner")) return Wind;
  if (lower.includes("avtoturargoh") || lower.includes("park")) return Car;
  if (lower.includes("televizor") || lower.includes("tv")) return Tv;
  if (lower.includes("xavfsizlik") || lower.includes("kadastr")) return ShieldCheck;
  if (lower.includes("kir yuvish")) return Sparkles;
  return CheckCircle2;
}

function formatRegistrationDate(dateStr?: string | null): string {
  if (!dateStr) return "2025-yil";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "2025-yil";
  const months = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
  ];
  return `${date.getFullYear()}-yil ${months[date.getMonth()]}`;
}

function normalizePhoneHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

export default function ListingDetailView({
  listing,
  owner,
}: ListingDetailViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Tezkor xabar qoldirish formasi
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [messageText, setMessageText] = useState(
    `Assalomu alaykum! "${listing.title}" e'loni bo'yicha murojaat qilyapman. Hali bo'shmi?`
  );
  const [messageSent, setMessageSent] = useState(false);
  const { showToast } = useToast();

  const images =
    listing.images.length > 0
      ? listing.images
      : [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
        ];

  const total = images.length;
  const safeIndex = activeIndex >= total ? 0 : activeIndex;

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
      }
      if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, total]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast({ type: "success", message: "Havola nusxalandi!" });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast({ type: "error", message: "Havolani nusxalab bo'lmadi." });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = inquiryFormSchema.safeParse({
      senderName,
      senderPhone,
      messageText,
    });
    if (!parsed.success) {
      showToast({
        type: "error",
        message:
          parsed.error.issues[0]?.message ||
          "Xabar maydonlarini to'g'ri to'ldiring.",
      });
      return;
    }
    setMessageSent(true);
    showToast({ type: "success", message: "Xabaringiz muvaffaqiyatli yuborildi!" });
  };

  const phoneDisplay =
    listing.contact_phone || owner?.phone_number || "+998 90 000 00 00";
  const phoneHref = `tel:${normalizePhoneHref(phoneDisplay)}`;
  const telegramDigits = normalizePhoneHref(phoneDisplay).replace("+", "");
  const telegramHref = `https://t.me/+${telegramDigits}`;

  const badge = CATEGORY_BADGE[listing.category];
  const ownerName = owner?.full_name || "Uy-joy egasi";
  const ownerSince = formatRegistrationDate(owner?.created_at);

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* CHAP USTUN: Galereya + Ma'lumotlar */}
        <div className="space-y-6 lg:col-span-8">
          {/* 1. Katta rasm galereyasi + Thumbnails */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
              <img
                src={images[safeIndex]}
                alt={`${listing.title} - rasm ${safeIndex + 1}`}
                onClick={() => setLightboxOpen(true)}
                className="h-full w-full cursor-zoom-in object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              />

              {/* Fullscreen button */}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label="To'liq ekranda ochish"
                className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-xl bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs transition-colors hover:bg-slate-900"
              >
                <Expand className="h-3.5 w-3.5" />
                <span>Kattalashtirish</span>
              </button>

              {/* Image counter */}
              <span className="absolute bottom-3 left-3 rounded-lg bg-slate-900/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                {safeIndex + 1} / {total}
              </span>

              {total > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex(safeIndex === 0 ? total - 1 : safeIndex - 1)
                    }
                    aria-label="Oldingi rasm"
                    className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0F2942] shadow-md transition-colors hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex(safeIndex === total - 1 ? 0 : safeIndex + 1)
                    }
                    aria-label="Keyingi rasm"
                    className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0F2942] shadow-md transition-colors hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {total > 1 && (
              <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
                {images.map((imgUrl, idx) => {
                  const isActive = idx === safeIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-20 sm:w-28 ${
                        isActive
                          ? "border-emerald-500 ring-2 ring-emerald-500/20"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Kichik rasm ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* 2. Asosiy ma'lumotlar */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-xl px-3 py-1 text-xs font-bold ${badge.className}`}
                >
                  {badge.label}
                </span>
                {listing.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <BadgeCheck className="h-4 w-4 text-emerald-500" />
                    Tasdiqlangan
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Nusxalandi</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Ulashish</span>
                  </>
                )}
              </button>
            </div>

            <p className="mt-4 text-3xl font-extrabold tracking-tight text-[#0F2942]">
              {formatListingPrice(listing)}
            </p>

            <h1 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              {listing.title}
            </h1>

            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                {listing.address || `${listing.city}, ${listing.district}`}
              </span>
            </div>

            {/* Asosiy ko'rsatkichlar */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <BedDouble className="h-4 w-4 text-emerald-600" />
                  <span>Xonalar soni</span>
                </div>
                <p className="mt-1 text-base font-bold text-[#0F2942]">
                  {listing.rooms} xona
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Maximize2 className="h-4 w-4 text-emerald-600" />
                  <span>Umumiy maydoni</span>
                </div>
                <p className="mt-1 text-base font-bold text-[#0F2942]">
                  {listing.area_sqm} m²
                </p>
              </div>

              <div className="col-span-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  <span>Qavat</span>
                </div>
                <p className="mt-1 text-base font-bold text-[#0F2942]">
                  {listing.floor || "Ko'rsatilmagan"}
                </p>
              </div>
            </div>

            {/* Talabalar uchun maxsus ma'lumotlar */}
            {listing.category === "student_dorm" && (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                  <span>Talabalar uchun sharoitlar</span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Users className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>
                      <strong>Kimlar uchun:</strong>{" "}
                      {listing.student_gender === "boys"
                        ? "Faqat o'g'il bolalar"
                        : listing.student_gender === "girls"
                        ? "Faqat qiz bolalar"
                        : "Farqi yo'q (yigitlar / qizlar)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <BedDouble className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>
                      <strong>Bo&apos;sh joylar:</strong>{" "}
                      {listing.available_spots ?? 1} ta joy
                    </span>
                  </div>
                  {listing.nearUniversity && (
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <GraduationCap className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>
                        <strong>OTM ga yaqinligi:</strong>{" "}
                        {listing.nearUniversity}
                      </span>
                    </div>
                  )}
                  {listing.with_owner !== null &&
                    listing.with_owner !== undefined && (
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <UserIcon className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>
                          <strong>Yashash tartibi:</strong>{" "}
                          {listing.with_owner
                            ? "Uy egasi bilan"
                            : "Alohida (uy egasisiz)"}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            )}
          </section>

          {/* 3. Qulayliklar ro'yxati va To'liq tavsif */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-[#0F2942]">
              Qulayliklar
            </h2>
            {listing.amenities.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {listing.amenities.map((amenity) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 text-xs font-semibold text-slate-700"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100/80 text-emerald-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Qo&apos;shimcha qulayliklar ko&apos;rsatilmagan.
              </p>
            )}

            <div className="mt-7 border-t border-slate-100 pt-6">
              <h2 className="text-lg font-bold text-[#0F2942]">
                Batafsil ma&apos;lumot
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {listing.description ||
                  "Ushbu e'lon bo'yicha qo'shimcha ma'lumot olish uchun muallif bilan bog'laning."}
              </p>
            </div>
          </section>
        </div>

        {/* O'NG USTUN: Sticky Murojaat qilish kartochkasi */}
        <aside className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-bold text-[#0F2942]">
                Murojaat qilish
              </h2>

              {/* E'lon egasi */}
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0F2942] text-base font-bold text-white">
                  {ownerName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#0F2942]">
                    {ownerName}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                    <span>A&apos;zo: {ownerSince}</span>
                  </p>
                </div>
              </div>

              {/* Telefon raqamni ko'rish */}
              <div className="mt-4 space-y-2.5">
                {phoneRevealed ? (
                  <a
                    href={phoneHref}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-colors hover:bg-emerald-600"
                  >
                    <Phone className="h-4 w-4" />
                    <span>{phoneDisplay}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPhoneRevealed(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0F2942] px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-[#0F2942]/15 transition-colors hover:bg-[#163a5c]"
                  >
                    <Phone className="h-4 w-4 text-emerald-400" />
                    <span>Telefon raqamni ko&apos;rish</span>
                  </button>
                )}

                {/* Telegram orqali yozish */}
                <a
                  href={telegramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100"
                >
                  <Send className="h-4 w-4" />
                  <span>Telegram orqali yozish</span>
                </a>

                {/* Ulashish (Copy link) */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-700">
                        Havola nusxalandi!
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-500" />
                      <span>Ulashish (Havolani nusxalash)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sayt ichida tezkor xabar qoldirish formasi */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>Tezkor xabar qoldirish</span>
                </div>

                {messageSent ? (
                  <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                    <Check className="mx-auto h-6 w-6 text-emerald-600" />
                    <p className="mt-1.5 text-sm font-bold text-emerald-900">
                      Xabaringiz yuborildi!
                    </p>
                    <p className="mt-1 text-xs text-emerald-700">
                      E&apos;lon egasi tez orada {senderPhone} raqamiga
                      bog&apos;lanadi.
                    </p>
                    <button
                      type="button"
                      onClick={() => setMessageSent(false)}
                      className="mt-3 text-xs font-semibold text-[#0F2942] underline"
                    >
                      Yana xabar yozish
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="mt-3 space-y-2.5">
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Ismingiz"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                    <input
                      type="tel"
                      required
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="Telefon raqamingiz (+998 ...)"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                    <textarea
                      rows={3}
                      required
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Xabar yuborish</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* FULL-SCREEN LIGHTBOX */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Yopish"
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative flex max-h-[90vh] w-full max-w-5xl items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[safeIndex]}
              alt={`${listing.title} - katta rasm ${safeIndex + 1}`}
              className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain"
            />

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex(safeIndex === 0 ? total - 1 : safeIndex - 1)
                  }
                  aria-label="Oldingi rasm"
                  className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xs transition-colors hover:bg-white/35"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex(safeIndex === total - 1 ? 0 : safeIndex + 1)
                  }
                  aria-label="Keyingi rasm"
                  className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xs transition-colors hover:bg-white/35"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium text-white/80">
              {safeIndex + 1} / {total}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

