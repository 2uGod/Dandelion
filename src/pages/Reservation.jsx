import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import "../styles/Reservation.css";

/** ---------------------------
 * 더미 데이터 (초기 시드)
 * --------------------------- */
const seedExperiences = [
  {
    id: 101,
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

const seedBookings = [
  // 취미반 사용자가 이미 예약해둔 예시
  {
    id: 5001,
    expId: 101,
    title: "딸기 수확 체험",
    date: "2025-08-20",
    headcount: 2,
    status: "확정",
  },
];

function money(n) {
  return n.toLocaleString("ko-KR");
}

/** ---------------------------
 * 모달 공통 래퍼
 * --------------------------- */
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="rs-modal-backdrop" onMouseDown={(e)=> e.target.classList.contains("rs-modal-backdrop") && onClose()}>
      <div className="rs-modal-panel">
        <button className="rs-modal-close" onClick={onClose} aria-label="닫기">✕</button>
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
    <div className="rs-card-cover" aria-hidden>{exp.cover}</div>
    <div className="rs-card-main">
      <h3 className="rs-card-title">{exp.title}</h3>
      <div className="rs-card-meta">
        <span>{exp.host}</span> • <span>{exp.location}</span> • <b>{money(exp.price)}원</b> • 최대 {exp.capacity}명
      </div>
      <p className="rs-card-desc">{exp.desc}</p>
      <div className="rs-tagwrap">
        {exp.tags.map(t => <span key={t} className="rs-tag">#{t}</span>)}
      </div>
    </div>
    {onBookClick && (
      <div className="rs-card-actions">
        <button className="btn-solid" onClick={()=>onBookClick(exp)}>예약하기</button>
      </div>
    )}
  </article>
);

/** ---------------------------
 * 예약 모달 (취미반)
 * --------------------------- */
const BookModal = ({ open, onClose, exp, onSubmit }) => {
  const [date, setDate] = useState("");
  const [headcount, setHeadcount] = useState(1);
  useEffect(()=>{ if (open) { setDate(""); setHeadcount(1); }}, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      {!exp ? null : (
        <div className="rs-form">
          <h3 className="rs-modal-title">예약하기 – {exp.title}</h3>
          <label className="rs-label">
            날짜
            <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
          </label>
          <label className="rs-label">
            인원
            <input type="number" min={1} max={exp.capacity} value={headcount}
              onChange={(e)=>setHeadcount(Number(e.target.value))}/>
          </label>
          <div className="rs-form-actions">
            <button className="btn-outline" onClick={onClose}>취소</button>
            <button
              className="btn-solid"
              disabled={!date || headcount<1}
              onClick={()=>{
                onSubmit({ exp, date, headcount });
                onClose();
              }}
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
 * 체험 등록 모달 (전문가)
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

  useEffect(()=>{ if (open){
    setTitle(""); setHost(""); setLocation(""); setPrice(10000);
    setCapacity(10); setTags(""); setDesc(""); setCover("🌱");
  }}, [open]);

  const disabled = !title.trim() || !host.trim() || !location.trim() || !desc.trim();

  return (
    <Modal open={open} onClose={onClose}>
      <div className="rs-form">
        <h3 className="rs-modal-title">내 체험 등록</h3>
        <label className="rs-label">표시 아이콘/이모지
          <input value={cover} onChange={(e)=>setCover(e.target.value)} placeholder="예: 🍓 / 🌾 / 🍅" />
        </label>
        <label className="rs-label">체험명
          <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="예: 딸기 수확 체험" />
        </label>
        <label className="rs-label">호스트/농장명
          <input value={host} onChange={(e)=>setHost(e.target.value)} placeholder="예: 베리팜" />
        </label>
        <label className="rs-label">지역
          <input value={location} onChange={(e)=>setLocation(e.target.value)} placeholder="예: 경기 양평" />
        </label>
        <div className="rs-grid2">
          <label className="rs-label">가격(원)
            <input type="number" min={0} value={price} onChange={(e)=>setPrice(Number(e.target.value))}/>
          </label>
          <label className="rs-label">정원(명)
            <input type="number" min={1} value={capacity} onChange={(e)=>setCapacity(Number(e.target.value))}/>
          </label>
        </div>
        <label className="rs-label">태그(쉼표 구분)
          <input value={tags} onChange={(e)=>setTags(e.target.value)} placeholder="예: 딸기,가족" />
        </label>
        <label className="rs-label">설명
          <textarea rows={4} value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="체험에 대해 자세히 알려주세요." />
        </label>

        <div className="rs-form-actions">
          <button className="btn-outline" onClick={onClose}>취소</button>
          <button
            className="btn-solid" disabled={disabled}
            onClick={()=>{
              onCreate({
                id: Date.now(),
                title, host, location, price, capacity,
                tags: tags.split(",").map(s=>s.trim()).filter(Boolean),
                desc, cover,
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
 * 메인 페이지
 * --------------------------- */
const Reservation = () => {
  const [role, setRole] = useState("hobby"); // hobby | pro
  const [experiences, setExperiences] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [q, setQ] = useState("");
  const [bookOpen, setBookOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [targetExp, setTargetExp] = useState(null);

  // 초기 더미 세팅 (한 번만)
  useEffect(()=>{
    setExperiences(seedExperiences);
    setBookings(seedBookings);
  },[]);

  const filtered = useMemo(()=>{
    const key = q.trim().toLowerCase();
    if (!key) return experiences;
    return experiences.filter(e =>
      e.title.toLowerCase().includes(key) ||
      e.desc.toLowerCase().includes(key) ||
      e.tags.some(t => t.toLowerCase().includes(key)) ||
      e.location.toLowerCase().includes(key) ||
      e.host.toLowerCase().includes(key)
    );
  }, [q, experiences]);

  /** 취미반 예약 확정 */
  const handleBookSubmit = ({ exp, date, headcount }) => {
    const rec = {
      id: Date.now(),
      expId: exp.id,
      title: exp.title,
      date,
      headcount,
      status: "확정",
    };
    setBookings(prev => [rec, ...prev]);

    // 마이페이지 캘린더 연동용 (임시: localStorage)
    const key = "farmunity_my_calendar";
    const prev = JSON.parse(localStorage.getItem(key) || "[]");
    prev.unshift({
      id: rec.id,
      type: "체험예약",
      title: `[예약] ${rec.title}`,
      date: rec.date,
      meta: { headcount: rec.headcount, location: experiences.find(x=>x.id===exp.id)?.location },
    });
    localStorage.setItem(key, JSON.stringify(prev));

    alert("예약이 완료되었습니다. 마이페이지 캘린더에서 확인할 수 있어요!");
  };

  /** 전문가 체험 등록 */
  const handleCreateExp = (exp) => {
    setExperiences(prev => [exp, ...prev]);
    alert("체험이 등록되었습니다.");
  };

  return (
    <div className="rs-wrap">
      <Header />
      <main className="rs-container">
        {/* 상단 바 */}
        <div className="rs-toolbar">
          <div className="rs-role-toggle" role="tablist" aria-label="역할 선택">
            <button
              className={`rs-role ${role==="hobby"?"active":""}`}
              onClick={()=>setRole("hobby")}
            >취미반</button>
            <button
              className={`rs-role ${role==="pro"?"active":""}`}
              onClick={()=>setRole("pro")}
            >전문가</button>
          </div>

          <div className="rs-search">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="체험 검색 (제목/설명/태그/지역/호스트)" />
            <span className="rs-search-ico">🔍</span>
          </div>

          {role==="pro" ? (
            <button className="btn-solid" onClick={()=>setCreateOpen(true)}>+ 내 체험 등록</button>
          ) : null}
        </div>

        {/* 본문: 취미/전문가 뷰 */}
        {role==="hobby" ? (
          <>
            <p className="rs-hint">원하는 농장 체험을 선택해 날짜/인원을 지정해 예약하세요. 예약 내역은 마이페이지 캘린더에 표시됩니다.</p>
            <div className="rs-grid">
              {filtered.map(exp => (
                <ExperienceCard
                  key={exp.id}
                  exp={exp}
                  onBookClick={(e)=>{ setTargetExp(e); setBookOpen(true); }}
                />
              ))}
              {!filtered.length && <div className="rs-empty">해당 조건의 체험이 없습니다.</div>}
            </div>

            <section className="rs-box">
              <h4>내 예약 내역 (더미 포함)</h4>
              <ul className="rs-book-list">
                {bookings.map(b=>(
                  <li key={b.id} className="rs-book-row">
                    <span className="rs-book-title">{b.title}</span>
                    <span className="rs-book-date">{b.date}</span>
                    <span className="rs-book-meta">{b.headcount}명</span>
                    <span className="rs-badge">{b.status}</span>
                  </li>
                ))}
                {!bookings.length && <li className="rs-empty">예약 내역이 없습니다.</li>}
              </ul>
            </section>
          </>
        ) : (
          <>
            <p className="rs-hint">전문가 모드: 내 농장 체험을 등록하고 예약 신청을 관리하세요.</p>
            <div className="rs-grid">
              {experiences
                .filter(e => e.host.includes("") ) // 실제로는 로그인한 호스트의 체험만 필터링
                .map(exp => <ExperienceCard key={exp.id} exp={exp} />)}
              {!experiences.length && <div className="rs-empty">등록한 체험이 없습니다. 우측 상단의 “내 체험 등록”을 눌러보세요.</div>}
            </div>

            <section className="rs-box">
              <h4>들어온 예약 요청 (샘플)</h4>
              <ul className="rs-book-list">
                {[
                  { id:9001, title:"딸기 수확 체험", date:"2025-08-22", headcount:3, status:"대기" },
                  { id:9002, title:"토마토 수확 + 포장", date:"2025-08-25", headcount:2, status:"확정" },
                ].map(b=>(
                  <li key={b.id} className="rs-book-row">
                    <span className="rs-book-title">{b.title}</span>
                    <span className="rs-book-date">{b.date}</span>
                    <span className="rs-book-meta">{b.headcount}명</span>
                    <span className={`rs-badge ${b.status==="확정"?"ok":"pending"}`}>{b.status}</span>
                    <div className="rs-row-actions">
                      <button className="btn-outline">승인</button>
                      <button className="btn-outline">거절</button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>

      {/* 모달들 */}
      <BookModal
        open={bookOpen}
        onClose={()=>setBookOpen(false)}
        exp={targetExp}
        onSubmit={handleBookSubmit}
      />
      <CreateExpModal
        open={createOpen}
        onClose={()=>setCreateOpen(false)}
        onCreate={handleCreateExp}
      />
    </div>
  );
};

export default Reservation;
