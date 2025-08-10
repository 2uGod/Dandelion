// src/components/MainCalendar.jsx
import React, { useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./MainCalendar.css"
// 분리했다면 아래를 켜주세요
// import "../styles/MainCalendar.css";

// 🧪 데모용 더미 데이터 (백엔드 붙기 전)
const tasksByPlant = {
  토마토: {
    "2025-08-09": ["물주기 500ml", "잎 끝 갈변 체크"],
    "2025-08-10": ["순치기", "지주대 점검"],
  },
  상추: {
    "2025-08-09": ["수확 5주차 기록", "상토 상태 확인"],
  },
  오이: {
    "2025-08-11": ["비료 A 10g", "수분 스트레스 관찰"],
  },
  고추: {},
};

function toKey(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const MainCalendar = ({ plant }) => {
  const [value, setValue] = useState(new Date());
  const selectedKey = useMemo(() => toKey(value), [value]);

  const items = useMemo(() => {
    if (!plant) return [];
    return (tasksByPlant[plant] && tasksByPlant[plant][selectedKey]) || [];
  }, [plant, selectedKey]);

  return (
    <section className="calendar-wrapper">
      {/* 왼쪽: 큰 캘린더 */}
      <div className="calendar-pane">
        <div className="calendar-header-row">
          <h3>{plant ? `${plant} 캘린더` : "캘린더"}</h3>
        </div>
        <Calendar
          onChange={setValue}
          value={value}
          locale="ko-KR"
          calendarType="gregory"
          className="custom-calendar"
        />
      </div>

      {/* 오른쪽: 일정 카드 */}
      <aside className="schedule-pane">
        <div className="schedule-card">
          <div className="schedule-head">
            <div className="schedule-title">📋 선택한 날짜의 일정</div>
            <div className="schedule-date">
              {value.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </div>
          </div>

          {!plant ? (
            <div className="schedule-empty">
              왼쪽 사이드바에서 <b>작물</b>을 먼저 선택해 주세요.
            </div>
          ) : items.length === 0 ? (
            <div className="schedule-empty">
              <b>{plant}</b>에 등록된 일정이 없습니다.
              <div className="hint">달력에서 날짜를 선택한 뒤 “일정 추가”를 눌러보세요.</div>
            </div>
          ) : (
            <ul className="schedule-list">
              {items.map((t, i) => (
                <li key={i} className="schedule-item">
                  <span className="dot" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="schedule-actions">
            <button className="btn-primary">일정 추가</button>
            <button className="btn-ghost">메모</button>
          </div>
        </div>
      </aside>
    </section>
  );
};

export default MainCalendar;
