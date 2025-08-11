// Header.jsx
import "./Header.css";
import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false); // ← 로그아웃 시 false 로!
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
          <NavLink
            to="/Pest"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            병해충 관리
          </NavLink>
          <NavLink
            to="/Community"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            커뮤니티
          </NavLink>
          <NavLink
            to="/Reservation"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            예약
          </NavLink>
          <NavLink
            to="/MyPage"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
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
          <Link to="/Login" className="login-area">
            <span role="img" aria-label="login">
              👤
            </span>
            <span className="login-text">로그인</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
