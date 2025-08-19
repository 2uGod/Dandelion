import React, { useState, useRef, useEffect } from 'react';

/** 질문/노하우 작성 폼 (모달 내부) */
const ComposeForm = ({ onSubmit, onClose }) => {
  const [postType, setPostType] = useState("자유"); // 자유 | 질문 | 일지 | 노하우 | 건의
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

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

  const disabled = !title.trim() || !content.trim();

  return (
    <div className="compose-form">
      <div className="compose-header">
        <h2 className="compose-title">새 글 작성</h2>
      </div>

      <div className="compose-body">
        {/* 타입 선택 */}
        <div className="form-section">
          <label className="form-label">카테고리</label>
          <div className="type-selector">
            {["자유","질문","일지","노하우","건의"].map(t=>(
              <button
                key={t}
                type="button"
                className={`type-btn ${postType===t ? "active":""}`}
                onClick={()=>setPostType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div className="form-section">
          <label className="form-label">제목</label>
          <input
            className="form-input"
            placeholder={
              postType==="질문" ? "제목을 입력하세요 (예: 토마토 추비 추천?)" :
              postType==="자유" ? "제목을 입력하세요 (예: 농사 이야기)" :
              postType==="건의" ? "제목을 입력하세요 (예: 기능 개선 건의)" :
              "제목을 입력하세요 (예: 딸기 러너 정리 팁)"
            }
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
          />
        </div>

        {/* 내용 */}
        <div className="form-section">
          <label className="form-label">내용</label>
          <textarea
            className="form-textarea"
            placeholder={
              postType==="질문" ? "무엇이 궁금한가요? (병징·환경·시도한 것 등 세부 정보 환영)" :
              postType==="자유" ? "자유롭게 이야기를 나누어보세요!" :
              postType==="건의" ? "개선하고 싶은 점이나 새로운 기능에 대해 자세히 설명해주세요." :
              "노하우를 공유해주세요. (배경/방법/팁/주의사항 등)"
            }
            rows={8}
            value={content}
            onChange={(e)=>setContent(e.target.value)}
          />
        </div>

        {/* 태그 - 건의게시판에서는 숨김 */}
        {postType !== "건의" && (
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
                  disabled={tags.length >= 5}
                />
              </div>
            </div>
            <div className="form-hint">최대 5개까지 추가 가능합니다</div>
          </div>
        )}

        {/* 이미지 업로드 */}
        <div className="form-section">
          <label className="form-label">이미지 ({images.length}/6)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={onPickFiles}
          />
          <button
            type="button"
            className="upload-btn"
            onClick={()=>fileInputRef.current?.click()}
            disabled={images.length >= 6}
          >
            📷 이미지 추가
          </button>
          <div className="form-hint">최대 6장까지 업로드 가능합니다 (JPG/PNG 권장)</div>

          {!!images.length && (
            <div className="image-preview-grid">
              {images.map((src, i)=>(
                <div key={i} className="image-preview-item">
                  <img src={src} alt={`첨부 ${i+1}`} />
                  <button
                    type="button"
                    className="image-remove-btn"
                    onClick={()=>removeImage(i)}
                    aria-label="삭제"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="compose-footer">
        <button className="btn-cancel" type="button" onClick={onClose}>
          취소
        </button>
        <button
          className="btn-submit"
          type="button"
          disabled={disabled}
          onClick={()=>{
            onSubmit({
              type: postType,
              title,
              content,
              images,
              tags: postType === "건의" ? [] : tags
            });
            onClose();
          }}
        >
          등록하기
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
    <div className="modal-overlay" onMouseDown={onBackdropMouseDown}>
      <div className="modal-container" ref={panelRef} role="dialog" aria-modal="true">
        <button className="modal-close-btn" onClick={onClose} aria-label="닫기" type="button">
          ×
        </button>
        <ComposeForm onSubmit={onSubmit} onClose={onClose}/>
      </div>
    </div>
  );
};

export default ComposeModal;
