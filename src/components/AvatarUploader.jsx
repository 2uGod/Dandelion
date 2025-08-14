// src/components/settings/AvatarUploader.jsx
import React, { useRef } from "react";
import "./AvatarUploader.css";

/**
 * props:
 * - id, label
 * - value: 보여줄 이미지 URL(dataURL/절대/상대)
 * - fallback: 기본 이미지 URL(절대)
 * - onChange({ preview, file }): 미리보기와 실제 파일을 함께 전달
 * - disabled
 */
export default function AvatarUploader({
  id = "avatar",
  label = "프로필 이미지",
  value = "",
  fallback = "",
  onChange,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const src = value || fallback;

  const handlePick = () => {
    if (!inputRef.current || disabled) return;
    inputRef.current.value = ""; // 같은 파일 재선택 허용
    inputRef.current.click();
  };



  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      onChange && onChange({ preview: reader.result, file }); // dataURL + File 전달
    reader.readAsDataURL(file);
  };

  const handleImgError = (e) => {
    if (!fallback) return;
    e.currentTarget.src = fallback; // 실패 시 기본 이미지로 강제
  };

  return (
    <div className="avatar-uploader">
      <label className="avatar-label" htmlFor={id}>
        {label}
      </label>

      <div className="avatar-box" aria-label="프로필 이미지 미리보기">
        {/* key={src} 로 이미지 노드를 강제 교체 → 즉시 리프레시 */}
        <img key={src} src={src} alt="avatar" className="avatar-img" onError={handleImgError} />
      </div>

      <div className="avatar-actions">
        <button type="button" className="btn-link" onClick={handlePick} disabled={disabled}>
          바꾸기
        </button>
      </div>

      <input
        ref={inputRef}
        id={id}
        name={id}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  );
}
