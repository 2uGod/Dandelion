import React, { useEffect, useState, useCallback } from "react";
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

const API_BASE = (() => {
  const v = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL;
  const c = typeof window !== "undefined" && window.ENV && window.ENV.API_BASE_URL;
  const p = typeof process !== "undefined" && process.env && (process.env.REACT_APP_API_BASE_URL || process.env.API_BASE_URL);
  return (v || p || c || "http://localhost:3000").replace(/\/$/, "");
})();

function getAuthToken() {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("Authorization") ||
    ""
  );
}

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

  const authHeader = useCallback(() => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const loadLocal = useCallback(() => {
    try {
      const savedEntries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const savedTasks = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
      if (Array.isArray(savedEntries)) setEntries(savedEntries);
      if (Array.isArray(savedTasks)) setTasks(savedTasks);
    } catch {}
  }, []);

  const saveLocal = useCallback((eList, tList) => {
    try {
      if (Array.isArray(eList)) localStorage.setItem(STORAGE_KEY, JSON.stringify(eList));
      if (Array.isArray(tList)) localStorage.setItem(TASKS_KEY, JSON.stringify(tList));
    } catch {}
  }, []);

  const fetchDiaries = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/schedules`, {
        headers: { accept: "application/json", ...authHeader() },
      });
      if (!res.ok) throw new Error("fetch schedules failed");
      const data = await res.json();
      const all = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const list = all.filter((x) => String(x.type || "").toLowerCase() === "crop_diary");
      if (list.length > 0) {
        setEntries(list);
        saveLocal(list, null);
      } else {
        const fallback = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        setEntries(Array.isArray(fallback) ? fallback : []);
      }
    } catch {
      const fallback = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setEntries(Array.isArray(fallback) ? fallback : []);
    }
  }, [authHeader, saveLocal]);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/schedules`, {
        headers: { accept: "application/json", ...authHeader() },
      });
      if (!res.ok) throw new Error("fetch schedules failed");
      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      if (list.length > 0) {
        setTasks(list);
        saveLocal(null, list);
      } else {
        const fallback = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
        setTasks(Array.isArray(fallback) ? fallback : []);
      }
    } catch {
      const fallback = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
      setTasks(Array.isArray(fallback) ? fallback : []);
    }
  }, [authHeader, saveLocal]);

  useEffect(() => {
    loadLocal();
    fetchDiaries();
    fetchSchedules();
  }, [loadLocal, fetchDiaries, fetchSchedules]);

  const handleSaveDiary = async (entry, isEdit) => {
    const basePayload = {
      title: entry.title,
      content: entry.content,
      date: entry.date,
      cropId: entry.cropId,
      type: "crop_diary",
    };

    try {
      if (isEdit && (entry.id || entry._id)) {
        const id = entry.id || entry._id;
        const body = entry.imageFile
          ? (() => {
              const fd = new FormData();
              if (basePayload.title) fd.append("title", basePayload.title);
              if (basePayload.content) fd.append("content", basePayload.content);
              if (basePayload.date) fd.append("date", basePayload.date);
              if (basePayload.cropId) fd.append("cropId", String(basePayload.cropId));
              fd.append("type", "crop_diary");
              fd.append("image", entry.imageFile);
              return fd;
            })()
          : JSON.stringify(basePayload);

        const headers =
          body instanceof FormData
            ? { ...authHeader() }
            : { "content-type": "application/json", ...authHeader() };

        const res = await fetch(`${API_BASE}/schedules/${id}`, {
          method: "PATCH",
          headers,
          body,
        });
        if (!res.ok) throw new Error("update diary failed");
      } else {
        const body = entry.imageFile
          ? (() => {
              const fd = new FormData();
              fd.append("title", basePayload.title || "");
              if (basePayload.content) fd.append("content", basePayload.content);
              fd.append("date", basePayload.date || "");
              if (basePayload.cropId) fd.append("cropId", String(basePayload.cropId));
              fd.append("type", "crop_diary");
              if (entry.imageFile) fd.append("image", entry.imageFile);
              return fd;
            })()
          : JSON.stringify(basePayload);

        const headers =
          body instanceof FormData
            ? { ...authHeader() }
            : { "content-type": "application/json", ...authHeader() };

        const res = await fetch(`${API_BASE}/schedules`, {
          method: "POST",
          headers,
          body,
        });
        if (!res.ok) throw new Error("create diary failed");
      }
      await fetchDiaries();
      setIsModalOpen(false);
      setEditingEntry(null);
    } catch {
      if (isEdit) {
        const local = entries.map((e) =>
          (e.id ?? e._id) === (entry.id ?? entry._id) ? { ...e, ...basePayload, plant: entry.plant, image: entry.image } : e
        );
        setEntries(local);
        saveLocal(local, null);
      } else {
        const local = [{ ...entry, ...basePayload, id: entry.id || Date.now() }, ...entries];
        setEntries(local);
        saveLocal(local, null);
      }
      setIsModalOpen(false);
      setEditingEntry(null);
    }
  };

  const handleDeleteDiary = async (entry) => {
    const id = entry?.id ?? entry?._id;
    if (!id) return;
    if (!window.confirm("이 일지를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`${API_BASE}/schedules/${id}`, {
        method: "DELETE",
        headers: { ...authHeader() },
      });
      if (!res.ok) throw new Error("delete diary failed");
      await fetchDiaries();
      setViewEntry(null);
    } catch {
      const local = entries.filter((e) => (e.id ?? e._id) !== id);
      setEntries(local);
      saveLocal(local, null);
      setViewEntry(null);
    }
  };

  const goPlanTabWithDate = (dateStr) => {
    setPlanDate(dateStr || "");
    setActiveTab("plan");
  };

  const handleAddTask = async (newTask) => {
    try {
      const body = newTask.imageFile
        ? (() => {
            const fd = new FormData();
            if (newTask.title) fd.append("title", newTask.title);
            if (newTask.content) fd.append("content", newTask.content);
            if (newTask.date) fd.append("date", newTask.date);
            if (newTask.type) fd.append("type", newTask.type);
            if (newTask.cropId) fd.append("cropId", String(newTask.cropId));
            if (newTask.color) fd.append("color", newTask.color);
            fd.append("image", newTask.imageFile);
            return fd;
          })()
        : JSON.stringify({
            title: newTask.title,
            content: newTask.content,
            date: newTask.date,
            type: newTask.type,
            cropId: newTask.cropId,
            color: newTask.color,
          });

      const headers =
        body instanceof FormData
          ? { ...authHeader() }
          : { "content-type": "application/json", ...authHeader() };

      const res = await fetch(`${API_BASE}/schedules`, {
        method: "POST",
        headers,
        body,
      });
      if (!res.ok) throw new Error("create schedule failed");
      await fetchSchedules();
      setActiveTab("calendar");
    } catch {
      const local = [{ ...newTask, id: Date.now() }, ...tasks];
      setTasks(local);
      saveLocal(null, local);
      setActiveTab("calendar");
    }
  };

  const openTaskModal = (task) => {
    setEditTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskUpdate = async (updated) => {
    try {
      const id = updated.id || updated._id;
      if (!id) return;
      const res = await fetch(`${API_BASE}/schedules/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", ...authHeader() },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("update schedule failed");
      await fetchSchedules();
      setIsTaskModalOpen(false);
    } catch {
      const local = tasks.map((t) => (t.id === updated.id ? { ...t, ...updated } : t));
      setTasks(local);
      saveLocal(null, local);
      setIsTaskModalOpen(false);
    }
  };

  const handleTaskDelete = async (id) => {
    if (!window.confirm("이 일정을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`${API_BASE}/schedules/${id}`, {
        method: "DELETE",
        headers: { ...authHeader() },
      });
      if (!res.ok) throw new Error("delete schedule failed");
      await fetchSchedules();
      setIsTaskModalOpen(false);
    } catch {
      const local = tasks.filter((t) => t.id !== id);
      setTasks(local);
      saveLocal(null, local);
      setIsTaskModalOpen(false);
    }
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
        onDelete={(taskOrId) => handleTaskDelete(taskOrId?.id ?? taskOrId)}
      />
    </div>
  );
};

export default MyPage;
