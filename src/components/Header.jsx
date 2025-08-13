// Header.jsx
import "./Header.css";
import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// (선택) 서버 로그아웃 API가 있다면 사용
// import api from "../api/axios";

const Header = () => {
  const { isLoggedIn, logout } = useAuth();   // ✅ setIsLoggedIn 제거, logout 사용
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // (선택) 쿠키 기반 인증이라면 서버에 로그아웃 요청 먼저
      // await api.post("/auth/logout");
      logout();                               // ✅ 토큰 삭제 + user=null
      alert("로그아웃 되었습니다.");
      navigate("/login");                     // ✅ 로그인 페이지로 이동 권장
    } catch (e) {
      console.error(e);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <h1 className="logo">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            Farmunity
          </Link>
        </h1>

        <nav className="nav-links">
          <NavLink to="/Pest" className={({ isActive }) => (isActive ? "active" : "")}>
            병해충 관리
          </NavLink>
          <NavLink to="/Community" className={({ isActive }) => (isActive ? "active" : "")}>
            커뮤니티
          </NavLink>
          <NavLink to="/Reservation" className={({ isActive }) => (isActive ? "active" : "")}>
            예약
          </NavLink>
          <NavLink to="/MyPage" className={({ isActive }) => (isActive ? "active" : "")}>
            마이페이지
          </NavLink>
        </nav>
      </div>

      <div className="header-right">
        {isLoggedIn ? (
          <button className="logout-button" onClick={handleLogout}>
            로그아웃
          </button>
        ) : (
          <Link to="/login" className="login-area"> {/* 소문자 권장 */}
            <span role="img" aria-label="login">👤</span>
            <span className="login-text">로그인</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
