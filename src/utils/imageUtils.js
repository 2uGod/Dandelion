const BACKEND = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * 프로필 이미지 경로를 올바른 URL로 변환
 * @param {string} profileImagePath - API에서 받은 프로필 이미지 경로
 * @returns {string} - 완전한 이미지 URL
 */
export const getProfileImageUrl = (profileImagePath) => {
  if (!profileImagePath) return "";
  
  // API에서 /uploads/profile-xxx 형태로 오는 경우
  // /uploads/profiles/profile-xxx 형태로 변환
  const correctedPath = profileImagePath.replace('/uploads/', '/uploads/profiles/');
  
  return `${BACKEND}${correctedPath}`;
};

/**
 * 기본 프로필 이미지 URL 반환
 * @returns {string} - 기본 프로필 이미지 URL
 */
export const getDefaultProfileImageUrl = () => {
  return `${BACKEND}/uploads/profiles/farmer_icon.png`;
};