import React, { useEffect, useState } from "react";
import "./ScheduleEditModal.css";

const PRESET_COLORS = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
];

const initialForm = {
  id: null,
  date: "",
  plant: "공통",
  color: "#6366f1",
  text: "",
  memo: "",
};

export default function ScheduleEditModal({ open, task, onClose, onUpdate, onDelete }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (task) {
      setForm({
        id: task.id,
        date: task.date || "",
        plant: task.plant || "공통",
        color: task.color || "#6366f1",
        text: task.text || "",
        memo: task.memo || "",
      });
    }
  }, [task]);

  if (!open) return null;

  const setField = (name, value) => setForm((s) => ({ ...s, [name]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.text.trim()) return;
    onUpdate({ ...form });
    onClose();
  };

  const handleDelete = () => {
    if (!task) return;
    onDelete(task.id);
    onClose();
  };

  return (
    <div className="sched-modal-backdrop" onClick={onClose}>
      <div className="sched-modal" onClick={(e) => e.stopPropagation()}>
        <header className="sched-modal-header">
          <h3>일정 수정</h3>
          <button className="icon-btn" onClick={onClose} aria-label="close">✕</button>
        </header>

        <form className="sched-form" onSubmit={handleSubmit}>
          <div className="row two">
            <label>
              날짜
              <input
                type="date"
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
                required
              />
            </label>
            <label>
              작물
              <select
                value={form.plant}
                onChange={(e) => setField("plant", e.target.value)}
              >
                <option value="공통">공통</option>
                <option value="망고">망고</option>
                <option value="파인애플">파인애플</option>
                <option value="방울토마토">방울토마토</option>
              </select>
            </label>
          </div>

          <label>
            일정 내용
            <input
              type="text"
              placeholder="예: 물 주기"
              value={form.text}
              onChange={(e) => setField("text", e.target.value)}
              required
            />
          </label>

          <div className="color-field">
            <div className="color-label">색상</div>

            <div className="color-ui">
              <div className="color-current" style={{ background: form.color }} />

              <div className="swatches">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`swatch ${form.color === c ? "active" : ""}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setField("color", c)}
                    aria-label={c}
                  />
                ))}
                <label className="swatch custom">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setField("color", e.target.value)}
                  />
                </label>
              </div>

              <div className="hex">{form.color.toUpperCase()}</div>
            </div>
          </div>

            <label>
              메모
              <textarea
                rows={4}
                value={form.memo}
                onChange={(e) => setField("memo", e.target.value)}
                placeholder="메모를 입력하세요"
              />
            </label>

          <div className="actions">
            <button type="button" className="danger" onClick={handleDelete}>삭제</button>
            <div className="spacer" />
            <button type="button" onClick={onClose}>취소</button>
            <button type="submit" className="primary">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
}
