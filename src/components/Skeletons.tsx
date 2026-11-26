import React from "react";

export function ListingCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-[16/10] w-full bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-6 w-1/2 rounded-lg bg-slate-200" />
        <div className="h-4 w-5/6 rounded-lg bg-slate-200" />
        <div className="h-3.5 w-2/3 rounded-lg bg-slate-100" />
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="h-4 w-24 rounded-lg bg-slate-100" />
          <div className="h-8 w-20 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function ListingDetailSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="aspect-[16/10] w-full rounded-2xl bg-slate-200" />
          <div className="mt-3 flex gap-2.5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 w-28 rounded-xl bg-slate-200" />
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-7">
          <div className="h-6 w-36 rounded-xl bg-slate-200" />
          <div className="h-9 w-1/3 rounded-xl bg-slate-200" />
          <div className="h-6 w-3/4 rounded-xl bg-slate-200" />
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-4">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="h-5 w-32 rounded-lg bg-slate-200" />
          <div className="h-16 rounded-2xl bg-slate-100" />
          <div className="h-12 rounded-2xl bg-slate-200" />
          <div className="h-11 rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="flex animate-pulse flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
        >
          <div className="h-28 w-full shrink-0 rounded-xl bg-slate-200 sm:w-44" />
          <div className="flex-1 space-y-2.5">
            <div className="h-4 w-24 rounded-lg bg-slate-200" />
            <div className="h-5 w-2/3 rounded-lg bg-slate-200" />
            <div className="h-4 w-1/3 rounded-lg bg-slate-100" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 rounded-xl bg-slate-200" />
            <div className="h-9 w-24 rounded-xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

