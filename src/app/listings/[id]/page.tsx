"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, Home, Plus } from "lucide-react";
import Footer from "@/components/Footer";
import ListingDetailView from "@/components/ListingDetailView";
import { ListingDetailSkeleton } from "@/components/Skeletons";
import { fetchListingById, ListingDetailResult } from "@/lib/listingsApi";

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const listingId = params?.id;

  const [result, setResult] = useState<ListingDetailResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listingId) return;
    let active = true;

    fetchListingById(listingId)
      .then((res) => {
        if (active) setResult(res);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [listingId]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/70">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#0F2942]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Barcha e&apos;lonlar</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F2942] text-white">
              <Building2 className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#0F2942]">
              UyJoy<span className="text-emerald-600">.uz</span>
            </span>
          </Link>

          <Link
            href="/create-listing"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">E&apos;lon joylash</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <ListingDetailSkeleton />
        ) : !result ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Home className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-[#0F2942]">
              E&apos;lon topilmadi
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Ushbu e&apos;lon o&apos;chirilgan yoki manzil noto&apos;g&apos;ri
              kiritilgan bo&apos;lishi mumkin.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F2942] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a5c]"
            >
              Bosh sahifaga qaytish
            </Link>
          </div>
        ) : (
          <ListingDetailView listing={result.listing} owner={result.owner} />
        )}
      </main>

      <Footer />
    </div>
  );
}

