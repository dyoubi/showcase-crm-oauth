import type { JSONArray, JSONObject, Primitive } from "~/domain/types";

export function IsBrowser() { return !(typeof document === 'undefined'); }


export function absolute(url: string, request: Request) {
  const u = new URL(request.url);
  return new URL(url, u.origin).toString();
}

export function resolveUrl(path: string, base?: string | URL) {
  if (base) return new URL(path, base).toString();
  if (typeof window !== 'undefined') return new URL(path, window.location.origin).toString();
  return path;
}

export function getLocaleHeader(locale?: string) {
  const raw = locale ?? (typeof navigator !== "undefined" ? navigator.language : "en");
  // bcp47 simplifié: fr-FR -> fr-FR, fr-fr -> fr-FR, fr -> fr
  const [lang, region] = raw.split(/[-_]/);
  return region ? `${lang.toLowerCase()}-${region.toUpperCase()}` : lang.toLowerCase();
}

function escapeRe(s: string) {
  return s.replace(/[-.$?*|{}()[\]\\/+^]/g, '\\$&');
}
export function getCookie(name: string, cookieHeader?: string): string | null {
  const source =
    typeof cookieHeader === 'string'
      ? cookieHeader
      : typeof document !== 'undefined'
        ? document.cookie
        : '';

  if (!source) return null;

  const m = source.match(new RegExp(`(?:^|;\\s*)${escapeRe(name)}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export async function fetchJsonObject<T = JSONObject>(url: string | URL, init?: RequestInit) {
  const res = await fetch(url, init);
  let data: T | null = null;
  try {
    data = await res.json();
  } catch {/** ignore JSON parse error; will throw below if not ok */ }
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return data as T;
}