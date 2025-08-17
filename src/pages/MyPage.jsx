import React, { useEffect, useState } from "react";
import "../styles/MyPage.css";
import Header from "../components/Header";
import PlantSidebar from "../components/PlantSidebar";
import WeatherBar from "../components/WeatherBar";
import NavTabs from "../components/NavTabs";
import MainCalendar from "../components/MainCalendar";
import DiaryList from "../components/DiaryList";
import DiaryModal from "../components/DiaryModal";
import DiaryViewModal from "../components/DiaryViewModal";
import ProfileSettings from "../components/ProfileSettings";
import PlanAdd from "../components/PlanAdd";
import ScheduleEditModal from "../components/ScheduleEditModal";

const STORAGE_KEY = "farmunity_diary_entries";
const TASKS_KEY = "farmunity_tasks";

const MyPage = () => {
  const [selectedPlant, setSelectedPlant] = useState("공통");
  const [activeTab, setActiveTab] = useState("calendar");

  const [entries, setEntries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const [viewEntry, setViewEntry] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [planDate, setPlanDate] = useState("");

  const [editTask, setEditTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

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
    setViewEntry(null);
  };

  const goPlanTabWithDate = (dateStr) => {
    setPlanDate(dateStr || "");
    setActiveTab("plan");
  };

  const handleAddTask = (newTask) => {
    setTasks((prev) => [{ ...newTask, id: Date.now() }, ...prev]);
    setActiveTab("calendar");
  };

  const openTaskModal = (task) => {
    setEditTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskUpdate = (updated) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
  };

  const handleTaskDelete = (id) => {
    if (!window.confirm("이 일정을 삭제하시겠습니까?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="mypage-wrapper">
      <Header />
      <WeatherBar />

      <div className="mypage-body">
        <PlantSidebar selectedPlant={selectedPlant} setSelectedPlant={setSelectedPlant} />

        <main className="mypage-main">
          <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {activeTab === "calendar" && (
            <MainCalendar
              plant={selectedPlant}
              tasks={tasks}
              onGoPlan={goPlanTabWithDate}
              onEventClick={openTaskModal}
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
                onView={(entry) => setViewEntry(entry)}
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

              <DiaryViewModal
                open={!!viewEntry}
                entry={viewEntry}
                onClose={() => setViewEntry(null)}
                onEdit={(entry) => {
                  setViewEntry(null);
                  setEditingEntry(entry);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteDiary}
              />
            </>
          )}

          {activeTab === "plan" && (
            <PlanAdd selectedPlant={selectedPlant} initialDate={planDate} onAddTask={handleAddTask} />
          )}

          {activeTab === "settings" && <ProfileSettings />}
        </main>
      </div>

      <ScheduleEditModal
        open={isTaskModalOpen}
        task={editTask}
        onClose={() => setIsTaskModalOpen(false)}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
      />
    </div>
  );
};

export default MyPage;
