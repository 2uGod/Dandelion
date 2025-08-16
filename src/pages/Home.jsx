import React from "react";
import Header from "../components/Header";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/Register");
  };

  return (
    <div className="main-container">
      <Header />
      <main className="main-section">
        <section className="text-section">
          <p className="intro-text">
            농사 초보부터 전문가까지, 모두가 함께하는 지식 공유 공간
          </p>
          <h2 className="main-title">스마트한 농사 커뮤니티</h2>

          <ul className="features-list">
            <li>
              <span className="dot">🔧</span> 병해충 관리
            </li>
            <li>
              <span className="dot">⛅</span> 위치 기반 날씨 정보
            </li>
            <li>
              <span className="dot">💬</span> 작물 커뮤니티
            </li>
            <li>
              <span className="dot">📅</span> 농사 캘린더
            </li>
            <li>
              <span className="dot">✅</span> 체험 예약
            </li>
          </ul>

          <button className="start-button" onClick={handleStart}>
            시작하기
          </button>
        </section>

        <section className="image-section">
          <div className="image-frame">
            <img
              src="/main_img.png"
              alt="농사 일러스트"
              className="main-image"
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
