
import React, { useEffect, useRef, useState } from "react";
import "./AvatarUploader.css"
const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' rx='24' fill='%23E5E7EB'/%3E%3Ccircle cx='120' cy='96' r='44' fill='%239CA3AF'/%3E%3Crect x='50' y='144' width='140' height='56' rx='28' fill='%239CA3AF'/%3E%3C/svg%3E";

async function toDataURL(file, max = 512, quality = 0.9) {
  const dataUrl = await new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });
  const ratio = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d").drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

export default function AvatarUploader({ value, onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || DEFAULT_AVATAR);

  useEffect(() => { setPreview(value || DEFAULT_AVATAR); }, [value]);

  const pick = () => inputRef.current?.click();

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await toDataURL(file);
      setPreview(dataUrl);
      onChange?.(dataUrl);
    } catch {
      alert("이미지를 불러오지 못했습니다.");
    }
  };

  const remove = () => {
    setPreview(DEFAULT_AVATAR);
    onChange?.(null);
  };

  return (
    <div className="avatar-card">
      <img src={preview} alt="avatar" className="avatar-img" />
      <div className="avatar-actions">
        <button className="link green" onClick={pick}>바꾸기</button>
        <span className="divider">|</span>
        <button className="link" onClick={remove}>삭제하기</button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onFile}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
