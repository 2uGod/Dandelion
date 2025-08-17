import React, { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Header from "../components/Header";
import "../styles/Community.css";
import { Link } from "react-router-dom";

const GREEN = "#047857";

export const DUMMY_POSTS = [
  {
    id: 1,
    type: "질문",
    title: "토마토에는 어떤 비료가 어울리나요?",
    content: "방울토마토 키우려는데 기비/추비 추천 부탁드려요!",
    author: "이웃농부",
    crop: "토마토",
    createdAt: "2025-08-06T09:10:00Z",
    likes: 12,
    replies: 5,
    icon: "🍅",
    tags: ["비료", "초보", "토마토"],
    images: []
  },
  {
    id: 2,
    type: "일지",
    title: "고추 생육 점검 (7/25)",
    content: "잎색 진해짐, 웃자람 방지 위해 전정 진행.",
    author: "열정농부",
    crop: "고추",
    createdAt: "2025-07-25T12:00:00Z",
    likes: 7,
    replies: 2,
    icon: "🌶️",
    tags: ["생육일지", "전정", "고추"],
    images: []
  },
  {
    id: 3,
    type: "노하우",
    title: "딸기 러너 정리 팁",
    content: "러너는 이 시기에 정리해야 뿌리 활착 좋아요.",
    author: "베리굿",
    crop: "딸기",
    createdAt: "2025-08-08T03:40:00Z",
    likes: 29,
    replies: 9,
    icon: "🍓",
    tags: ["러너", "정식", "딸기"],
    images: []
  },
  {
    id: 4,
    type: "질문",
    title: "배추 모종에 작은 벌레… 방제 뭘로 갈까요?",
    content: "잎에 구멍, 똥 흔적 보임. 약제 추천 좀…",
    author: "새싹",
    crop: "배추",
    createdAt: "2025-08-09T22:10:00Z",
    likes: 3,
    replies: 4,
    icon: "🥬",
    tags: ["해충", "약제", "배추"],
    images: []
  },
];

const HOT_KEYWORDS = [
  "기비/추비","관수 주기","러너","병해 사진판독","하우스 환기","탄저병","방제 캘린더",
  "배수","적심","유인"
];

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}초 전`;
  if (diff < 3600) return `${Math.floor(diff/60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff/3600)}시간 전`;
  return `${Math.floor(diff/86400)}일 전`;
}

const PostCard = ({ p }) => (
  <Link to={`/Community/${p.id}`} className="post-link">
    <div className="post-icon" aria-hidden>{p.icon}</div>
    <div className="post-main">
      <header className="post-head">
        <span className="post-type">{p.type}</span>
        <h3 className="post-title">{p.title}</h3>
      </header>

      <p className="post-content">{p.content}</p>

      {!!(p.images && p.images.length) && (
        <div className="thumb-grid">
          {p.images.slice(0,4).map((src, i) => (
            <img key={i} src={src} alt="" className="thumb" />
          ))}
          {p.images.length > 4 && (
            <div className="thumb more">+{p.images.length - 4}</div>
          )}
        </div>
      )}

      <footer className="post-foot">
        {p.crop && <span className="meta">{p.crop}</span>}
        <span className="meta">• {p.author}</span>
        <span className="meta">• {timeAgo(p.createdAt)}</span>
        <span className="spacer" />
        <span className="meta">👍 {p.likes}</span>
        <span className="meta">💬 {p.replies}</span>
      </footer>

      <div className="tag-wrap">
        {p.tags.map(t => <span key={t} className="tag">#{t}</span>)}
      </div>
    </div>
  </Link>
);

/** 질문/노하우 작성 폼 (모달 내부) */
const ComposeForm = ({ onSubmit, onClose }) => {
  const [postType, setPostType] = useState("질문"); // 질문 | 노하우
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const onPickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    const next = [...files, ...picked].slice(0, 6); // 최대 6장 누적
    setFiles(next);
    // 새로 추가된 파일만 미리보기 생성
    const newly = next.slice(images.length);
    const readers = newly.map(f => new Promise(res => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.readAsDataURL(f);
    }));
    Promise.all(readers).then((arr)=> setImages(prev=> [...prev, ...arr]));
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const disabled = !title.trim() || !content.trim();

  return (
    <div className="quick-ask">
      <h3 className="modal-title">새 글 작성</h3>

      {/* 타입 선택 (일지는 제외) */}
      <div className="type-toggle" role="tablist" aria-label="글 유형 선택">
        {["질문","노하우"].map(t=>(
          <button
            key={t}
            type="button"
            role="tab"
            className={`type-pill ${postType===t ? "active":""}`}
            aria-selected={postType===t}
            onClick={()=>setPostType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="qa-row">
        <input
          className="qa-input"
          placeholder={postType==="질문" ? "제목을 입력하세요 (예: 토마토 추비 추천?)" : "제목을 입력하세요 (예: 딸기 러너 정리 팁)"}
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
        />
      </div>

      <textarea
        className="qa-textarea"
        placeholder={
          postType==="질문"
            ? "무엇이 궁금한가요? (병징·환경·시도한 것 등 세부 정보 환영)"
            : "노하우를 공유해주세요. (배경/방법/팁/주의사항 등)"
        }
        rows={5}
        value={content}
        onChange={(e)=>setContent(e.target.value)}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={onPickFiles}
      />
      <div className="qa-upload">
        <button type="button" className="btn-upload" onClick={()=>fileInputRef.current?.click()}>
          📷 사진 추가
        </button>
        <span className="hint">최대 6장 • JPG/PNG 권장</span>
      </div>

      {!!images.length && (
        <div className="qa-thumbs">
          {images.map((src, i)=>(
            <div key={i} className="qa-thumb">
              <img src={src} alt={`첨부 ${i+1}`} />
              <button className="del" onClick={()=>removeImage(i)} aria-label="삭제">✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="qa-actions">
        <button className="btn-outline" type="button" onClick={onClose}>취소</button>
        <button
          className="btn-solid"
          type="button"
          disabled={disabled}
          onClick={()=>{
            onSubmit({ type: postType, title, content, images });
            onClose();
          }}
        >
          등록
        </button>
      </div>
    </div>
  );
};

/** 모달 래퍼 (✅ Portal 로 body에 렌더링) */
const ComposeModal = ({ open, onClose, onSubmit }) => {
  const panelRef = useRef(null);

  // ESC로 닫기 + 바디 스크롤 잠금
  useEffect(()=>{
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose]);

  const onBackdropMouseDown = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
  };

  if (!open) return null;

  return createPortal(
    <div className="modal-backdrop" onMouseDown={onBackdropMouseDown}>
      <div className="modal-panel" ref={panelRef} role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="닫기" type="button">✕</button>
        <ComposeForm onSubmit={onSubmit} onClose={onClose}/>
      </div>
    </div>,
    document.body
  );
};

const Community = () => {
  const [tab, setTab] = useState("전체");
  const [q, setQ]   = useState("");
  const [sort, setSort] = useState("최신순");
  const [composeOpen, setComposeOpen] = useState(false);

  const filtered = useMemo(()=>{
    let arr = DUMMY_POSTS.slice();
    if (tab !== "전체") arr = arr.filter(p=>p.type === tab);
    if (q.trim()) {
      const key = q.trim().toLowerCase();
      arr = arr.filter(p =>
        p.title.toLowerCase().includes(key) ||
        p.content.toLowerCase().includes(key) ||
        p.tags.some(t=>t.toLowerCase().includes(key))
      );
    }
    if (sort === "최신순") arr.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "인기순") arr.sort((a,b)=> b.likes - a.likes);
    if (sort === "댓글많은순") arr.sort((a,b)=> b.replies - a.replies);
    return arr;
  }, [tab,q,sort]);

  const handleComposeSubmit = ({ type, title, content, images }) => {
    DUMMY_POSTS.unshift({
      id: Date.now(),
      type,                         // 질문 | 노하우
      title, content,
      author: "나",
      crop: "기타",
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: 0,
      icon: type === "질문" ? "❓" : "💡",
      tags: [type],
      images: images || []
    });
    setTab(type); // 작성한 탭으로 이동
  };

  return (
    <div className="community-wrap">
      <Header/>

      <main className="comm-container">
        <section className="comm-left">
          {/* 상단 컨트롤 */}
          <div className="toolbar">
            <div className="tabs" role="tablist" aria-label="게시판 탭">
              {["전체","질문","일지","노하우"].map(t=>(
                <button
                  key={t}
                  className={`tab ${tab===t ? "active":""}`}
                  onClick={()=>setTab(t)}
                  type="button"
                  role="tab"
                  aria-selected={tab===t}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="filters">
              <div className="search">
                <input
                  value={q}
                  onChange={(e)=>setQ(e.target.value)}
                  placeholder="검색 (제목/내용/태그)"
                  aria-label="게시글 검색"
                />
              </div>

              <select
                className="select"
                value={sort}
                onChange={(e)=>setSort(e.target.value)}
                aria-label="정렬 선택"
              >
                <option>최신순</option>
                <option>인기순</option>
                <option>댓글많은순</option>
              </select>

              <button className="write-btn" type="button" onClick={()=>setComposeOpen(true)}>
                글쓰기
              </button>
            </div>
          </div>

          {/* 리스트 */}
          <div className="post-list">
            {filtered.map(p=> <PostCard key={p.id} p={p} />)}
            {!filtered.length && (
              <div className="empty">조건에 맞는 글이 없어요.</div>
            )}
          </div>
        </section>

        {/* 오른쪽 패널 */}
        <aside className="comm-right">
          <div className="box">
            <h4>어제의 핫 키워드</h4>
            <ol className="hot-list">
              {HOT_KEYWORDS.map((k,i)=>(
                <li key={k} onClick={()=>setQ(k)}>
                  <span className="rank">{i+1}.</span>
                  <span className="kw">{k}</span>
                </li>
              ))}
            </ol>
            <div className="box-actions">
              <button className="mini" type="button">이전</button>
              <button className="mini" type="button">다음</button>
            </div>
          </div>

          <div className="box">
            <h4>인기 카테고리</h4>
            <div className="chips">
              {["비료","관수","전정","병해","해충","토양","하우스"].map(c=>(
                <button key={c} className="chip" onClick={()=>setQ(c)} type="button">#{c}</button>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* 작성 모달 (Portal) */}
      <ComposeModal
        open={composeOpen}
        onClose={()=>setComposeOpen(false)}
        onSubmit={handleComposeSubmit}
      />
    </div>
  );
};

export default Community;
