import React, { useMemo, useState } from "react";
import "./DiaryList.css";
import { FaPen } from "react-icons/fa";

const DEFAULT_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A//www.w3.org/2000/svg%22 width%3D%22200%22 height%3D%22200%22 viewBox%3D%220 0 200 200%22%3E%3Crect width%3D%22200%22 height%3D%22200%22 rx%3D%2224%22 fill%3D%22%23e5f7ef%22/%3E%3Ctext x%3D%2250%25%22 y%3D%2255%25%22 dominant-baseline%3D%22middle%22 text-anchor%3D%22middle%22 font-size%3D%2272%22%3E%F0%9F%8C%B1%3C/text%3E%3C/svg%3E";

const DiaryList = ({
  entries = [],
  setEntries,
  onEdit,
  onAdd,
  onDelete,
  loading = false,
}) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => {
      const title = (e?.title || "").toLowerCase();
      const content = (e?.content || "").toLowerCase();
      return title.includes(q) || content.includes(q);
    });
  }, [entries, query]);

  return (
    <div className="diary-list">
      {/* 상단 툴바: 버튼이 입력칸 왼쪽에 오도록 구성 */}
      <div className="list-toolbar">
        <div className="toolbar-actions">
          <button type="button" className="write-button" onClick={onAdd}>
            <FaPen style={{ marginRight: 6 }} />
            일지 작성
          </button>

          <input
            className="search-input"
            type="text"
            placeholder="제목/내용 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="empty">불러오는 중…</div>
      ) : filtered.length === 0 ? (
        <div className="empty">해당 조건에 맞는 일지가 없습니다.</div>
      ) : (
        <ul className="cards">
          {filtered.map((e) => (
            <li className="card" key={e.id || e._id || e.createdAt}>
              <div className="thumb">
                <img
                  src={e.imageUrl || e.image || DEFAULT_IMAGE}
                  alt={e.title || "diary"}
                  onError={(ev) => {
                    ev.currentTarget.src = DEFAULT_IMAGE;
                  }}
                />
              </div>
              <div className="meta">
                <div className="title-row">
                  <h3 className="title">{e.title || "제목 없음"}</h3>
                  <div className="card-actions">
                    <button
                      className="card-btn"
                      onClick={() => onEdit && onEdit(e)}
                    >
                      수정
                    </button>
                    <button
                      className="card-btn danger"
                      onClick={() => onDelete && onDelete(e)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <p className="date">
                  {e.date
                    ? new Date(e.date).toLocaleDateString()
                    : "날짜 없음"}
                </p>
                <p className="content">{e.content || "내용 없음"}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DiaryList;
