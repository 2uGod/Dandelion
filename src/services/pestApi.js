// src/services/pestApi.js
import axios from 'axios';

const API_URL = "http://127.0.0.1:5000";

/**
 * 이미지 파일을 받아 AI 서버에 예측을 요청하는 함수
 * @param {File} file - 사용자가 업로드한 이미지 파일
 * @returns {Promise<object>} - 예측 결과 객체
 */
export async function detectPest(file) {
  const formData = new FormData();
  formData.append("file", file); 
 
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "알 수 없는 서버 오류" }));
    throw new Error(errorData.error || "서버 요청에 실패했습니다.");
  }

  return response.json();
}



const NEST_API_URL = "http://localhost:3000";

/**
 * 텍스트를 받아 NestJS 서버에 질병 진단을 요청하는 함수
 * @param {string} prompt - 사용자가 입력한 채팅 메시지
 * @returns {Promise<Array>} - 질병 정보가 담긴 배열
 */
export async function askAiChat(prompt) {
  try {
    const response = await axios.post(`${NEST_API_URL}/ai/symptom-check`, {
      prompt,
    });
    return response.data;
  } catch (error) {
    console.error("AI 채팅 요청 실패:", error);
    throw error;
  }
}