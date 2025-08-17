import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import "../styles/Reservation.css";
import api from "../api/axios";

/** --------------------------------
 * 더미 체험 목록 (postId 포함)
 * 실제에선 게시글 목록 API로 대체하세요.
 * -------------------------------- */
const seedExperiences = [
  {
    id: 101,
    postId: 101, // 서버의 posts PK가 있다면 실제 값으로 매핑
    title: "딸기 수확 체험",
    host: "베리팜",
    location: "경기 양평",
    price: 20000,
    capacity: 12,
    tags: ["딸기", "가족"],
    desc: "하우스 딸기 수확과 시식, 잼만들기(선택).",
    cover: "🍓",
  },
  {
    id: 102,
    postId: 102,
    title: "벼 베기 & 탈곡",
    host: "곡물연구회",
    location: "전북 김제",
    price: 15000,
    capacity: 20,
    tags: ["벼", "전통"],
    desc: "전통 방식 벼 베기 체험과 탈곡 시연.",
    cover: "🌾",
  },
  {
    id: 103,
    postId: 103,
    title: "토마토 수확 + 포장",
    host: "프레쉬팜",
    location: "충남 논산",
    price: 18000,
    capacity: 10,
    tags: ["토마토", "하우스"],
    desc: "완숙토마토 수확하고 선물용 포장까지!",
    cover: "🍅",
  },
];

const money = (n) => n.toLocaleString("ko-KR");

// 서버 status → 뱃지 라벨 매핑
const STATUS_LABEL = {
  PENDING: "대기",
  CONFIRMED: "확정",
  REJECTED: "거절",
  CANCELED: "취소",
};

/** ---------------------------
 * 모달 공통 래퍼
 * --------------------------- */
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div
      className="rs-modal-backdrop"
      onMouseDown={(e) =>
        e.target.classList.contains("rs-modal-backdrop") && onClose()
      }
    >
      <div className="rs-modal-panel">
        <button className="rs-modal-close" onClick={onClose} aria-label="닫기">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

/** ---------------------------
 * 체험 카드
 * --------------------------- */
const ExperienceCard = ({ exp, onBookClick }) => (
  <article className="rs-card">
    <div className="rs-card-cover" aria-hidden>
      {exp.cover}
    </div>
    <div className="rs-card-main">
      <h3 className="rs-card-title">{exp.title}</h3>
      <div className="rs-card-meta">
        <span>{exp.host}</span> • <span>{exp.location}</span> •{" "}
        <b>{money(exp.price)}원</b> • 최대 {exp.capacity}명
      </div>
      <p className="rs-card-desc">{exp.desc}</p>
      <div className="rs-tagwrap">
        {exp.tags.map((t) => (
          <span key={t} className="rs-tag">
            #{t}
          </span>
        ))}
      </div>
    </div>
    {onBookClick && (
      <div className="rs-card-actions">
        <button className="btn-solid" onClick={() => onBookClick(exp)}>
          예약하기
        </button>
      </div>
    )}
  </article>
);

/** ---------------------------
 * 예약 모달 (취미)
 * --------------------------- */
const BookModal = ({ open, onClose, exp, onSubmit }) => {
  const [date, setDate] = useState("");
  const [headcount, setHeadcount] = useState(1);
  useEffect(() => {
    if (open) {
      setDate("");
      setHeadcount(1);
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      {!exp ? null : (
        <div className="rs-form">
          <h3 className="rs-modal-title">예약하기 – {exp.title}</h3>
          <label className="rs-label">
            날짜
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="rs-label">
            인원
            <input
              type="number"
              min={1}
              max={exp.capacity}
              value={headcount}
              onChange={(e) => setHeadcount(Number(e.target.value))}
            />
          </label>
          <div className="rs-form-actions">
            <button className="btn-outline" onClick={onClose}>
              취소
            </button>
            <button
              className="btn-solid"
              disabled={!date || headcount < 1}
              onClick={() => onSubmit({ exp, date, headcount })}
            >
              예약 확정
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

/** ---------------------------
 * 체험 등록 모달 (전문가 — 로컬 더미)
 * --------------------------- */
const CreateExpModal = ({ open, onClose, onCreate }) => {
  const [title, setTitle] = useState("");
  const [host, setHost] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState(10000);
  const [capacity, setCapacity] = useState(10);
  const [tags, setTags] = useState("");
  const [desc, setDesc] = useState("");
  const [cover, setCover] = useState("🌱");

  useEffect(() => {
    if (open) {
      setTitle("");
      setHost("");
      setLocation("");
      setPrice(10000);
      setCapacity(10);
      setTags("");
      setDesc("");
      setCover("🌱");
    }
  }, [open]);

  const disabled =
    !title.trim() || !host.trim() || !location.trim() || !desc.trim();

  return (
    <Modal open={open} onClose={onClose}>
      <div className="rs-form">
        <h3 className="rs-modal-title">내 체험 등록</h3>
        <label className="rs-label">
          표시 아이콘/이모지
          <input
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            placeholder="예: 🍓 / 🌾 / 🍅"
          />
        </label>
        <label className="rs-label">
          체험명
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 딸기 수확 체험"
          />
        </label>
        <label className="rs-label">
          호스트/농장명
          <input
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="예: 베리팜"
          />
        </label>
        <label className="rs-label">
          지역
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="예: 경기 양평"
          />
        </label>
        <div className="rs-grid2">
          <label className="rs-label">
            가격(원)
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </label>
          <label className="rs-label">
            정원(명)
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </label>
        </div>
        <label className="rs-label">
          태그(쉼표 구분)
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="예: 딸기,가족"
          />
        </label>
        <label className="rs-label">
          설명
          <textarea
            rows={4}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="체험에 대해 자세히 알려주세요."
          />
        </label>

        <div className="rs-form-actions">
          <button className="btn-outline" onClick={onClose}>
            취소
          </button>
          <button
            className="btn-solid"
            disabled={disabled}
            onClick={() => {
              onCreate({
                id: Date.now(),
                postId: Date.now(), // 데모용
                title,
                host,
                location,
                price,
                capacity,
                tags: tags
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                desc,
                cover,
              });
              onClose();
            }}
          >
            등록
          </button>
        </div>
      </div>
    </Modal>
  );
};

/** ---------------------------
 * 유저 타입 판별 (JWT payload 기준)
 * 서버가 'EXPERT' | 'HOBBY'로 내려준다고 가정
 * --------------------------- */
function resolveUserType(auth) {
  const t =
    auth?.user?.userType ||
    (typeof window !== "undefined" && localStorage.getItem("userType")) ||
    "HOBBY";
  return t === "EXPERT" ? "pro" : "hobby";
}

/** ---------------------------
 * 메인 페이지 (API 연동)
 * --------------------------- */
const Reservation = () => {
  const auth = useAuth?.() ?? null;
  const [role, setRole] = useState(() => resolveUserType(auth)); // "hobby" | "pro"
  const [experiences, setExperiences] = useState(seedExperiences);

  // 취미 전용
  const [myBookings, setMyBookings] = useState([]);
  const [bookOpen, setBookOpen] = useState(false);
  const [targetExp, setTargetExp] = useState(null);

  // 전문가 전용
  const [received, setReceived] = useState([]);

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  // userType 변경 반영
  useEffect(() => {
    setRole(resolveUserType(auth));
  }, [auth?.user?.userType]);

  // 검색 필터
  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return experiences;
    return experiences.filter(
      (e) =>
        e.title.toLowerCase().includes(key) ||
        e.desc.toLowerCase().includes(key) ||
        e.tags.some((t) => t.toLowerCase().includes(key)) ||
        e.location.toLowerCase().includes(key) ||
        e.host.toLowerCase().includes(key)
    );
  }, [q, experiences]);

  /** =========================
   *  API 함수 (Swagger 기준)
   *  ========================= */

  // [HOBBY] 내 예약 목록
  const fetchMyReservations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/reservations/my");
      // data 스키마 예시: [{ id, title, date, headcount, status }, ...]
      setMyBookings(Array.isArray(data) ? data : data?.items ?? []);
    } catch (e) {
      console.error(e);
      alert("내 예약 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // [HOBBY] 예약 생성
  const createReservation = async ({ postId, date, headcount }) => {
    await api.post(`/reservations/posts/${postId}`, { date, headcount });
  };

  // [HOBBY] 예약 취소
  const cancelReservation = async (reservationId) => {
    await api.patch(`/reservations/${reservationId}/cancel`);
  };

  // [EXPERT] 받은 예약 목록
  const fetchReceived = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/reservations/received");
      // data 스키마 예시: [{ id, title, date, headcount, status, requester }, ...]
      setReceived(Array.isArray(data) ? data : data?.items ?? []);
    } catch (e) {
      console.error(e);
      alert("받은 예약 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // [EXPERT] 상태 변경 (승인/거절)
  const updateStatus = async (reservationId, status) => {
    await api.patch(`/reservations/${reservationId}/status`, { status });
  };

  /** 초기 로딩: 역할에 따라 목록 호출 */
  useEffect(() => {
    if (role === "hobby") {
      fetchMyReservations();
    } else {
      fetchReceived();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  /** 취미: 예약 확정(모달 submit) */
  const handleBookSubmit = async ({ exp, date, headcount }) => {
    try {
      await createReservation({
        postId: exp.postId ?? exp.id,
        date,
        headcount,
      });
      alert("예약 신청이 완료됐습니다.");
      setBookOpen(false);
      setTargetExp(null);
      await fetchMyReservations();

      // (선택) 마이페이지 캘린더 연동
      const key = "farmunity_my_calendar";
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      prev.unshift({
        id: `res-${Date.now()}`,
        type: "체험예약",
        title: `[예약] ${exp.title}`,
        date,
        meta: { headcount, location: exp.location },
      });
      localStorage.setItem(key, JSON.stringify(prev));
    } catch (e) {
      console.error(e);
      alert("예약 신청에 실패했습니다. (postId/날짜/인원 확인)");
    }
  };

  /** 취미: 예약 취소 */
  const handleCancel = async (reservationId) => {
    if (!window.confirm("예약을 취소하시겠습니까?")) return;
    try {
      await cancelReservation(reservationId);
      alert("예약을 취소했습니다.");
      await fetchMyReservations();
    } catch (e) {
      console.error(e);
      alert("예약 취소에 실패했습니다.");
    }
  };

  /** 전문가: 승인/거절 */
  const handleApprove = async (reservationId) => {
    try {
      await updateStatus(reservationId, "CONFIRMED");
      await fetchReceived();
    } catch (e) {
      console.error(e);
      alert("승인 처리에 실패했습니다.");
    }
  };
  const handleReject = async (reservationId) => {
    try {
      await updateStatus(reservationId, "REJECTED");
      await fetchReceived();
    } catch (e) {
      console.error(e);
      alert("거절 처리에 실패했습니다.");
    }
  };

  return (
    <div className="rs-wrap">
      <Header />
      <main className="rs-container">
        {/* 상단 바 */}
        <div className="rs-toolbar">
          <div className="rs-role-badge" aria-label="유저 타입">
            {role === "pro" ? "전문가 전용" : "취미반 전용"}
          </div>

          <div className="rs-search">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="체험 검색 (제목/설명/태그/지역/호스트)"
            />
            <span className="rs-search-ico">🔍</span>
          </div>

          {role === "pro" ? (
            <button
              className="btn-solid"
              onClick={() => alert("게시글 등록 API와 연동 예정")}
            >
              + 내 체험 등록
            </button>
          ) : null}
        </div>

        {loading && <div className="rs-box">불러오는 중…</div>}

        {/* 본문 */}
        {role === "hobby" ? (
          <>
            <p className="rs-hint">
              원하는 농장 체험을 선택해 날짜/인원을 지정해 예약을 신청하세요.
            </p>
            <div className="rs-grid">
              {filtered.map((exp) => (
                <ExperienceCard
                  key={exp.id}
                  exp={exp}
                  onBookClick={(e) => {
                    setTargetExp(e);
                    setBookOpen(true);
                  }}
                />
              ))}
              {!filtered.length && (
                <div className="rs-empty">해당 조건의 체험이 없습니다.</div>
              )}
            </div>

            <section className="rs-box">
              <h4>내 예약 내역</h4>
              <ul className="rs-book-list">
                {myBookings.map((b) => (
                  <li key={b.id} className="rs-book-row">
                    <span className="rs-book-title">
                      {b.title ?? `예약#${b.id}`}
                    </span>
                    <span className="rs-book-date">{b.date}</span>
                    <span className="rs-book-meta">
                      {(b.headcount ?? b.people ?? 1) + "명"}
                    </span>
                    <span
                      className={`rs-badge ${
                        b.status === "CONFIRMED"
                          ? "ok"
                          : b.status === "PENDING"
                          ? "pending"
                          : ""
                      }`}
                    >
                      {STATUS_LABEL[b.status] ?? b.status}
                    </span>
                    <div className="rs-row-actions">
                      {b.status !== "CANCELED" && b.status !== "REJECTED" && (
                        <button
                          className="btn-outline"
                          onClick={() => handleCancel(b.id)}
                        >
                          취소
                        </button>
                      )}
                    </div>
                  </li>
                ))}
                {!myBookings.length && (
                  <li className="rs-empty">예약 내역이 없습니다.</li>
                )}
              </ul>
            </section>
          </>
        ) : (
          <>
            <p className="rs-hint">
              전문가 모드: 받은 예약 요청을 확인하고 승인/거절하세요.
            </p>

            <section className="rs-box">
              <h4>받은 예약 요청</h4>
              <ul className="rs-book-list">
                {received.map((b) => (
                  <li key={b.id} className="rs-book-row">
                    <span className="rs-book-title">
                      {b.title ?? `예약#${b.id}`}
                    </span>
                    <span className="rs-book-date">{b.date}</span>
                    <span className="rs-book-meta">
                      {(b.headcount ?? b.people ?? 1) + "명"}
                    </span>
                    <span
                      className={`rs-badge ${
                        b.status === "CONFIRMED"
                          ? "ok"
                          : b.status === "PENDING"
                          ? "pending"
                          : ""
                      }`}
                    >
                      {STATUS_LABEL[b.status] ?? b.status}
                    </span>
                    <div className="rs-row-actions">
                      {b.status === "PENDING" && (
                        <>
                          <button
                            className="btn-outline"
                            onClick={() => handleApprove(b.id)}
                          >
                            승인
                          </button>
                          <button
                            className="btn-outline"
                            onClick={() => handleReject(b.id)}
                          >
                            거절
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
                {!received.length && (
                  <li className="rs-empty">받은 예약 요청이 없습니다.</li>
                )}
              </ul>
            </section>
          </>
        )}
      </main>

      {/* 모달: 취미만 사용 */}
      <BookModal
        open={role === "hobby" && bookOpen}
        onClose={() => setBookOpen(false)}
        exp={targetExp}
        onSubmit={handleBookSubmit}
      />
    </div>
  );
};

export default Reservation;
