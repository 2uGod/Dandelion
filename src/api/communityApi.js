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
      return response.data;
    } catch (error) {
      console.error('댓글 목록 조회 실패:', error);
      throw error;
    }
  },

  // 댓글 작성
  createComment: async (postId, commentData) => {
    try {
      const response = await api.post(`/posts/${postId}/comments`, commentData);
      return response.data;
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      throw error;
    }
  }
};