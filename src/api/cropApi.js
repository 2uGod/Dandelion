import api from './axios';

export const cropApi = {
  // 작물 등록
  createCrop: async (payload) => {
    try {
      const response = await api.post('/crops', payload);
      return response.data;
    } catch (error) {
      console.error('작물 등록 실패:', error);
      throw error;
    }
  },

  // 내 작물 목록 조회
  getMyCrops: async () => {
    try {
      const response = await api.get('/crops');
      return response.data;
    } catch (error) {
      console.error('작물 목록 조회 실패:', error);
      throw error;
    }
  },

  // 특정 작물 조회
  getCropById: async (id) => {
    try {
      const response = await api.get(`/crops/${id}`);
      return response.data;
    } catch (error) {
      console.error('작물 상세 조회 실패:', error);
      throw error;
    }
  },

  // 작물 수정
  updateCrop: async (id, payload) => {
    try {
      const response = await api.patch(`/crops/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('작물 수정 실패:', error);
      throw error;
    }
  },

  // 작물 삭제
  deleteCrop: async (id) => {
    try {
      const response = await api.delete(`/crops/${id}`);
      return response.data;
    } catch (error) {
      console.error('작물 삭제 실패:', error);
      throw error;
    }
  }
};

// 기존 개별 export 함수들 (하위 호환성을 위해 유지)
export const createCrop = cropApi.createCrop;
export const getMyCrops = cropApi.getMyCrops;
export const getCropById = cropApi.getCropById;
export const updateCrop = cropApi.updateCrop;
export const deleteCrop = cropApi.deleteCrop;