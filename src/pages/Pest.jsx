import React, { useCallback, useRef, useState } from "react";
import Header from "../components/Header";
import "../styles/Pest.css";
import { detectPest } from "../services/pestApi";

const ACCEPT = "image/*";

export default function Pest() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const onSelectFile = useCallback((f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있어요.");
      return;
    }
    setError("");
    setResult(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer?.files?.[0];
    onSelectFile(f);
  };

  const onChange = (e) => {
    const f = e.target.files?.[0];
    onSelectFile(f);
  };

  const onClickUpload = () => inputRef.current?.click();

  const onReset = () => {
    setFile(null);
    setPreviewUrl("");
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

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
    } catch (err) {
      console.error(err);
      setError("예측 요청 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pest-page">
      <Header />

      <main className="pest-container" role="main">
        <section className="pest-hero">
          <h2 className="pest-title">병해충 이미지 진단 (베타)</h2>
          <p className="pest-subtitle">잎 사진을 업로드하면 AI가 의심되는 병해충을 추정해요. (테스트용 UI)</p>
        </section>

        <section
          className="upload-area"
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
          onDrop={onDrop}
          aria-label="이미지 드래그 앤 드롭 영역"
        >
          {previewUrl ? (
            <figure className="preview">
              <img src={previewUrl} alt="업로드 미리보기" />
              <figcaption className="preview-name" title={file?.name}>{file?.name}</figcaption>
              <div className="preview-actions">
                <button type="button" className="btn" onClick={onReset}>다시 선택</button>
              </div>
            </figure>
          ) : (
            <button type="button" className="upload-cta" onClick={onClickUpload}>
              <span className="upload-icon" aria-hidden>⬆️</span>
              <span>
                이미지를 드래그하거나 <strong>클릭해 업로드</strong>
              </span>
              <span className="upload-hint">JPG, PNG 등 이미지 파일 지원</span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            onChange={onChange}
            aria-label="이미지 파일 선택"
            hidden
          />
        </section>

        <section className="actions">
          <button type="button" className="btn primary" onClick={onPredict} disabled={loading}>
            {loading ? "예측 중…" : "예측하기"}
          </button>
          {file && !loading && (
            <button type="button" className="btn ghost" onClick={onReset}>초기화</button>
          )}
        </section>

        {error && (
          <div role="alert" className="alert error">{error}</div>
        )}

        {loading && (
          <section className="result loading" aria-busy>
            <div className="skeleton title" />
            <div className="skeleton line" />
            <div className="skeleton line" />
          </section>
        )}

        {result && !loading && (
          <section className="result" aria-live="polite">
            <h3 className="result-title">예측 결과</h3>
            <div className="result-grid">
              <div className="card">
                <h4>가장 유력</h4>
                <p className="pred-main">{result.label}
                  {typeof result.confidence === "number" && (
                    <span className="confidence">{`  •  ${(result.confidence*100).toFixed(1)}%`}</span>
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
                          <span className="score">{(it.score*100).toFixed(1)}%</span>
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
                    {result.tips.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}