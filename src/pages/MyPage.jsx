// src/pages/MyPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
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

async function fetchCrops(apiBase, getAuthHeader) {
  const res = await fetch(`${apiBase}/crops`, {
    headers: { accept: "application/json", ...(getAuthHeader ? getAuthHeader() : {}) },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  return list
    .map((c) => ({ id: c.id ?? c.cropId ?? c.crop_id, name: c.name ?? c.title ?? c.label }))
    .filter((x) => x.id && x.name);
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

  const [crops, setCrops] = useState([]);

  const authHeader = useCallback(() => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const cropMap = useMemo(() => new Map(crops.map((c) => [Number(c.id), c.name])), [crops]);
  const selectedCropId = useMemo(() => {
    if (selectedPlant === "공통") return null;
    const found = crops.find((c) => c.name === selectedPlant);
    return found ? Number(found.id) : null;
  }, [crops, selectedPlant]);

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

  const fetchAllSchedules = useCallback(
    async (opt = {}) => {
      const url = new URL(`${API_BASE}/schedules`);
      if (opt.cropId) url.searchParams.set("cropId", String(opt.cropId));
      const res = await fetch(url.toString(), {
        headers: { accept: "application/json", ...authHeader() },
      });
      if (!res.ok) throw new Error("fetch schedules failed");
      const data = await res.json();
      const raw = Array.isArray(data?.schedules) ? data.schedules : Array.isArray(data) ? data : [];
      return raw.map((x) => ({
        id: x.id ?? x._id,
        title: x.title ?? "",
        content: x.content ?? "",
        date: String(x.date || "").slice(0, 10),
        image: x.image ?? null,
        cropId: x.cropId ?? x.crop_id ?? x?.crop?.id ?? null,
        color: x.color ?? null,
        type: x.type ?? null,
        plant: x?.crop?.name || cropMap.get(Number(x.cropId ?? x.crop_id)) || "공통",
        createdAt: x.createdAt,
        updatedAt: x.updatedAt,
      }));
    },
    [authHeader, cropMap]
  );

  const fetchDiaries = useCallback(
    async (cropId) => {
      try {
        const [all, cropList] = await Promise.all([
          fetchAllSchedules(cropId ? { cropId } : {}),
          crops.length ? Promise.resolve(crops) : fetchCrops(API_BASE, authHeader),
        ]);
        if (!crops.length) setCrops(cropList);
        const diaries = all.filter((x) => x.type === "crop_diary");
        setEntries(diaries);
        saveLocal(diaries, null);
      } catch {
        const fallback = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        setEntries(Array.isArray(fallback) ? fallback : []);
      }
    },
    [fetchAllSchedules, crops, authHeader, saveLocal]
  );

  const fetchSchedules = useCallback(
    async (cropId) => {
      try {
        const all = await fetchAllSchedules(cropId ? { cropId } : {});
        setTasks(all);
        saveLocal(null, all);
      } catch {
        const fallback = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
        setTasks(Array.isArray(fallback) ? fallback : []);
      }
    },
    [fetchAllSchedules, saveLocal]
  );

  useEffect(() => {
    loadLocal();
    fetchCrops(API_BASE, authHeader).then(setCrops).catch(() => {});
  }, [loadLocal, authHeader]);

  useEffect(() => {
    const cropId = selectedCropId || undefined; 
    fetchDiaries(cropId);
    fetchSchedules(cropId);
  }, [selectedCropId, fetchDiaries, fetchSchedules]);

  const isFileLike = (v) =>
    v instanceof File || v instanceof Blob || (v && typeof v === "object" && typeof v.size === "number" && typeof v.type === "string");

  const handleSaveDiary = async (entry, isEdit) => {
    const baseType =
      entry?.type && (entry.type === "crop_diary" || entry.type === "personal")
        ? entry.type
        : (entry?.cropId || selectedCropId) ? "crop_diary" : "personal";

    const resolvedCropId =
      baseType === "personal" ? undefined : (entry.cropId ?? (selectedCropId ? Number(selectedCropId) : undefined));

    const title = (entry.title || "").trim();
    const date = String(entry.date || "").slice(0, 10);
    const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(date);
    if (!title) return alert("제목은 필수입니다.");
    if (!dateOk) return alert("날짜는 YYYY-MM-DD 형식이어야 합니다.");
    if (baseType === "crop_diary" && !resolvedCropId) return alert("작물 일지에는 cropId가 필요합니다.");

    const fd = new FormData();
    fd.append("title", title);
    fd.append("date", date);
    fd.append("type", baseType);
    if (entry.content) fd.append("content", entry.content);
    if (resolvedCropId) fd.append("cropId", String(resolvedCropId));
    if (entry.color) fd.append("color", String(entry.color));
    if (isFileLike(entry.imageFile)) fd.append("image", entry.imageFile);

    try {
      if (isEdit && (entry.id || entry._id)) {
        const id = entry.id || entry._id;
        const res = await fetch(`${API_BASE}/schedules/${id}`, {
          method: "PATCH",
          headers: { ...authHeader() },
          body: fd,
        });
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(t || "update diary failed");
        }
      } else {
        const res = await fetch(`${API_BASE}/schedules`, {
          method: "POST",
          headers: { ...authHeader() },
          body: fd,
        });
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(t || "create diary failed");
        }
      }
      await fetchDiaries(selectedCropId || undefined);
      setIsModalOpen(false);
      setEditingEntry(null);
    } catch {
      const local = isEdit
        ? entries.map((e) =>
            (e.id ?? e._id) === (entry.id ?? entry._id)
              ? {
                  ...e,
                  title,
                  content: entry.content,
                  date,
                  cropId: resolvedCropId ?? null,
                  color: entry.color ?? null,
                  plant: cropMap.get(Number(resolvedCropId)) || "공통",
                  image: isFileLike(entry.imageFile) ? e.image : (entry.image || e.image || null),
                }
              : e
          )
        : [
            {
              ...entry,
              id: entry.id || Date.now(),
              title,
              date,
              type: baseType,
              cropId: resolvedCropId ?? null,
              plant: cropMap.get(Number(resolvedCropId)) || "공통",
            },
            ...entries,
          ];
      setEntries(local);
      saveLocal(local, null);
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
      await fetchDiaries(selectedCropId || undefined);
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
    const fd = new FormData();
    if (newTask.title) fd.append("title", newTask.title);
    if (newTask.content) fd.append("content", newTask.content);
    if (newTask.date) fd.append("date", newTask.date);
    if (newTask.type) fd.append("type", newTask.type);
    if (newTask.cropId) fd.append("cropId", String(newTask.cropId));
    if (newTask.color) fd.append("color", newTask.color);
    if (newTask.imageFile) fd.append("image", newTask.imageFile);

    try {
      const res = await fetch(`${API_BASE}/schedules`, {
        method: "POST",
        headers: { ...authHeader() },
        body: fd,
      });
      if (!res.ok) throw new Error("create schedule failed");
      await fetchSchedules(selectedCropId || undefined);
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
      await fetchSchedules(selectedCropId || undefined);
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
      await fetchSchedules(selectedCropId || undefined);
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
                selectedPlant={selectedPlant}
                entries={
                  selectedPlant === "공통"
                    ? entries                     
                    : entries.filter((e) =>    
                        e.cropId
                          ? Number(e.cropId) === Number(selectedCropId)
                          : e.plant === selectedPlant
                      )
                }
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
