import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import PostCard from "../components/PostCard";
import ComposeModal from "../components/ComposeModal";
import "../styles/Community.css";
import { communityApi } from "../api/communityApi";
import {
  POST_CATEGORIES,
  COMMUNITY_CATEGORIES,
  SORT_OPTIONS,
  PAGINATION,
  HOT_KEYWORDS,
  POPULAR_CATEGORIES
} from "../constants";

const Community = () => {
  const [tab, setTab] = useState("전체");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("최신순");
  const [composeOpen, setComposeOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // API에서 게시글 목록 가져오기
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: PAGINATION.DEFAULT_LIMIT
      };

      // 카테고리 매핑
      if (tab !== "전체") {
        params.category = POST_CATEGORIES.KOREAN_TO_ENGLISH[tab];
      }

      // 검색어
      if (q.trim()) {
        params.search = q.trim();
      }

      // 정렬
      params.sortBy = SORT_OPTIONS.KOREAN_TO_ENGLISH[sort];

      const response = await communityApi.getPosts(params);

      if (response.success) {
        const postsData = response.data?.posts || response.data?.data?.posts || [];
        const filteredPosts = Array.isArray(postsData) ? postsData.filter(post => post.category !== 'reservation') : [];
        setPosts(filteredPosts);
        setTotalPages(response.data?.totalPages || response.data?.data?.totalPages || 1);
      } else {
        setPosts([]);
      }
    } catch (err) {
      setError('게시글을 불러오는데 실패했습니다.');
      setPosts([]);
      console.error('게시글 목록 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [tab, q, sort, currentPage]);

  // 게시글 목록 새로고침
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 검색어 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [q, tab, sort]);

  const handleComposeSubmit = async ({ type, title, content, images, tags }) => {
    try {
      const postData = {
        title,
        content,
        category: POST_CATEGORIES.KOREAN_TO_ENGLISH[type],
        tags: tags || [], // 사용자가 입력한 태그 사용
        images: images || []
      };

      const response = await communityApi.createPost(postData);
      if (response.success) {
        setComposeOpen(false);
        setTab(type); // 작성한 탭으로 이동
        setCurrentPage(1);
        // 약간의 지연 후 목록 새로고침
        setTimeout(() => {
          fetchPosts();
        }, 100);
      }
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert('게시글 작성에 실패했습니다.');
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
              {COMMUNITY_CATEGORIES.map(t=>(
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
            {!loading && !error && Array.isArray(posts) && posts.map(p=> <PostCard key={p.id} p={p} />)}
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
              {POPULAR_CATEGORIES.map(c=>(
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
