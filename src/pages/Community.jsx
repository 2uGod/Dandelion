import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import "../styles/Community.css";
import { Link } from "react-router-dom";
import { communityApi } from "../api/communityApi";

const GREEN = "#047857";

// 더미 데이터 제거 - API를 사용하므로 불필요

// 임시 하드코딩 - 추후 API로 교체 가능
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

const PostCard = ({ p, onLike }) => {
  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      "question": "질문",
      "diary": "일지", 
      "knowhow": "노하우",
      "general": "일반",
      "reservation": "예약"
    };
    return categoryMap[category] || category;
  };
  
  const getCategoryIcon = (category) => {
    const iconMap = {
      "question": "❓",
      "diary": "📝",
      "knowhow": "💡",
      "general": "💬",
      "reservation": "📅"
    };
    return iconMap[category] || "💬";
  };
  
  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) {
      await onLike(p.id);
    }
  };
  
  return (
    <div className="post-card">
      <Link to={`/Community/${p.id}`} className="post-link">
        <div className="post-icon" aria-hidden>{getCategoryIcon(p.category)}</div>
        <div className="post-main">
          <header className="post-head">
            <span className="post-type">{getCategoryDisplayName(p.category)}</span>
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
            <span className="meta">• {p.author?.nickname || p.author?.name || '익명'}</span>
            <span className="meta">• {timeAgo(p.createdAt)}</span>
            <span className="spacer" />
            <button 
              className="like-btn"
              onClick={handleLike}
              type="button"
            >
              👍 {p.likesCount || 0}
            </button>
            <span className="meta">💬 {p.commentsCount || 0}</span>
          </footer>
          <div className="tag-wrap">
            {(p.tags || []).map(t => <span key={t} className="tag">#{t}</span>)}
          </div>
        </div>
      </Link>
    </div>
  );
};

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

/** 모달 래퍼 */
const ComposeModal = ({ open, onClose, onSubmit }) => {
  const panelRef = useRef(null);

  // ESC로 닫기
  useEffect(()=>{
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 바깥 클릭으로 닫기
  const onBackdropMouseDown = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
  };

  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onBackdropMouseDown}>
      <div className="modal-panel" ref={panelRef} role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="닫기" type="button">✕</button>
        <ComposeForm onSubmit={onSubmit} onClose={onClose}/>
      </div>
    </div>
  );
};

const Community = () => {
  const [tab, setTab] = useState("전체");
  const [q, setQ]   = useState("");
  const [sort, setSort] = useState("최신순");
  const [composeOpen, setComposeOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // API에서 게시글 목록 가져오기
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 20
      };
      
      // 카테고리 매핑
      if (tab !== "전체") {
        const categoryMap = {
          "질문": "question",
          "일지": "diary", 
          "노하우": "knowhow"
        };
        params.category = categoryMap[tab];
      }
      
      // 검색어
      if (q.trim()) {
        params.search = q.trim();
      }
      
      // 정렬
      const sortMap = {
        "최신순": "latest",
        "인기순": "popular",
        "댓글많은순": "views"
      };
      params.sortBy = sortMap[sort];
      
      const response = await communityApi.getPosts(params);
      if (response.success) {
        setPosts(response.data.posts || response.data || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err) {
      setError('게시글을 불러오는데 실패했습니다.');
      console.error('게시글 목록 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 게시글 목록 새로고침
  useEffect(() => {
    fetchPosts();
  }, [tab, q, sort, currentPage]);
  
  // 검색어 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [q, tab, sort]);

  const handleComposeSubmit = async ({ type, title, content, images }) => {
    try {
      const categoryMap = {
        "질문": "question",
        "노하우": "knowhow"
      };
      
      const postData = {
        title,
        content, 
        category: categoryMap[type],
        tags: [type],
        images: images || []
      };
      
      const response = await communityApi.createPost(postData);
      if (response.success) {
        setTab(type); // 작성한 탭으로 이동
        setCurrentPage(1);
        fetchPosts(); // 목록 새로고침
      }
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert('게시글 작성에 실패했습니다.');
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await communityApi.likePost(postId);
      if (response.success) {
        // 게시글 목록에서 해당 게시글의 좋아요 수 업데이트
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, likesCount: (post.likesCount || 0) + 1 }
              : post
          )
        );
      }
    } catch (error) {
      console.error('좋아요 실패:', error);
    }
  };

  return (
    <div className="community-wrap">
      <Header/>

      <main className="comm-container">
        <section className="comm-left">
          {/* 상단 컨트롤 */}
          <div className="toolbar">
            <div className="tabs">
              {["전체","질문","일지","노하우"].map(t=>(
                <button
                  key={t}
                  className={`tab ${tab===t ? "active":""}`}
                  onClick={()=>setTab(t)}
                  type="button"
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
                />
                <span className="search-ico">🔍</span>
              </div>
              <select className="select" value={sort} onChange={(e)=>setSort(e.target.value)}>
                <option>최신순</option>
                <option>인기순</option>
                <option>댓글많은순</option>
              </select>
              <button className="write-btn" type="button" onClick={()=>setComposeOpen(true)}>
                ✍️ 글쓰기
              </button>
            </div>
          </div>

          {/* 리스트 */}
          <div className="post-list">
            {loading && <div className="loading">로딩 중...</div>}
            {error && <div className="error">{error}</div>}
            {!loading && !error && posts.map(p=> <PostCard key={p.id} p={p} onLike={handleLike} />)}
            {!loading && !error && !posts.length && (
              <div className="empty">조건에 맞는 글이 없어요.</div>
            )}
          </div>
          
          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                이전
              </button>
              <span>{currentPage} / {totalPages}</span>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                다음
              </button>
            </div>
          )}
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

      {/* 작성 모달 */}
      <ComposeModal
        open={composeOpen}
        onClose={()=>setComposeOpen(false)}
        onSubmit={handleComposeSubmit}
      />
    </div>
  );
};

export default Community;
