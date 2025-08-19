// src/components/settings/ProfileSettings.jsx
import "./ProfileSettings.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import AvatarUploader from "./AvatarUploader";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const DEFAULT_AVATAR = `${BACKEND}/uploads/profiles/farmer_icon.png`;

const STORAGE_KEY = "farmunity_profile_v1";

function toAbs(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${BACKEND}${url.startsWith("/") ? "" : "/"}${url}`;
}

function fixUploadsPathname(pathname) {
  if (!pathname) return pathname;
  if (pathname === "/uploads/farmer_icon.png") {
    return "/uploads/profiles/farmer_icon.png";
  }
  if (/^\/uploads\/profile-/.test(pathname)) {
    return pathname.replace(/^\/uploads\/(profile-)/, "/uploads/profiles/$1");
  }
  if (/^\/uploads\/profile\//.test(pathname)) {
    return pathname.replace(/^\/uploads\/profile\//, "/uploads/profiles/");
  }
  return pathname;
}

function normalizeProfileImage(url) {
  if (!url) return "";
  try {
    if (/^https?:\/\//i.test(url)) {
      const u = new URL(url);
      u.pathname = fixUploadsPathname(u.pathname);
      return u.href;
    }
    let path = url.startsWith("/") ? url : `/${url}`;
    path = fixUploadsPathname(path);
    return toAbs(path);
  } catch {
    return toAbs(url);
  }
}

function withCacheBust(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("_cb", Date.now().toString());
    return u.href;
  } catch {
    const abs = toAbs(url);
    try {
      const u2 = new URL(abs);
      u2.searchParams.set("_cb", Date.now().toString());
      return u2.href;
    } catch {
      return abs;
    }
  }
}

async function dataURLtoFile(dataURL, fileName = "avatar.png") {
  const res = await fetch(dataURL);
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type || "image/png" });
}

export default function ProfileSettings() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    email: "",
    nickname: "",
    interests: "",
    avatarPreview: "",
    avatarUrl: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);

  const [avatarDirty, setAvatarDirty] = useState(false);
  const [nicknameDirty, setNicknameDirty] = useState(false);
  const [interestsDirty, setInterestsDirty] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  const avatarInputRef = useRef(null);

  const token = useMemo(() => localStorage.getItem("accessToken") || "", []);
  useEffect(() => {
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    let mounted = true;
    async function fetchMe() {
      try {
        setLoading(true);
        const res = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const me = res?.data?.data || {};

        const fixedUrl = normalizeProfileImage(me.profileImage);

        const next = {
          email: me.email || "",
          nickname: me.nickname ?? "",
          interests: me.interestCrops ?? "",
          avatarPreview: "",
          avatarUrl: fixedUrl ? withCacheBust(fixedUrl) : "",
        };
        if (mounted) {
          setProfile(next);
          setAvatarFile(null);
          setAvatarDirty(false);
          setNicknameDirty(false);
          setInterestsDirty(false);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
      } catch (err) {
        console.warn("[GET /users/me] error:", err);
        alert(err?.response?.data?.message || "프로필 정보를 불러오지 못했습니다.");
      } finally {
        mounted && setLoading(false);
      }
    }
    if (token) fetchMe();
    return () => { mounted = false; };
  }, [token]);

  const handleAvatarFileChange = async ({ preview, file }) => {
    setLoadingAvatar(true);
    try {
      setProfile((p) => ({ ...p, avatarPreview: preview || "" }));
      setAvatarFile(file || null);
      setAvatarDirty(true);
    } finally {
      setLoadingAvatar(false);
    }
  };

  const handleAvatarChange = () => {
    if (!avatarInputRef.current) return;
    avatarInputRef.current.value = ""; // 같은 파일 재선택 허용
    avatarInputRef.current.click();
  };

  const handleAvatarDelete = () => {
    setProfile((p) => ({
      ...p,
      avatarPreview: "",
      avatarUrl: withCacheBust(DEFAULT_AVATAR),
    }));
    setAvatarFile(null);
    setAvatarDirty(true);
  };

  const handleNicknameChange = (e) => {
    setProfile((p) => ({ ...p, nickname: e.target.value }));
    setNicknameDirty(true);
  };
  const handleInterestsChange = (e) => {
    setProfile((p) => ({ ...p, interests: e.target.value }));
    setInterestsDirty(true);
  };

  const handleSave = async () => {
    const anythingDirty = avatarDirty || nicknameDirty || interestsDirty;
    if (!anythingDirty) {
      alert("변경된 내용이 없습니다.");
      return;
    }
    setLoading(true);
    try {
      let newAvatarUrl = profile.avatarUrl;

      if (avatarDirty) {
        if (avatarFile instanceof File) {
          const formData = new FormData();
          formData.append("image", avatarFile);

          const imgRes = await api.post("/users/me/image", formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });

          const urlRaw =
            imgRes?.data?.data?.profileImage ||
            imgRes?.data?.data?.url ||
            imgRes?.data?.profileImage ||
            imgRes?.data?.url || "";

          const normalized = normalizeProfileImage(urlRaw);
          newAvatarUrl = normalized ? withCacheBust(normalized) : profile.avatarUrl;
        } else if (profile.avatarPreview && profile.avatarPreview.startsWith("data:")) {
          const file = await dataURLtoFile(profile.avatarPreview, "avatar.png");
          const formData = new FormData();
          formData.append("image", file);

          const imgRes = await api.post("/users/me/image", formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });

          const urlRaw =
            imgRes?.data?.data?.profileImage ||
            imgRes?.data?.data?.url ||
            imgRes?.data?.profileImage ||
            imgRes?.data?.url || "";

          const normalized = normalizeProfileImage(urlRaw);
          newAvatarUrl = normalized ? withCacheBust(normalized) : profile.avatarUrl;
        } else if (profile.avatarPreview === "") {
          newAvatarUrl = withCacheBust(DEFAULT_AVATAR);
        }
      }

      if (nicknameDirty || interestsDirty) {
        const payload = {};
        if (nicknameDirty) payload.nickname = profile.nickname;
        if (interestsDirty) payload.interestCrops = profile.interests;

        await api.patch("/users/me", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const next = {
        ...profile,
        avatarUrl: newAvatarUrl,
        avatarPreview: "",
      };
      setProfile(next);
      setAvatarFile(null);
      setAvatarDirty(false);
      setNicknameDirty(false);
      setInterestsDirty(false);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

      alert("프로필이 저장되었습니다.");
    } catch (err) {
      console.warn("[SAVE PROFILE] error:", err);
      alert(err?.response?.data?.message || "프로필 저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved) {
      setProfile({ ...saved, avatarPreview: "" });
    } else {
      setProfile({
        email: "",
        nickname: "",
        interests: "",
        avatarPreview: "",
        avatarUrl: "",
      });
    }
    setAvatarFile(null);
    setAvatarDirty(false);
    setNicknameDirty(false);
    setInterestsDirty(false);
  };

  const displayAvatar = profile.avatarPreview || profile.avatarUrl || withCacheBust(DEFAULT_AVATAR);

  const anythingDirty = avatarDirty || nicknameDirty || interestsDirty;


  return (
    <section className="settings-wrap">
      <h2 className="settings-title">프로필 편집</h2>

      <div className="settings-grid">
        <div className="settings-col-left">
          <div className="avatar-card">
            <AvatarUploader
              id="avatar"
              label="프로필 이미지"
              value={displayAvatar}
              fallback={withCacheBust(DEFAULT_AVATAR)}
              onChange={handleAvatarFileChange}
              disabled={loading || loadingAvatar}
              inputRef={avatarInputRef}
            />

            <div className="avatar-actions">
              <button
                type="button"
                className="link green"
                onClick={handleAvatarChange}
                disabled={loading || loadingAvatar}
              >
                바꾸기
              </button>
              <span className="divider">·</span>
              <button
                type="button"
                className="link danger"
                onClick={handleAvatarDelete}
                disabled={loading || loadingAvatar}
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>

        <div className="settings-col-right">
          <div className="settings-row">
            <label className="settings-label" htmlFor="farmunityId">Farmunity ID</label>
            <input
              id="farmunityId"
              name="farmunityId"
              className="settings-input"
              readOnly
              value={profile.email || "-"}
              placeholder="-"
            />
          </div>

          <div className="settings-row">
            <label className="settings-label" htmlFor="nickname">닉네임</label>
            <input
              id="nickname"
              name="nickname"
              className="settings-input"
              value={profile.nickname}
              onChange={handleNicknameChange}
              placeholder="닉네임을 입력하세요"
              disabled={loading}
            />
          </div>

          <label className="settings-label" htmlFor="interests">관심 작물</label>
          <textarea
            id="interests"
            name="interests"
            className="settings-textarea"
            rows={6}
            placeholder="예) 토마토, 딸기, 상추…"
            value={profile.interests}
            onChange={handleInterestsChange}
            disabled={loading}
          />

          <div className="settings-actions">
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={!anythingDirty || loading}
            >
              {loading ? "저장 중..." : "저장"}
            </button>
            <button className="btn-ghost" onClick={handleCancel} disabled={loading}>
              취소
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
