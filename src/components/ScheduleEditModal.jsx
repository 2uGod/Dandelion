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
  title: "",
  content: "",
  plant: "공통",
  color: "#6366f1",
};

export default function ScheduleEditModal({ open, task, onClose, onUpdate, onDelete }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (task) {
      setForm({
        id: task.id,
        date: task.date || "",
        title: task.title || task.text || "",
        content: task.content || "",
        plant: task.plant || "공통",
        color: task.color || "#6366f1",
      });
    }
  }, [task]);

  if (!open) return null;

  const setField = (name, value) => setForm((s) => ({ ...s, [name]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
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
          <div className="form-field">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
              required
            />
          </div>
          
          <div className="form-field">
            <input
              type="text"
              placeholder="일정 제목 (예: 물주기, 순치기 등)"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              required
            />
          </div>
          
          <div className="form-field">
            <textarea
              placeholder="상세 내용 (선택사항)"
              value={form.content}
              onChange={(e) => setField("content", e.target.value)}
              rows={3}
            />
          </div>

          <div className="color-picker">
            <div className="color-picker-row">
              <span className="color-picker-label">색상</span>
              <input
                type="color"
                className="color-input"
                value={form.color || "#6366f1"}
                onChange={(e) => setField("color", e.target.value)}
                title="임의 색상 선택"
              />
              <button
                type="button"
                className="color-reset-btn"
                onClick={() => setField("color", "")}
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
                  className={`swatch ${form.color === c ? "active" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setField("color", c)}
                  title={c}
                />
              ))}
            </div>

            <div className="hint">
              색상을 지정하지 않으면 작물별 기본색을 사용합니다.
            </div>
          </div>

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