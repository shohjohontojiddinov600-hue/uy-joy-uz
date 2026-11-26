"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  Check,
  GraduationCap,
  Home,
  ImagePlus,
  KeyRound,
  Loader2,
  MapPin,
  Phone,
  Sparkles,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import { AMENITIES_OPTIONS, CITIES, UZBEKISTAN_REGIONS } from "@/data/mockListings";
import { usePhoneAuth } from "@/components/PhoneAuthGate";
import { useToast } from "@/components/ToastProvider";
import { compressImageFiles } from "@/lib/imageCompression";
import { createListingInDb } from "@/lib/listingsApi";
import { uploadPropertyImages } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listingFormSchema } from "@/lib/validation";
import { Listing, ListingType, StudentGender } from "@/types/listing";

const MIN_IMAGES = 1;
const MAX_IMAGES = 8;

interface SelectedImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface CreateListingFormProps {
  userId: string | null;
  onSuccess?: (created: Listing) => void;
}

const CATEGORY_CARDS: {
  value: ListingType;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
}[] = [
  {
    value: "sale",
    title: "Uy / Kvartira sotish",
    subtitle: "Kvartira, hovli yoki yangi qurilgan uy-joylar",
    icon: Home,
    accentClass: "text-[#0F2942] bg-[#0F2942]/10",
  },
  {
    value: "rent",
    title: "Oilaviy / Umumiy ijara",
    subtitle: "Uzoq muddatli oilaviy va tartibli ijarachilar uchun",
    icon: KeyRound,
    accentClass: "text-sky-700 bg-sky-100",
  },
  {
    value: "student_dorm",
    title: "Talabalar uchun yotoqxona / Sheriklikka joy",
    subtitle: "OTM yaqinidagi yotoqxona, xona yoki xonadoshlik",
    icon: GraduationCap,
    accentClass: "text-emerald-700 bg-emerald-100",
  },
];

export default function CreateListingForm({
  userId,
  onSuccess,
}: CreateListingFormProps) {
  const [category, setCategory] = useState<ListingType>("rent");
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("Toshkent shahri");
  const [district, setDistrict] = useState(
    UZBEKISTAN_REGIONS["Toshkent shahri"][0]
  );
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<"USD" | "UZS">("USD");
  const [rooms, setRooms] = useState("2");
  const [areaSqm, setAreaSqm] = useState("");
  const { session } = usePhoneAuth();
  const [amenities, setAmenities] = useState<string[]>(["Wi-Fi", "Mebel"]);
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState(
    session?.phone_number || ""
  );

  useEffect(() => {
    if (session?.phone_number && !contactPhone) {
      setContactPhone(session.phone_number);
    }
  }, [session?.phone_number, contactPhone]);

  // Talabalar uchun dinamik maydonlar
  const [studentGender, setStudentGender] = useState<StudentGender>("any");
  const [availableSpots, setAvailableSpots] = useState("2");
  const [nearUniversity, setNearUniversity] = useState("");
  const [withOwner, setWithOwner] = useState<boolean>(false);

  // Rasmlar
  const [images, setImages] = useState<SelectedImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [compressing, setCompressing] = useState(false);

  // Holatlar
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdListing, setCreatedListing] = useState<Listing | null>(null);
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<SelectedImageItem[]>([]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const processIncomingFiles = async (rawFiles: File[]) => {
    setErrorMsg(null);
    const imageFiles = rawFiles.filter((f) => f.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      setErrorMsg("Iltimos, faqat rasm fayllarini tanlang (JPG, PNG, WEBP).");
      return;
    }

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setErrorMsg(`Ko'pi bilan ${MAX_IMAGES} ta rasm yuklash mumkin.`);
      return;
    }

    const filesToProcess = imageFiles.slice(0, remainingSlots);
    if (imageFiles.length > remainingSlots) {
      setErrorMsg(
        `Maksimal ${MAX_IMAGES} ta rasmga ruxsat etiladi. Dastlabki ${remainingSlots} tasi qo'shildi.`
      );
    }

    setCompressing(true);
    try {
      const compressed = await compressImageFiles(filesToProcess, 1200, 0.82);
      const nextItems: SelectedImageItem[] = compressed.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...nextItems]);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Rasmlarni qayta ishlashda xatolik yuz berdi."
      );
    } finally {
      setCompressing(false);
    }
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await processIncomingFiles(files);
    }
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      await processIncomingFiles(files);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const resetForm = () => {
    images.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setImages([]);
    setTitle("");
    setDistrict("");
    setPrice("");
    setAreaSqm("");
    setDescription("");
    setNearUniversity("");
    setWithOwner(false);
    setCreatedListing(null);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isSupabaseConfigured && !userId && !session) {
      const msg = "E'lon joylash uchun avval tizimga kiring.";
      setErrorMsg(msg);
      showToast({ type: "error", message: msg });
      return;
    }

    if (images.length < MIN_IMAGES) {
      const msg = `Kamida ${MIN_IMAGES} ta rasm yuklashingiz shart.`;
      setErrorMsg(msg);
      showToast({ type: "error", message: msg });
      return;
    }

    const parsed = listingFormSchema.safeParse({
      category,
      title,
      city,
      district,
      price,
      currency,
      rooms,
      area_sqm: areaSqm,
      contact_phone: contactPhone,
      description,
      amenities,
      student_gender: category === "student_dorm" ? studentGender : null,
      available_spots:
        category === "student_dorm" ? Number(availableSpots) || 1 : null,
      near_university:
        category === "student_dorm" ? nearUniversity : null,
      with_owner: category === "student_dorm" ? withOwner : null,
    });

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ||
        "Iltimos, maydonlarni to'g'ri to'ldiring.";
      setErrorMsg(firstError);
      showToast({ type: "error", message: firstError });
      return;
    }

    const valid = parsed.data;

    setSubmitting(true);
    try {
      const filesToUpload = images.map((item) => item.file);

      if (isSupabaseConfigured && userId) {
        const uploadedUrls = await uploadPropertyImages(filesToUpload, userId);

        const created = await createListingInDb({
          user_id: userId,
          category: valid.category,
          title: valid.title,
          description: valid.description,
          price: valid.price,
          currency: valid.currency,
          city: valid.city,
          district: valid.district,
          rooms: valid.rooms,
          area_sqm: valid.area_sqm,
          student_gender: valid.student_gender ?? null,
          available_spots: valid.available_spots ?? null,
          near_university: valid.near_university || null,
          with_owner: valid.with_owner ?? null,
          amenities: valid.amenities,
          images: uploadedUrls,
          contact_phone: valid.contact_phone,
        });

        setCreatedListing(created);
        showToast({ type: "success", message: "E'lon muvaffaqiyatli joylandi!" });
        onSuccess?.(created);
      } else {
        // Supabase ulanmagan holatda lokal demo ko'rinish
        const localListing: Listing = {
          id: `uy-${Date.now()}`,
          category: valid.category,
          title: valid.title,
          description:
            valid.description || "Barcha qulayliklarga ega zamonaviy xonadon.",
          price: valid.price,
          currency: valid.currency,
          pricePeriod: valid.category !== "sale" ? "oyiga" : undefined,
          city: valid.city,
          district: valid.district || valid.city,
          address: valid.district ? `${valid.city}, ${valid.district}` : valid.city,
          rooms: valid.rooms,
          area_sqm: valid.area_sqm,
          student_gender: valid.student_gender ?? null,
          available_spots: valid.available_spots ?? null,
          nearUniversity: valid.near_university || undefined,
          with_owner: valid.with_owner ?? null,
          amenities: valid.amenities,
          images: images.map((item) => item.previewUrl),
          contact_phone: valid.contact_phone,
          status: "active",
          isVerified: true,
        };
        setCreatedListing(localListing);
        showToast({ type: "success", message: "E'lon muvaffaqiyatli joylandi!" });
        onSuccess?.(localListing);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "E'lonni saqlashda xatolik yuz berdi.";
      setErrorMsg(msg);
      showToast({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (createdListing) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="h-8 w-8 stroke-[2.5]" />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold text-[#0F2942]">
          E&apos;lon muvaffaqiyatli joylandi!
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          &ldquo;{createdListing.title}&rdquo; nomli e&apos;loningiz{" "}
          {createdListing.images.length} ta rasm bilan birga bazaga saqlandi.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#0F2942] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#163a5c] sm:w-auto"
          >
            Bosh sahifaga qaytish
          </a>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
          >
            Yana e&apos;lon joylash
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. KATEGORIYA TANLASH (3 ta katta chiroyli kartochka) */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0F2942] text-xs font-bold text-white">
            1
          </span>
          <h2 className="text-lg font-bold text-[#0F2942]">
            Kategoriya tanlang
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          E&apos;lon turiga qarab formadagi maydonlar avtomatik moslashadi.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CATEGORY_CARDS.map((card) => {
            const Icon = card.icon;
            const isSelected = category === card.value;
            return (
              <button
                key={card.value}
                type="button"
                onClick={() => setCategory(card.value)}
                className={`relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/40 shadow-md shadow-emerald-500/10"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  </span>
                )}
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.accentClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 pr-6 text-sm font-bold text-[#0F2942]">
                  {card.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {card.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. TALABALAR UCHUN DINAMIK MAYDONLAR */}
      {category === "student_dorm" && (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-emerald-950">
              Talabalar uchun qo&apos;shimcha ma&apos;lumotlar
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Kimlar uchun */}
            <div>
              <label className="text-xs font-semibold text-emerald-900">
                Kimlar uchun? *
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { value: "boys", label: "O'g'il bolalar" },
                  { value: "girls", label: "Qiz bolalar" },
                  { value: "any", label: "Farqi yo'q" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setStudentGender(opt.value as StudentGender)
                    }
                    className={`rounded-xl border px-2.5 py-2.5 text-xs font-semibold transition-all ${
                      studentGender === opt.value
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                        : "border-emerald-200 bg-white text-slate-700 hover:bg-emerald-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bo'sh joylar soni */}
            <div>
              <label className="text-xs font-semibold text-emerald-900">
                Nechta bo&apos;sh joy bor? *
              </label>
              <div className="mt-2 flex items-center gap-2">
                <div className="relative flex-1">
                  <Users className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={availableSpots}
                    onChange={(e) => setAvailableSpots(e.target.value)}
                    placeholder="Masalan: 2"
                    className="w-full rounded-xl border border-emerald-200 bg-white py-2.5 pr-3.5 pl-10 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-1">
                  {["1", "2", "3", "4"].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAvailableSpots(num)}
                      className={`h-10 w-10 rounded-xl border text-xs font-bold transition-colors ${
                        availableSpots === num
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-emerald-200 bg-white text-slate-700 hover:bg-emerald-50"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* OTM ga yaqinligi */}
            <div>
              <label className="text-xs font-semibold text-emerald-900">
                OTM ga yaqinligi
              </label>
              <input
                type="text"
                value={nearUniversity}
                onChange={(e) => setNearUniversity(e.target.value)}
                placeholder="Masalan: KIUT yoki O'zMU ga 10 daqiqalik yo'l"
                className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Uy egasi bilanmi yoki alohida */}
            <div>
              <label className="text-xs font-semibold text-emerald-900">
                Yashash tartibi
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWithOwner(false)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                    !withOwner
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-emerald-200 bg-white text-slate-700 hover:bg-emerald-50"
                  }`}
                >
                  Alohida (uy egasisiz)
                </button>
                <button
                  type="button"
                  onClick={() => setWithOwner(true)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                    withOwner
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-emerald-200 bg-white text-slate-700 hover:bg-emerald-50"
                  }`}
                >
                  Uy egasi bilan
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. ASOSIY MA'LUMOTLAR */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0F2942] text-xs font-bold text-white">
            2
          </span>
          <h2 className="text-lg font-bold text-[#0F2942]">
            Asosiy ma&apos;lumotlar
          </h2>
        </div>

        <div className="mt-5 space-y-4">
          {/* Sarlavha */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Sarlavha *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                category === "student_dorm"
                  ? "Masalan: Chilonzorda KIUT talabalari uchun shinam xona"
                  : category === "sale"
                  ? "Masalan: Yunusobodda yevro ta'mirli 3 xonali kvartira"
                  : "Masalan: Mirzo Ulug'bekda oila uchun 2 xonali kvartira"
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Shahar va Tuman */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Viloyat / Shahar *
              </label>
              <div className="relative mt-1.5">
                <MapPin className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={city}
                  onChange={(e) => {
                    const nextCity = e.target.value;
                    setCity(nextCity);
                    setDistrict(UZBEKISTAN_REGIONS[nextCity]?.[0] || "");
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3.5 pl-10 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                >
                  {CITIES.filter((c) => c !== "Barchasi").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Tuman / Shahar *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              >
                {(UZBEKISTAN_REGIONS[city] || []).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Narxi, Valyuta, Xonalar, Maydon */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-700">
                Narxi {category !== "sale" ? "(oyiga)" : ""} *
              </label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={currency === "USD" ? "550" : "1200000"}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Valyuta
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "USD" | "UZS")}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="UZS">UZS (so&apos;m)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Xonalar soni *
              </label>
              <input
                type="number"
                required
                min={1}
                max={30}
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Umumiy maydoni (m²) *
              </label>
              <input
                type="number"
                required
                min={5}
                value={areaSqm}
                onChange={(e) => setAreaSqm(e.target.value)}
                placeholder="65"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Qulayliklar (Checkboxlar) */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Qulayliklar
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {AMENITIES_OPTIONS.map((item) => {
                const checked = amenities.includes(item);
                return (
                  <label
                    key={item}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors ${
                      checked
                        ? "border-emerald-500 bg-emerald-50/70 text-emerald-900"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(item)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Batafsil ma'lumot */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Batafsil ma&apos;lumot
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Xonadon holati, atrofdagi infratuzilma, metro yoki avtobus bekatlariga masofa, kommunal to'lovlar haqida yozing..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Telefon raqam */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Telefon raqam *
            </label>
            <div className="relative mt-1.5 max-w-sm">
              <Phone className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full rounded-xl border border-slate-200 py-2.5 pr-3.5 pl-10 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. RASM YUKLASH (Drag & Drop + Mobil Kamera + Browser Siqish) */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0F2942] text-xs font-bold text-white">
              3
            </span>
            <h2 className="text-lg font-bold text-[#0F2942]">
              Rasmlar yuklash
            </h2>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              images.length >= MIN_IMAGES
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {images.length} / {MAX_IMAGES} rasm (kamida {MIN_IMAGES} ta)
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-500">
          Rasmlar yuklashdan oldin brauzeringizda avtomatik siqiladi (max
          1200px). Birinchi rasm e&apos;lonning asosiy muqovasi bo&apos;ladi.
        </p>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
            isDragging
              ? "border-emerald-500 bg-emerald-50/70"
              : "border-slate-300 bg-slate-50/60 hover:border-emerald-400"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
            {compressing ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">
            {compressing
              ? "Rasmlar siqilmoqda..."
              : "Rasmlarni bu yerga tashlang (Drag & Drop)"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            yoki quyidagi tugmalar orqali galereyadan / kameradan tanlang
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              disabled={compressing || images.length >= MAX_IMAGES}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#0F2942] shadow-xs transition-colors hover:bg-slate-100 disabled:opacity-50"
            >
              <ImagePlus className="h-4 w-4 text-emerald-600" />
              <span>Fayl / Galereyadan tanlash</span>
            </button>

            <button
              type="button"
              disabled={compressing || images.length >= MAX_IMAGES}
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F2942] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#163a5c] disabled:opacity-50"
            >
              <Camera className="h-4 w-4 text-emerald-400" />
              <span>Kameradan rasmga olish</span>
            </button>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Preview Grid */}
        {images.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((item, idx) => (
              <div
                key={item.id}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
              >
                <img
                  src={item.previewUrl}
                  alt={`Preview ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                {idx === 0 && (
                  <span className="absolute bottom-2 left-2 rounded-lg bg-[#0F2942]/85 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                    Asosiy rasm
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(item.id)}
                  aria-label="Rasmni o'chirish"
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/75 text-white shadow-sm transition-colors hover:bg-rose-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SUBMIT BUTTON */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:p-6">
        <div className="flex items-center gap-2.5 text-xs text-slate-500">
          <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            E&apos;lon joylangandan so&apos;ng barcha foydalanuvchilarga
            ko&apos;rinadi.
          </span>
        </div>
        <button
          type="submit"
          disabled={submitting || compressing}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 active:scale-[0.99] disabled:opacity-60 sm:w-auto"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Yuklanmoqda...</span>
            </>
          ) : (
            <span>E&apos;lonni joylash</span>
          )}
        </button>
      </div>
    </form>
  );
}

