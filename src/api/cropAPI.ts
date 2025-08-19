// src/api/cropAPI.ts
import api from "./axios"; // axios.js에서 export한 api 인스턴스

// 작물 등록
export const createCrop = (payload) => {
  return api.post("/crops", payload).then((res) => res.data);
};

// 내 작물 목록 조회
export const getMyCrops = () => {
  return api.get("/crops").then((res) => res.data);
};

// 특정 작물 조회
export const getCropById = (id) => {
  return api.get(`/crops/${id}`).then((res) => res.data);
};

// 작물 수정
export const updateCrop = (id, payload) => {
  return api.patch(`/crops/${id}`, payload).then((res) => res.data);
};

// 작물 삭제
export const deleteCrop = (id) => {
  return api.delete(`/crops/${id}`).then((res) => res.data);
};
