import React, { useEffect, useMemo, useState, useCallback } from "react";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { communityApi } from "../api/communityApi";
import ExperienceCard from "../components/reservation/ExperienceCard";
import BookModal from "../components/reservation/BookModal";
import CreateExpModal from "../components/reservation/CreateExpModal";
import "../styles/Reservation.css";

const Reservation = () => {
  const { userProfile, isLoggedIn } = useAuth();

  const [experiences, setExperiences] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [q, setQ] = useState("");
  const [bookOpen, setBookOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [targetExp, setTargetExp] = useState(null);
  const [loading, setLoading] = useState(false);


  // 예약 체험 게시글 목록 가져오기
  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      const response = await communityApi.getPosts({
        category: 'reservation',
        limit: 50
      });

      if (response.success) {
        const posts = response.data?.posts || response.data?.data?.posts || [];

        const normalizedExperiences = posts.map(post => {
          let reservationInfo = {};

          // content가 JSON 형태인지 확인하고 파싱
          try {
            if (post.content && post.content.startsWith('{')) {
              reservationInfo = JSON.parse(post.content);
            }
          } catch (e) {
            // JSON 파싱 실패시 기본값 사용
            reservationInfo = { description: post.content || '설명 없음' };
            console.warn('체험 설명 파싱 실패:', e);
          }

          const normalized = {
            id: post.id,
            title: post.title || '제목 없음',
            host: post.user?.nickname || post.author?.nickname || post.author?.username || '호스트 미정',
            location: reservationInfo.location || post.location || '장소 미정',
            price: reservationInfo.price !== null && reservationInfo.price !== undefined ? Number(reservationInfo.price) : 0,
            maxParticipants: Number(reservationInfo.maxParticipants) || Number(post.maxParticipants) || 0,
            currentParticipants: Number(post.currentParticipants) || 0,
            scheduledDate: reservationInfo.scheduledDate || post.scheduledDate,
            tags: reservationInfo.tags || (Array.isArray(post.tags) ? post.tags.map(tag => typeof tag === 'string' ? tag : tag.name) : []),
            desc: reservationInfo.description || post.content || '설명 없음',
            cover: '🌱'
          };
          return normalized;
        });

        setExperiences(normalizedExperiences);
      }
    } catch (error) {
      console.error('체험 목록 조회 실패:', error);
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 예약 목록 가져오기
  const fetchReservations = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      let response;
      if (userProfile?.type === 'EXPERT') {
        // 전문가: 내가 올린 체험 글에 들어온 예약 신청 목록
        console.log('전문가 - 받은 예약 조회 중...');
        response = await communityApi.getReceivedReservations();
      } else {
        // 일반 사용자: 본인이 신청한 예약 목록
        console.log('일반 사용자 - 내 예약 조회 중...');
        response = await communityApi.getMyReservations();
      }

      console.log('예약 목록 응답:', response);

      if (response && response.success) {
        const reservationsData = Array.isArray(response.data) ? response.data : [];
        setReservations(reservationsData);
      } else if (response && response.data) {
        const reservationsData = Array.isArray(response.data) ? response.data : [];
        setReservations(reservationsData);
      } else {
        setReservations([]);
      }
    } catch (error) {
      console.error('예약 목록 조회 실패:', error);
      setReservations([]);
    }
  }, [isLoggedIn, userProfile?.type]);

  // 데이터 로드
  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const filtered = useMemo(()=>{
    const key = q.trim().toLowerCase();
    if (!key) return experiences;
    return experiences.filter(e => {
      if (!e) return false;
      return (
        (e.title || '').toLowerCase().includes(key) ||
        (e.desc || e.content || '').toLowerCase().includes(key) ||
        (e.tags || []).some(t => (t || '').toLowerCase().includes(key)) ||
        (e.location || '').toLowerCase().includes(key) ||
        (e.host || '').toLowerCase().includes(key)
      );
    });
  }, [q, experiences]);

  // 취미반 예약 확정
  const handleBookSubmit = async ({ exp, headcount, message }) => {
    try {
      const reservationData = {
        participantCount: headcount,
        message: message || '체험 참가 신청합니다.'
      };

      const response = await communityApi.createReservation(exp.id, reservationData);

      if (response.success) {
        alert("예약 신청이 완료되었습니다. 전문가의 승인을 기다려주세요!");
        fetchReservations();
      } else {
        alert(`예약 신청에 실패했습니다: ${response.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('예약 신청 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다.';
      alert(`예약 신청에 실패했습니다: ${errorMessage}`);
    }
  };

  // 전문가 체험 등록
  const handleCreateExp = async (exp) => {
    try {
      console.log('체험 등록 데이터:', exp);

      // 예약 정보를 content에 구조화해서 포함
      const reservationInfo = {
        description: exp.desc,
        price: exp.price,
        maxParticipants: exp.maxParticipants,
        scheduledDate: exp.scheduledDate,
        location: exp.location,
        tags: exp.tags || []
      };

      const postData = {
        title: exp.title,
        content: JSON.stringify(reservationInfo),
        category: 'reservation'
      };

      console.log('API 요청 데이터:', postData);

      const response = await communityApi.createPost(postData);

      console.log('API 응답:', response);

      if (response && (response.success || response.data)) {
        alert("체험이 등록되었습니다.");
        fetchExperiences();
      } else {
        alert('체험 등록에 실패했습니다: ' + (response.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('체험 등록 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다.';
      alert(`체험 등록에 실패했습니다: ${errorMessage}`);
    }
  };

  // 예약 승인/거절 처리
  const handleReservationAction = async (reservationId, action) => {
    try {
      const status = action === 'accept' ? 'CONFIRMED' : 'CANCELLED';
      const response = await communityApi.updateReservationStatus(reservationId, status);

      if (response.success) {
        alert(action === 'accept' ? '예약이 승인되었습니다.' : '예약이 거절되었습니다.');
        fetchReservations();
      }
    } catch (error) {
      console.error('예약 처리 실패:', error);
      alert('예약 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="rs-wrap">
      <Header />
      <main className="rs-container">
        {/* 상단 바 */}
        <div className="rs-toolbar">
          <div className="rs-search">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="체험 검색 (제목/설명/태그/지역/호스트)" />
            <span className="rs-search-ico">🔍</span>
          </div>

          {isLoggedIn && userProfile?.type === 'EXPERT' ? (
            <button className="btn-solid" onClick={()=>setCreateOpen(true)}>+ 내 체험 등록</button>
          ) : (
            <div className="tooltip-container" style={{position: 'relative'}}>
              <button className="btn-solid disabled" disabled style={{opacity: 0.5, cursor: 'not-allowed'}}>
                + 내 체험 등록
              </button>
              {isLoggedIn && userProfile?.type !== 'EXPERT' && (
                <div className="tooltip" style={{
                  position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                  backgroundColor: '#333', color: 'white', padding: '8px 12px', borderRadius: '4px',
                  fontSize: '12px', whiteSpace: 'nowrap', opacity: 0, visibility: 'hidden',
                  transition: 'opacity 0.3s, visibility 0.3s', marginBottom: '5px', pointerEvents: 'none', zIndex: 1000
                }}>
                  전문농업인만 체험을 등록할 수 있습니다
                </div>
              )}
            </div>
          )}
        </div>

        {/* 본문 */}
        {userProfile?.type !== "EXPERT" ? (
          <>
            <div className="rs-grid">
              {loading ? (
                <div className="rs-empty">로딩 중...</div>
              ) : (
                filtered.map(exp => (
                  <ExperienceCard
                    key={`exp-${exp.id}`}
                    exp={exp}
                    userProfile={userProfile}
                    onBookClick={(e)=>{ setTargetExp(e); setBookOpen(true); }}
                  />
                ))
              )}
              {!loading && !filtered.length && <div className="rs-empty">해당 조건의 체험이 없습니다.</div>}
            </div>

            <section className="rs-box">
              <h4>내 예약 내역</h4>
              <ul className="rs-book-list">
                {reservations.map(r=>(
                  <li key={`reservation-${r.id}`} className="rs-book-card">
                    <div className="rs-book-header">
                      <h4 className="rs-book-title">{r.post?.title || '체험명 미정'}</h4>
                      <span className={`rs-status-badge ${r.status === "PENDING" ? "pending" : r.status === "CONFIRMED" ? "confirmed" : "cancelled"}`}>
                        {r.status === "PENDING" ? "대기중" : r.status === "CONFIRMED" ? "승인됨" : "거절됨"}
                      </span>
                    </div>
                    <div className="rs-book-details">
                      <div className="rs-book-info-row">
                        <span className="rs-info-label">📅 프로그램 일시:</span>
                        <span className="rs-info-value">
                          {(() => {
                            // post.content에서 scheduledDate 파싱 시도
                            let scheduledDate = r.post?.scheduledDate;
                            if (!scheduledDate && r.post?.content) {
                              try {
                                const reservationInfo = JSON.parse(r.post.content);
                                scheduledDate = reservationInfo.scheduledDate;
                              } catch (e) {
                                console.log(e);
                                // JSON 파싱 실패시 기본값 사용
                              }
                            }
                            return scheduledDate ? new Date(scheduledDate).toLocaleString('ko-KR') : '일정 미정';
                          })()}
                        </span>
                      </div>
                      <div className="rs-book-info-row">
                        <span className="rs-info-label">✏️ 신청일:</span>
                        <span className="rs-info-value">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('ko-KR') : '날짜 미정'}
                        </span>
                      </div>
                      <div className="rs-book-info-row">
                        <span className="rs-info-label">👥 신청 인원:</span>
                        <span className="rs-info-value">{r.participantCount}명</span>
                      </div>
                      {r.message && (
                        <div className="rs-book-info-row">
                          <span className="rs-info-label">💭 신청 메시지:</span>
                          <span className="rs-info-value rs-message-text">{r.message}</span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
                {!reservations.length && <li className="rs-empty">예약 내역이 없습니다.</li>}
              </ul>
            </section>
          </>
        ) : (
          <>
            <div className="rs-grid">
              {experiences
                .filter(e => e.host && e.host.includes(""))
                .map(exp => <ExperienceCard key={`exp-${exp.id}`} exp={exp} userProfile={userProfile} />)}
              {!experiences.length && <div className="rs-empty">등록한 체험이 없습니다. 우측 상단의 "내 체험 등록"을 눌러보세요.</div>}
            </div>

            <section className="rs-box">
              <h4>들어온 예약 요청</h4>
              <ul className="rs-book-list">
                {reservations.map(r=>(
                  <li key={`reservation-${r.id}`} className="rs-book-card">
                    <div className="rs-book-header">
                      <h4 className="rs-book-title">{r.post?.title || '체험명 미정'}</h4>
                      <span className={`rs-status-badge ${r.status === "PENDING" ? "pending" : r.status === "CONFIRMED" ? "confirmed" : "cancelled"}`}>
                        {r.status === "PENDING" ? "대기중" : r.status === "CONFIRMED" ? "승인됨" : "거절됨"}
                      </span>
                    </div>
                    <div className="rs-book-details">
                      <div className="rs-book-info-row">
                        <span className="rs-info-label">📅 프로그램 일시:</span>
                        <span className="rs-info-value">
                          {(() => {
                            // post.content에서 scheduledDate 파싱 시도
                            let scheduledDate = r.post?.scheduledDate;
                            if (!scheduledDate && r.post?.content) {
                              try {
                                const reservationInfo = JSON.parse(r.post.content);
                                scheduledDate = reservationInfo.scheduledDate;
                              } catch (e) {
                                console.log(e);
                                // JSON 파싱 실패시 기본값 사용
                              }
                            }
                            return scheduledDate ? new Date(scheduledDate).toLocaleString('ko-KR') : '일정 미정';
                          })()}
                        </span>
                      </div>
                      <div className="rs-book-info-row">
                        <span className="rs-info-label">✏️ 신청일:</span>
                        <span className="rs-info-value">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('ko-KR') : '날짜 미정'}
                        </span>
                      </div>
                      <div className="rs-book-info-row">
                        <span className="rs-info-label">👤 신청자:</span>
                        <span className="rs-info-value">{r.user?.nickname || r.user?.name || '미정'}</span>
                      </div>
                      <div className="rs-book-info-row">
                        <span className="rs-info-label">👥 신청 인원:</span>
                        <span className="rs-info-value">{r.participantCount}명</span>
                      </div>
                      {r.message && (
                        <div className="rs-book-info-row">
                          <span className="rs-info-label">💭 신청 메시지:</span>
                          <span className="rs-info-value rs-message-text">{r.message}</span>
                        </div>
                      )}
                    </div>
                    {r.status === "PENDING" && (
                      <div className="rs-book-actions">
                        <button
                          className="btn-approve"
                          onClick={() => handleReservationAction(r.id, 'accept')}
                        >
                          승인
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReservationAction(r.id, 'reject')}
                        >
                          거절
                        </button>
                      </div>
                    )}
                  </li>
                ))}
                {!reservations.length && <li className="rs-empty">예약 요청이 없습니다.</li>}
              </ul>
            </section>
          </>
        )}
      </main>

      {/* 모달들 */}
      <BookModal
        open={bookOpen}
        onClose={()=>setBookOpen(false)}
        exp={targetExp}
        onSubmit={handleBookSubmit}
      />
      <CreateExpModal
        open={createOpen}
        onClose={()=>setCreateOpen(false)}
        onCreate={handleCreateExp}
        userProfile={userProfile}
      />
    </div>
  );
};

export default Reservation;
