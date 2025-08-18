import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const CreateExpModal = ({ open, onClose, onCreate, userProfile }) => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState(10000);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [scheduledDate, setScheduledDate] = useState("");
  const [tagList, setTagList] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(()=>{ 
    if (open){
      setTitle(""); setLocation(""); setPrice(10000);
      setMaxParticipants(10); setScheduledDate(""); setTagList([]); setTagInput(""); setDesc("");
    }
  }, [open]);

  // 태그 관련 함수들
  const addTag = (tagText) => {
    const tag = tagText.trim().replace(/^#/, '');
    if (tag && !tagList.includes(tag) && tagList.length < 5) {
      setTagList(prev => [...prev, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    setTagList(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
        setTagInput('');
      }
    } else if (e.key === 'Backspace' && !tagInput && tagList.length > 0) {
      removeTag(tagList[tagList.length - 1]);
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

  const disabled = !title.trim() || !location.trim() || !desc.trim();

  return (
    <Modal open={open} onClose={onClose}>
      <div className="rs-form">
        <h3 className="rs-modal-title">내 체험 등록</h3>
        

        <div className="rs-form-section">
          <label className="rs-label">체험명
            <input 
              value={title} 
              onChange={(e)=>setTitle(e.target.value)} 
              placeholder="예: 딸기 수확 체험" 
            />
          </label>
        </div>


        <div className="rs-form-section">
          <label className="rs-label">지역
            <input 
              value={location} 
              onChange={(e)=>setLocation(e.target.value)} 
              placeholder="예: 경기 양평" 
            />
          </label>
        </div>

        <div className="rs-form-section">
          <label className="rs-label">체험 일시
            <input 
              type="datetime-local" 
              value={scheduledDate} 
              onChange={(e)=>setScheduledDate(e.target.value)} 
            />
          </label>
        </div>

        <div className="rs-grid2">
          <div className="rs-form-section">
            <label className="rs-label">가격(원)
              <input 
                type="number" 
                min={0} 
                value={price} 
                onChange={(e)=>setPrice(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="rs-form-section">
            <label className="rs-label">최대 참가자(명)
              <input 
                type="number" 
                min={1} 
                value={maxParticipants} 
                onChange={(e)=>setMaxParticipants(Number(e.target.value))}
              />
            </label>
          </div>
        </div>

        <div className="rs-form-section">
          <label className="rs-label">태그 ({tagList.length}/5)</label>
          <div className="rs-tag-input-container">
            <div className="rs-tag-list">
              {tagList.map((tag, index) => (
                <span key={`tag-${index}-${String(tag)}`} className="rs-tag-item">
                  #{typeof tag === 'string' ? tag : String(tag)}
                  <button
                    type="button"
                    className="rs-tag-remove"
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                className="rs-tag-input"
                placeholder={tagList.length === 0 ? "#태그1, #태그2 (Enter 또는 쉼표로 구분)" : ""}
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                disabled={tagList.length >= 5}
              />
            </div>
          </div>
          <div className="rs-form-hint">최대 5개까지 추가 가능합니다</div>
        </div>

        <div className="rs-form-section">
          <label className="rs-label">설명
            <textarea 
              rows={4} 
              value={desc} 
              onChange={(e)=>setDesc(e.target.value)} 
              placeholder="체험에 대해 자세히 알려주세요." 
            />
          </label>
        </div>

        <div className="rs-form-actions">
          <button className="btn-outline" onClick={onClose}>취소</button>
          <button
            className="btn-solid" disabled={disabled}
            onClick={()=>{
              onCreate({
                id: Date.now(),
                title, 
                host: userProfile?.nickname || userProfile?.name || '호스트', 
                location, 
                price, 
                maxParticipants, 
                currentParticipants: 0,
                scheduledDate,
                tags: tagList,
                desc
              });
              onClose();
            }}
          >
            등록
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateExpModal;