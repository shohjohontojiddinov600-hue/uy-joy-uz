import { supabase } from "./supabase";

export const PHONE_SESSION_KEY = "uyjoy_phone_session";
export const AUTH_CHANGED_EVENT = "uyjoy-phone-auth-changed";

export interface PhoneUserSession {
  id: string;
  full_name: string;
  phone_number: string;
  isDemo: boolean;
  created_at: string;
}

export function formatUzPhoneDisplay(digits9: string): string {
  const clean = digits9.replace(/\D/g, "").slice(0, 9);
  const p1 = clean.slice(0, 2);
  const p2 = clean.slice(2, 5);
  const p3 = clean.slice(5, 7);
  const p4 = clean.slice(7, 9);

  let formatted = "+998";
  if (p1) formatted += ` (${p1}`;
  if (p1.length === 2) formatted += ")";
  if (p2) formatted += ` ${p2}`;
  if (p3) formatted += `-${p3}`;
  if (p4) formatted += `-${p4}`;
  return formatted;
}

export function formatUzPhoneInput(rawDigits: string): string {
  const clean = rawDigits.replace(/\D/g, "").slice(0, 9);
  const p1 = clean.slice(0, 2);
  const p2 = clean.slice(2, 5);
  const p3 = clean.slice(5, 7);
  const p4 = clean.slice(7, 9);

  let out = "";
  if (p1) out += `(${p1}`;
  if (p1.length === 2 && (p2 || clean.length > 2)) out += ") ";
  else if (p1.length === 2) out += ")";
  if (p2) out += p2;
  if (p3) out += `-${p3}`;
  if (p4) out += `-${p4}`;
  return out;
}

export function toE164UzPhone(digits9: string): string {
  const clean = digits9.replace(/\D/g, "").slice(0, 9);
  return `+998${clean}`;
}

export function getStoredPhoneSession(): PhoneUserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PHONE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PhoneUserSession;
    if (!parsed?.phone_number || !parsed?.full_name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePhoneSession(session: PhoneUserSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PHONE_SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
  } catch {
    // localStorage cheklangan holat
  }
}

export async function clearPhoneSession(): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(PHONE_SESSION_KEY);
      window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
    } catch {
      // ignore
    }
  }
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
}

export async function upsertUserProfile(
  userId: string,
  fullName: string,
  phoneNumber: string
): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from("profiles").upsert(
      {
        id: userId,
        full_name: fullName,
        phone_number: phoneNumber,
      },
      { onConflict: "id" }
    );
  } catch {
    // Demo yoki RLS holatida xatoni yutib yubormaslik uchun jim fallback
  }
}

