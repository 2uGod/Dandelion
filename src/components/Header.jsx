import "./Header.css"
import React from "react";


const Header = () => {
    
    return (<header className="main-header">
        <div className="header-left">
          <h1 className="logo">Farmunity</h1>
          <nav className="nav-links">
            <a href="#">병해충 관리</a>
            <a href="#">커뮤니티</a>
            <a href="#">예약</a>
            <a href="#">마이페이지</a>
          </nav>
        </div>
        <div className="header-right">
          <span role="img" aria-label="login">👤</span>
          <span className="login-text">로그인</span>
        </div>
      </header>)
}

export default Header;