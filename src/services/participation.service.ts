import { axiosInstance } from "@/lib/axiosInstance";

export const joinEventRequest = async (eventId: string) => {
  const response = await axiosInstance.post(`/participations/${eventId}/join`);
  return response.data;
};

export const initiatePayment = async (eventId: string) => {
  const response = await axiosInstance.post(`/payments/${eventId}/initiate`);
  return response.data;
};

export const updateParticipantStatus = async (participationId: string, status: string) => {
  const response = await axiosInstance.patch(`/participations/${participationId}/status`, { status });
  return response.data;
};
