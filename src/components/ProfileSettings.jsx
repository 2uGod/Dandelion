// src/components/settings/ProfileSettings.jsx
import "./ProfileSettings.css"
import React, { useEffect, useState } from "react";
import AvatarUploader from "./AvatarUploader";
import EmailInput from "./EmailInput";
import "./ProfileSettings.css";

const STORAGE_KEY = "farmunity_profile_v1";

const DEFAULT_PROFILE = {
  id: "subhinone",      // 서버 연동 전까지 임시
  nickname: "빙수",
  emailLocal: "subhinone",
  emailDomain: "gmail.com",
  interests: "",
  avatar: null,         // dataURL
};

export default function ProfileSettings() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved) setProfile({ ...DEFAULT_PROFILE, ...saved });
  }, []);

  const setField = (k, v) => {
    setProfile(p => ({ ...p, [k]: v }));
    setDirty(true);
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setDirty(false);
    alert("저장되었습니다.");
  };

  const cancel = () => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    setProfile(saved ? { ...DEFAULT_PROFILE, ...saved } : DEFAULT_PROFILE);
    setDirty(false);
  };

  return (
    <section className="settings-wrap">
      <h2 className="settings-title">프로필 편집</h2>

      <div className="settings-grid">
        {/* 왼쪽: 아바타 */}
        <div className="settings-col-left">
          <AvatarUploader
            value={profile.avatar}
            onChange={(v) => setField("avatar", v)}
          />
        </div>

        {/* 오른쪽: 폼 */}
        <div className="settings-col-right">
          <label className="settings-label">관심 작물</label>
          <textarea
            className="settings-textarea"
            rows={6}
            placeholder="예) 토마토, 딸기, 상추…"
            value={profile.interests}
            onChange={(e) => setField("interests", e.target.value)}
          />

          <div className="settings-row">
            <div className="settings-label">Farmunity ID</div>
            <input className="settings-input" readOnly value={profile.id} />
          </div>

          <div className="settings-row">
            <div className="settings-label">Email</div>
            <EmailInput
              local={profile.emailLocal}
              domain={profile.emailDomain}
              onChange={(local, domain) => {
                setDirty(true);
                setProfile(p => ({ ...p, emailLocal: local, emailDomain: domain }));
              }}
            />
          </div>

          <div className="settings-row">
            <div className="settings-label">닉네임</div>
            <input
              className="settings-input"
              value={profile.nickname}
              onChange={(e) => setField("nickname", e.target.value)}
              placeholder="닉네임을 입력하세요"
            />
          </div>

          <div className="settings-actions">
            <button className="btn-primary" onClick={save} disabled={!dirty}>저장</button>
            <button className="btn-ghost" onClick={cancel}>취소</button>
          </div>
        </div>
      </div>
    </section>
  );
}
