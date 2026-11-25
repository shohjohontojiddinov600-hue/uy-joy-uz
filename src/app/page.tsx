"use client";

import React, { useEffect, useMemo, useState } from "react";
import AuthModal from "@/components/AuthModal";
import Footer from "@/components/Footer";
import HeroFilter from "@/components/HeroFilter";
import ListingCard from "@/components/ListingCard";
import ListingModal from "@/components/ListingModal";
import Navbar from "@/components/Navbar";
import PostListingModal from "@/components/PostListingModal";
import { MOCK_LISTINGS } from "@/data/mockListings";
import { fetchActiveListings } from "@/lib/listingsApi";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { FilterState, Listing, ListingCategory } from "@/types/listing";
import { User } from "@supabase/supabase-js";
import {
  GraduationCap,
  Home,
  KeyRound,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const INITIAL_FILTERS: FilterState = {
  category: "all",
  city: "Barchasi",
  minPrice: "",
  maxPrice: "",
  rooms: "all",
  searchQuery: "",
};

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Supabase Auth session & e'lonlarni yuklash
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    fetchActiveListings().then((dbListings) => {
      if (dbListings.length > 0) {
        setListings([...dbListings, ...MOCK_LISTINGS]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  // Category filter trigger from Navbar
  const handleSelectCategory = (category: ListingCategory) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleAddListing = (newListing: Listing) => {
    setListings((prev) => [newListing, ...prev]);
  };

  // Filter logic
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (filters.category !== "all" && item.category !== filters.category) {
        return false;
      }

      if (filters.city !== "Barchasi" && item.city !== filters.city) {
        return false;
      }

      if (filters.rooms !== "all") {
        if (filters.rooms === "4+") {
          if (item.rooms < 4) return false;
        } else {
          if (item.rooms !== Number(filters.rooms)) return false;
        }
      }

      if (filters.minPrice) {
        const minVal = parseFloat(filters.minPrice);
        if (!isNaN(minVal) && item.price < minVal) {
          return false;
        }
      }

      if (filters.maxPrice) {
        const maxVal = parseFloat(filters.maxPrice);
        if (!isNaN(maxVal) && item.price > maxVal) {
          return false;
        }
      }

      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesAddress = (item.address || "").toLowerCase().includes(q);
        const matchesDistrict = item.district.toLowerCase().includes(q);
        const matchesUniv = item.nearUniversity
          ? item.nearUniversity.toLowerCase().includes(q)
          : false;

        if (!matchesTitle && !matchesAddress && !matchesDistrict && !matchesUniv) {
          return false;
        }
      }

      return true;
    });
  }, [listings, filters]);

  // Quick stats by type
  const counts = useMemo(() => {
    return {
      sale: listings.filter((l) => l.category === "sale").length,
      rent: listings.filter((l) => l.category === "rent").length,
      student_dorm: listings.filter((l) => l.category === "student_dorm").length,
    };
  }, [listings]);

  const userName =
    (currentUser?.user_metadata?.full_name as string | undefined) || null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50">
      {/* Top Navbar */}
      <Navbar
        activeCategory={filters.category}
        onSelectCategory={handleSelectCategory}
        onOpenPostModal={() => setIsPostModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        userEmail={currentUser?.email ?? null}
        userName={userName}
        onSignOut={handleSignOut}
      />

      {/* Hero + Filter Section */}
      <main className="flex-1">
        <HeroFilter
          filters={filters}
          onChangeFilters={setFilters}
          onResetFilters={handleResetFilters}
          totalCount={listings.length}
        />

        {/* Feature Banners */}
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div
              onClick={() => handleSelectCategory("sale")}
              className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0F2942]/8 text-[#0F2942] group-hover:bg-[#0F2942] group-hover:text-white transition-colors">
                <Home className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F2942]">
                  Sotiladigan ko&apos;chmas mulk
                </h4>
                <p className="text-xs text-slate-500">
                  {counts.sale} ta yangi va ikkilamchi e&apos;lon
                </p>
              </div>
            </div>

            <div
              onClick={() => handleSelectCategory("rent")}
              className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-sky-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F2942]">
                  Uzoq muddatli ijara
                </h4>
                <p className="text-xs text-slate-500">
                  {counts.rent} ta qulay oilaviy xonadonlar
                </p>
              </div>
            </div>

            <div
              onClick={() => handleSelectCategory("student_dorm")}
              className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 transition-all hover:border-emerald-400 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900">
                  Talabalar yotoqxonalari
                </h4>
                <p className="text-xs text-emerald-700">
                  {counts.student_dorm} ta OTM yaqinidagi arzon variantlar
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Listings Section */}
        <section
          id="listings"
          className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
        >
          {/* Section Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Dolzarb takliflar
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0F2942]">
                {filters.category === "all" && "Barcha e'lonlar"}
                {filters.category === "sale" && "Sotiladigan uylar"}
                {filters.category === "rent" && "Ijara kvartiralar"}
                {filters.category === "student_dorm" &&
                  "Talabalar uchun yotoqxonalar"}
              </h2>
            </div>

            <p className="text-sm text-slate-500">
              <span className="font-bold text-[#0F2942]">
                {filteredListings.length}
              </span>{" "}
              ta e&apos;lon topildi
            </p>
          </div>

          {/* Grid of Listings */}
          {filteredListings.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredListings.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  onSelect={(selected) => setSelectedListing(selected)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <RotateCcw className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-800">
                Tanlangan filtrlar bo&apos;yicha e&apos;lon topilmadi
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Filtr parametrlarini o&apos;zgartirib ko&apos;ring yoki
                tozalang.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                Filtrlarni tozalash
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <ListingModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
      />

      <PostListingModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmit={handleAddListing}
        userId={currentUser?.id ?? null}
        onRequireAuth={() => setIsAuthModalOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
