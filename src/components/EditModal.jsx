import React, { useState, useRef } from 'react';
import { communityApi } from '../api/communityApi';

/** 게시글 수정 폼 (모달 내부) */
const EditForm = ({ post, onSubmit, onClose }) => {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [category, setCategory] = useState(post?.category || "knowhow");
  const [images, setImages] = useState(post?.images || []);
  const [files, setFiles] = useState([]);
  const [tags, setTags] = useState(post?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const onPickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    const next = [...files, ...picked].slice(0, 6); // 최대 6장
    setFiles(next);
    
    // 새로 추가된 파일만 미리보기 생성
    const newly = next.slice(images.length);
    const readers = newly.map(f => new Promise(res => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.readAsDataURL(f);
    }));
    Promise.all(readers).then((arr) => setImages(prev => [...prev, ...arr]));
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // 태그 관련 함수들
  const addTag = (tagText) => {
    const tag = tagText.trim().replace(/^#/, ''); // # 제거
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags(prev => [...prev, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
        setTagInput('');
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    if (value.includes(',')) {
      const newTags = value.split(',');
      newTags.slice(0, -1).forEach(tag => addTag(tag));
      setTagInput(newTags[newTags.length - 1]);
    } else {
      setTagInput(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      const updateData = {
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags, // 태그 배열 포함
        images: images // 이미지 처리는 백엔드 명세에 따라 조정 필요
      };

      await communityApi.updatePost(post.id, updateData);
      onSubmit && onSubmit();
      onClose();
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      alert('게시글 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const disabled = !title.trim() || !content.trim() || loading;

  return (
    <div className="compose-form">
      <div className="compose-header">
        <h2 className="compose-title">게시글 수정</h2>
      </div>

      <div className="compose-body">
        <form onSubmit={handleSubmit}>
          {/* 카테고리 선택 */}
          <div className="form-section">
            <label className="form-label">카테고리</label>
            <div className="type-selector">
              {[
                { value: "question", label: "질문" },
                { value: "diary", label: "일지" },
                { value: "knowhow", label: "노하우" }
              ].map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  className={`type-btn ${category === cat.value ? "active" : ""}`}
                  onClick={() => setCategory(cat.value)}
                  disabled={loading}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div className="form-section">
            <label className="form-label" htmlFor="edit-title">제목</label>
            <input
              id="edit-title"
              className="form-input"
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* 내용 */}
          <div className="form-section">
            <label className="form-label" htmlFor="edit-content">내용</label>
            <textarea
              id="edit-content"
              className="form-textarea"
              rows={8}
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* 태그 */}
          <div className="form-section">
            <label className="form-label">태그 ({tags.length}/5)</label>
            <div className="tag-input-container">
              <div className="tag-list">
                {tags.map((tag, index) => (
                  <span key={index} className="tag-item">
                    #{tag}
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => removeTag(tag)}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  className="tag-input"
                  placeholder={tags.length === 0 ? "#태그1, #태그2 (Enter 또는 쉼표로 구분)" : ""}
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  disabled={tags.length >= 5 || loading}
                />
              </div>
            </div>
            <div className="form-hint">최대 5개까지 추가 가능합니다</div>
          </div>

          {/* 이미지 업로드 */}
          <div className="form-section">
            <label className="form-label">이미지 ({images.length}/6)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={onPickFiles}
            />
            <button
              type="button"
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || images.length >= 6}
            >
              📷 이미지 추가
            </button>
            <div className="form-hint">최대 6장까지 업로드 가능합니다 (JPG/PNG 권장)</div>

            {/* 이미지 미리보기 */}
            {images.length > 0 && (
              <div className="image-preview-grid">
                {images.map((src, i) => (
                  <div key={i} className="image-preview-item">
                    <img src={src} alt={`preview ${i}`} />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={() => removeImage(i)}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="compose-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={disabled}
            >
              {loading ? "수정 중..." : "수정 완료"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/** 수정 모달 */
const EditModal = ({ isOpen, post, onClose, onSuccess }) => {
  if (!isOpen || !post) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="닫기" type="button">
          ×
        </button>
        <EditForm
          post={post}
          onSubmit={onSuccess}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default EditModal;