// src/api/schedules.js
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  (typeof window !== "undefined" &&
    window.ENV &&
    window.ENV.API_BASE_URL) ||
  "";

function getTokenFromCookies() {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)(Authorization|accessToken|token)=([^;]+)/i);
  return m ? decodeURIComponent(m[2]) : "";
}

function authHeader() {
  const raw =
    (typeof localStorage !== "undefined" &&
      (localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("Authorization"))) ||
    (typeof sessionStorage !== "undefined" &&
      (sessionStorage.getItem("accessToken") || sessionStorage.getItem("token"))) ||
    getTokenFromCookies() ||
    "";
  if (!raw) return {};
  const value = /^Bearer\s+/i.test(raw) ? raw : `Bearer ${raw}`;
  return { Authorization: value };
}

export function normalizeSchedule(r) {
  return {
    id: r.id,
    title: r.title ?? "",
    content: r.content ?? "",
    date: r.date ?? r.createdAt ?? "",
    type: r.type ?? "crop_diary",
    color: r.color ?? "",
    image: r.imageUrl || r.image || null,
    plant: r.crop?.name || r.cropName || undefined,
    cropId: r.crop?.id ?? r.cropId ?? undefined,
  };
}

export async function fetchSchedules(params = {}) {
  const url = new URL("/schedules", API_BASE || window.location.origin);
  if (params.cropId) url.searchParams.set("cropId", String(params.cropId));
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json", ...authHeader() },
  });
  if (!res.ok) throw new Error(`Failed to fetch /schedules (${res.status})`);
  const json = await res.json();
  const list = Array.isArray(json?.schedules) ? json.schedules : (Array.isArray(json) ? json : []);
  return list.map(normalizeSchedule);
}

export async function createSchedule(payload) {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("date", payload.date);
  fd.append("type", payload.type || "crop_diary");
  if (payload.content) fd.append("content", payload.content);
  if (payload.cropId) fd.append("cropId", String(payload.cropId));
  if (payload.color) fd.append("color", payload.color);
  if (payload.imageFile) fd.append("image", payload.imageFile);

  const res = await fetch(new URL("/schedules", API_BASE || window.location.origin).toString(), {
    method: "POST",
    headers: { ...authHeader() }, 
    body: fd,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to POST /schedules (${res.status})`);
  }
  const json = await res.json();
  const rec = json?.schedule || json?.data || json;
  return normalizeSchedule(rec);
}
