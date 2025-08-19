// src/services/pestApi.js

// AI 서버 주소가 올바르게 설정되어 있습니다.
const API_URL = "http://127.0.0.1:5000";

/**
 * 이미지 파일을 받아 AI 서버에 예측을 요청하는 함수
 * @param {File} file - 사용자가 업로드한 이미지 파일
 * @returns {Promise<object>} - 예측 결과 객체
 */
export async function detectPest(file) {
  const formData = new FormData();
  // 'file'이라는 키로 이미지 파일을 담는 부분도 정확합니다.
  formData.append("file", file); 

  // Flask 서버의 '/predict' 주소로 요청을 보내는 부분도 완벽합니다.
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  // 서버에서 에러가 발생했을 때 처리하는 로직도 잘 구현되어 있습니다.
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "알 수 없는 서버 오류" }));
    throw new Error(errorData.error || "서버 요청에 실패했습니다.");
  }

  // 성공 시, 결과를 JSON 형태로 반환합니다.
  return response.json();
}