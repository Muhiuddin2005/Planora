import { axiosInstance } from "@/lib/axiosInstance";

export const getEventReviews = async (eventId: string) => {
  const response = await axiosInstance.get(`/reviews/${eventId}`);
  return response.data;
};

export const submitReview = async (eventId: string, data: { rating: number; comment?: string }) => {
  const response = await axiosInstance.post(`/reviews/${eventId}`, data);
  return response.data;
};

export const deleteReview = async (reviewId: string) => {
  const response = await axiosInstance.delete(`/reviews/${reviewId}`);
  return response.data;
};

export const updateReview = async (reviewId: string, data: { rating: number; comment?: string }) => {
  const response = await axiosInstance.put(`/reviews/${reviewId}`, data);
  return response.data;
};

