const API_BASE = (() => {
  const v = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL;
  const c = typeof window !== "undefined" && window.ENV && window.ENV.API_BASE_URL;
  const p = typeof process !== "undefined" && process.env && (process.env.REACT_APP_API_BASE_URL || process.env.API_BASE_URL);
  return (v || p || c || "http://localhost:3000").replace(/\/$/, "");
})();

function authHeader() {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("Authorization") ||
    "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function fmt(d) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getDateRange(activeStartDate) {
  const base = activeStartDate ? new Date(activeStartDate) : new Date();
  const start = new Date(base.getFullYear(), base.getMonth(), 1);
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  return { start: fmt(start), end: fmt(end) };
}

export async function listSchedules() {
  const res = await fetch(`${API_BASE}/schedules`, {
    headers: { accept: "application/json", ...authHeader() },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data || { message: "failed" };
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
}

export async function getSchedule(id) {
  const res = await fetch(`${API_BASE}/schedules/${id}`, {
    headers: { accept: "application/json", ...authHeader() },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data || { message: "failed" };
  return data?.data ?? data ?? null;
}

export async function createSchedule(payload) {
  const body =
    payload && payload.imageFile
      ? (() => {
          const fd = new FormData();
          if (payload.title) fd.append("title", payload.title);
          if (payload.content) fd.append("content", payload.content);
          if (payload.date) fd.append("date", payload.date);
          if (payload.type) fd.append("type", payload.type);
          if (payload.cropId) fd.append("cropId", String(payload.cropId));
          if (payload.color) fd.append("color", payload.color);
          fd.append("image", payload.imageFile);
          return fd;
        })()
      : JSON.stringify({
          title: payload?.title,
          content: payload?.content,
          date: payload?.date,
          type: payload?.type,
          cropId: payload?.cropId,
          color: payload?.color,
        });

  const headers =
    body instanceof FormData
      ? { ...authHeader() }
      : { "content-type": "application/json", ...authHeader() };

  const res = await fetch(`${API_BASE}/schedules`, { method: "POST", headers, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data || { message: "failed" };
  return data;
}

export async function updateSchedule(id, payload) {
  const res = await fetch(`${API_BASE}/schedules/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", ...authHeader() },
    body: JSON.stringify(payload || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data || { message: "failed" };
  return data;
}

export async function deleteSchedule(id) {
  const res = await fetch(`${API_BASE}/schedules/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw data || { message: "failed" };
  }
  return true;
}

export default {
  listSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getDateRange,
};
