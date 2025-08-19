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
  try {
    // Vite 환경변수
    const viteEnv = typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_BASE_URL;
    // 윈도우 객체 환경변수  
    const windowEnv = typeof window !== "undefined" && window?.ENV?.API_BASE_URL;
    
    return (viteEnv || windowEnv || "http://localhost:3000").replace(/\/$/, "");
  } catch (error) {
    console.warn("API_BASE 설정 중 오류:", error);
    return "http://localhost:3000";
  }
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
  // API 명세에 따르면 배열 형태로 직접 반환됨
  const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return list
    .map((c) => ({
      id: c.id,
      name: c.name,
      variety: c.variety,
      plantingDate: c.plantingDate,
      expectedHarvestDate: c.expectedHarvestDate,
      status: c.status,
      description: c.description
    }))
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
    } catch(e) {
      console.error("❌ 로컬 데이터 로드 실패:", e);
    }
  }, []);

  const saveLocal = useCallback((eList, tList) => {
    try {
      if (Array.isArray(eList)) localStorage.setItem(STORAGE_KEY, JSON.stringify(eList));
      if (Array.isArray(tList)) localStorage.setItem(TASKS_KEY, JSON.stringify(tList));
    } catch(e) {
      console.error("❌ 로컬 데이터 저장 실패:", e);
    }
  }, []);

  const fetchAllSchedules = useCallback(
    async (opt = {}) => {
      let url;
      if (opt.cropId) {
        // 특정 작물의 일정/일지 조회
        url = `${API_BASE}/schedules?cropId=${opt.cropId}`;
      } else {
        // 메인 캘린더 조회 (모든 일정) - 우선 /schedules 엔드포인트 시도
        url = `${API_BASE}/schedules`;
      }


      const res = await fetch(url, {
        headers: { accept: "application/json", ...authHeader() },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`fetch schedules failed: ${res.status} - ${errorText}`);
      }

      const data = await res.json();

      // API 응답 구조에 따라 데이터 추출
      let schedules = [];
      if (Array.isArray(data)) {
        schedules = data;
      } else if (data.success && Array.isArray(data.schedules)) {
        // API 응답: { success: true, data: { schedules: [...] } }
        schedules = data.schedules;
      } else if (data.data && Array.isArray(data.data.schedules)) {
        // API 응답: { data: { schedules: [...] } }
        schedules = data.data.schedules;
      } else if (data.success && Array.isArray(data.data)) {
        schedules = data.data;
      } else if (data.data && typeof data.data === 'object') {
        // 단일 객체인 경우 배열로 변환
        schedules = [data.data];
      }

      return schedules.map((x) => {
        // 이미지 URL 처리 (상대 경로인 경우 절대 URL로 변환)
        let imageUrl = x.image ?? null;
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
          imageUrl = `${API_BASE}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }

        return {
          id: x.id ?? x._id,
          title: x.title ?? "",
          content: x.content ?? "",
          date: String(x.date || "").slice(0, 10),
          image: imageUrl,
          cropId: x.cropId ?? x.crop_id ?? x?.crop?.id ?? null,
          color: x.color ?? null,
          type: x.type ?? null,
          plant: x?.crop?.name || cropMap.get(Number(x.cropId ?? x.crop_id)) || "공통",
          createdAt: x.createdAt,
          updatedAt: x.updatedAt,
        };
      });
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
      } catch (error) {
        console.error("fetchSchedules error:", error);
        const fallback = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
        setTasks(Array.isArray(fallback) ? fallback : []);
      }
    },
    [fetchAllSchedules, saveLocal]
  );

  useEffect(() => {
    loadLocal();
    const token = getAuthToken();
    if (token) {
      fetchCrops(API_BASE, authHeader).then(setCrops).catch(() => {});
    }
  }, [loadLocal, authHeader]);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const cropId = selectedCropId || undefined;
      fetchDiaries(cropId);
      fetchSchedules(cropId);
    }
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
    // type 필드 제거 - 백엔드에서 기본적으로 crop_diary로 설정됨
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
    fd.append("title", newTask.title || "");
    fd.append("date", newTask.date || "");
    fd.append("cropId", String(newTask.cropId || selectedCropId || ""));
    if (newTask.content) fd.append("content", newTask.content);
    if (newTask.color) fd.append("color", newTask.color);
    if (newTask.imageFile) fd.append("image", newTask.imageFile);

    try {
      const res = await fetch(`${API_BASE}/schedules`, {
        method: "POST",
        headers: { ...authHeader() },
        body: fd,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`create schedule failed: ${res.status} ${res.statusText} - ${errorText}`);
      }

      await fetchSchedules(selectedCropId || undefined);
      setActiveTab("calendar");
    } catch (error) {
      const local = [{ ...newTask, id: Date.now() }, ...tasks];
      setTasks(local);
      saveLocal(null, local);
      setActiveTab("calendar");
      console.error("❌ 일정 추가 실패:", error);
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

      // API 명세에 따라 multipart/form-data 사용
      const fd = new FormData();
      if (updated.title) fd.append("title", updated.title);
      if (updated.content) fd.append("content", updated.content);
      if (updated.date) fd.append("date", updated.date);
      // type 필드 제거 - 백엔드에서 기본적으로 crop_diary로 설정됨
      if (updated.cropId) fd.append("cropId", String(updated.cropId));
      if (updated.color) fd.append("color", String(updated.color));
      if (isFileLike(updated.imageFile)) fd.append("image", updated.imageFile);

      const res = await fetch(`${API_BASE}/schedules/${id}`, {
        method: "PATCH",
        headers: { ...authHeader() },
        body: fd,
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
            selectedPlant === "공통" ? (
              <div className="common-calendar-notice">
                <h2>📅 일정 추가</h2>
                <div className="notice-content">
                  <p>공통 캘린더는 모든 작물의 일정을 한눈에 보는 용도입니다.</p>
                  <p>일정을 추가하려면 특정 작물을 선택해 주세요.</p>
                </div>
              </div>
            ) : (
              <PlanAdd
                selectedPlant={selectedPlant}
                selectedCropId={selectedCropId}
                initialDate={planDate}
                onAddTask={handleAddTask}
                onBack={() => setActiveTab("calendar")}
              />
            )
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
