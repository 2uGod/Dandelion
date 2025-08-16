// src/components/settings/ProfileSettings.jsx
import "./ProfileSettings.css";
import React, { useEffect, useMemo, useState } from "react";
import AvatarUploader from "./AvatarUploader";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

/** 백엔드 호스트
 *  NOTE: .env 에 VITE_API_BASE_URL 를 쓰고 있다면 그대로 두고,
 *        VITE_API_BASE 를 쓰는 프로젝트였다면 변수명을 바꿔주세요.
 */
const BACKEND = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/** 기본 아바타(절대 URL) */
const DEFAULT_AVATAR = `${BACKEND}/uploads/profiles/farmer_icon.png`;

const STORAGE_KEY = "farmunity_profile_v1";

/** URL을 절대경로로 보정 */
function toAbs(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url; // 이미 절대 URL
  return `${BACKEND}${url.startsWith("/") ? "" : "/"}${url}`;
}

/** /uploads 경로 오타/누락을 교정하는 유틸
 *  - /uploads/profile-xxxx → /uploads/profiles/profile-xxxx
 *  - /uploads/profile/...  → /uploads/profiles/...
 *  - /uploads/farmer_icon.png → /uploads/profiles/farmer_icon.png
 */
function fixUploadsPathname(pathname) {
  if (!pathname) return pathname;

  // 기본 아이콘 보정
  if (pathname === "/uploads/farmer_icon.png") {
    return "/uploads/profiles/farmer_icon.png";
  }

  // profiles 디렉터리 누락 보정:
  // 1) /uploads/profile-xxxx 형태 (파일명 앞에 'profiles/' 누락)
  if (/^\/uploads\/profile-/.test(pathname)) {
    return pathname.replace(/^\/uploads\/(profile-)/, "/uploads/profiles/$1");
  }

  // 2) /uploads/profile/filename 형태 (디렉터리명이 profile 인 단수)
  if (/^\/uploads\/profile\//.test(pathname)) {
    return pathname.replace(/^\/uploads\/profile\//, "/uploads/profiles/");
  }

  return pathname;
}

/** 서버가 잘못 내려주는 경로를 절대/상대 가리지 않고 보정 */
function normalizeProfileImage(url) {
  if (!url) return "";
  try {
    if (/^https?:\/\//i.test(url)) {
      const u = new URL(url);
      u.pathname = fixUploadsPathname(u.pathname);
      return u.href;
    }
    // 상대 경로인 경우
    let path = url.startsWith("/") ? url : `/${url}`;
    path = fixUploadsPathname(path);
    return toAbs(path);
  } catch {
    // 실패 시 절대화만
    return toAbs(url);
  }
}

/** 캐시 버스터 쿼리 추가 */
function withCacheBust(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("_cb", Date.now().toString());
    return u.href;
  } catch {
    // 상대경로 형태가 들어오면 절대화 후 다시 시도
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

/** dataURL -> File (백업 경로용) */
async function dataURLtoFile(dataURL, fileName = "avatar.png") {
  const res = await fetch(dataURL);
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type || "image/png" });
}

export default function ProfileSettings() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    email: "",            // Farmunity ID (읽기전용)
    nickname: "",
    interests: "",
    avatarPreview: "",    // dataURL/ObjectURL(미리보기)
    avatarUrl: "",        // 서버 URL(보정된 절대)
  });

  // 실제 업로드할 파일 별도 보관
  const [avatarFile, setAvatarFile] = useState(null);

  // 변경 감지
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [nicknameDirty, setNicknameDirty] = useState(false);
  const [interestsDirty, setInterestsDirty] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  const token = useMemo(() => localStorage.getItem("accessToken") || "", []);
  useEffect(() => {
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    }
  }, [token, navigate]);

  // GET /users/me
  useEffect(() => {
    let mounted = true;
    async function fetchMe() {
      try {
        setLoading(true);
        const res = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const me = res?.data?.data || {};

        // 서버 URL 보정 (+ 캐시버스터)
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

  // 아바타 변경(업로더에서 preview + file을 함께 받음)
  const handleAvatarChange = async ({ preview, file }) => {
    setLoadingAvatar(true);
    try {
      setProfile((p) => ({ ...p, avatarPreview: preview || "" }));
      setAvatarFile(file || null);         // 실제 파일 보관
      setAvatarDirty(true);
    } finally {
      setLoadingAvatar(false);
    }
  };

  // 아바타 삭제(즉시 기본 이미지로 표시하고, 저장 시 서버에도 반영)
  const handleAvatarDelete = () => {
    setProfile((p) => ({
      ...p,
      avatarPreview: "",                         // 저장 로직이 기본이미지 분기로 들어가게 함
      avatarUrl: withCacheBust(DEFAULT_AVATAR),  // 화면에서는 즉시 기본 이미지
    }));
    setAvatarFile(null);
    setAvatarDirty(true); // 변경됨 표시
  };

  // 닉네임/관심작물 변경
  const handleNicknameChange = (e) => {
    setProfile((p) => ({ ...p, nickname: e.target.value }));
    setNicknameDirty(true);
  };
  const handleInterestsChange = (e) => {
    setProfile((p) => ({ ...p, interests: e.target.value }));
    setInterestsDirty(true);
  };

  // 저장: 변경된 것만 서버 반영 (이미지 → PATCH 순서)
  const handleSave = async () => {
    const anythingDirty = avatarDirty || nicknameDirty || interestsDirty;
    if (!anythingDirty) {
      alert("변경된 내용이 없습니다.");
      return;
    }
    setLoading(true);
    try {
      let newAvatarUrl = profile.avatarUrl;

      // 1) 아바타 업로드/삭제 반영
      if (avatarDirty) {
        if (avatarFile instanceof File) {
          // 새 파일 업로드
          const formData = new FormData();
          formData.append("image", avatarFile); // 반드시 'image' 키

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
            imgRes?.data?.url ||
            "";

          const normalized = normalizeProfileImage(urlRaw);
          newAvatarUrl = normalized ? withCacheBust(normalized) : profile.avatarUrl;
        } else if (profile.avatarPreview && profile.avatarPreview.startsWith("data:")) {
          // 백업 경로: dataURL만 있을 때 파일 변환 후 업로드
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
            imgRes?.data?.url ||
            "";

          const normalized = normalizeProfileImage(urlRaw);
          newAvatarUrl = normalized ? withCacheBust(normalized) : profile.avatarUrl;
        } else if (profile.avatarPreview === "") {
          // “삭제하기” 후 저장 (삭제 API가 없다면 기본이미지로 대체)
          // 만약 서버에 삭제 API가 있다면 여기서 호출하고 기본이미지로 업데이트하세요.
          newAvatarUrl = withCacheBust(DEFAULT_AVATAR);
        }
      }

      // 2) 프로필 저장(PATCH) — 닉네임/관심작물 중 변경된 것만 보냄
      if (nicknameDirty || interestsDirty) {
        const payload = {};
        if (nicknameDirty) payload.nickname = profile.nickname;
        if (interestsDirty) payload.interestCrops = profile.interests;

        await api.patch("/users/me", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // 3) 상태/로컬 저장 동기화
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

  // 표시 이미지: 미리보기 > 서버 URL(보정+캐시버스터) > 기본 이미지
  const displayAvatar = profile.avatarPreview || profile.avatarUrl || withCacheBust(DEFAULT_AVATAR);

  const anythingDirty = avatarDirty || nicknameDirty || interestsDirty;

  return (
    <section className="settings-wrap">
      <h2 className="settings-title">프로필 편집</h2>

      <div className="settings-grid">
        {/* 왼쪽: 아바타 */}
        <div className="settings-col-left">
          <AvatarUploader
            id="avatar"
            label="프로필 이미지"
            value={displayAvatar}
            fallback={withCacheBust(DEFAULT_AVATAR)}
            onChange={handleAvatarChange}   // { preview, file } 수신
            disabled={loading || loadingAvatar}
          />
          <div className="settings-avatar-actions" style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button
              type="button"
              className="btn-danger"
              onClick={handleAvatarDelete}
              disabled={loading || loadingAvatar}
            >
              삭제하기
            </button>
          </div>
        </div>

        {/* 오른쪽: 폼 */}
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
