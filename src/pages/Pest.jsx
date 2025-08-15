// src/pages/Pest.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import "../styles/Pest.css";
import { getMyPlants } from "../services/plantApi";
import { getPestsForSpecies, searchPests, getPestDetail } from "../services/pestApi";
import { chatPlantAdvisor } from "../services/aiApi";

// 작은 UI 유틸
const Tag = ({ children, tone = "neutral" }) => (
  <span className={`tag tag-${tone}`}>{children}</span>
);

// 메시지 버블
const ChatBubble = ({ role, content }) => {
  const isUser = role === "user";
  return (
    <div className={`chat-row ${isUser ? "right" : "left"}`}>
      <div className={`bubble ${isUser ? "user" : "assistant"}`}>{content}</div>
    </div>
  );
};

// 식물 리스트(좌측)
const PlantList = ({ plants, selectedId, onSelect }) => {
  if (!plants?.length) {
    return (
      <div className="empty-list">
        등록된 식물이 없어요. <br /> 마이페이지에서 식물을 추가해 주세요.
      </div>
    );
  }
  return (
    <ul className="plant-list" role="listbox" aria-label="내 작물 목록">
      {plants.map((p) => (
        <li
          key={p.id}
          className={`plant-item ${selectedId === p.id ? "active" : ""}`}
          onClick={() => onSelect(p)}
          role="option"
          aria-selected={selectedId === p.id}
        >
          <img
            src={p.thumbnailUrl || "/plant_fallback.png"}
            alt={`${p.name} 썸네일`}
            className="plant-thumb"
          />
          <div className="plant-meta">
            <div className="plant-name">{p.name}</div>
            <div className="plant-species">{p.species}</div>
          </div>
        </li>
      ))}
    </ul>
  );
};

// 병해충 카드
const PestCard = ({ pest, onOpen }) => {
  return (
    <article className="pest-card" onClick={() => onOpen(pest.slug)} role="button">
      <div className="pest-card-top">
        <h4 className="pest-name">{pest.koreanName || pest.name}</h4>
        <Tag tone={pest.severity === "high" ? "danger" : pest.severity === "mid" ? "warn" : "neutral"}>
          {pest.severity === "high" ? "주의(높음)" : pest.severity === "mid" ? "주의(중간)" : "일반"}
        </Tag>
      </div>
      <p className="pest-desc">{pest.shortDescription}</p>
      <div className="pest-card-bottom">
        {pest.categories?.map((c) => (
          <Tag key={c} tone="neutral">{c}</Tag>
        ))}
      </div>
    </article>
  );
};

// 백과사전 사이드패널
const EncyclopediaPanel = ({ openSlug, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!openSlug) return;
      setLoading(true);
      try {
        const data = await getPestDetail(openSlug);
        if (!ignore) setDetail(data);
      } catch (e) {
        if (!ignore)
          setDetail({
            name: "정보를 불러오지 못했습니다.",
            description: "잠시 후 다시 시도해 주세요.",
          });
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [openSlug]);

  return (
    <aside className={`ency-panel ${openSlug ? "open" : ""}`}>
      <div className="ency-header">
        <h3>병해충 백과</h3>
        <button className="icon-btn" onClick={onClose} aria-label="닫기">✖</button>
      </div>
      <div className="ency-body">
        {loading && <div className="skeleton tall" />}
        {!loading && detail && (
          <>
            <h4 className="ency-title">{detail.koreanName || detail.name}</h4>
            {detail.images?.length ? (
              <div className="ency-images">
                {detail.images.map((src, i) => (
                  <img key={i} src={src} alt={`${detail.name} 이미지 ${i + 1}`} />
                ))}
              </div>
            ) : null}
            <p className="ency-desc">{detail.description}</p>
            {detail.symptoms?.length ? (
              <>
                <h5>주요 증상</h5>
                <ul className="bullet">
                  {detail.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </>
            ) : null}
            {detail.cause ? (
              <>
                <h5>원인</h5>
                <p>{detail.cause}</p>
              </>
            ) : null}
            {detail.treatments?.length ? (
              <>
                <h5>관리 방법</h5>
                <ul className="bullet">
                  {detail.treatments.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </>
            ) : null}
            {detail.references?.length ? (
              <>
                <h5>참고</h5>
                <ul className="refs">
                  {detail.references.map((r, i) => (
                    <li key={i}>
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noreferrer">{r.title || r.url}</a>
                      ) : (
                        r.title
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </>
        )}
      </div>
    </aside>
  );
};

export default function Pest() {
  // 좌측: 내 식물
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);

  // 우측: 병해충 목록 / 검색
  const [loadingPests, setLoadingPests] = useState(false);
  const [pests, setPests] = useState([]);
  const [query, setQuery] = useState("");

  // 중앙: 상담(메인)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "안녕하세요! 상담 도우미입니다.\n식물/증상을 알려주시면 의심되는 병해충과 관리 방법을 알려드릴게요.\n예: “토마토 잎에 갈색 반점이 생기고 번져요.”",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // 입력기(한글 IME) 조합 상태
  const [isComposing, setIsComposing] = useState(false);

  // 더블 전송 방지용
  const lastSentAt = useRef(0);
  const textareaRef = useRef(null);

  // 백과사전 패널
  const [openSlug, setOpenSlug] = useState("");

  // --- 초기: 내 식물 불러오기
  useEffect(() => {
    (async () => {
      try {
        const data = await getMyPlants();
        setPlants(data);
        if (data.length) setSelectedPlant(data[0]);
      } catch (e) {
        // 실패해도 UI는 동작(목데이터 사용)
      }
    })();
  }, []);

  // --- 식물 선택 시 해당 종의 주요 병해충 로딩
  useEffect(() => {
    const load = async () => {
      if (!selectedPlant?.species) {
        setPests([]);
        return;
      }
      setLoadingPests(true);
      try {
        const data = await getPestsForSpecies(selectedPlant.species);
        setPests(data);
      } catch (e) {
        setPests([]);
      } finally {
        setLoadingPests(false);
      }
    };
    load();
  }, [selectedPlant]);

  // --- 병해충 검색
  useEffect(() => {
    const id = setTimeout(async () => {
      if (!query) return; // 선택 작물 기준 목록 유지
      setLoadingPests(true);
      try {
        const data = await searchPests(query);
        setPests(data);
      } catch (e) {
        // ignore
      } finally {
        setLoadingPests(false);
      }
    }, 350);
    return () => clearTimeout(id);
  }, [query]);

  // --- 전송 함수 (중복 방지 & 안전한 상태 업데이트)
  const onSend = async () => {
    const text = chatInput.trim();
    if (!text) return;
    if (chatLoading) return; // 전송 중이면 무시

    const now = Date.now();
    if (now - lastSentAt.current < 350) return; // 연타 방지(0.35s)
    lastSentAt.current = now;

    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]); // ✅ 이전 상태 기반
    setChatLoading(true);

    try {
      const ctx = {
        plant: selectedPlant?.name,
        species: selectedPlant?.species,
        recentPests: pests.slice(0, 5).map((p) => p.name),
      };
      const answer = await chatPlantAdvisor(text, ctx);
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "답변 생성 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요." },
      ]);
    } finally {
      setChatLoading(false);
      // 전송 후 포커스 유지
      textareaRef.current?.focus();
    }
  };

  // --- Enter 핸들 (한글 조합/Shift+Enter 줄바꿈 처리)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      onSend();
    }
  };

  // --- 필터링(검색어가 있을 때만 사용)
  const filtered = useMemo(() => {
    if (!query) return pests;
    const q = query.toLowerCase();
    return pests.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.koreanName?.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q)
    );
  }, [pests, query]);

  return (
    <div className="pest-page">
      <Header />

      {/* 상담 메인 레이아웃: 좌(내 식물) - 중(상담) - 우(병해충) */}
      <main className="pest-layout chat-first">
        {/* 좌측: 내 식물 */}
        <aside className="pane left">
          <div className="pane-header">
            <h3>내 식물</h3>
          </div>
          <PlantList
            plants={plants}
            selectedId={selectedPlant?.id}
            onSelect={setSelectedPlant}
          />
        </aside>

        {/* 중앙: AI 상담(메인) */}
        <section className="pane center chat-pane" role="main">
          <div className="hero">
            <h2 className="title">AI 병해충 상담</h2>
            <p className="subtitle">
              선택한 작물/증상을 알려주시면 진단 방향과 관리 팁을 제안해 드려요.
            </p>
          </div>

          <div className="chat-box" role="log" aria-live="polite">
            {messages.map((m, i) => (
              <ChatBubble key={i} role={m.role} content={m.content} />
            ))}
            {chatLoading && <div className="typing">AI가 답변을 작성 중…</div>}
          </div>

          <div className="chat-input">
            <textarea
              ref={textareaRef}
              rows={3}
              placeholder={
                selectedPlant
                  ? `예) ${selectedPlant.name} 잎이 누렇게 변하고 갈라져요.`
                  : "예) 잎이 누렇게 변하고 갈라져요."
              }
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
            />
            <button
              className="btn primary"
              onClick={onSend}
              disabled={chatLoading || isComposing || chatInput.trim() === ""}
              title={isComposing ? "한글 조합이 끝난 뒤 전송할 수 있어요" : undefined}
            >
              전송
            </button>
          </div>
        </section>

        {/* 우측: 병해충 목록 */}
        <aside className="pane right">
          <div className="pane-header">
            <h3>{selectedPlant?.species || "작물"} 주요 병해충</h3>
          </div>

          <div className="list-header">
            <input
              className="search"
              placeholder={`'${
                selectedPlant?.species || "작물"
              }' 관련 병해충 검색…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="병해충 검색"
            />
          </div>

          {loadingPests ? (
            <div className="grid loading">
              <div className="skeleton card" />
              <div className="skeleton card" />
              <div className="skeleton card" />
            </div>
          ) : filtered?.length ? (
            <div className="grid">
              {filtered.map((p) => (
                <PestCard key={p.slug || p.name} pest={p} onOpen={setOpenSlug} />
              ))}
            </div>
          ) : (
            <div className="empty">
              병해충 결과가 없어요. 검색어를 바꾸거나 다른 식물을 선택해 보세요.
            </div>
          )}
        </aside>

        {/* 우측 플로팅: 백과사전 상세 */}
        <EncyclopediaPanel openSlug={openSlug} onClose={() => setOpenSlug("")} />
      </main>
    </div>
  );
}
