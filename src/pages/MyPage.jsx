import React, { useState } from "react";
import "../styles/MyPage.css";
import Header from "../components/Header";
import PlantSidebar from "../components/PlantSidebar";
import WeatherBar from "../components/WeatherBar";
import NavTabs from "../components/NavTabs";
import MainCalendar from "../components/MainCalendar";

const MyPage = () => {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <div className="mypage-wrapper">
      <Header />
      <WeatherBar />

      <div className="mypage-body">
        <PlantSidebar
          selectedPlant={selectedPlant}
          setSelectedPlant={setSelectedPlant}
        />

        <main className="mypage-main">
          <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {activeTab === "calendar" && (
            <MainCalendar plant={selectedPlant} />
          )}
          {activeTab === "journal" && <div>농사일지 페이지 (작성 예정)</div>}
          {activeTab === "settings" && <div>설정 페이지 (작성 예정)</div>}
        </main>
      </div>
    </div>
  );
};

export default MyPage;
