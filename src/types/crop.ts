// src/types/crop.ts
export type CropCreateDto = {
  name: string; // ex) "토마토"  (필수)
  variety?: string; // "방울토마토"
  plantingDate?: string; // "2024-03-15" 또는 ISO 문자열
  expectedHarvestDate?: string; // "2024-08-15"
  status?: "growing" | "planned" | "harvested" | string;
  description?: string; // 메모/설명
};

// 서버 응답(201)의 핵심만 타입화 — 필요시 더 확장
export type Crop = {
  id: number;
  name: string;
  variety?: string;
  plantingDate?: string;
  expectedHarvestDate?: string;
  status?: string;
  description?: string;
  createdAt?: string;
  logCount?: number;
  // user 등 추가 필드는 필요할 때 확장
};
