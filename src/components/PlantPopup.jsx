import React, { useState } from "react";
import "./PlantPopup.css";
import { createCrop } from "../api/cropAPI";

const PlantPopup = ({ onClose, onAdded }) => {
  const [name, setName] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const [plantingDate, setPlantingDate] = useState(today);

  const isValidDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return alert("작물 이름을 입력하세요.");
    if (!plantingDate || !isValidDate(plantingDate)) {
      return alert("심은 날짜를 입력해주세요.");
    }

    try {
      const payload = { name: trimmed, plantingDate };
      const newCrop = await createCrop(payload);

      const cropName =
        newCrop?.name ?? newCrop?.data?.name ?? newCrop?.crop?.name ?? trimmed;

      // ✅ 부모(사이드바)로 새 항목 전달 → 즉시 갱신 & 선택
      onAdded && onAdded(newCrop);

      alert(`"${cropName}"이(가) 등록되었습니다.`);
      onClose();
    } catch (err) {
      console.error("❌ 등록 실패:", err);
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "알 수 없는 오류";
      alert(`작물 등록 실패\nstatus: ${status}\nmessage: ${msg}`);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>작물 추가하기</h3>

        <label>작물 이름</label>
        <input
          type="text"
          placeholder="예: 토마토"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>심은 날짜</label>
        <input
          type="date"
          value={plantingDate}
          onChange={(e) => setPlantingDate(e.target.value)}
        />

        <div className="popup-actions">
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={!name.trim() || !isValidDate(plantingDate)}
          >
            추가
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantPopup;
