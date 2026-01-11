/**
 * Reviews API
 * @module features/reviews/api/reviews-api
 */

import apiClient from '@/lib/axios';

export const reviewsApi = {
  // TODO: Implement reviews API methods
  getReviews: async (productId: string) => {
    return apiClient.get(`/reviews/${productId}`);
  },
  
  createReview: async (productId: string, review: any) => {
    return apiClient.post(`/reviews/${productId}`, review);
  },
  
  updateReview: async (reviewId: string, review: any) => {
    return apiClient.put(`/reviews/${reviewId}`, review);
  },
  
  deleteReview: async (reviewId: string) => {
    return apiClient.delete(`/reviews/${reviewId}`);
  },
};
