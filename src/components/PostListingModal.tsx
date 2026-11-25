"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Check,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AMENITIES_OPTIONS, CITIES } from "@/data/mockListings";
import { createListingInDb } from "@/lib/listingsApi";
import { uploadPropertyImages } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Listing, ListingType, StudentGender } from "@/types/listing";

interface PostListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newListing: Listing) => void;
  userId?: string | null;
  onRequireAuth?: () => void;
}

export default function PostListingModal({
  isOpen,
  onClose,
  onSubmit,
  userId,
  onRequireAuth,
}: PostListingModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ListingType>("rent");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<"USD" | "UZS">("USD");
  const [city, setCity] = useState("Toshkent");
  const [district, setDistrict] = useState("");
  const [areaSqm, setAreaSqm] = useState("");
  const [rooms, setRooms] = useState("2");
  const [studentGender, setStudentGender] = useState<StudentGender>("any");
  const [availableSpots, setAvailableSpots] = useState("2");
  const [amenities, setAmenities] = useState<string[]>(["Wi-Fi", "Mebel"]);
  const [contactPhone, setContactPhone] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSelectedFiles((prev) => [...prev, ...files].slice(0, 6));
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...newPreviews].slice(0, 6));
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title || !price || !areaSqm) return;

    // Agar Supabase sozlangan bo'lsa, foydalanuvchi tizimga kirgan bo'lishi shart (RLS qoidasi)
    if (isSupabaseConfigured && !userId) {
      setErrorMsg("E'lon joylash uchun avval hisobingizga kiring.");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrls: string[] = [];

      if (isSupabaseConfigured && userId) {
        if (selectedFiles.length > 0) {
          imageUrls = await uploadPropertyImages(selectedFiles, userId);
        } else {
          imageUrls = [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
          ];
        }

        const created = await createListingInDb({
          user_id: userId,
          category,
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          currency,
          city,
          district: district.trim(),
          rooms: Number(rooms) || 1,
          area_sqm: Number(areaSqm),
          student_gender: category === "student_dorm" ? studentGender : null,
          available_spots:
            category === "student_dorm" ? Number(availableSpots) || 1 : null,
          amenities,
          images: imageUrls,
          contact_phone: contactPhone.trim(),
        });

        onSubmit(created);
      } else {
        // Fallback: Supabase .env.local sozlanmagan bo'lsa lokal qo'shish
        const localImages =
          previewUrls.length > 0
            ? previewUrls
            : [
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
              ];

        const newListing: Listing = {
          id: `uy-${Date.now()}`,
          title: title.trim(),
          category,
          price: Number(price),
          currency,
          pricePeriod: category !== "sale" ? "oyiga" : undefined,
          city,
          district: district.trim() || city,
          address: district.trim() ? `${city}, ${district.trim()}` : city,
          area_sqm: Number(areaSqm),
          rooms: Number(rooms) || 1,
          student_gender: category === "student_dorm" ? studentGender : null,
          available_spots:
            category === "student_dorm" ? Number(availableSpots) || 1 : null,
          description:
            description.trim() ||
            "Barcha qulayliklarga ega zamonaviy xonadon.",
          amenities,
          contact_phone: contactPhone.trim(),
          status: "active",
          isVerified: true,
          images: localImages,
        };
        onSubmit(newListing);
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setTitle("");
        setPrice("");
        setDistrict("");
        setAreaSqm("");
        setDescription("");
        setSelectedFiles([]);
        setPreviewUrls([]);
        onClose();
      }, 1100);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "E'lonni saqlashda xatolik."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Yopish"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              E&apos;lon muvaffaqiyatli joylandi!
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              E&apos;loningiz asosiy ro&apos;yxatda ko&apos;rsatilmoqda.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[#0F2942]">
                Yangi e&apos;lon joylashtirish
              </h2>
              <p className="text-xs text-slate-500">
                Uy-joy yoki talabalar turar joyi bo&apos;yicha ma&apos;lumotlarni
                to&apos;ldiring.
              </p>
            </div>

            {isSupabaseConfigured && !userId && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <span>E&apos;lon joylash uchun avval tizimga kiring.</span>
                {onRequireAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRequireAuth();
                    }}
                    className="shrink-0 rounded-lg bg-[#0F2942] px-3 py-1.5 font-semibold text-white"
                  >
                    Kirish
                  </button>
                )}
              </div>
            )}

            {errorMsg && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Category selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700">
                E&apos;lon turi
              </label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {[
                  { value: "sale", label: "Sotuv" },
                  { value: "rent", label: "Ijara" },
                  { value: "student_dorm", label: "Talabalar" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setCategory(item.value as ListingType)}
                    className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                      category === item.value
                        ? "border-[#0F2942] bg-[#0F2942] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Sarlavha *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masalan: Yunusobodda yevro ta'mirli 2 xonali kvartira"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Price & Currency */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Narxi *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Masalan: 550 yoki 1200000"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Valyuta
                </label>
                <select
                  value={currency}
                  onChange={(e) =>
                    setCurrency(e.target.value as "USD" | "UZS")
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="UZS">UZS (so&apos;m)</option>
                </select>
              </div>
            </div>

            {/* City & District */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Shahar / Viloyat
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                >
                  {CITIES.filter((c) => c !== "Barchasi").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Tuman / Mo&apos;ljal
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Mas: Yunusobod, 4-kvartal"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Area & Rooms & Contact Phone */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Maydon (m²) *
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  value={areaSqm}
                  onChange={(e) => setAreaSqm(e.target.value)}
                  placeholder="Mas: 68"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Xonalar
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Telefon *
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+998 90 ..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Student Dorm specific fields */}
            {category === "student_dorm" && (
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
                <div>
                  <label className="text-xs font-semibold text-emerald-800">
                    Kimlar uchun?
                  </label>
                  <select
                    value={studentGender}
                    onChange={(e) =>
                      setStudentGender(e.target.value as StudentGender)
                    }
                    className="mt-1 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="any">Yigitlar va qizlar</option>
                    <option value="boys">Faqat yigitlar</option>
                    <option value="girls">Faqat qizlar</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-emerald-800">
                    Bo&apos;sh joylar soni
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={availableSpots}
                    onChange={(e) => setAvailableSpots(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Amenities */}
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Qulayliklar
              </label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {AMENITIES_OPTIONS.map((item) => {
                  const selected = amenities.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAmenity(item)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                        selected
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Tavsif
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Uy haqida qo'shimcha ma'lumotlar..."
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Image Upload (Supabase Storage) */}
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Rasmlar yuklash (maksimal 6 ta)
              </label>
              <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 py-3 text-xs font-semibold text-slate-600 transition-colors hover:border-emerald-400 hover:bg-emerald-50/40">
                <ImagePlus className="h-4 w-4 text-emerald-600" />
                <span>Qurilmadan rasm tanlash</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {previewUrls.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {previewUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-video overflow-hidden rounded-lg border border-slate-200"
                    >
                      <img
                        src={url}
                        alt={`Yuklangan rasm ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 rounded-full bg-slate-900/70 p-1 text-white hover:bg-rose-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition-all hover:bg-emerald-600 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>
                  {submitting ? "Yuklanmoqda..." : "E'lonni joylashtirish"}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
