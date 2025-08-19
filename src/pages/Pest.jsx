import React, { useCallback, useRef, useState, useEffect } from "react";
import Header from "../components/Header";
import "../styles/Pest.css";
import { detectPest, askAiChat } from "../services/pestApi";

/** 건강/이상 플래그 추출 */
function getHealthFlags(res) {
  if (!res) return { isHealthy: null };
  if (typeof res.isHealthy === "boolean") return { isHealthy: res.isHealthy };
  const label = String(res.label || "").toLowerCase();
  const healthyKeywords = ["정상", "healthy", "normal", "no pest", "no disease", "이상 없음"];
  const isHealthy = healthyKeywords.some((k) => label.includes(k));
  return { isHealthy };
}

/** 간단 마크다운(###, **bold**, - list) → HTML 변환 */
function mdToHtml(src = "") {
  const esc = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = esc(src).split(/\r?\n/);
  const out = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (let line of lines) {
    const h3 = line.match(/^###\s+(.*)$/);
    if (h3) {
      flushList();
      out.push(`<h4 class="md-h4">${h3[1]}</h4>`);
      continue;
    }
    const li = line.match(/^\s*-\s+(.*)$/);
    if (li) {
      if (!inList) {
        out.push('<ul class="md-ul">');
        inList = true;
      }
      out.push(`<li>${li[1]}</li>`);
      continue;
    }
    if (line.trim() === "") {
      flushList();
      out.push("<br/>");
      continue;
    }
    let html = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    out.push(`<p class="md-p">${html}</p>`);
  }
  flushList();
  return out.join("\n");
}

/** LLM 응답을 마크다운 문자열로 정리 (백엔드가 이미 포맷하면 그대로 사용) */
function formatDiseasesToText(diseases) {
  if (!diseases || diseases.length === 0) {
    return "분석 결과를 찾을 수 없어요. 더 자세히 알려주세요.";
  }
  return diseases
    .map(
      (d) =>
        `### ${d.diseaseName}\n- **설명**: ${d.description}\n- **해결책**: ${d.solution}`
    )
    .join("\n\n");
}

/** NCPMS: 관련 질병 3개 (사진 + 요약 + 팁) — 데모용 더미 데이터 */
async function fetchRelatedFromNcpms(mainLabel) {
  // TODO: 실제 NCPMS API로 교체
  // const r = await fetch(`/api/ncpms/related?query=${encodeURIComponent(mainLabel)}`);
  // const json = await r.json();
  // return (json?.items || []).slice(0, 3);

  return [
    {
      id: "leaf-spot",
      name: "잎 반점병",
      imageUrl:
        "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?q=80&w=800&auto=format&fit=crop",
      summary:
        "잎 표면 갈색/흑갈 반점이 확산·융합됩니다. 고온다습 시 급속 진행.",
      tips: [
        "감염 잎 제거·폐기(퇴비 금지)",
        "잎 젖지 않게 토양 관수 위주",
        "필요 시 등록 약제 라벨 준수",
      ],
    },
    {
      id: "anthracnose",
      name: "탄저병",
      imageUrl:
        "https://images.unsplash.com/photo-1589739906080-46f9c1fbdbb0?q=80&w=800&auto=format&fit=crop",
      summary:
        "수침성 반점이 진전되며 중앙부가 괴사/함몰. 잎·줄기·과실 침해.",
      tips: [
        "과습 회피, 통풍/환기 확보",
        "감염 부위 제거 후 도구 소독",
        "예방 위주 주기 관리",
      ],
    },
    {
      id: "bacterial-blight",
      name: "세균성 점무늬",
      imageUrl:
        "https://images.unsplash.com/photo-1568640347023-dffd6a6fa18b?q=80&w=800&auto=format&fit=crop",
      summary:
        "작은 수침성 반점이 잎맥 따라 번질 수 있음. 물방울 튐·접촉으로 전염.",
      tips: [
        "작업 도구·손 위생 철저(차아염소산 등)",
        "비가림·관수 방식 개선",
        "허가 세균성 제제 사용",
      ],
    },
  ];
}

const ACCEPT = "image/*";

export default function Pest() {
  // 업로드/예측
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // 채팅
  const [chat, setChat] = useState([
    { role: "assistant", text: "안녕하세요! 잎 사진을 올려주시면 병해충 여부를 간단히 살펴볼게요." },
  ]);
  const [userInput, setUserInput] = useState("");
  const [sending, setSending] = useState(false);

  // “더 알아보기” 모달
  const [modalOpen, setModalOpen] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [moreItems, setMoreItems] = useState([]);

  // 스크롤
  const scrollRef = useRef(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat, loading]);

  // 미리보기 URL 해제
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onSelectFile = useCallback(
    (f) => {
      if (!f) return;
      if (!f.type?.startsWith("image/")) {
        setError("이미지 파일만 업로드할 수 있어요.");
        return;
      }
      setError("");
      setResult(null);
      setFile(f);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    },
    [previewUrl]
  );

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    onSelectFile(f);
  };

  const onChange = (e) => {
    const f = e.target.files?.[0];
    onSelectFile(f);
  };

  const onClickUpload = () => inputRef.current?.click();

  const onPredict = async () => {
    if (!file) {
      setError("먼저 이미지를 선택해 주세요.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await detectPest(file);
      setResult(res);

      const { isHealthy } = getHealthFlags(res);
      const confTxt =
        typeof res?.confidence === "number" ? ` (신뢰도 ${(res.confidence * 100).toFixed(1)}%)` : "";

      if (isHealthy) {
        setChat((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `정상으로 보입니다${confTxt}. 다른 도움이 필요하신가요?`,
            extra: { canMore: true, mainLabel: res?.label || "정상" },
          },
        ]);
      } else {
        setChat((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `${res.label ?? "병해충"}이(가) 의심됩니다${confTxt}. 관리 팁이 필요하신가요?`,
            extra: { canMore: true, mainLabel: res?.label || "잎 반점병" },
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setError("예측 요청 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  const openMore = async (mainLabel) => {
    try {
      setModalOpen(true);
      setMoreLoading(true);
      const items = await fetchRelatedFromNcpms(mainLabel);
      setMoreItems(items);
    } catch (e) {
      console.error(e);
      setMoreItems([]);
    } finally {
      setMoreLoading(false);
    }
  };

  const handleSend = async () => {
    const text = userInput.trim();
    if (!text || sending) return;
    setSending(true);

    setChat((prev) => [...prev, { role: "user", text }]);
    setUserInput("");

    const typingMessage = { role: "assistant", text: "입력 중…", meta: "typing" };
    setChat((prev) => [...prev, typingMessage]);

    try {
      const responseData = await askAiChat(text);
      const reply = formatDiseasesToText(responseData?.data);

      setChat((prev) => {
        const next = [...prev];
        const idx = next.findIndex((m) => m.meta === "typing");
        if (idx !== -1) {
          next[idx] = { role: "assistant", text: reply, asMarkdown: true };
        } else {
          next.push({ role: "assistant", text: reply, asMarkdown: true });
        }
        return next;
      });
    } catch (e) {
      console.error(e);
      setChat((prev) => [
        ...prev.filter((m) => m.meta !== "typing"),
        { role: "assistant", text: "응답 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.isComposing || e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="pest-page">
      <Header />
      <main className="pest-container">
        {/* 왼쪽 업로드/결과 */}
        <section className="left-panel">
          <h2 className="pest-title">병해충 이미지 진단</h2>

          <div
            className="upload-area"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }}
            onDrop={onDrop}
          >
            {previewUrl ? (
              <figure className="preview">
                <img src={previewUrl} alt="업로드 미리보기" />
                <figcaption className="preview-name">{file?.name}</figcaption>
                <div className="preview-actions">
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => {
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setFile(null);
                      setPreviewUrl("");
                      setResult(null);
                      setError("");
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                  >
                    다시 선택
                  </button>
                </div>
              </figure>
            ) : (
              <button type="button" className="upload-cta" onClick={onClickUpload}>
                <span className="upload-icon" aria-hidden>
                  ⬆️
                </span>
                <span>
                  이미지를 드래그하거나 <strong>클릭해 업로드</strong>
                </span>
                <span className="upload-hint">JPG, PNG 등 이미지 파일 지원</span>
              </button>
            )}

            <input ref={inputRef} type="file" accept={ACCEPT} onChange={onChange} hidden />
          </div>

          <div className="actions">
            <button onClick={onPredict} className="btn primary" disabled={loading}>
              {loading ? "예측 중…" : "예측하기"}
            </button>
          </div>

          {error && <div className="alert">{error}</div>}

          {result && (
            <div className="result">
              <p className="result-title">예측 결과</p>
              <div className="result-grid">
                <div className="card">
                  <h4>가장 유력</h4>
                  <p className="pred-main">
                    {result.label}
                    {typeof result.confidence === "number" && (
                      <span className="confidence">{`  •  ${(result.confidence * 100).toFixed(1)}%`}</span>
                    )}
                  </p>
                </div>

                {result.topK?.length > 0 && (
                  <div className="card">
                    <h4>다른 후보</h4>
                    <ul className="topk">
                      {result.topK.map((it, idx) => (
                        <li key={idx}>
                          <span className="label">{it.label}</span>
                          {typeof it.score === "number" && (
                            <span className="score">{(it.score * 100).toFixed(1)}%</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.tips?.length > 0 && (
                  <div className="card">
                    <h4>관리 팁</h4>
                    <ul className="tips">
                      {result.tips.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 오른쪽 채팅 */}
        <section className="right-panel chat-panel">
          <h3 className="chat-title">상담 채팅</h3>
          <div className="chat-scroll" ref={scrollRef} role="log" aria-live="polite">
            {chat.map((m, i) => (
              <div key={i} className={`bubble ${m.role} ${m.meta === "typing" ? "typing" : ""}`}>
                {m.asMarkdown ? (
                  <div
                    className="bubble-inner"
                    dangerouslySetInnerHTML={{ __html: mdToHtml(m.text) }}
                  />
                ) : (
                  <div className="bubble-inner">{m.text}</div>
                )}

                {/* 예측 응답에만 "더 알아보기" 버튼 */}
                {m.role === "assistant" && m.extra?.canMore && (
                  <div className="bubble-actions">
                    <button
                      type="button"
                      className="btn link"
                      onClick={() => openMore(m.extra.mainLabel)}
                      title="관련 질병 더 보기"
                    >
                      🔎 더 알아보기
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="chat-input-row">
            <textarea
              className="chat-input"
              placeholder="메시지를 입력하세요. (Enter: 전송, Shift+Enter: 줄바꿈)"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              disabled={sending}
            />
            <button onClick={handleSend} className="btn send" disabled={sending}>
              {sending ? "전송 중…" : "전송"}
            </button>
          </div>
        </section>
      </main>

      {/* ===== 모달(더 알아보기) ===== */}
      {modalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setModalOpen(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h4 className="modal-title">관련 질병 정보</h4>
              <button className="btn ghost sm" onClick={() => setModalOpen(false)}>닫기</button>
            </div>

            {moreLoading ? (
              <div className="modal-loading">
                <div className="skeleton big" />
                <div className="skeleton line" />
                <div className="skeleton line" />
              </div>
            ) : moreItems.length === 0 ? (
              <p className="modal-empty">표시할 정보가 없어요.</p>
            ) : (
              <div className="disease-grid">
                {moreItems.map((it) => (
                  <article key={it.id} className="disease-card">
                    <div className="disease-img-wrap">
                      {it.imageUrl ? (
                        <img src={it.imageUrl} alt={`${it.name} 예시`} className="disease-img" />
                      ) : (
                        <div className="disease-img placeholder">이미지 없음</div>
                      )}
                    </div>
                    <div className="disease-body">
                      <h5 className="disease-name">{it.name}</h5>
                      <p className="disease-summary">{it.summary}</p>
                      {Array.isArray(it.tips) && it.tips.length > 0 && (
                        <ul className="tip-list">
                          {it.tips.map((t, idx) => (
                            <li key={idx}>• {t}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
