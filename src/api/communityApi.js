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
      console.log('API 요청 시작:', {
        url: `/posts/${postId}/comments`,
        postId: postId,
        commentData: commentData
      });
      
      const response = await api.post(`/posts/${postId}/comments`, commentData);
      
      console.log('API 응답 성공:', response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      console.error('에러 상세:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          headers: error.config?.headers
        }
      });
      
      // 서버 에러 메시지가 있다면 표시
      if (error.response?.data?.message) {
        console.error('서버 에러 메시지:', error.response.data.message);
      }
      
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
};
