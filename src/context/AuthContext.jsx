import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
      } catch (error) {
        console.error("저장된 토큰이 유효하지 않습니다:", error);
        localStorage.removeItem('accessToken');
      }
    }
  }, []);

  //로그인 처리 함수
  const login = (token) => {
    localStorage.setItem('accessToken', token);
    const decodedUser = jwtDecode(token);
    setUser(decodedUser);
  };

  const logout = () => {
    //토큰 삭제
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const value = {
    user,
    isLoggedIn: !!user,
    login,

    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
