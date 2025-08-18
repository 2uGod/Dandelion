import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const money = (n) => {
  if (typeof n !== 'number' || isNaN(n)) return '0';
  return n.toLocaleString("ko-KR");
};

const BookModal = ({ open, onClose, exp, onSubmit }) => {
  const [headcount, setHeadcount] = useState(1);
  const [message, setMessage] = useState("");
  
  useEffect(()=>{ 
    if (open) { 
      setHeadcount(1);
      setMessage("");
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      {!exp ? null : (
        <div className="rs-form">
          <h3 className="rs-modal-title">예약하기 – {exp.title}</h3>
          <div className="rs-experience-info">
            <p><strong>체험 일시:</strong> {exp.scheduledDate ? new Date(exp.scheduledDate).toLocaleString('ko-KR') : '미정'}</p>
            <p><strong>장소:</strong> {exp.location}</p>
            <p><strong>가격:</strong> {money(exp.price)}원</p>
            <p><strong>현재 예약:</strong> {exp.currentParticipants || 0}/{exp.maxParticipants || exp.capacity}명</p>
          </div>
          <label className="rs-label">
            참가 인원
            <input type="number" min={1} max={exp.maxParticipants || exp.capacity} value={headcount}
              onChange={(e)=>setHeadcount(Number(e.target.value))}/>
          </label>
          <label className="rs-label">
            참가 신청 메시지
            <textarea 
              value={message} 
              onChange={(e)=>setMessage(e.target.value)}
              placeholder="참가 신청 이유나 메시지를 입력해주세요..."
              rows={4}
            />
          </label>
          <div className="rs-form-actions">
            <button className="btn-outline" onClick={onClose}>취소</button>
            <button
              className="btn-solid"
              disabled={headcount<1}
              onClick={()=>{
                onSubmit({ exp, headcount, message });
                onClose();
              }}
            >
              참가 신청
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BookModal;