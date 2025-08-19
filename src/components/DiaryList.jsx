// src/components/DiaryList.jsx
import React, { useMemo, useState } from "react";
import "./DiaryList.css";

export default function DiaryList({
  entries = [],
  selectedPlant = "공통",
  onAdd,
  onEdit,
  onDelete,
  onView,
  setEntries,
  disableCreate = false,
}) {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("latest");

  const filtered = useMemo(() => {
    const q = query.trim();
    const list = q
      ? entries.filter(
          (e) =>
            (e.title || "").toLowerCase().includes(q.toLowerCase()) ||
            (e.content || "").toLowerCase().includes(q.toLowerCase())
        )
      : entries.slice();
    list.sort((a, b) => {
      const da = new Date(a.date || a.createdAt || 0).getTime();
      const db = new Date(b.date || b.createdAt || 0).getTime();
      return order === "latest" ? db - da : da - db;
    });
    return list;
  }, [entries, query, order]);

  return (
    <div className="diary-list">
      <div className="diary-list-toolbar">
        <div className="left">
          <span className="list-title">
            {selectedPlant === "공통"
              ? "농사일지(전체 모아보기)"
              : `농사일지(${selectedPlant})`}
          </span>
        </div>
        <div className="right">
          <input
            className="diary-search"
            placeholder="제목/내용 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="diary-order"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>
          {!disableCreate && (
            <button className="primary-btn" onClick={onAdd}>
              일지 작성
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="diary-empty">
          {selectedPlant === "공통"
            ? "등록된 농사일지가 없습니다. 왼쪽에서 작물을 선택해 일지를 작성한 뒤, 공통에서 모아보세요."
            : "해당 작물에 등록된 농사일지가 없습니다. ‘일지 작성’을 눌러 첫 일지를 만들어 보세요."}
        </div>
      ) : (
        <ul className="diary-cards">
          {filtered.map((e) => (
            <li
              key={e.id || `${e.date}-${e.title}`}
              className="diary-card"
              onClick={() => onView && onView(e)}
            >
              <div className="card-head">
                <span className="card-date">{(e.date || "").slice(0, 10)}</span>
                {e.plant && <span className="card-chip">{e.plant}</span>}
              </div>
              <div className="card-title">{e.title || "제목 없음"}</div>
              <div className="card-content-preview">
                {e.content || "내용 없음"}
              </div>
              {e.image && <img className="card-thumb" src={e.image} alt="" />}
              <div className="card-actions">
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onEdit && onEdit(e);
                  }}
                >
                  수정
                </button>
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onDelete && onDelete(e);
                  }}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
