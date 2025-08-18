import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { communityApi } from "../api/communityApi";
import { useAuth } from "../context/AuthContext";
import EditModal from "../components/EditModal";
import "../styles/Community.css";

// initialComments 더미 데이터 제거 - API에서 가져옴

const time = (iso) => new Date(iso).toLocaleString();

export default function CommunityDetail(){
  const { id } = useParams();
  const nav = useNavigate();
  const { user, userProfile, isLoggedIn } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [writer, setWriter] = useState("");
  const [text, setText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  
  // 댓글 목록 가져오기
  const fetchComments = useCallback(async () => {
    try {
      const response = await communityApi.getComments(id);
      if (response.success) {
        // API 응답 구조: response.data.data.comments
        const comments = response.data?.data?.comments || response.data?.comments || [];
        setComments(comments);
      }
    } catch (error) {
      console.error('댓글 조회 실패:', error);
      setComments([]);
    }
  }, [id]);

  // 게시글 데이터 가져오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await communityApi.getPost(id);
        if (response.success) {
          const postData = response.data;
          setPost(postData);
          setLikesCount(postData.likeCount || 0);
          setIsLiked(postData.isLiked || false);
        }
      } catch (error) {
        console.error('게시글 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLikeStatus = async () => {
      if (!isLoggedIn) return;
      try {
        const response = await communityApi.getLikeStatus(id);
        if (response.success) {
          setIsLiked(response.data.isLiked || false);
        }
      } catch (error) {
        console.error('좋아요 상태 조회 실패:', error);
      }
    };
    
    if (id) {
      fetchPost();
      fetchComments();
      fetchLikeStatus();
    }
  }, [id, isLoggedIn, fetchComments]);

  if (loading) {
    return (
      <div className="community-wrap">
        <Header/>
        <main className="comm-container">
          <div style={{padding:20, textAlign:'center'}}>로딩 중...</div>
        </main>
      </div>
    );
  }
  
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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    try {
      const commentData = {
        content: text.trim(),
        isAnonymous: isAnonymous
      };
      
      // 백엔드 API 스펙에 따른 다른 형식도 시도
      console.log('다른 형식 테스트 1 - anonymous 필드명 사용:');
      const alternativeData1 = {
        content: text.trim(),
        anonymous: isAnonymous
      };
      console.log('alternativeData1:', alternativeData1);
      
      console.log('다른 형식 테스트 2 - 추가 필드 포함:');
      const alternativeData2 = {
        content: text.trim(),
        isAnonymous: isAnonymous,
        postId: parseInt(id)
      };
      console.log('alternativeData2:', alternativeData2);
      
      console.log('댓글 작성 요청 데이터:', {
        postId: id,
        commentData: commentData,
        user: user,
        userProfile: userProfile,
        isLoggedIn: isLoggedIn
      });
      
      const response = await communityApi.createComment(id, commentData);
      if (response.success) {
        // 댓글 목록 다시 불러오기
        await fetchComments();
        setText("");
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  // 좋아요 기능
  const handleLike = async () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    try {
      // POST API만 호출 (토글 방식)
      const response = await communityApi.likePost(id);
      if (response.success) {
        // API 응답의 isLiked로 상태 설정
        setIsLiked(response.data.isLiked);
        setLikesCount(response.data.likesCount || 0);
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    }
  };

  // 게시글 수정
  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  // 수정 완료 후 새로고침
  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    // 게시글 다시 불러오기
    window.location.reload();
  };

  // 댓글 수정 시작
  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.content);
  };

  // 댓글 수정 취소
  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText("");
  };

  // 댓글 수정 완료
  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      const response = await communityApi.updateComment(commentId, { content: editText.trim() });
      if (response.success) {
        await fetchComments();
        setEditingComment(null);
        setEditText("");
      }
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await communityApi.deleteComment(commentId);
      if (response.success) {
        await fetchComments();
      }
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  // 게시글 삭제
  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const response = await communityApi.deletePost(id);
      if (response.success) {
        alert('게시글이 삭제되었습니다.');
        nav('/Community');
      }
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
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
              <span>{post.user?.nickname || post.author?.nickname || post.authorNickname || post.author?.name || post.author?.username || post.nickname || '익명'}</span> · <span>{time(post.createdAt)}</span>
            </div>
          </div>

          <article className="detail-content">
            {post.content ? post.content.split("\n").map((line, i)=> <p key={i}>{line}</p>) : <p>내용이 없습니다.</p>}
          </article>

          <div className="detail-actions">
            <button className="btn-outline" onClick={()=>nav(-1)}>뒤로</button>
            <div className="spacer" />
            <button 
              className={`btn-solid ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={!isLoggedIn}
            >
              {isLiked ? '❤️' : '👍'} 좋아요 {likesCount}
            </button>
            <button className="btn-outline">💬 댓글 {Array.isArray(comments) ? comments.length : 0}</button>
            {isLoggedIn && user && post && (user.id === post.user?.id || user.sub === post.user?.id) && (
              <>
                <button className="btn-outline" onClick={handleEdit}>✏️ 수정</button>
                <button className="btn-danger" onClick={handleDelete}>🗑️ 삭제</button>
              </>
            )}
          </div>

          {/* 댓글 작성 */}
          <section className="comment-write">
            <h3>댓글 달기</h3>
            {isLoggedIn ? (
              <form onSubmit={onSubmit}>
                <div className="comment-options" style={{marginBottom: '15px', display: 'flex', gap: '10px'}}>
                  <button
                    type="button"
                    className={`btn-toggle ${!isAnonymous ? 'active' : ''}`}
                    onClick={() => setIsAnonymous(false)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: '2px solid #4CAF50',
                      backgroundColor: !isAnonymous ? '#4CAF50' : 'transparent',
                      color: !isAnonymous ? 'white' : '#4CAF50',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🙋‍♀️ {userProfile?.nickname || user?.nickname || '닉네임'}
                  </button>
                  <button
                    type="button"
                    className={`btn-toggle ${isAnonymous ? 'active' : ''}`}
                    onClick={() => setIsAnonymous(true)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: '2px solid #4CAF50',
                      backgroundColor: isAnonymous ? '#4CAF50' : 'transparent',
                      color: isAnonymous ? 'white' : '#4CAF50',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🕶️ 익명
                  </button>
                </div>
                <textarea
                  className="cw-textarea"
                  rows={4}
                  placeholder="댓글 내용을 입력하세요"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="cw-actions">
                  <button type="button" className="btn-outline" onClick={() => setText("")}>취소</button>
                  <button type="submit" className="btn-solid" disabled={!text.trim()}>등록</button>
                </div>
              </form>
            ) : (
              <div className="login-required" style={{padding: '20px', textAlign: 'center', color: '#666'}}>
                <p>로그인 후 댓글을 작성할 수 있습니다.</p>
              </div>
            )}
          </section>

          {/* 댓글 목록 */}
          <section className="comment-list">
            <h3>댓글 {Array.isArray(comments) ? comments.length : 0}</h3>
            {(!Array.isArray(comments) || comments.length === 0) && <div className="empty">첫 댓글을 남겨보세요.</div>}
            <ul>
              {Array.isArray(comments) && comments.map(c=>(
                <li key={c.id} className="comment-item">
                  <div className="avatar" aria-hidden>💬</div>
                  <div className="c-body">
                    <div className="c-head">
                      <strong>{c.user?.nickname || c.author || '익명'}</strong>
                      <span className="c-time">{time(c.createdAt)}</span>
                      {isLoggedIn && user && c.user && (user.id === c.user.id || user.sub === c.user.id) && (
                        <div className="comment-actions" style={{marginLeft: 'auto', display: 'flex', gap: '5px'}}>
                          <button 
                            onClick={() => handleEditComment(c)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              border: '1px solid #4CAF50',
                              backgroundColor: 'transparent',
                              color: '#4CAF50',
                              fontSize: '11px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = '#4CAF50';
                              e.target.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#4CAF50';
                            }}
                          >
                            ✏️ 수정
                          </button>
                          <button 
                            onClick={() => handleDeleteComment(c.id)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              border: '1px solid #ff6b6b',
                              backgroundColor: 'transparent',
                              color: '#ff6b6b',
                              fontSize: '11px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = '#ff6b6b';
                              e.target.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#ff6b6b';
                            }}
                          >
                            🗑️ 삭제
                          </button>
                        </div>
                      )}
                    </div>
                    {editingComment === c.id ? (
                      <div className="comment-edit">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          style={{
                            width: '100%', 
                            marginBottom: '10px',
                            borderRadius: '12px',
                            border: '2px solid #e0e0e0',
                            padding: '8px 12px',
                            fontSize: '14px',
                            resize: 'vertical',
                            transition: 'border-color 0.2s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#4CAF50';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e0e0e0';
                          }}
                        />
                        <div style={{display: 'flex', gap: '8px'}}>
                          <button 
                            onClick={() => handleUpdateComment(c.id)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '15px',
                              border: '2px solid #4CAF50',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = '#45a049';
                              e.target.style.borderColor = '#45a049';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = '#4CAF50';
                              e.target.style.borderColor = '#4CAF50';
                            }}
                          >
                            💾 저장
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '15px',
                              border: '2px solid #999',
                              backgroundColor: 'transparent',
                              color: '#999',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = '#999';
                              e.target.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#999';
                            }}
                          >
                            ❌ 취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="c-text">{c.content}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </section>

        <aside className="comm-right">
          <div className="box">
            <h4>작성자 정보</h4>
            <div className="author-info">
              <p>작성자: {post.user?.nickname || post.author?.nickname || post.authorNickname || post.author?.name || post.author?.username || post.nickname || '익명'}</p>
              <p>작성일: {new Date(post.createdAt).toLocaleDateString()}</p>
              <p>카테고리: {post.category}</p>
            </div>
          </div>
        </aside>
      </main>
      
      {/* 수정 모달 */}
      <EditModal
        isOpen={isEditModalOpen}
        post={post}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}

