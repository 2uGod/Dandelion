// Header.jsx
import "./Header.css";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { isLoggedIn, logout } = useAuth();   // ✅ logout 가져오기
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // (선택) 서버에 로그아웃 API가 있으면 먼저 호출
      // await api.post('/auth/logout');  // 쿠키 기반이면 유용

      logout();                          // ✅ 토큰 삭제 + 상태 초기화
      alert("로그아웃 되었습니다.");
      navigate("/login");                // ✅ 보통 로그인 페이지로 이동
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
          <Link to="/Pest">병해충 관리</Link>
          <Link to="/Community">커뮤니티</Link>
          <Link to="/Reservation">예약</Link>
          <Link to="/MyPage">마이페이지</Link>
        </nav>
      </div>

      <div className="header-right">
        {isLoggedIn ? (
          <button className="logout-button" onClick={handleLogout}>
            로그아웃
          </button>
        ) : (
          <Link to="/login" className="login-area"> {/* 소문자 경로 권장 */}
            <span role="img" aria-label="login">👤</span>
            <span className="login-text">로그인</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
