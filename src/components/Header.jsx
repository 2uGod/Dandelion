import "./Header.css";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";  // ✅ 로그인 상태 context

const Header = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(true);
    alert("로그아웃 되었습니다.");
    navigate("/");
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
          <Link to="/Login" className="login-area">
            <span role="img" aria-label="login">👤</span>
            <span className="login-text">로그인</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
