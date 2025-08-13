// src/components/DiaryList.jsx
import React, { useMemo, useState } from "react";
import "./DiaryList.css"; 

// 동일한 기본 이미지(렌더 안전용)
const DEFAULT_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A//www.w3.org/2000/svg%22 width%3D%22200%22 height%3D%22200%22 viewBox%3D%220 0 200 200%22%3E%3Crect width%3D%22200%22 height%3D%22200%22 rx%3D%2224%22 fill%3D%22%23e5f7ef%22/%3E%3Ctext x%3D%2250%25%22 y%3D%2255%25%22 dominant-baseline%3D%22middle%22 text-anchor%3D%22middle%22 font-size%3D%2272%22%3E%F0%9F%8C%B1%3C/text%3E%3C/svg%3E";

const DiaryList = ({ entries, setEntries, onEdit }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [q, setQ] = useState("");

  const sorted = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [entries]
  );

  const filtered = useMemo(() => {
    return sorted.filter((e) => {
      if (!e.date) return false;
      const d = new Date(e.date);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      if (y !== year || m !== month) return false;

      if (q.trim()) {
        const needle = q.toLowerCase();
        const hay = `${e.title || ""} ${e.content || ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [sorted, year, month, q]);

  const prevMonth = () => {
    setMonth((m) => (m === 1 ? 12 : m - 1));
    setYear((y) => (month === 1 ? y - 1 : y));
  };
  const nextMonth = () => {
    setMonth((m) => (m === 12 ? 1 : m + 1));
    setYear((y) => (month === 12 ? y + 1 : y));
  };
  const prevYear = () => setYear((y) => y - 1);
  const nextYear = () => setYear((y) => y + 1);

  const deleteEntry = (id) => {
    if (!confirm("정말 삭제할까요?")) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const monthLabel = `${month.toString().padStart(2, "0")}월`;
  const yearLabel = `${year}년`;

  return (
    <div className="diary-list">
      <div className="diary-toolbar">
        <div className="toolbar-left">
          <div className="nav-group year-nav">
            <button className="nav-btn" onClick={prevYear} aria-label="이전 해">&lt;</button>
            <span className="nav-label">{yearLabel}</span>
            <button className="nav-btn" onClick={nextYear} aria-label="다음 해">&gt;</button>
          </div>
          <div className="nav-group month-nav">
            <button className="nav-btn" onClick={prevMonth} aria-label="이전 달">&lt;</button>
            <span className="nav-label">{monthLabel}</span>
            <button className="nav-btn" onClick={nextMonth} aria-label="다음 달">&gt;</button>
          </div>
        </div>

        <div className="toolbar-right">
          <input
            className="search-input"
            placeholder="제목/내용 검색…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-summary">
        현재 보기: <strong>{yearLabel} {monthLabel}</strong>
        {q.trim() && <> · 검색어: <strong>“{q.trim()}”</strong></>}
        {" · "}총 <strong>{filtered.length}</strong>건
      </div>

      {filtered.length === 0 && (
        <p className="empty-state">해당 조건에 맞는 일지가 없습니다.</p>
      )}

      {filtered.map((entry) => (
        <div key={entry.id} className="diary-item diary-item--row">
          <img
            className="diary-thumb"
            src={entry.image || DEFAULT_IMAGE}
            alt={entry.title || "thumbnail"}
          />

          <div className="diary-item-body">
            <div className="diary-item-header">
              <h3 className="diary-title">{entry.title}</h3>
              <div className="diary-meta">
                <span>{entry.date}</span>
                <span className="dot">•</span>
                <span>{entry.plant || "작물 미선택"}</span>
              </div>
            </div>

            {entry.content && <p className="diary-content">{entry.content}</p>}

            <div className="diary-actions">
              <button className="btn-ghost" onClick={() => onEdit(entry)}>수정</button>
              <button className="btn-danger" onClick={() => deleteEntry(entry.id)}>삭제</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiaryList;
