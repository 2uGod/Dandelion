// src/components/DiaryModal.jsx
import React, { useEffect, useState } from "react";
import "./DiaryModal.css"
// 🌱 기본 썸네일 (SVG data URL)
const DEFAULT_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A//www.w3.org/2000/svg%22 width%3D%22200%22 height%3D%22200%22 viewBox%3D%220 0 200 200%22%3E%3Crect width%3D%22200%22 height%3D%22200%22 rx%3D%2224%22 fill%3D%22%23e5f7ef%22/%3E%3Ctext x%3D%2250%25%22 y%3D%2255%25%22 dominant-baseline%3D%22middle%22 text-anchor%3D%22middle%22 font-size%3D%2272%22%3E%F0%9F%8C%B1%3C/text%3E%3C/svg%3E";

// 브라우저에서 이미지 리사이즈(최대 1280px) 후 dataURL(JPEG)로 반환
async function compressImage(file, maxSize = 1280, quality = 0.8) {
  const dataUrl = await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  const { width, height } = img;
  const ratio = Math.min(1, maxSize / Math.max(width, height));
  const w = Math.round(width * ratio);
  const h = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

const DiaryModal = ({ open, onClose, onSave, initial, selectedPlant }) => {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageData, setImageData] = useState(DEFAULT_IMAGE);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setDate(initial.date || "");
      setTitle(initial.title || "");
      setContent(initial.content || "");
      setImageData(initial.image || DEFAULT_IMAGE);
    } else {
      setDate(new Date().toISOString().slice(0, 10)); // 오늘
      setTitle("");
      setContent("");
      setImageData(DEFAULT_IMAGE);
    }
  }, [open, initial]);

  if (!open) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setImageData(compressed);
    } catch (err) {
      console.error(err);
      alert("이미지 처리 중 오류가 발생했습니다.");
    }
  };

  const handleSave = () => {
    if (!title.trim() || !date) {
      alert("날짜와 제목을 입력해주세요.");
      return;
    }
    const payload = {
      id: initial?.id ?? Date.now(),
      date,
      title,
      content,
      image: imageData || DEFAULT_IMAGE,
      plant: selectedPlant,
    };
    onSave(payload, !!initial);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{initial ? "일지 수정" : "새 일지"}</h3>

        <div className="modal-body">
          <div className="form-row">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <input
              type="text"
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <textarea
            rows={5}
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* 이미지 업로더 */}
          <div className="image-uploader">
            <div className="image-box">
              <img src={imageData || DEFAULT_IMAGE} alt="미리보기" className="image-preview" />
            </div>
            <div className="image-actions">
              <label className="btn-ghost" htmlFor="journal-image-input">이미지 선택</label>
              <input
                id="journal-image-input"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="btn-danger"
                onClick={() => setImageData(DEFAULT_IMAGE)}
              >
                이미지 제거
              </button>
            </div>

          </div>

          <div className="hint">
            현재 선택 작물: <strong>{selectedPlant || "작물 미선택"}</strong>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>취소</button>
          <button className="btn-primary" onClick={handleSave}>
            {initial ? "수정 완료" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiaryModal;
