import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { DUMMY_POSTS } from "./Community";
import "../styles/Community.css";

const initialComments = {
  1: [
    { id: "c1", author: "그린핸드", content: "완효성 복합비료 소량 + 액비 주 1회 추천!", createdAt: "2025-08-06T10:05:00Z" },
    { id: "c2", author: "베테랑", content: "질소 과다 주의. 꽃 피기 전엔 칼륨 줄여요.", createdAt: "2025-08-06T11:40:00Z" },
  ],
  2: [
    { id: "c3", author: "고추왕", content: "전정 후 스트레스 줄이려고 관수 살짝 늘립니다.", createdAt: "2025-07-25T14:22:00Z" },
  ],
  3: [],
  4: [
    { id: "c4", author: "방제러", content: "벼룩잎벌레 의심. 스피노사드 한번 보세요.", createdAt: "2025-08-09T23:00:00Z" },
  ],
};

const time = (iso) => new Date(iso).toLocaleString();

export default function CommunityDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const post = useMemo(()=> DUMMY_POSTS.find(p=> String(p.id)===String(id)), [id]);

  const [comments, setComments] = useState(initialComments[id] || []);
  const [writer, setWriter] = useState("");
  const [text, setText] = useState("");

  if (!post) {
    return (
      <div className="community-wrap">
        <Header/>
        <main className="comm-container">
          <div className="detail-empty-card">
            게시물을 찾을 수 없습니다.
            <button className="btn-outline" onClick={()=>nav(-1)} style={{marginLeft:8}}>돌아가기</button>
          </div>
        </main>
      </div>
    );
  }

  const onSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const nick = writer.trim() || "익명";
    const newC = { id: "c"+Date.now(), author: nick, content: text.trim(), createdAt: new Date().toISOString() };
    setComments(prev => [newC, ...prev]);
    setText("");
  };

  return (
    <div className="community-wrap">
      <Header/>
      <main className="comm-container detail-layout">

        {/* 좌측: 본문 */}
        <section className="detail-col">
          {/* 빵부스러기 */}
          <div className="detail-breadcrumb">
            <Link to="/Community" className="crumb-link">커뮤니티</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{post.type}</span>
          </div>

          {/* ✅ 카드 바깥쪽 상단 오른쪽에 배치된 '목록으로' */}
          <div className="detail-back right">
            <button className="back-btn" type="button" onClick={()=>nav(-1)}>← 목록으로</button>
          </div>

          <article className="detail-card">
            <header className="detail-header">
              <div className="detail-type-chip">{post.type}</div>
              <h1 className="detail-title">{post.title}</h1>

              <div className="detail-meta">
                <div className="author-badge" aria-hidden>
                  <span className="author-initial">{post.author?.[0] ?? "?"}</span>
                </div>
                <div className="meta-text">
                  <div className="meta-line">
                    <span className="meta-strong">{post.author}</span>
                    <span className="meta-dot">·</span>
                    <span>{time(post.createdAt)}</span>
                  </div>
                  <div className="meta-tags">
                    {post.crop && <span className="meta-chip">#{post.crop}</span>}
                    {post.tags?.map(t => <span key={t} className="meta-chip">#{t}</span>)}
                  </div>
                </div>
                <div className="meta-spacer" />
              </div>
            </header>

            {/* 본문 */}
            <div className="detail-content">
              {post.content.split("\n").map((line, i)=> <p key={i}>{line}</p>)}
            </div>

            {/* 액션바 */}
            <div className="detail-actions">
              <button className="action-btn" type="button">👍 좋아요 {post.likes}</button>
              <button className="action-btn ghost" type="button">💬 댓글 {comments.length}</button>
              <div className="action-spacer" />
              <button className="action-btn ghost" type="button">📎 공유</button>
              <button className="action-btn ghost" type="button">⛳ 북마크</button>
            </div>
          </article>

          {/* 댓글 */}
          <section className="comment-card">
            <h2 className="section-title">댓글 <span className="count">{comments.length}</span></h2>

            <form onSubmit={onSubmit} className="comment-form">
              <div className="form-row">
                <input
                  className="input"
                  placeholder="닉네임(선택)"
                  value={writer}
                  onChange={(e)=>setWriter(e.target.value)}
                />
              </div>
              <textarea
                className="textarea"
                rows={4}
                placeholder="칭찬, 피드백, 질문 등을 남겨주세요"
                value={text}
                onChange={(e)=>setText(e.target.value)}
              />
              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={()=>{setWriter(""); setText("");}}>취소</button>
                <button type="submit" className="btn-solid" disabled={!text.trim()}>등록</button>
              </div>
            </form>

            <ul className="comment-list">
              {comments.length===0 && <li className="comment-empty">첫 댓글을 남겨보세요.</li>}
              {comments.map(c=>(
                <li key={c.id} className="comment-item">
                  <div className="c-avatar" aria-hidden>{c.author?.[0] ?? "?"}</div>
                  <div className="c-main">
                    <div className="c-head">
                      <strong className="c-author">{c.author}</strong>
                      <span className="c-time">{time(c.createdAt)}</span>
                    </div>
                    <p className="c-text">{c.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </section>

        {/* 우측: 관련/서브 */}
        <aside className="detail-aside">
          <div className="aside-card">
            <h3 className="aside-title">연관 글</h3>
            <div className="aside-list">
              {DUMMY_POSTS
                .filter(p=>p.id!==post.id && (p.crop===post.crop || p.type===post.type))
                .slice(0,5)
                .map(r=>(
                  <Link key={r.id} to={`/Community/${r.id}`} className="aside-item">
                    <span className="aside-icon" aria-hidden>{r.icon}</span>
                    <span className="aside-text">{r.title}</span>
                  </Link>
              ))}
            </div>
          </div>

          <div className="aside-card">
            <h3 className="aside-title">카테고리</h3>
            <div className="aside-chips">
              {(post.tags || []).concat(post.crop ? [post.crop] : []).slice(0,8).map(t=>(
                <span key={t} className="meta-chip">#{t}</span>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
