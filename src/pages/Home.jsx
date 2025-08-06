import React from "react";
import "./Home.css";

export default function Home() {
  return (
    <div className="main-container">
      {/* Header */}
      <header className="main-header">
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
      </header>

      {/* Main Section */}
      <main className="main-section">
        {/* Text Section */}
        <section className="text-section">
          <h2 className="main-title">스마트한 농사 커뮤니티</h2>
          <ul className="features-list">
            <li>🔧 병해충 관리</li>
            <li>⛅ 위치 기반 날씨 정보</li>
            <li>💬 작물 커뮤니티</li>
            <li>📅 농사 캘린더</li>
            <li>✅ 체험 예약</li>
          </ul>
          <button className="start-button">시작하기</button>
        </section>

        {/* Image Section */}
        <section className="image-section">
          <img
            src="/main_img.png"
            alt="농사 일러스트"
            className="main-image"
          />
        </section>
      </main>
    </div>
  );
}