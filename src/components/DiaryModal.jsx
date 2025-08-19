import React, { useEffect, useState } from "react";
import "./DiaryModal.css";

const DEFAULT_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A//www.w3.org/2000/svg%22 width%3D%22200%22 height%3D%22200%22 viewBox%3D%220 0 200 200%22%3E%3Crect width%3D%22200%22 height%3D%22200%22 rx%3D%2224%22 fill%3D%22%23e5f7ef%22/%3E%3Ctext x%3D%2250%25%22 y%3D%2255%25%22 dominant-baseline%3D%22middle%22 text-anchor%3D%22middle%22 font-size%3D%2272%22%3E%F0%9F%8C%B1%3C/text%3E%3C/svg%3E";

const SWATCHES = [
  "#16a34a",
  "#4CAF50",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#6b7280",
  "#111827",
];

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
  const outDataUrl = canvas.toDataURL("image/jpeg", quality);
  const byteString = atob(outDataUrl.split(",")[1]);
  const mimeString = outDataUrl.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  const blob = new Blob([ab], { type: mimeString });
  return { dataUrl: outDataUrl, blob };
}

const DiaryModal = ({ open, onClose, onSave, initial, selectedPlant, selectedCropId, crops = [] }) => {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("crop_diary");
  const [color, setColor] = useState("");
  const [imagePreview, setImagePreview] = useState(DEFAULT_IMAGE);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setDate(initial.date || "");
      setTitle(initial.title || "");
      setContent(initial.content || "");
      setType(initial.type || "crop_diary");
      setColor(initial.color || "");
      setImagePreview(initial.image || DEFAULT_IMAGE);
      setImageFile(null);
    } else {
      setDate(new Date().toISOString().slice(0, 10));
      setTitle("");
      setContent("");
      setType(selectedPlant === "공통" ? "personal" : "crop_diary");
      setColor("");
      setImagePreview(DEFAULT_IMAGE);
      setImageFile(null);
    }
  }, [open, initial, selectedPlant]);

  if (!open) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl, blob } = await compressImage(file);
      setImagePreview(dataUrl);
      const extSafeName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
      setImageFile(new File([blob], extSafeName, { type: "image/jpeg" }));
    } catch {
      alert("이미지 처리 중 오류가 발생했습니다.");
    }
  };

  const handleSave = () => {
    if (!title.trim() || !date) {
      alert("날짜와 제목을 입력해주세요.");
      return;
    }

    let cropId;
    if ((type || "crop_diary") === "crop_diary" && selectedPlant !== "공통") {
      const byProp = typeof selectedCropId !== "undefined" ? selectedCropId : undefined;
      const byList = !byProp && Array.isArray(crops) && crops.find(c => String(c.name).trim() === String(selectedPlant).trim())?.id;
      const byInitial = initial?.cropId;
      cropId = byProp ?? byList ?? byInitial ?? undefined;
      if (!cropId) {
        alert("작물 일지에는 cropId가 필요합니다.");
        return;
      }
    }

    const payload = {
      id: initial?.id ?? initial?._id,
      title,
      content,
      date,
      type,
      color: color || undefined,
      imageFile: imageFile || undefined,
      cropId
    };

    onSave(payload, Boolean(initial));
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

          <div className="form-row three">
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="crop_diary">작물 일지</option>
              <option value="personal">개인 일정</option>
            </select>

            <div className="color-field">
              <input
                className="color-input"
                type="text"
                placeholder="색상 HEX (선택)"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <input
                className="native-color"
                type="color"
                value={/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color) ? color : "#16a34a"}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>

          <div className="color-swatches">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                className={`swatch${color === c ? " active" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>

          <div className="image-uploader">
            <div className="image-box">
              <img src={imagePreview} alt="미리보기" className="image-preview" />
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
                onClick={() => {
                  setImagePreview(DEFAULT_IMAGE);
                  setImageFile(null);
                }}
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
