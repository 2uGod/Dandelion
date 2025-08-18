import React from 'react';

const money = (n) => {
  if (typeof n !== 'number' || isNaN(n)) return '0';
  return n.toLocaleString("ko-KR");
};

const ExperienceCard = ({ exp, onBookClick, userProfile }) => {
  if (!exp) return null;
  
  const isExpert = userProfile?.type === 'EXPERT';
  
  return (
    <article className="rs-card">
      <div className="rs-card-header">
        <div className="rs-card-cover" aria-hidden>{exp.cover || '🌱'}</div>
        <div className="rs-card-main">
          <h3 className="rs-card-title">{exp.title || '제목 없음'}</h3>
          <div className="rs-card-meta">
            <span>{exp.host || '호스트 미정'}</span> • <span>{exp.location || '장소 미정'}</span> • <b>{money(exp.price)}원</b> • 최대 {exp.maxParticipants || exp.capacity || 0}명
          </div>
        </div>
      </div>
      
      {exp.scheduledDate && (
        <div className="rs-card-schedule">
          <span>📅 {new Date(exp.scheduledDate).toLocaleString('ko-KR')}</span>
        </div>
      )}
      
      <div className="rs-card-participants">
        <span>👥 {exp.currentParticipants || 0}/{exp.maxParticipants || exp.capacity || 0}명 참여</span>
      </div>
      
      <p className="rs-card-desc">{exp.desc || exp.content || '설명 없음'}</p>
      
      <div className="rs-tagwrap">
        {(exp.tags || []).map((tag, index) => {
          const tagName = typeof tag === 'string' ? tag : tag?.name || String(tag);
          return (
            <span key={`${exp.id}-tag-${index}`} className="rs-tag">
              #{tagName}
            </span>
          );
        })}
      </div>
      
      {onBookClick && (
        <div className="rs-card-actions">
          {isExpert ? (
            <div className="tooltip-container" style={{position: 'relative', display: 'inline-block'}}>
              <button 
                className="btn-solid disabled" 
                disabled 
                style={{opacity: 0.5, cursor: 'not-allowed'}}
              >
                예약하기
              </button>
              <div className="tooltip expert-tooltip" style={{
                position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                backgroundColor: '#333', color: 'white', padding: '8px 12px', borderRadius: '4px',
                fontSize: '12px', whiteSpace: 'nowrap', opacity: 0, visibility: 'hidden',
                transition: 'opacity 0.3s, visibility 0.3s', marginBottom: '5px', pointerEvents: 'none', zIndex: 1000
              }}>
                비전문 농업인만 신청 가능합니다!
              </div>
            </div>
          ) : (
            <button className="btn-solid" onClick={()=>onBookClick(exp)}>예약하기</button>
          )}
        </div>
      )}
    </article>
  );
};

export default ExperienceCard;