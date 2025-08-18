import React, { useEffect, useState } from "react";
import "./ScheduleEditModal.css";
import { updateSchedule, deleteSchedule, getSchedule } from "../api/SchedulesAPI";

export default function ScheduleEditModal({ id, isOpen, onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (!isOpen || !id) return;
    getSchedule(id).then((d) => {
      setTitle(d.title || "");
      setContent(d.content || "");
      setDate(d.date || "");
    });
  }, [isOpen, id]);

  async function handleSave(e) {
    e.preventDefault();
    await updateSchedule(id, { title, content, date });
    onSaved?.();
    onClose?.();
  }

  async function handleDelete() {
    await deleteSchedule(id);
    onSaved?.();
    onClose?.();
  }

  if (!isOpen) return null;

  return (
    <div className="schedule-edit-modal">
      <div className="modal-card">
        <h3>일정 수정</h3>
        <form onSubmit={handleSave}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="actions">
            <button type="button" className="danger" onClick={handleDelete}>삭제</button>
            <button type="button" onClick={onClose}>취소</button>
            <button type="submit" className="primary">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
}
