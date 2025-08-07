import "./Header.css";
import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="main-header">
      <div className="header-left">
        <h1 className="logo">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>Farmunity</Link>
        </h1>
        <nav className="nav-links">
          <Link to="/Pest">병해충 관리</Link>
          <Link to="/Community">커뮤니티</Link>
          <Link to="/Reservation">예약</Link>
          <Link to="/MyPage">마이페이지</Link>
        </nav>
      </div>
      <div className="header-right">
        <Link to="/Login" className="login-area">
          <span role="img" aria-label="login">👤</span>
          <span className="login-text">로그인</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
