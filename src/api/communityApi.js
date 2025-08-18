import api from './axios';

export const communityApi = {
  // 게시글 목록 조회
  getPosts: async (params = {}) => {
    try {
      const response = await api.get('/posts', { params });
      return response.data;
    } catch (error) {
      console.error('게시글 목록 조회 실패:', error);
      throw error;
    }
  },

  // 게시글 상세 조회
  getPost: async (id) => {
    try {
      const response = await api.get(`/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error('게시글 상세 조회 실패:', error);
      throw error;
    }
  },

  // 게시글 작성
  createPost: async (postData) => {
    try {
      const response = await api.post('/posts', postData);
      return response.data;
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      throw error;
    }
  },

  // 게시글 좋아요
  likePost: async (id) => {
    try {
      const response = await api.post(`/posts/${id}/like`);
      return response.data;
    } catch (error) {
      console.error('좋아요 실패:', error);
      throw error;
    }
  },

  // 댓글 목록 조회
  getComments: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('댓글 목록 조회 실패:', error);
      throw error;
    }
  },

  // 댓글 작성
  createComment: async (postId, commentData) => {
    try {
      const response = await api.post(`/posts/${postId}/comments`, commentData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      throw error;
    }
  },

  // 댓글 수정
  updateComment: async (commentId, commentData) => {
    try {
      const response = await api.patch(`/comments/${commentId}`, commentData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      throw error;
    }
  },

  // 댓글 삭제
  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/comments/${commentId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      throw error;
    }
  },

  // 게시글 수정
  updatePost: async (id, postData) => {
    try {
      const response = await api.patch(`/posts/${id}`, postData);
      return response.data;
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      throw error;
    }
  },

  // 게시글 삭제
  deletePost: async (id) => {
    try {
      const response = await api.delete(`/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      throw error;
    }
  },

  // 좋아요 상태 조회
  getLikeStatus: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('좋아요 상태 조회 실패:', error);
      throw error;
    }
  },

  // 좋아요 취소 (토글 방식이므로 사용 안함)
  // unlikePost: 백엔드가 POST 토글 방식으로 구현되어 있으므로 불필요

  // === 예약 관련 API ===
  
  // 예약 신청
  createReservation: async (postId, reservationData) => {
    try {
      const response = await api.post(`/reservations/posts/${postId}`, reservationData);
      return response.data;
    } catch (error) {
      console.error('예약 신청 실패:', error);
      throw error;
    }
  },

  // 내 예약 목록 조회
  getMyReservations: async () => {
    try {
      const response = await api.get('/reservations/my');
      return response.data;
    } catch (error) {
      console.error('내 예약 목록 조회 실패:', error);
      throw error;
    }
  },

  // 받은 예약 목록 조회 (전문가용)
  getReceivedReservations: async () => {
    try {
      const response = await api.get('/reservations/received');
      return response.data;
    } catch (error) {
      console.error('받은 예약 목록 조회 실패:', error);
      throw error;
    }
  },

  // 예약 취소
  cancelReservation: async (reservationId) => {
    try {
      const response = await api.patch(`/reservations/${reservationId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('예약 취소 실패:', error);
      throw error;
    }
  },

  // 예약 상태 변경 (전문가용 - 승인/거절)
  updateReservationStatus: async (reservationId, status) => {
    try {
      const response = await api.patch(`/reservations/${reservationId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('예약 상태 변경 실패:', error);
      throw error;
    }
  }
};
