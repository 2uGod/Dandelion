// src/components/MainCalendar.jsx
import React, { useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./MainCalendar.css";

const plantColor = (plant) => {
  switch (plant) {
    case "토마토":
    case "방울토마토":
      return "#ef4444"; 
    case "상추":
      return "#10b981"; 
    case "오이":
      return "#06b6d4"; 
    case "고추":
      return "#f59e0b"; 
    case "공통":
    default:
      return "#6366f1";
  }
};

function toKey(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function ymdRangeOfMonth(activeStartDate) {
  const start = new Date(activeStartDate.getFullYear(), activeStartDate.getMonth(), 1);
  const end = new Date(activeStartDate.getFullYear(), activeStartDate.getMonth() + 1, 0);
  const startStr = toKey(start);
  const endStr = toKey(end);
  return { start, end, startStr, endStr };
}


const MainCalendar = ({ plant, tasks = [], onGoPlan }) => {
  const [value, setValue] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date()); 

  const selectedKey = useMemo(() => toKey(value), [value]);
  const isCommonView = !plant || plant === "공통";
  const currentPlant = plant || "공통";

  const monthGroups = useMemo(() => {
    if (!isCommonView) return [];
    const { startStr, endStr } = ymdRangeOfMonth(activeStartDate);
    const monthTasks = tasks
      .filter((t) => t.date >= startStr && t.date <= endStr)
      .sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? -1 : 1));

    const map = new Map();
    monthTasks.forEach((t) => {
      const list = map.get(t.date) || [];
      list.push(t);
      map.set(t.date, list);
    });

    return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
  }, [isCommonView, tasks, activeStartDate]);

  const dayTasks = useMemo(() => {
    if (isCommonView) return [];
    return tasks.filter((t) => t.date === selectedKey && (t.plant || "공통") === plant);
  }, [tasks, selectedKey, plant, isCommonView]);

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const key = toKey(date);

    const dayTasksForTile = isCommonView
      ? tasks.filter((t) => t.date === key) // 공통 뷰: 전체
      : tasks.filter((t) => t.date === key && (t.plant || "공통") === plant);

    if (dayTasksForTile.length === 0) return null;

    const first3 = dayTasksForTile.slice(0, 3);
    const extra = dayTasksForTile.length - first3.length;

    return (
      <div className="cal-dots-wrap">
        {first3.map((t, i) => (
          <span
            key={i}
            className="cal-dot"
            style={{ backgroundColor: t.color || plantColor(t.plant || "공통") }}
            title={`${t.plant || "공통"}: ${t.text}`}
          />
        ))}
        {extra > 0 && <span className="cal-plus">+{extra}</span>}
      </div>
    );
  };

  const goPlan = () => {
    if (typeof onGoPlan === "function") onGoPlan(selectedKey);
  };

  return (
    <section className="calendar-wrapper">
      <div className="calendar-pane">
        <div className="calendar-header-row">
          <h3>{isCommonView ? "캘린더(공통 · 이번 달 전체)" : `${plant} 캘린더`}</h3>
        </div>
        <Calendar
          onChange={setValue}
          value={value}
          locale="ko-KR"
          calendarType="gregory"
          className="custom-calendar"
          tileContent={tileContent}
          onActiveStartDateChange={({ activeStartDate: d }) => setActiveStartDate(d)}
        />
      </div>

      <aside className="schedule-pane">
        <div className="schedule-card">
          <div className="schedule-head">
            <div className="schedule-title">
              {isCommonView ? "📅 이번 달 전체 일정" : "📋 선택한 날짜의 일정"}
            </div>
            <div className="schedule-date">
              {isCommonView
                ? (() => {
                    const { start, end } = ymdRangeOfMonth(activeStartDate);
                    return `${start.getFullYear()}년 ${start.getMonth() + 1}월 (${toKey(start)} ~ ${toKey(end)})`;
                  })()
                : value.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  })}
            </div>
          </div>

          {isCommonView ? (
            monthGroups.length === 0 ? (
              <div className="schedule-empty">
                <b>공통(전체)</b>에 등록된 일정이 없습니다.
                <div className="hint">달력에서 날짜를 선택한 뒤 “일정 추가”를 눌러보세요.</div>
              </div>
            ) : (
              <div className="month-groups">
                {monthGroups.map((g) => (
                  <div key={g.date} className="month-group">
                    <div className="group-date">{g.date}</div>
                    <ul className="group-list">
                      {g.items.map((t) => (
                        <li key={t.id} className="group-item">
                          <span
                            className="dot"
                            style={{ backgroundColor: t.color || plantColor(t.plant || "공통") }}
                          />
                          <span className="plant-chip"
                                style={{
                                  backgroundColor: (t.color || plantColor(t.plant || "공통")) + "22",
                                  borderColor: t.color || plantColor(t.plant || "공통"),
                                }}
                          >
                            {t.plant || "공통"}
                          </span>
                          <span className="task-text">{t.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )
          ) : 
          dayTasks.length === 0 ? (
            <div className="schedule-empty">
              <b>{currentPlant}</b>에 등록된 일정이 없습니다.
              <div className="hint">달력에서 날짜를 선택한 뒤 “일정 추가”를 눌러보세요.</div>
            </div>
          ) : (
            <ul className="schedule-list">
              {dayTasks.map((t) => (
                <li key={t.id} className="schedule-item">
                  <span
                    className="dot"
                    style={{ backgroundColor: t.color || plantColor(t.plant || "공통") }}
                  />
                  <span className="task-text">{t.text}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="schedule-actions">
            <button className="btn-primary" onClick={goPlan}>일정 추가</button>
            <button className="btn-ghost" onClick={() => alert("메모 기능은 추후 연결 예정입니다.")}>
              메모
            </button>
          </div>
        </div>
      </aside>
    </section>
  );
};

export default MainCalendar;
