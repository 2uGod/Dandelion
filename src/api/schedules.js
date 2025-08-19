const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  (typeof window !== "undefined" &&
    window.ENV &&
    window.ENV.API_BASE_URL) ||
  "";

function authHeader() {
  const token =
    (typeof localStorage !== "undefined" &&
      (localStorage.getItem("accessToken") ||
        localStorage.getItem("token"))) ||
    (typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem("accessToken")) ||
    "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchSchedules(params = {}) {
  const url = new URL("/schedules", API_BASE || window.location.origin);
  if (params.cropId) url.searchParams.set("cropId", String(params.cropId));
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...authHeader(),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to fetch /schedules (${res.status})`);
  }
  return res.json();
}
