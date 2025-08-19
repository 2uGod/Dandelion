import api from './axios';

export const scheduleApi = {
  // 스케줄 목록 조회
  getSchedules: async (params = {}) => {
    try {
      const response = await api.get('/schedules', { params });
      return response.data;
    } catch (error) {
      console.error('스케줄 목록 조회 실패:', error);
      throw error;
    }
  },

  // 스케줄 생성
  createSchedule: async (payload) => {
    try {
      // API 명세에 따라 multipart/form-data 형식 사용
      if (payload instanceof FormData) {
        const response = await api.post('/schedules', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
      }
      
      // 일반 객체인 경우 FormData로 변환
      const formData = new FormData();
      Object.keys(payload).forEach(key => {
        if (payload[key] !== null && payload[key] !== undefined) {
          formData.append(key, payload[key]);
        }
      });
      
      const response = await api.post('/schedules', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('스케줄 생성 실패:', error);
      throw error;
    }
  },

  // 스케줄 수정
  updateSchedule: async (id, payload) => {
    try {
      // API 명세에 따라 multipart/form-data 형식 사용
      const formData = new FormData();
      
      // payload가 FormData인지 확인
      if (payload instanceof FormData) {
        const response = await api.patch(`/schedules/${id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
      }
      
      // 일반 객체인 경우 FormData로 변환
      Object.keys(payload).forEach(key => {
        if (payload[key] !== null && payload[key] !== undefined) {
          formData.append(key, payload[key]);
        }
      });
      
      const response = await api.patch(`/schedules/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('스케줄 수정 실패:', error);
      throw error;
    }
  },

  // 스케줄 삭제
  deleteSchedule: async (id) => {
    try {
      const response = await api.delete(`/schedules/${id}`);
      return response.data;
    } catch (error) {
      console.error('스케줄 삭제 실패:', error);
      throw error;
    }
  },

  // 일정 색상 변경
  updateScheduleColor: async (id, color) => {
    try {
      const response = await api.patch(`/schedules/${id}/color`, { color });
      return response.data;
    } catch (error) {
      console.error('스케줄 색상 변경 실패:', error);
      throw error;
    }
  },

  // 특정 작물의 캘린더 조회
  getCropCalendar: async (cropId, params = {}) => {
    try {
      const response = await api.get(`/schedules/crop/${cropId}`, { params });
      return response.data;
    } catch (error) {
      console.error('작물별 캘린더 조회 실패:', error);
      throw error;
    }
  },

  // 날짜 범위 일정/작물일지 조회  
  getSchedulesByDateRange: async (startDate, endDate, cropId = null) => {
    try {
      const params = { startDate, endDate };
      if (cropId) params.cropId = cropId;
      const response = await api.get('/schedules/date-range', { params });
      return response.data;
    } catch (error) {
      console.error('날짜 범위 조회 실패:', error);
      throw error;
    }
  },

  // 특정 날짜 일정/작물일지 조회
  getSchedulesByDate: async (date, cropId = null) => {
    try {
      const params = cropId ? { cropId } : {};
      const response = await api.get(`/schedules/date/${date}`, { params });
      return response.data;
    } catch (error) {
      console.error('특정 날짜 조회 실패:', error);
      throw error;
    }
  },

  // 메인 캘린더 조회 (통합)
  getMainCalendar: async (year = null, month = null) => {
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      const response = await api.get('/schedules/main', { params });
      return response.data;
    } catch (error) {
      console.error('메인 캘린더 조회 실패:', error);
      throw error;
    }
  }
};

// 개별 export 함수들 (하위 호환성을 위해 유지)
export const getSchedules = scheduleApi.getSchedules;
export const createSchedule = scheduleApi.createSchedule;
export const updateSchedule = scheduleApi.updateSchedule;
export const deleteSchedule = scheduleApi.deleteSchedule;
export const updateScheduleColor = scheduleApi.updateScheduleColor;
export const getCropCalendar = scheduleApi.getCropCalendar;
export const getSchedulesByDateRange = scheduleApi.getSchedulesByDateRange;
export const getSchedulesByDate = scheduleApi.getSchedulesByDate;
export const getMainCalendar = scheduleApi.getMainCalendar;