import React, { useEffect, useState } from "react";
import PlantPopup from "./PlantPopup";
import { getMyCrops, deleteCrop } from "../api/cropApi";
import "./PlantSidebar.css";
import { FaTrash } from "react-icons/fa";

// 응답 배열 안전 추출
const asArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.crops)) return data.crops;
  return [];
};

// 다양한 응답 모양 -> {id, name} 으로 표준화
const normalizeCrop = (c) => {
  const name =
    c?.name ??
    c?.data?.name ??
    c?.crop?.name ??
    c?.title ??
    c?.label ??
    ""; // 최종 fallback
  const id =
    c?.id ??
    c?.data?.id ??
    c?.crop?.id ??
    c?.uuid ??
    c?._id ??
    null;

  return { id, name, _raw: c };
};

const PlantSidebar = ({ selectedPlant, setSelectedPlant }) => {
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
      // 서버쪽이 id 삭제만 받는 경우가 많지만, id가 없을 때는 이름으로도 시도
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
        <>
          <ul className="plant-list">
            <li key="common" className={selectedPlant === "공통" ? "selected" : ""}>
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
            {crops.map((crop, idx) => {
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
                      <FaTrash />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          
          {crops.length === 0 && (
            <div className="empty-state" role="status" aria-live="polite">
              <div className="empty-emoji" aria-hidden>
                🌱
              </div>
              <p className="empty-title">아직 등록된 작물이 없어요</p>
              <p className="empty-desc">
                아래 <b>+ 작물 추가</b> 버튼을 눌러 첫 작물을 등록해 보세요.
              </p>

              <ul className="empty-tips">
                <li>#토마토</li>
                <li>#상추</li>
                <li>#고추</li>
              </ul>
            </div>
          )}
        </>
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
