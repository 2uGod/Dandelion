import api from './axios';

export const userApi = {
  // 현재 사용자 정보 조회
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }
      
      const response = await api.get('/users/me', {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      // ProfileSettings.jsx와 동일한 응답 구조로 처리
      const data = response.data?.data || response.data;
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('현재 사용자 정보 조회 실패:', error);
      throw error;
    }
  }
};