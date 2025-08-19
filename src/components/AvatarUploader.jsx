// src/components/settings/AvatarUploader.jsx
import React, { useRef } from "react";
import "./AvatarUploader.css";

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
    inputRef.current.value = "";
    inputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      onChange && onChange({ preview: reader.result, file });
    reader.readAsDataURL(file);
  };

  const handleImgError = (e) => {
    if (!fallback) return;
    e.currentTarget.src = fallback;
  };

  return (
    <div className="avatar-uploader">
      <label className="avatar-label" htmlFor={id}>
        {label}
      </label>

      <div className="avatar-box" aria-label="프로필 이미지 미리보기">
        <img
          key={src}
          src={src}
          alt="avatar"
          className="avatar-img"
          onError={handleImgError}
        />
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
