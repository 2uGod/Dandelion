import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

const isExpired = (decoded) => {
  // exp(초 단위) 존재하고, 현재 시간(ms)보다 과거면 만료
  if (!decoded || typeof decoded.exp !== 'number') return false;
  return decoded.exp * 1000 < Date.now();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 앱 시작 시 로컬스토리지의 토큰 로드
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || typeof token !== 'string') return;

    try {
      const decoded = jwtDecode(token);
      if (isExpired(decoded)) {
        localStorage.removeItem('accessToken');
        setUser(null);
      } else {
        setUser(decoded);
      }
    } catch (e) {
      console.error('저장된 토큰이 유효하지 않습니다:', e);
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  }, []);

  // (선택) 다른 탭/창과 로그인 상태 동기화
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== 'accessToken') return;
      const token = e.newValue;
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const decoded = jwtDecode(token);
        setUser(isExpired(decoded) ? null : decoded);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // 로그인 처리 함수 (안전한 타입/만료 체크)
  const login = (token) => {
    if (typeof token !== 'string') {
      console.error('로그인 토큰이 문자열이 아닙니다:', token);
      throw new Error('유효하지 않은 토큰 형식');
    }
    try {
      const decoded = jwtDecode(token);
      if (isExpired(decoded)) {
        throw new Error('만료된 토큰입니다.');
      }
      localStorage.setItem('accessToken', token);
      setUser(decoded);
    } catch (e) {
      console.error('토큰 디코드 실패:', e);
      localStorage.removeItem('accessToken');
      setUser(null);
      throw e;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isLoggedIn: !!user, login, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
