"use client";

import React, { useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { AMENITIES_OPTIONS, CITIES, UZBEKISTAN_REGIONS } from "@/data/mockListings";
import { useToast } from "@/components/ToastProvider";
import { updateListingInDb } from "@/lib/listingsApi";
import { listingFormSchema } from "@/lib/validation";
import { Listing, ListingType, StudentGender } from "@/types/listing";

interface EditListingModalProps {
  listing: Listing;
  userId: string;
  onClose: () => void;
  onUpdated: (updated: Listing) => void;
}

export default function EditListingModal({
  listing,
  userId,
  onClose,
  onUpdated,
}: EditListingModalProps) {
  const { showToast } = useToast();
  const [category, setCategory] = useState<ListingType>(listing.category);
  const [title, setTitle] = useState(listing.title);
  const [city, setCity] = useState(listing.city);
  const [district, setDistrict] = useState(listing.district);
  const [price, setPrice] = useState(String(listing.price));
  const [currency, setCurrency] = useState<"USD" | "UZS">(listing.currency);
  const [rooms, setRooms] = useState(String(listing.rooms));
  const [areaSqm, setAreaSqm] = useState(String(listing.area_sqm));
  const [contactPhone, setContactPhone] = useState(listing.contact_phone);
  const [description, setDescription] = useState(listing.description);
  const [amenities, setAmenities] = useState<string[]>(listing.amenities);
  const [studentGender, setStudentGender] = useState<StudentGender>(
    listing.student_gender || "any"
  );
  const [availableSpots, setAvailableSpots] = useState(
    String(listing.available_spots ?? 1)
  );
  const [nearUniversity, setNearUniversity] = useState(
    listing.nearUniversity || ""
  );
  const [withOwner, setWithOwner] = useState(Boolean(listing.with_owner));
  const [saving, setSaving] = useState(false);

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      near_university: category === "student_dorm" ? nearUniversity : null,
      with_owner: category === "student_dorm" ? withOwner : null,
    });

    if (!parsed.success) {
      showToast({
        type: "error",
        message:
          parsed.error.issues[0]?.message ||
          "Maydonlarni to'g'ri to'ldiring.",
      });
      return;
    }

    const valid = parsed.data;
    setSaving(true);
    try {
      const updated = await updateListingInDb(listing.id, userId, {
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
        contact_phone: valid.contact_phone,
      });

      showToast({ type: "success", message: "E'lon muvaffaqiyatli yangilandi!" });
      onUpdated(updated);
      onClose();
    } catch (err) {
      showToast({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Tahrirlashda xatolik yuz berdi.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Yopish"
          className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-[#0F2942]">
          E&apos;lonni tahrirlash
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "sale", label: "Sotuv" },
              { value: "rent", label: "Ijara" },
              { value: "student_dorm", label: "Talabalar" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setCategory(item.value as ListingType)}
                className={`rounded-xl border py-2 text-xs font-semibold ${
                  category === item.value
                    ? "border-[#0F2942] bg-[#0F2942] text-white"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Sarlavha *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Viloyat / Shahar
              </label>
              <select
                value={city}
                onChange={(e) => {
                  const nextCity = e.target.value;
                  setCity(nextCity);
                  setDistrict(UZBEKISTAN_REGIONS[nextCity]?.[0] || "");
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
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
                Tuman / Shahar
              </label>
              {UZBEKISTAN_REGIONS[city] ? (
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  {UZBEKISTAN_REGIONS[city].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                  {!UZBEKISTAN_REGIONS[city].includes(district) && district && (
                    <option value={district}>{district}</option>
                  )}
                </select>
              ) : (
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Narxi *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Valyuta
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "USD" | "UZS")}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="USD">USD</option>
                <option value="UZS">UZS</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Xonalar
              </label>
              <input
                type="number"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Maydon (m²)
              </label>
              <input
                type="number"
                value={areaSqm}
                onChange={(e) => setAreaSqm(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {category === "student_dorm" && (
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-emerald-900">
                  Kimlar uchun?
                </label>
                <select
                  value={studentGender}
                  onChange={(e) =>
                    setStudentGender(e.target.value as StudentGender)
                  }
                  className="mt-1 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs"
                >
                  <option value="any">Farqi yo&apos;q</option>
                  <option value="boys">O&apos;g&apos;il bolalar</option>
                  <option value="girls">Qiz bolalar</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-emerald-900">
                  Bo&apos;sh joylar
                </label>
                <input
                  type="number"
                  min={1}
                  value={availableSpots}
                  onChange={(e) => setAvailableSpots(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-emerald-900">
                  OTM ga yaqinligi
                </label>
                <input
                  type="text"
                  value={nearUniversity}
                  onChange={(e) => setNearUniversity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-emerald-900">
                  Yashash tartibi
                </label>
                <select
                  value={withOwner ? "yes" : "no"}
                  onChange={(e) => setWithOwner(e.target.value === "yes")}
                  className="mt-1 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs"
                >
                  <option value="no">Alohida (uy egasisiz)</option>
                  <option value="yes">Uy egasi bilan</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Qulayliklar
            </label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {AMENITIES_OPTIONS.map((item) => {
                const checked = amenities.includes(item);
                return (
                  <label
                    key={item}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs ${
                      checked
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(item)}
                      className="h-3.5 w-3.5 rounded text-emerald-600"
                    />
                    <span>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Telefon raqam *
            </label>
            <input
              type="tel"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Tavsif
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Saqlash</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

