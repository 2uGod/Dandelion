// src/components/PlantSidebar.jsx
import React, { useEffect, useState } from "react";
import PlantPopup from "./PlantPopup";
import { getMyCrops, deleteCrop } from "../api/cropAPI";
import "./PlantSidebar.css";
import { FaTrash } from "react-icons/fa";

const asArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.crops)) return data.crops;
  return [];
};

const normalizeCrop = (c) => {
  const name =
    c?.name ??
    c?.data?.name ??
    c?.crop?.name ??
    c?.title ??
    c?.label ??
    "";
  const id =
    c?.id ??
    c?.data?.id ??
    c?.crop?.id ??
    c?.uuid ??
    c?._id ??
    null;

  return { id, name, _raw: c };
};

const PlantSidebar = ({ selectedPlant, setSelectedPlant, onCropAdded }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyCrops();
        const items = asArray(res).map(normalizeCrop);
        setCrops(items);
      } catch (e) {
        console.error("❌ 내 작물 불러오기 실패:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAdded = (newCropRaw) => {
    if (!newCropRaw) return setShowPopup(false);
    const added = normalizeCrop(newCropRaw);
    setCrops((prev) => [added, ...prev]);
    if (added.name) setSelectedPlant?.(added.name);
    if (added.id || added.name) onCropAdded?.({ id: added.id, name: added.name });
    setShowPopup(false);
  };

  const handleDelete = async (idOrName) => {
    if (!window.confirm("정말 삭제하시겠어요?")) return;
    const backup = crops;
    const removed = backup.find(
      (c) => c.id === idOrName || c.name === idOrName
    );
    setCrops((prev) => prev.filter((c) => c !== removed));
    try {
      await deleteCrop(removed?.id ?? removed?.name);
      if (removed && selectedPlant === (removed.name ?? "")) {
        setSelectedPlant?.("");
      }
    } catch (e) {
      console.error("❌ 삭제 실패:", e);
      alert("삭제 중 오류가 발생했습니다.");
      setCrops(backup);
    }
  };

  return (
    <aside className="plant-sidebar">
      <h3>🌱 나의 작물</h3>

      {loading ? (
        <div className="muted">불러오는 중…</div>
      ) : (
        <ul>
          <li className={selectedPlant === "공통" ? "selected" : ""}>
            <div className="row">
              <button
                type="button"
                className="name-btn"
                onClick={() => setSelectedPlant?.("공통")}
                title="공통"
              >
                공통
              </button>
            </div>
          </li>

          {crops.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">🌱</div>
              <p className="empty-title">아직 등록된 작물이 없어요</p>
              <p className="empty-desc">아래 <b>+작물 추가</b> 버튼을 눌러 첫 작물을 등록해 보세요.</p>
              <ul className="empty-tips">
                <li>#토마토</li>
                <li>#상추</li>
                <li>#오이</li>
              </ul>
            </div>
          ) : (
            crops.map((crop, idx) => {
              const isSelected = selectedPlant === (crop.name ?? "");
              const key = crop.id ?? crop.name ?? `row-${idx}`;
              const displayName = crop.name || "(이름 없음)";
              return (
                <li key={key} className={isSelected ? "selected" : ""}>
                  <div className="row">
                    <button
                      type="button"
                      className="name-btn"
                      onClick={() => setSelectedPlant?.(crop.name ?? "")}
                      title={displayName}
                    >
                      {displayName}
                    </button>
                    <button
                      type="button"
                      className="icon-btn danger"
                      onClick={() => handleDelete(crop.id ?? crop.name)}
                      aria-label="작물 삭제"
                      title="삭제"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      )}

      <button
        type="button"
        className="add-btn"
        onClick={() => setShowPopup(true)}
      >
        + 작물 추가
      </button>

      {showPopup && (
        <PlantPopup onClose={() => setShowPopup(false)} onAdded={handleAdded} />
      )}
    </aside>
  );
};

export default PlantSidebar;
