import React from "react";
import Header from "../components/Header"
import "../styles/Home.css"

const Home = () => {
  return (
    <div className="main-container">
      <Header/>
      <main className="main-section">
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

export default Home