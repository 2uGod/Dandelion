// src/context/AuthContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

const TOKEN_KEY = "accessToken";

// exp(초) 기준 만료 체크
const isExpired = (decoded) => {
  if (!decoded || typeof decoded.exp !== "number") return false;
  return decoded.exp * 1000 < Date.now();
};

// 로그인 응답이 "Bearer xxx" 형태여도 항상 순수 JWT만 저장하도록 정리
const sanitizeToken = (t) =>
  typeof t === "string" && t.startsWith("Bearer ")
    ? t.slice(7)
    : t;

// 안전 디코드
const decodeSafe = (token) => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);     // 디코드된 JWT payload
  const [logoutTimer, setLogoutTimer] = useState(null); // 만료 타이머 id

  // 만료 시간에 맞춰 자동 로그아웃 예약
  const scheduleAutoLogout = (decoded) => {
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      setLogoutTimer(null);
    }
    if (!decoded?.exp) return;
    const msLeft = decoded.exp * 1000 - Date.now();
    if (msLeft <= 0) {
      logout();
      return;
    }
    const id = setTimeout(() => {
      logout();
    }, msLeft);
    setLogoutTimer(id);
  };

  const loadFromStorage = () => {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw || typeof raw !== "string") {
      setUser(null);
      return;
    }
    const token = sanitizeToken(raw);
    const decoded = decodeSafe(token);
    if (!decoded || isExpired(decoded)) {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      return;
    }
    setUser(decoded);
    scheduleAutoLogout(decoded);
  };

  // 앱 시작 시 토큰 로드
  useEffect(() => {
    loadFromStorage();
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 다른 탭/창과 로그인 상태 동기화
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== TOKEN_KEY) return;
      if (!e.newValue) {
        setUser(null);
        if (logoutTimer) clearTimeout(logoutTimer);
        return;
      }
      const clean = sanitizeToken(e.newValue);
      const decoded = decodeSafe(clean);
      if (!decoded || isExpired(decoded)) {
        setUser(null);
        if (logoutTimer) clearTimeout(logoutTimer);
      } else {
        setUser(decoded);
        scheduleAutoLogout(decoded);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoutTimer]);

  // 로그인 처리: 서버에서 받은 accessToken 문자열만 넘겨주면 됨
  const login = (token) => {
    if (typeof token !== "string") {
      console.error("로그인 토큰이 문자열이 아닙니다:", token);
      throw new Error("유효하지 않은 토큰 형식");
    }
    const clean = sanitizeToken(token); // ✅ 항상 순수 JWT로 정리
    const decoded = decodeSafe(clean);
    if (!decoded) {
      console.error("토큰 디코드 실패");
      throw new Error("유효하지 않은 토큰");
    }
    if (isExpired(decoded)) {
      throw new Error("만료된 토큰입니다.");
    }
    localStorage.setItem(TOKEN_KEY, clean);
    setUser(decoded);
    scheduleAutoLogout(decoded);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      setLogoutTimer(null);
    }
  };

  // (선택) 현재 토큰을 직접 읽고 싶을 때
  const getAccessToken = () => localStorage.getItem(TOKEN_KEY) || null;

  const value = useMemo(
    () => ({ user, isLoggedIn: !!user, login, logout, getAccessToken }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
