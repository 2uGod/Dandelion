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

export default function CommunityDetail(){
  const { id } = useParams();
  const nav = useNavigate();
  const post = useMemo(()=> DUMMY_POSTS.find(p=> String(p.id)===String(id)), [id]);

  // 댓글 상태(초기값: 상단 더미)
  const [comments, setComments] = useState(initialComments[id] || []);
  const [writer, setWriter] = useState("");
  const [text, setText] = useState("");

  if (!post) {
    return (
      <div className="community-wrap">
        <Header/>
        <main className="comm-container">
          <div style={{padding:20}}>게시물을 찾을 수 없습니다. <button className="btn-outline" onClick={()=>nav(-1)}>돌아가기</button></div>
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
      <main className="comm-container detail">
        <section className="detail-left">
          <div className="detail-head">
            <Link to="/Community" className="back-link">← 목록으로</Link>
            <span className="post-type">{post.type}</span>
            <h2 className="detail-title">{post.title}</h2>
            <div className="post-meta">
              <span>{post.crop}</span> · <span>{post.author}</span> · <span>{time(post.createdAt)}</span>
            </div>
          </div>

          <article className="detail-content">
            {post.content.split("\n").map((line, i)=> <p key={i}>{line}</p>)}
          </article>

          <div className="detail-actions">
            <button className="btn-outline" onClick={()=>nav(-1)}>뒤로</button>
            <div className="spacer" />
            <button className="btn-solid">👍 좋아요 {post.likes}</button>
            <button className="btn-outline">💬 댓글 {comments.length}</button>
          </div>

          {/* 댓글 작성 */}
          <section className="comment-write">
            <h3>댓글 달기</h3>
            <form onSubmit={onSubmit}>
              <div className="cw-row">
                <input
                  className="cw-input"
                  placeholder="닉네임(선택)"
                  value={writer}
                  onChange={(e)=>setWriter(e.target.value)}
                />
              </div>
              <textarea
                className="cw-textarea"
                rows={4}
                placeholder="내용을 입력하세요"
                value={text}
                onChange={(e)=>setText(e.target.value)}
              />
              <div className="cw-actions">
                <button type="button" className="btn-outline" onClick={()=>{setWriter(""); setText("");}}>취소</button>
                <button type="submit" className="btn-solid" disabled={!text.trim()}>등록</button>
              </div>
            </form>
          </section>

          {/* 댓글 목록 */}
          <section className="comment-list">
            <h3>댓글 {comments.length}</h3>
            {comments.length===0 && <div className="empty">첫 댓글을 남겨보세요.</div>}
            <ul>
              {comments.map(c=>(
                <li key={c.id} className="comment-item">
                  <div className="avatar" aria-hidden>💬</div>
                  <div className="c-body">
                    <div className="c-head">
                      <strong>{c.author}</strong>
                      <span className="c-time">{time(c.createdAt)}</span>
                    </div>
                    <p className="c-text">{c.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </section>

        <aside className="comm-right">
          <div className="box">
            <h4>연관 글</h4>
            <div className="chips">
              {DUMMY_POSTS.filter(p=>p.id!==post.id && p.crop===post.crop).slice(0,3).map(r=>(
                <Link key={r.id} to={`/Community/${r.id}`} className="chip">#{r.title}</Link>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

