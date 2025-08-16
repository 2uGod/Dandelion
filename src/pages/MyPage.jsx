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
import ProfileSettings from "../components/ProfileSettings";

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

  // ✅ 삭제 핸들러 (이게 없어서 삭제가 동작하지 않았습니다)
  const handleDelete = (entry) => {
    const id = entry?.id ?? entry?._id;
    if (!id) {
      alert("삭제할 항목의 ID를 찾지 못했습니다.");
      return;
    }
    if (!window.confirm("이 일지를 삭제하시겠습니까?")) return;

    // 로컬 저장소 기준 삭제
    setEntries((prev) => prev.filter((e) => (e.id ?? e._id) !== id));

    // 🔻 서버 연동을 쓰신다면, 아래 주석을 해제하고 API 호출로 바꿔주세요.
    // import { deleteDiary } from "../api/cropDiaryAPI";
    // deleteDiary(id)
    //   .then(() => setEntries((prev) => prev.filter((e) => (e.id ?? e._id) !== id)))
    //   .catch((err) => {
    //     console.error(err);
    //     alert("서버 삭제 중 오류가 발생했습니다.");
    //   });
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
              <DiaryList
                entries={entries}
                setEntries={setEntries}
                onEdit={(entry) => {
                  setEditingEntry(entry);
                  setIsModalOpen(true);
                }}
                onAdd={() => {
                  setEditingEntry(null);
                  setIsModalOpen(true);
                }}
                // ✅ 빠졌던 부분 추가
                onDelete={handleDelete}
              />

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

          {activeTab === "settings" && <ProfileSettings />}
        </main>
      </div>
    </div>
  );
};

export default MyPage;
