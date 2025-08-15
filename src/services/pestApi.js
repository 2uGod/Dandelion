// src/services/pestApi.js
import api from "../api/axios";

/**
 * 특정 species에 대한 주요 병해충 목록
 * BE 예시: GET /pests?species=Tomato
 */
export async function getPestsForSpecies(species) {
  try {
    const { data } = await api.get("/pests", { params: { species } });
    return data?.data || [];
  } catch (e) {
    // fallback mock
    const MOCK = {
      Lettuce: [
        {
          slug: "downy-mildew",
          name: "Downy Mildew",
          koreanName: "노균병",
          shortDescription: "잎 뒷면에 하얀 곰팡이, 습한 환경에서 급속 확산.",
          severity: "mid",
          categories: ["곰팡이", "잎병"],
        },
        {
          slug: "aphids",
          name: "Aphids",
          koreanName: "진딧물",
          shortDescription: "새순에 군집하며 즙액을 빨아 피해.",
          severity: "high",
          categories: ["곤충", "해충"],
        },
      ],
      Tomato: [
        {
          slug: "late-blight",
          name: "Late Blight",
          koreanName: "역병",
          shortDescription: "잎과 과실에 암갈색 수침 반점. 저온다습 시 급속 확산.",
          severity: "high",
          categories: ["곰팡이", "역병"],
        },
        {
          slug: "leaf-miner",
          name: "Leaf Miner",
          koreanName: "굴파리",
          shortDescription: "잎에 뱀 모양의 갤러 흔적.",
          severity: "mid",
          categories: ["곤충", "해충"],
        },
      ],
      Chili: [
        {
          slug: "anthracnose",
          name: "Anthracnose",
          koreanName: "탄저병",
          shortDescription: "과실에 동심원상의 함몰 반점.",
          severity: "high",
          categories: ["곰팡이", "과실병"],
        },
      ],
    };
    return MOCK[species] || [];
  }
}

/**
 * 병해충 검색
 * BE 예시: GET /pests/search?q=...
 */
export async function searchPests(q) {
  try {
    const { data } = await api.get("/pests/search", { params: { q } });
    return data?.data || [];
  } catch (e) {
    // fallback: 간단 통합 검색
    const all = [
      ...await getPestsForSpecies("Lettuce"),
      ...await getPestsForSpecies("Tomato"),
      ...await getPestsForSpecies("Chili"),
    ];
    const LQ = q.toLowerCase();
    return all.filter(
      p =>
        p.name?.toLowerCase().includes(LQ) ||
        p.koreanName?.toLowerCase().includes(LQ) ||
        p.shortDescription?.toLowerCase().includes(LQ)
    );
  }
}

/**
 * 백과사전 상세
 * BE 예시: GET /pests/:slug
 */
export async function getPestDetail(slug) {
  try {
    const { data } = await api.get(`/pests/${slug}`);
    return data?.data;
  } catch (e) {
    // fallback mock 일부
    const MOCK = {
      "aphids": {
        name: "Aphids",
        koreanName: "진딧물",
        description:
          "식물 체액을 빨아 성장 저해와 바이러스 전염의 매개가 될 수 있습니다. 어린 잎과 새순에 집단으로 발생합니다.",
        symptoms: [
          "잎의 말림/왜곡",
          "점성 있는 꿀물(배설물)로 그을음병 유발",
        ],
        cause: "곤충(진딧물) 대발생",
        treatments: [
          "강한 물줄기로 씻어내기",
          "유기농 살충제(비누, 유황 등) 사용",
          "개미 방제(상호 공생 차단)",
        ],
        images: ["/mock/aphids_1.jpg", "/mock/aphids_2.jpg"],
        references: [{ title: "농촌진흥청 자료", url: "https://www.rda.go.kr" }],
      },
      "late-blight": {
        name: "Late Blight",
        koreanName: "역병",
        description:
          "저온다습 환경에서 급속히 번지는 토마토·감자의 대표적 병해. 잎, 줄기, 과실에 수침성 반점을 만듭니다.",
        symptoms: ["암갈색 반점", "하얀 균사", "빠른 고사"],
        cause: "곰팡이성 병원균(Phytophthora infestans)",
        treatments: ["배수 개선", "하엽 제거", "등록 약제 정식 사용"],
        images: ["/mock/blight.jpg"],
        references: [{ title: "FAO Plant Health" }],
      },
    };
    return MOCK[slug] || { name: "알 수 없는 항목", description: "데이터 없음" };
  }
}
