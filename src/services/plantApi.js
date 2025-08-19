// src/services/plantApi.js
import api from "../api/axios";

/**
 * 내 식물 목록 가져오기
 * BE 예시: GET /plants/my  -> [{id, name, species, thumbnailUrl}, ...]
 * 실패 시 목데이터 반환
 */
export async function getMyPlants() {
  try {
    const { data } = await api.get("/plants/my");
    return data?.data || [];
  } catch (e) {
    // fallback mock
    return [
      { id: "p1", name: "상추 1호", species: "Lettuce", thumbnailUrl: "/mock/lettuce.jpg" },
      { id: "p2", name: "토마토 A", species: "Tomato", thumbnailUrl: "/mock/tomato.jpg" },
      { id: "p3", name: "고추 B", species: "Chili", thumbnailUrl: "/mock/chili.jpg" },
    ];
  }
}
