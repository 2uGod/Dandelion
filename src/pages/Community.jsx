// src/pages/Community.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Header from "../components/Header";
import "../styles/Community.css";
import { Link } from "react-router-dom";
import { fetchPosts, createPost } from "../services/postApi";

const GREEN = "#047857";

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
            // 서버가 이미지 URL을 준다고 가정 (상대경로면 baseURL과 합쳐 표시)
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
        {p.tags?.map(t => <span key={t} className="tag">#{t}</span>)}
      </div>
    </div>
  </Link>
);

/** 작성 폼 (모달 내부) */
const ComposeForm = ({ onSubmit, onClose, loading }) => {
  const [postType, setPostType] = useState("질문"); // 질문 | 노하우
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const fileInputRef = useRef(null);

  const onPickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    const next = [...files, ...picked].slice(0, 6); // 최대 6장 누적
    setFiles(next);
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

  const addTag = () => {
    const val = tagInput.trim();
    if (!val) return;
    if (tags.includes(val)) return;
    setTags(prev => [...prev, val]);
    setTagInput("");
  };

  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t));

  const disabled = !title.trim() || !content.trim() || loading;

  return (
    <div className="quick-ask">
      <h3 className="modal-title">새 글 작성</h3>

      {/* 타입 선택 */}
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

      {/* 태그 입력 */}
      <div className="qa-tags">
        <input
          className="qa-input"
          placeholder="태그 입력 후 Enter (예: 배추, 병해충)"
          value={tagInput}
          onChange={(e)=>setTagInput(e.target.value)}
          onKeyDown={(e)=> e.key === "Enter" ? (e.preventDefault(), addTag()) : null}
        />
        <button type="button" className="btn-outline mini" onClick={addTag}>추가</button>
      </div>
      {!!tags.length && (
        <div className="tag-wrap">
          {tags.map(t=>(
            <span key={t} className="tag">
              #{t}
              <button className="tag-x" onClick={()=>removeTag(t)} aria-label="태그 삭제">×</button>
            </span>
          ))}
        </div>
      )}

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
        <button className="btn-outline" type="button" onClick={onClose} disabled={loading}>취소</button>
        <button
          className="btn-solid"
          type="button"
          disabled={disabled}
          onClick={()=> onSubmit({ type: postType, title, content, tags, files })}
        >
          {loading ? "등록 중..." : "등록"}
        </button>
      </div>
    </div>
  );
};

/** 모달 래퍼 (Portal) */
const ComposeModal = ({ open, onClose, onSubmit, loading }) => {
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
        <ComposeForm onSubmit={onSubmit} onClose={onClose} loading={loading}/>
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
  const [posting, setPosting] = useState(false); // 등록 중 상태

  // 서버에서 받은 게시글 목록
  const [posts, setPosts] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [page, setPage] = useState(1);   // 필요하면 무한스크롤에 사용
  const [total, setTotal] = useState(0);

  // 검색 입력 디바운스
  const searchTimer = useRef(null);
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedQ(q), 300);
    return () => searchTimer.current && clearTimeout(searchTimer.current);
  }, [q]);

  // 목록 로드: 탭/검색어 변경 시 서버에서 새로 가져오기
  useEffect(() => {
    const load = async () => {
      setLoadingList(true);
      try {
        const { list, total } = await fetchPosts({
          type: tab,
          q: debouncedQ,
          page: 1,
          limit: 30,
        });
        // 서버에서 정렬이 없으면 클라에서 보조 정렬
        let arr = list.slice();
        if (sort === "최신순") arr.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
        if (sort === "인기순") arr.sort((a,b)=> (b.likes ?? 0) - (a.likes ?? 0));
        if (sort === "댓글많은순") arr.sort((a,b)=> (b.replies ?? 0) - (a.replies ?? 0));
        setPosts(arr);
        setPage(1);
        setTotal(total);
      } catch (e) {
        console.error("목록 로드 실패:", e);
        setPosts([]); // 실패 시 빈 배열
      } finally {
        setLoadingList(false);
      }
    };
    load();
  }, [tab, debouncedQ, sort]);

  // 글 등록
  const handleComposeSubmit = async ({ type, title, content, tags, files }) => {
    try {
      setPosting(true);
      const created = await createPost({ type, title, content, tags, files });
      // 낙관적 반영 (서버 응답 모델을 UI로 변환해둔 상태)
      setPosts(prev => [created, ...prev]);
      setTab(type); // 작성한 탭으로 이동
      setComposeOpen(false);
    } catch (err) {
      console.error(err);
      alert("게시글 등록에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setPosting(false);
    }
  };

  const filtered = useMemo(()=>{
    // 서버 필터를 이미 적용했기 때문에 여기서는 추가 필터 불필요
    return posts;
  }, [posts]);

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
            {loadingList && <div className="empty">불러오는 중…</div>}
            {!loadingList && filtered.map(p=> <PostCard key={p.id} p={p} />)}
            {!loadingList && !filtered.length && (
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
        loading={posting}
      />
    </div>
  );
};

export default Community;
