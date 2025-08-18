import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { POST_CATEGORIES, CATEGORY_ICONS } from '../constants';
import { communityApi } from '../api/communityApi';
import { useAuth } from '../context/AuthContext';

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}초 전`;
  if (diff < 3600) return `${Math.floor(diff/60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff/3600)}시간 전`;
  return `${Math.floor(diff/86400)}일 전`;
}

const PostCard = ({ p }) => {
  const { isLoggedIn } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(p.likesCount || 0);
  const [isProcessing, setIsProcessing] = useState(false);


  // 좋아요 상태 초기화 (백엔드 인증 가드 수정 완료)
  useEffect(() => {
    if (isLoggedIn && p.id) {
      const fetchLikeStatus = async () => {
        try {
          const response = await communityApi.getLikeStatus(p.id);
          if (response.success && response.data) {
            setIsLiked(Boolean(response.data.isLiked));
          }
        } catch (error) {
          console.error('좋아요 상태 조회 실패:', error);
          setIsLiked(false);
        }
      };
      fetchLikeStatus();
    } else {
      setIsLiked(false);
    }
  }, [p.id, isLoggedIn]);

  // 좋아요 수 초기화 (별도 관리)
  useEffect(() => {
    const initialLikesCount = p.likesCount || p.likeCount || 0;
    setLikesCount(initialLikesCount);
  }, [p.likesCount, p.likeCount]);


  const getCategoryDisplayName = (category) => {
    return POST_CATEGORIES.ENGLISH_TO_KOREAN[category] || category;
  };

  const getCategoryIcon = (category) => {
    return CATEGORY_ICONS[category] || "💬";
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    try {
      // POST API만 호출 (토글 방식)
      const response = await communityApi.likePost(p.id);

      if (response.success) {
        const data = response.data;
        const newIsLiked = data.isLiked ?? !isLiked;
        const newLikesCount = data.likeCount ?? (isLiked ? likesCount - 1 : likesCount + 1);

        setIsLiked(newIsLiked);
        setLikesCount(newLikesCount);
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    } finally {
      setIsProcessing(false);
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

          {/* 태그 표시 */}
          {!!(p.tags && p.tags.length) && (
            <div className="post-tags">
              {p.tags.map((tag, index) => (
                <span key={index} className="post-tag">
                  #{typeof tag === 'object' ? tag.name : tag}
                </span>
              ))}
            </div>
          )}

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
            <span className="meta">• {p.user?.nickname || p.author?.nickname || p.authorNickname || p.author?.name || p.author?.username || p.nickname || '익명'}</span>
            <span className="meta">• {timeAgo(p.createdAt)}</span>
            <span className="spacer" />
            <button
              className={`like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              type="button"
              disabled={!isLoggedIn || isProcessing}
            >
              {isLiked ? '❤️' : '👍'} {likesCount}
            </button>
            <span className="meta">💬 {p.commentCount || 0}</span>
          </footer>
        </div>
      </Link>
    </div>
  );
};

export default PostCard;
