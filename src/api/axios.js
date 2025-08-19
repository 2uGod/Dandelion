// src/api/axios.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키 기반 인증 대비 (백엔드 CORS도 credentials:true 필요)
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("토큰 로드 실패:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (401 처리 예시)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      console.warn("인증 오류 401: 다시 로그인 필요");
      // 필요하다면 자동 로그아웃/리다이렉트
      // localStorage.removeItem("accessToken");
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
