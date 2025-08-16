// src/pages/MyPage.jsx
import React, { useEffect, useState } from "react";
import "../styles/MyPage.css";
import Header from "../components/Header";
import PlantSidebar from "../components/PlantSidebar";
import WeatherBar from "../components/WeatherBar";
import NavTabs from "../components/NavTabs";
import MainCalendar from "../components/MainCalendar";
import DiaryList from "../components/DiaryList";
import DiaryModal from "../components/DiaryModal"; // ⬅️ 새 모달
import ProfileSettings from "../components/ProfileSettings"

const STORAGE_KEY = "farmunity_diary_entries";

const MyPage = () => {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [activeTab, setActiveTab] = useState("calendar");
  const [entries, setEntries] = useState([]);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null); // 수정 대상

  // 최초 로드
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setEntries(saved);
  }, []);

  // 저장 동기화
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // 모달 저장 핸들러 (신규/수정 공용)
  const handleSave = (entry, isEdit) => {
    setEntries((prev) =>
      isEdit ? prev.map((e) => (e.id === entry.id ? entry : e)) : [entry, ...prev]
    );
    setIsModalOpen(false);
    setEditingEntry(null);
  };

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

          {activeTab === "calendar" && <MainCalendar plant={selectedPlant} />}

          {activeTab === "journal" && (
            <>
              {/* 목록 + 검색/월이동은 DiaryList가 담당 */}
              <DiaryList
                entries={entries}
                setEntries={setEntries}
                onEdit={(entry) => {
                  setEditingEntry(entry);
                  setIsModalOpen(true);
                }}
              />

              {/* + 버튼 (FAB) */}
              <button
                className="fab-add"
                aria-label="일지 추가"
                onClick={() => {
                  setEditingEntry(null);
                  setIsModalOpen(true);
                }}
              >
                +
              </button>

              {/* 작성/수정 모달 */}
              <DiaryModal
                open={isModalOpen}
                onClose={() => {
                  setIsModalOpen(false);
                  setEditingEntry(null);
                }}
                initial={editingEntry}
                selectedPlant={selectedPlant}
                onSave={handleSave}
              />
            </>
          )}

          {activeTab === "settings" && <ProfileSettings/>}
        </main>
      </div>
    </div>
  );
};

export default MyPage;
