import React, { useCallback, useRef, useState, useEffect } from "react";
import Header from "../components/Header";
import "../styles/Pest.css";
import { detectPest, askAiChat } from "../services/pestApi";

const ACCEPT = "image/*";

function getHealthFlags(res) {
  if (!res) return { isHealthy: null };
  if (typeof res.isHealthy === "boolean") return { isHealthy: res.isHealthy };
  const label = String(res.label || "").toLowerCase();
  const healthyKeywords = ["정상", "healthy", "normal", "no pest", "no disease", "이상 없음"];
  const isHealthy = healthyKeywords.some((k) => label.includes(k));
  return { isHealthy };
}

function formatDiseasesToText(diseases){
  if(!diseases || diseases.length === 0){
    return "분석 결과를 찾을 수 없어요. 더 자세히 알려주세요.";
  }
  return diseases
    .map(d => `### ${d.diseaseName}\n- **설명**: ${d.description}\n- **해결책**: ${d.solution}`)
    .join('\n\n');
}

export default function Pest() {
  // 업로드/예측 상태
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false); // 예측 로딩
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // 채팅 상태
  const [chat, setChat] = useState([
    { role: "assistant", text: "안녕하세요! 잎 사진을 올려주시면 병해충 여부를 간단히 살펴볼게요." },
  ]);
  const [userInput, setUserInput] = useState("");
  const [sending, setSending] = useState(false); // 전송 잠금(중복 방지)

  // 스크롤 제어
  const scrollRef = useRef(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat, loading]);

  // 언마운트 시 미리보기 URL 해제
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
          { role: "assistant", text: `정상으로 보입니다${confTxt}. 다른 도움이 필요하신가요?` },
        ]);
      } else {
        setChat((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `${res.label ?? "병해충"}이(가) 의심됩니다${confTxt}. 관리 팁이 필요하신가요?`,
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
      console.log("백엔드에서 받은 실제 데이터:", responseData);
      
      const reply = formatDiseasesToText(responseData.data);

      setChat((prev) => {
        const next = [...prev];
        const idx = next.findIndex((m) => m.meta === "typing");
        if (idx !== -1) {
          next[idx] = { role: "assistant", text: reply };
        } else {
          next.push({ role: "assistant", text: reply });
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
                <div className="bubble-inner">{m.text}</div>
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
    </div>
  );
}
