// WeatherBar.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./WeatherBar.css";

// 가로 간격(컬럼 너비) — 점 간 간격을 줄이거나 늘리고 싶으면 여기만 바꾸면 됩니다.
const COL_W = 56;

// 온도 컬러
const TEMP_COLORS = (t) => (t >= 30 ? "#C81E1E" : t >= 28 ? "#F97316" : "#F59E0B");

// 날짜/시간 포맷
const fmtDay = (d) =>
  `${d.getMonth() + 1}월 ${d.getDate()}일 ${["일","월","화","수","목","금","토"][d.getDay()]}요일`;

function fmtHour(d) {
  const h = d.getHours();
  const ampm = h < 12 ? "오전" : "오후";
  const hh = h % 12 || 12;
  return `${ampm} ${hh}시`;
}

export default function WeatherBar({ lat, lon }) {
  const [data, setData] = useState(null); // { location, items:[{time:Date,temp:number}] }
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);

  // 데이터 로딩
  useEffect(() => {
    const withCoords = async () => {
      setLoading(true);
      let coords = null;

      if (typeof lat === "number" && typeof lon === "number") {
        coords = { latitude: lat, longitude: lon, label: "내 위치" };
      } else if ("geolocation" in navigator) {
        try {
          const p = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, {
              enableHighAccuracy: true,
              timeout: 6000,
            })
          );
          coords = { latitude: p.coords.latitude, longitude: p.coords.longitude, label: "내 위치" };
        } catch {}
      }
      if (!coords) coords = { latitude: 37.4201, longitude: 127.1269, label: "성남시" };

      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}` +
          `&longitude=${coords.longitude}` +
          `&hourly=temperature_2m&timezone=Asia/Seoul&forecast_days=2`; // 48시간 확보
        const r = await fetch(url);
        const j = await r.json();

        const hours = j?.hourly?.time || [];
        const temps = j?.hourly?.temperature_2m || [];

        const now = new Date();
        // 현재 시각 이상 첫 인덱스
        let startIdx = hours.findIndex((iso) => new Date(iso) >= now);
        if (startIdx === -1) {
          // 전부 과거라면 배열 끝에서 24개
          startIdx = Math.max(0, hours.length - 24);
        }

        const items = [];
        for (let i = 0; i < 24; i++) {
          const idx = startIdx + i;
          if (idx >= hours.length) break;
          items.push({ time: new Date(hours[idx]), temp: Math.round(temps[idx]) });
        }

        // 혹시 24개가 안 찼으면, 앞에서 보충
        while (items.length < 24 && startIdx - 1 >= 0) {
          startIdx -= 1;
          items.unshift({ time: new Date(hours[startIdx]), temp: Math.round(temps[startIdx]) });
        }

        setData({ location: coords.label, items });
      } catch (e) {
        // 더미: 현재 시각부터 24시간
        const now = new Date();
        const items = Array.from({ length: 24 }).map((_, i) => {
          const d = new Date(now.getTime() + i * 3600000);
          const base = 26 + Math.sin((i / 24) * Math.PI * 2) * 4;
          return { time: d, temp: Math.round(base) };
        });
        setData({ location: "성남시", items });
      } finally {
        setLoading(false);
      }
    };

    withCoords();
  }, [lat, lon]);

  // 현재 시간 칼럼으로 스크롤
  useEffect(() => {
    if (!data?.items?.length || !trackRef.current) return;
    const now = new Date();
    const idx = Math.max(0, data.items.findIndex((it) => it.time >= now));
    const left = Math.max(0, COL_W * (idx - 2));
    if (typeof trackRef.current.scrollTo === "function") {
      trackRef.current.scrollTo({ left, behavior: "smooth" });
    } else {
      trackRef.current.scrollLeft = left;
    }
  }, [data]);

  // 평균/범위 기반 점 높이 스케일
  const { avg, min, max } = useMemo(() => {
    if (!data?.items?.length) return { avg: 0, min: 0, max: 0 };
    const arr = data.items.map((d) => d.temp);
    const sum = arr.reduce((a, b) => a + b, 0);
    const avg = sum / arr.length;
    return { avg, min: Math.min(...arr), max: Math.max(...arr) };
  }, [data]);

  const scaleY = (t) => {
    if (max === min) return 0.5;
    const span = Math.max(max - avg, avg - min) || 1;
    const norm = (t - avg) / (2 * span); // -0.5 ~ 0.5
    const y = 0.5 + norm;                // 평균보다 높으면 0.5↑
    return Math.min(1, Math.max(0, y));  // [0,1] 클램프
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="wb-wrap wb-skeleton">
        <div className="wb-left">
          <div className="wb-temp-skel" />
          <div className="wb-meta-skel" />
        </div>
        <div className="wb-track-skel" />
      </div>
    );
  }
  if (!data) return null;

  // 현재 온도(첫 아이템 기준)
  const nowTemp = Math.round((data.items && data.items[0] && data.items[0].temp) || 0);

  // 그래프 영역 높이와 패딩(점 위치 계산과 CSS를 일치시킵니다)
  const GRAPH_H = 120;
  const GRAPH_TOP_PAD = 8;
  const GRAPH_BOTTOM_PAD = 8;
  const GRAPH_EFFECTIVE_H = GRAPH_H - GRAPH_TOP_PAD - GRAPH_BOTTOM_PAD;

  return (
    <div className="wb-wrap">
      <div className="wb-left">
        <div className="wb-temp">{nowTemp}°</div>
        <div className="wb-meta">
          <div className="wb-date">{fmtDay(new Date())}</div>
          <div className="wb-loc">📍 {data.location}</div>
        </div>
      </div>

      <div className="wb-track" ref={trackRef}>
        <div className="wb-inner" style={{ width: `${COL_W * 24}px` }}>
          {data.items.map((it, i) => {
            const y = scaleY(it.temp);
            const top = GRAPH_TOP_PAD + (1 - y) * GRAPH_EFFECTIVE_H; // 그래프 영역 내부 Y
            const showLabel = it.time.getHours() % 3 === 0; // 3시간 간격 라벨만 강조
            return (
              <div key={i} className={`wb-col ${showLabel ? "label" : ""}`} style={{ width: COL_W }}>
                {/* 그래프 전용 칸 */}
                <div className="wb-graph" style={{ height: GRAPH_H }}>
                  <div
                    className="wb-dot"
                    style={{
                      top,
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: TEMP_COLORS(it.temp),
                      boxShadow: "0 0 0 2px #fff, 0 1px 4px rgba(0,0,0,.25)",
                    }}
                    title={`${fmtHour(it.time)} • ${it.temp}°`}
                  />
                </div>

                {/* 라벨 전용 칸 */}
                <div className="wb-labels">
                  <div className="wb-val">{it.temp}°</div>
                  <div className="wb-time">{fmtHour(it.time)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
