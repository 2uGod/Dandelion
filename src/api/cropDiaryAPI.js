// src/api/cropDiaryAPI.js
import axios from "axios";

const BASE = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      console.warn("🔒 인증 만료/실패: 로그인 필요");
    }
    return Promise.reject(err);
  }
);

/** 목록 조회 (옵션: cropId, startDate, endDate) */
export async function listDiaries(params = {}) {
  const res = await api.get("/crop-diaries", { params });
  const payload = res?.data?.data ?? res?.data ?? [];
  return Array.isArray(payload) ? payload : [];
}

/** 날짜 범위 조회 (월 단위 캘린더용) */
export async function listByDateRange({ startDate, endDate, cropId } = {}) {
  const res = await api.get("/crop-diaries/date-range", {
    params: { startDate, endDate, cropId },
  });
  const payload = res?.data?.data ?? res?.data ?? [];
  return Array.isArray(payload) ? payload : [];
}

/** 생성 (multipart/form-data) */
export async function createDiary(formData) {
  const res = await api.post("/crop-diaries", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res?.data?.data ?? res?.data;
}

/** 수정 (multipart/form-data) */
export async function updateDiary(id, formData) {
  const res = await api.patch(`/crop-diaries/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res?.data?.data ?? res?.data;
}

/** 삭제 */
export async function deleteDiary(id) {
  const res = await api.delete(`/crop-diaries/${id}`);
  return res?.data?.data ?? res?.data;
}
