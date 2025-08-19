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

const PlanAdd = ({ selectedPlant, initialDate = "", onAddTask }) => {
  const [date, setDate] = useState(initialDate || "");
  const [text, setText] = useState("");
  const [color, setColor] = useState(""); 

  useEffect(() => {
    setDate(initialDate || "");
  }, [initialDate]);

  const handleSave = () => {
    if (!date || !text.trim()) {
      alert("날짜와 일정을 입력하세요.");
      return;
    }
    const payload = {
      date,
      text: text.trim(),
      plant: selectedPlant || "공통",
      color: color || undefined, 
    };
    if (typeof onAddTask === "function") {
      onAddTask(payload);
    }
    alert("일정이 저장되었습니다!");
    setText("");
  };

  return (
    <div className="planadd-wrapper">
      <h2>📅 일정 추가</h2>
      <div className="planadd-form">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="예: 물주기 500ml, 순치기 등"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* ✅ 색상 선택 섹션 */}
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
