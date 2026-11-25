import React from "react";
import {
  Building2,
  GraduationCap,
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F2942] text-white">
                <Building2 className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-lg font-bold text-[#0F2942]">
                UyJoy<span className="text-emerald-600">.uz</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              O&apos;zbekistonda ko&apos;chmas mulk oldi-sotdisi, kvartiralar
              ijarasi va talabalar uchun maxsus turar joy qidiruv tizimi.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Ishonchli va tekshirilgan e&apos;lonlar</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F2942]">
              Bo&apos;limlar
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <a href="#listings" className="hover:text-emerald-600">
                  Sotiladigan uylar
                </a>
              </li>
              <li>
                <a href="#listings" className="hover:text-emerald-600">
                  Uzoq muddatli ijara
                </a>
              </li>
              <li>
                <a href="#listings" className="hover:text-emerald-600">
                  Talabalar yotoqxonalari
                </a>
              </li>
              <li>
                <a href="#listings" className="hover:text-emerald-600">
                  Universitetlar atrofidagi uylar
                </a>
              </li>
            </ul>
          </div>

          {/* Talabalar uchun maxsus */}
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0F2942]">
              <GraduationCap className="h-4 w-4 text-emerald-600" />
              Talabalar markazi
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <span className="text-slate-500">O&apos;zMU / TDTU talabalar shaharchasi</span>
              </li>
              <li>
                <span className="text-slate-500">Toshkent moliya / Iqtisodiyot OTM</span>
              </li>
              <li>
                <span className="text-slate-500">NamDU va Samarqand oliygohlari</span>
              </li>
              <li>
                <span className="text-emerald-700 font-medium">Hamyonbop oylik to&apos;lovlar</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F2942]">
              Aloqa
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>Toshkent shahri, Amir Temur shox ko&apos;chasi</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                <span>+998 (71) 200-00-00</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-emerald-600" />
                <span>info@uyjoy.uz</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© 2026 UyJoy.uz — Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Foydalanish shartlari</span>
            <span className="hover:text-slate-600 cursor-pointer">Maxfiylik siyosati</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

