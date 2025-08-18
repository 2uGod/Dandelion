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
  onView,
  loading = false,
}) => {
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = entries;

    if (q) {
      list = list.filter((e) => {
        const title = (e?.title || "").toLowerCase();
        const content = (e?.content || "").toLowerCase();
        return title.includes(q) || content.includes(q);
      });
    }

    list = [...list].sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      return sortOrder === "latest" ? db - da : da - db;
    });

    return list;
  }, [entries, query, sortOrder]);

  return (
    <div className="diary-list">
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

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
          >
            <option value="latest">최신순</option>
            <option value="oldest">날짜순</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="empty">불러오는 중…</div>
      ) : filtered.length === 0 ? (
        <div className="empty">해당 조건에 맞는 일지가 없습니다.</div>
      ) : (
        <ul className="cards">
          {filtered.map((e, i) => {
            const key = e.id || e._id || `${e.date || ""}-${i}`;
            return (
              <li
                className="card"
                key={key}
                onClick={() => onView && onView(e)}
              >
                <div className="card-image">
                  <img
                    src={e.imageUrl || e.image || DEFAULT_IMAGE}
                    alt={e.title || "diary"}
                    onError={(ev) => {
                      ev.currentTarget.src = DEFAULT_IMAGE;
                    }}
                  />
                </div>
                <div className="card-body">
                  <h3 className="title">{e.title || "제목 없음"}</h3>
                  <p className="date">
                    {e.date ? new Date(e.date).toLocaleDateString() : "날짜 없음"}
                  </p>
                  <p className="content">{e.content || "내용 없음"}</p>
                </div>
                <div className="card-footer">
                  <button
                    className="card-btn"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onEdit && onEdit(e);
                    }}
                  >
                    수정
                  </button>
                  <button
                    className="card-btn danger"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onDelete && onDelete(e);
                    }}
                  >
                    삭제
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default DiaryList;
