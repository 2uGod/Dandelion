// src/pages/MyPage.jsx
import React, { useEffect, useState } from "react";
import "../styles/MyPage.css";
import Header from "../components/Header";
import PlantSidebar from "../components/PlantSidebar";
import WeatherBar from "../components/WeatherBar";
import NavTabs from "../components/NavTabs";
import MainCalendar from "../components/MainCalendar";
import DiaryList from "../components/DiaryList";
import DiaryModal from "../components/DiaryModal";
import ProfileSettings from "../components/ProfileSettings";
import PlanAdd from "../components/PlanAdd";

const STORAGE_KEY = "farmunity_diary_entries";
const TASKS_KEY = "farmunity_tasks";

const MyPage = () => {
  const [selectedPlant, setSelectedPlant] = useState("공통");
  const [activeTab, setActiveTab] = useState("calendar");

  const [entries, setEntries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [planDate, setPlanDate] = useState("");

  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setEntries(savedEntries);
    const savedTasks = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
    setTasks(Array.isArray(savedTasks) ? savedTasks : []);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const handleSaveDiary = (entry, isEdit) => {
    setEntries((prev) =>
      isEdit ? prev.map((e) => (e.id === entry.id ? entry : e)) : [entry, ...prev]
    );
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleDeleteDiary = (entry) => {
    const id = entry?.id ?? entry?._id;
    if (!id) return;
    if (!window.confirm("이 일지를 삭제하시겠습니까?")) return;
    setEntries((prev) => prev.filter((e) => (e.id ?? e._id) !== id));
  };

  const goPlanTabWithDate = (dateStr) => {
    setPlanDate(dateStr || "");
    setActiveTab("plan");
  };

  const handleAddTask = (newTask) => {
    setTasks((prev) => [{ ...newTask, id: Date.now() }, ...prev]);
    setActiveTab("calendar");
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

          {activeTab === "calendar" && (
            <MainCalendar
              plant={selectedPlant}       
              tasks={tasks}
              onGoPlan={goPlanTabWithDate}
            />
          )}

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
                onDelete={handleDeleteDiary}
              />

              <DiaryModal
                open={isModalOpen}
                onClose={() => {
                  setIsModalOpen(false);
                  setEditingEntry(null);
                }}
                initial={editingEntry}
                selectedPlant={selectedPlant}
                onSave={handleSaveDiary}
              />
            </>
          )}

          {activeTab === "plan" && (
            <PlanAdd
              selectedPlant={selectedPlant}
              initialDate={planDate}
              onAddTask={handleAddTask}
            />
          )}

          {activeTab === "settings" && <ProfileSettings />}
        </main>
      </div>
    </div>
  );
};

export default MyPage;
