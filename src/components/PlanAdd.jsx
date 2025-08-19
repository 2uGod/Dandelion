// src/components/PlanAdd.jsx
import React, { useEffect, useState } from "react";
import "./PlanAdd.css";

const PRESET_COLORS = [
  "#ef4444", 
  "#f59e0b", 
  "#10b981", 
  "#06b6d4", 
  "#3b82f6", 
  "#6366f1", 
  "#a855f7", 
  "#ec4899", 
  "#6b7280", 
];

const PlanAdd = ({ selectedPlant, initialDate = "", onAddTask, selectedCropId, onBack }) => {
  const [date, setDate] = useState(initialDate || "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState(""); 

  useEffect(() => {
    setDate(initialDate || "");
  }, [initialDate]);

  const handleSave = () => {
    if (!date || !title.trim()) {
      alert("날짜와 제목을 입력하세요.");
      return;
    }
    const payload = {
      title: title.trim(),
      date,
      cropId: selectedCropId,
      content: content.trim() || undefined, 
      color: color || undefined, 
    };
    if (typeof onAddTask === "function") {
      onAddTask(payload);
    }
    alert("일정이 저장되었습니다!");
    setTitle("");
    setContent("");
  };

  return (
    <div className="planadd-wrapper">
      <div className="planadd-header">
        <h2>📅 일정 추가</h2>
        {onBack && (
          <button className="back-button" onClick={onBack}>
            ←
          </button>
        )}
      </div>
      <div className="planadd-form">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="일정 제목 (예: 물주기, 순치기 등)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="상세 내용 (선택사항)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />

        <div className="color-picker">
          <div className="color-picker-row">
            <span className="color-picker-label">색상</span>
            <input
              type="color"
              className="color-input"
              value={color || "#6366f1"}
              onChange={(e) => setColor(e.target.value)}
              title="임의 색상 선택"
            />
            <button
              type="button"
              className="color-reset-btn"
              onClick={() => setColor("")}
              title="기본(작물별) 색 사용"
            >
              기본색
            </button>
          </div>

          <div className="color-swatches">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`swatch ${color === c ? "active" : ""}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                title={c}
              />
            ))}
          </div>

          <div className="hint">
            색상을 지정하지 않으면 작물별 기본색을 사용합니다.
          </div>
        </div>

        <button onClick={handleSave}>저장</button>
      </div>

      <div className="hint">
        현재 선택된 작물: <strong>{selectedPlant || "공통"}</strong>
      </div>
    </div>
  );
};

export default PlanAdd;