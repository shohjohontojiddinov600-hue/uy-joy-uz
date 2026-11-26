"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Edit3,
  Eye,
  Heart,
  Home,
  Lock,
  LogIn,
  LogOut,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import BottomNav from "@/components/BottomNav";
import EditListingModal from "@/components/EditListingModal";
import Footer from "@/components/Footer";
import { usePhoneAuth } from "@/components/PhoneAuthGate";
import { DashboardSkeleton } from "@/components/Skeletons";
import { useToast } from "@/components/ToastProvider";
import { formatListingPrice } from "@/data/mockListings";
import {
  FAVORITES_CHANGED_EVENT,
  getFavoriteIds,
  toggleFavoriteId,
} from "@/lib/favorites";
import {
  deleteListingInDb,
  fetchListingsByIds,
  fetchUserListings,
  updateListingStatusInDb,
} from "@/lib/listingsApi";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Listing } from "@/types/listing";

type DashboardTab = "my_listings" | "favorites";

export default function DashboardPage() {
  const { showToast } = useToast();
  const { session, signOut } = usePhoneAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(isSupabaseConfigured);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<DashboardTab>("my_listings");
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    const ids = getFavoriteIds();
    if (ids.length === 0) {
      setFavoriteListings([]);
      return;
    }
    const items = await fetchListingsByIds(ids);
    setFavoriteListings(items);
  }, []);

  const loadDashboardData = useCallback(
    async (user: User | null) => {
      setLoadingData(true);
      try {
        await loadFavorites();
        if (user) {
          const mine = await fetchUserListings(user.id);
          setMyListings(mine);
        } else {
          setMyListings([]);
        }
      } catch (err) {
        showToast({
          type: "error",
          message:
            err instanceof Error
              ? err.message
              : "Ma'lumotlarni yuklashda xatolik yuz berdi.",
        });
      } finally {
        setLoadingData(false);
      }
    },
    [loadFavorites, showToast]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "favorites") {
        setActiveTab("favorites");
      }
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setCheckingAuth(false);
      loadDashboardData(null);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      setCheckingAuth(false);
      loadDashboardData(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      setCheckingAuth(false);
      loadDashboardData(user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadDashboardData]);

  useEffect(() => {
    const handler = () => {
      loadFavorites();
    };
    window.addEventListener(FAVORITES_CHANGED_EVENT, handler);
    return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, handler);
  }, [loadFavorites]);

  const handleToggleStatus = async (item: Listing) => {
    if (!currentUser) return;
    const nextStatus = item.status === "active" ? "sold" : "active";
    setBusyId(item.id);
    try {
      const updated = await updateListingStatusInDb(
        item.id,
        currentUser.id,
        nextStatus
      );
      setMyListings((prev) =>
        prev.map((l) => (l.id === item.id ? updated : l))
      );
      showToast({
        type: "success",
        message:
          nextStatus === "sold"
            ? "E'lon 'Sotildi / Band qilindi' deb belgilandi."
            : "E'lon qayta faollashtirildi.",
      });
    } catch (err) {
      showToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Holatni o'zgartirishda xatolik.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: Listing) => {
    if (!currentUser) return;
    const confirmed = window.confirm(
      `"${item.title}" e'lonini va uning rasmlarini butunlay o'chirmoqchimisiz?`
    );
    if (!confirmed) return;

    setBusyId(item.id);
    try {
      await deleteListingInDb(item.id, currentUser.id, item.images);
      setMyListings((prev) => prev.filter((l) => l.id !== item.id));
      showToast({
        type: "success",
        message: "E'lon va rasmlari muvaffaqiyatli o'chirildi.",
      });
    } catch (err) {
      showToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "O'chirishda xatolik yuz berdi.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleRemoveFavorite = (id: string) => {
    toggleFavoriteId(id);
    setFavoriteListings((prev) => prev.filter((item) => item.id !== id));
    showToast({
      type: "info",
      message: "E'lon saqlanganlardan olib tashlandi.",
    });
  };

  const isAuthorized =
    !isSupabaseConfigured || Boolean(currentUser) || Boolean(session);

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F7FC] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Bosh sahifa</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F2942] text-white">
              <Building2 className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-base font-bold text-[#0F2942]">
              UyJoy<span className="text-emerald-600">.uz</span>
            </span>
          </Link>

          <Link
            href="/create-listing"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">E&apos;lon joylash</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F2942] sm:text-3xl">
              Shaxsiy kabinet
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {session
                ? `${session.full_name} (${session.phone_number})`
                : currentUser?.email || "Saqlangan va joylangan e'lonlaringizni boshqaring."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Tabs */}
            <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab("my_listings")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                  activeTab === "my_listings"
                    ? "bg-[#1D61E7] text-white"
                    : "text-slate-600 hover:text-[#1D61E7]"
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Mening e&apos;lonlarim ({myListings.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("favorites")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                  activeTab === "favorites"
                    ? "bg-[#1D61E7] text-white"
                    : "text-slate-600 hover:text-[#1D61E7]"
                }`}
              >
                <Heart className="h-4 w-4" />
                <span>Saqlanganlar ({favoriteListings.length})</span>
              </button>
            </div>

            {session && (
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Chiqish</span>
              </button>
            )}
          </div>
        </div>

        {checkingAuth || loadingData ? (
          <DashboardSkeleton />
        ) : activeTab === "my_listings" && !isAuthorized ? (
          <div className="rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#0F2942]">
              Shaxsiy kabinetga kirish
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              O&apos;z e&apos;lonlaringizni ko&apos;rish, tahrirlash va
              o&apos;chirish uchun tizimga kiring.
            </p>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              <LogIn className="h-4 w-4" />
              <span>Kirish / Ro&apos;yxatdan o&apos;tish</span>
            </button>
          </div>
        ) : activeTab === "my_listings" ? (
          myListings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Home className="mx-auto h-10 w-10 text-slate-300" />
              <h2 className="mt-4 text-lg font-bold text-[#0F2942]">
                Hozircha sizda e&apos;lonlar yo&apos;q
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Birinchi e&apos;loningizni joylab, ijarachi yoki xaridor
                toping.
              </p>
              <Link
                href="/create-listing"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4" />
                <span>E&apos;lon joylash</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myListings.map((item) => {
                const isSold = item.status === "sold";
                const isBusy = busyId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-xs transition-all sm:flex-row sm:items-center ${
                      isSold
                        ? "border-slate-200 opacity-80"
                        : "border-slate-200"
                    }`}
                  >
                    <Link
                      href={`/listings/${item.id}`}
                      className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-44"
                    >
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-lg px-2.5 py-0.5 text-[11px] font-bold ${
                            isSold
                              ? "bg-slate-200 text-slate-700"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isSold ? "Sotildi / Band qilindi" : "Faol"}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {item.city}
                          {item.district ? `, ${item.district}` : ""}
                        </span>
                      </div>

                      <Link
                        href={`/listings/${item.id}`}
                        className="mt-1.5 block truncate text-base font-bold text-[#0F2942] hover:underline"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-1 text-sm font-extrabold text-emerald-700">
                        {formatListingPrice(item)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setEditingListing(item)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Tahrirlash</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
                          isSold
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                        }`}
                      >
                        {isSold ? (
                          <>
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Faollashtirish</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Sotildi / Band qilindi</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDelete(item)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>O&apos;chirish</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : favoriteListings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Heart className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-bold text-[#0F2942]">
              Saqlangan e&apos;lonlar yo&apos;q
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Yoqqan uylaringizdagi yurakcha tugmasini bosing — ular shu yerda
              saqlanadi.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0F2942] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#163a5c]"
            >
              E&apos;lonlarni ko&apos;rish
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteListings.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center"
              >
                <Link
                  href={`/listings/${item.id}`}
                  className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-44"
                >
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400">
                    {item.city}
                    {item.district ? `, ${item.district}` : ""}
                  </p>
                  <Link
                    href={`/listings/${item.id}`}
                    className="mt-1 block truncate text-base font-bold text-[#0F2942] hover:underline"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-1 text-sm font-extrabold text-emerald-700">
                    {formatListingPrice(item)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/listings/${item.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F2942] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#163a5c]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Ko&apos;rish</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemoveFavorite(item.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Olib tashlash</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      <BottomNav
        activeTab={activeTab === "favorites" ? "favorites" : "profile"}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {editingListing && currentUser && (
        <EditListingModal
          listing={editingListing}
          userId={currentUser.id}
          onClose={() => setEditingListing(null)}
          onUpdated={(updated) =>
            setMyListings((prev) =>
              prev.map((l) => (l.id === updated.id ? updated : l))
            )
          }
        />
      )}
    </div>
  );
}

