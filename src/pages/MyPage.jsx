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

function getTokenFromCookies() {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)(Authorization|accessToken|token)=([^;]+)/i);
  return m ? decodeURIComponent(m[2]) : "";
}

function getAuthToken() {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("Authorization") ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    getTokenFromCookies() ||
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

const normalizeType = (t) => String(t || "").toLowerCase().replace(/[\s_-]/g, "");
const isCropDiary = (obj) => {
  const t = normalizeType(obj?.type);
  if (t === "cropdiary") return true;
  if (!t && (obj?.cropId || obj?.crop?.id)) return true;
  return false;
};

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
    if (!token) return {};
    const value = /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`;
    return { Authorization: value };
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
      const payload = await res.json();
      const box = payload?.data ?? payload;
      const list = Array.isArray(box?.schedules) ? box.schedules : (Array.isArray(box) ? box : []);
      return list.map((x) => {
        const cropId = x.cropId ?? x.crop_id ?? x?.crop?.id ?? null;
        const d = x.date || x.createdAt || "";
        const imageUrl = x.image
          ? (x.image.startsWith("http") ? x.image : `${API_BASE}${x.image}`)
          : null;
        return {
          id: x.id ?? x._id,
          title: x.title ?? "",
          content: x.content ?? "",
          date: String(d).slice(0, 10),
          image: imageUrl,
          cropId,
          color: x.color ?? null,
          type: x.type ?? null,
          plant: x?.crop?.name || cropMap.get(Number(cropId)) || "공통",
          createdAt: x.createdAt,
          updatedAt: x.updatedAt,
          user: x.user ?? null,
          crop: x.crop ?? null,
        };
      });
    },
    [authHeader, cropMap]
  );

  const fetchScheduleDetailById = useCallback(
    async (id) => {
      const res = await fetch(`${API_BASE}/schedules/${id}`, {
        headers: { accept: "application/json", ...authHeader() },
      });
      if (!res.ok) throw new Error("fetch schedule detail failed");
      const json = await res.json();
      const s = json?.data?.schedule ?? json?.data ?? json?.schedule ?? json;
      return s;
    },
    [authHeader]
  );

  const fetchDiaries = useCallback(
    async (cropId) => {
      try {
        const [all, cropList] = await Promise.all([
          fetchAllSchedules(cropId ? { cropId } : {}),
          crops.length ? Promise.resolve(crops) : fetchCrops(API_BASE, authHeader),
        ]);
        if (!crops.length) setCrops(cropList);
        const diaries = all.filter(isCropDiary);
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

  useEffect(() => {
    if (selectedPlant !== "공통" && !selectedCropId) {
      fetchCrops(API_BASE, authHeader).then((list) => {
        setCrops(list);
      }).catch(() => {});
    }
  }, [selectedPlant, selectedCropId, authHeader]);

  const isFileLike = (v) =>
    v instanceof File || v instanceof Blob || (v && typeof v === "object" && typeof v.size === "number" && typeof v.type === "string");

  const handleSaveDiary = async (entry, isEdit) => {
    const baseType =
      entry?.type && (normalizeType(entry.type) === "cropdiary" || normalizeType(entry.type) === "personal")
        ? entry.type
        : (entry?.cropId || selectedCropId) ? "crop_diary" : "personal";

    const byNameId = (() => {
      if (selectedPlant === "공통") return undefined;
      const found = crops.find((c) => c.name === selectedPlant);
      return found ? Number(found.id) : undefined;
    })();

    const resolvedCropId =
      normalizeType(baseType) === "personal"
        ? undefined
        : (entry.cropId ?? (selectedCropId ?? byNameId));

    const title = (entry.title || "").trim();
    const date = String(entry.date || "").slice(0, 10);
    const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(date);
    if (!title) return alert("제목은 필수입니다.");
    if (!dateOk) return alert("날짜는 YYYY-MM-DD 형식이어야 합니다.");
    if (normalizeType(baseType) === "cropdiary" && !resolvedCropId) return alert("작물 일지에는 cropId가 필요합니다.");

    const fd = new FormData();
    fd.append("title", title);
    fd.append("date", date);
    if (entry.content) fd.append("content", entry.content);
    if (resolvedCropId) fd.append("cropId", String(resolvedCropId));
    if (isFileLike(entry.imageFile)) fd.append("image", entry.imageFile);

    try {
      if (isEdit && (entry.id || entry._id)) {
        const id = entry.id || entry._id;
        const res = await fetch(`${API_BASE}/schedules/${id}`, {
          method: "PATCH",
          headers: { ...authHeader() },
          body: fd,
          credentials: "include",
        });
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(t || "update diary failed");
        }
      } else {
        const fdCreate = new FormData();
        for (const [k, v] of fd.entries()) fdCreate.append(k, v);
        fdCreate.append("type", normalizeType(baseType) === "cropdiary" ? "crop_diary" : "personal");
        if (entry.color) fdCreate.append("color", String(entry.color));
        const res = await fetch(`${API_BASE}/schedules`, {
          method: "POST",
          headers: { ...authHeader() },
          body: fdCreate,
          credentials: "include",
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
                  plant: (selectedPlant !== "공통" ? selectedPlant : (e.plant || "공통")),
                  image: isFileLike(entry.imageFile) ? e.image : (entry.image || e.image || null),
                  type: "cropdiary",
                }
              : e
          )
        : [
            {
              ...entry,
              id: entry.id || Date.now(),
              title,
              date,
              type: "cropdiary",
              cropId: resolvedCropId ?? null,
              plant: (selectedPlant !== "공통" ? selectedPlant : (entry.plant || "공통")),
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
        credentials: "include",
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
        credentials: "include",
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
      const date = updated.date ? String(updated.date).slice(0, 10) : undefined;
      const fd = new FormData();
      if (updated.title) fd.append("title", updated.title);
      if (updated.content) fd.append("content", updated.content);
      if (date) fd.append("date", date);
      const resolvedCropId = updated.cropId ? Number(updated.cropId) : undefined;
      if (resolvedCropId) fd.append("cropId", String(resolvedCropId));
      if (updated.imageFile && (updated.imageFile instanceof File || updated.imageFile instanceof Blob)) fd.append("image", updated.imageFile);

      const res = await fetch(`${API_BASE}/schedules/${id}`, {
        method: "PATCH",
        headers: { ...authHeader() },
        body: fd,
        credentials: "include",
      });
      if (!res.ok) throw new Error("update schedule failed");
      await Promise.all([
        fetchSchedules(selectedCropId || undefined),
        fetchDiaries(selectedCropId || undefined),
      ]);
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
        credentials: "include",
      });
      if (!res.ok) throw new Error("delete schedule failed");
      await Promise.all([
        fetchSchedules(selectedCropId || undefined),
        fetchDiaries(selectedCropId || undefined),
      ]);
      setIsTaskModalOpen(false);
    } catch {
      const local = tasks.filter((t) => t.id !== id);
      setTasks(local);
      saveLocal(null, local);
      setIsTaskModalOpen(false);
    }
  };

  const handleOpenView = async (entry) => {
    const id = entry?.id ?? entry?._id;
    if (!id) {
      setViewEntry(entry);
      return;
    }
    try {
      const s = await fetchScheduleDetailById(id);
      const mapped = {
        id: s.id ?? entry.id,
        title: s.title ?? entry.title,
        content: s.content ?? entry.content,
        date: String(s.date || entry.date || "").slice(0, 10),
        image: s.image
          ? (s.image.startsWith("http") ? s.image : `${API_BASE}${s.image}`)
          : null,
        cropId: s.cropId ?? s.crop_id ?? s?.crop?.id ?? entry.cropId ?? null,
        color: s.color ?? entry.color ?? null,
        type: normalizeType(s.type) || entry.type || null,
        plant: s?.crop?.name || cropMap.get(Number(s.cropId ?? s.crop_id)) || entry.plant || "공통",
        createdAt: s.createdAt ?? entry.createdAt,
        updatedAt: s.updatedAt ?? entry.updatedAt,
        user: s.user ?? entry.user ?? null,
        crop: s.crop ?? entry.crop ?? null,
      };
      setViewEntry(mapped);
    } catch {
      setViewEntry(entry);
    }
  };

  const matchSelected = useCallback(
    (e) => {
      if (selectedPlant === "공통") return true;
      if (selectedCropId) return Number(e.cropId) === Number(selectedCropId);
      const name = (e.plant || e?.crop?.name || "").trim();
      return name === selectedPlant;
    },
    [selectedPlant, selectedCropId]
  );

  return (
    <div className="mypage-wrapper">
      <Header />
      <WeatherBar />
      <div className="mypage-body">
        <PlantSidebar
          selectedPlant={selectedPlant}
          setSelectedPlant={setSelectedPlant}
          onCropAdded={(c) => {
            if (!c) return;
            setCrops((prev) => {
              const exists = prev.some((p) => Number(p.id) === Number(c.id) || p.name === c.name);
              if (exists) return prev;
              return [{ id: Number(c.id), name: c.name }, ...prev];
            });
          }}
        />
        <main className="mypage-main">
          <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          {activeTab === "calendar" && (
            <MainCalendar
              plant={selectedPlant}
              tasks={tasks}
              onGoPlan={goPlanTabWithDate}
              onEventClick={(t) => {
                setEditTask(t);
                setIsTaskModalOpen(true);
              }}
            />
          )}
          {activeTab === "journal" && (
            <>
              <DiaryList
                selectedPlant={selectedPlant}
                entries={entries.filter(matchSelected)}
                setEntries={setEntries}
                disableCreate={selectedPlant === "공통"}
                onEdit={(entry) => {
                  setEditingEntry(entry);
                  setIsModalOpen(true);
                }}
                onAdd={() => {
                  if (selectedPlant === "공통") {
                    alert("작물을 먼저 선택한 뒤 일지를 작성해 주세요.");
                    return;
                  }
                  setEditingEntry(null);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteDiary}
                onView={handleOpenView}
              />
              <DiaryModal
                open={isModalOpen}
                onClose={() => {
                  setIsModalOpen(false);
                  setEditingEntry(null);
                }}
                initial={editingEntry}
                selectedPlant={selectedPlant}
                selectedCropId={selectedCropId}
                crops={crops}
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
