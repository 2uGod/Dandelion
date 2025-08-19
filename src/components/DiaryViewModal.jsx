import React, { useEffect } from "react";
import "./DiaryViewModal.css";

const DEFAULT_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A//www.w3.org/2000/svg%22 width%3D%22200%22 height%3D%22200%22 viewBox%3D%220 0 200 200%22%3E%3Crect width%3D%22200%22 height%3D%22200%22 rx%3D%2224%22 fill%3D%22%23e5f7ef%22/%3E%3Ctext x%3D%2250%25%22 y%3D%2255%25%22 dominant-baseline%3D%22middle%22 text-anchor%3D%22middle%22 font-size%3D%2272%22%3E%F0%9F%8C%B1%3C/text%3E%3C/svg%3E";

const DiaryViewModal = ({ open, entry, onClose, onEdit, onDelete }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !entry) return null;

  const img = entry.imageUrl || entry.image || DEFAULT_IMAGE;

  return (
    <div className="dv-overlay" onClick={onClose}>
      <div className="dv-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="dv-media">
          <img src={img} alt={entry.title || "diary"} onError={(ev)=>{ev.currentTarget.src = DEFAULT_IMAGE;}} />
        </div>
        <div className="dv-body">
          <h2 className="dv-title">{entry.title || "제목 없음"}</h2>
          <div className="dv-sub">
            <span>{entry.date ? new Date(entry.date).toLocaleDateString() : "날짜 없음"}</span>
            {entry.plant && <span className="dv-dot">•</span>}
            {entry.plant && <span>{entry.plant}</span>}
          </div>
          <div className="dv-content">{entry.content || "내용 없음"}</div>
        </div>
        <div className="dv-actions">
          <button className="dv-btn" onClick={onClose}>닫기</button>
          {onEdit && (
            <button
              className="dv-btn primary"
              onClick={() => { onEdit(entry); }}
            >
              수정
            </button>
          )}
          {onDelete && (
            <button
              className="dv-btn danger"
              onClick={() => { onDelete(entry); }}
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiaryViewModal;
