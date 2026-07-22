import { axiosInstance } from "@/lib/axiosInstance";

export const getPublicEvents = async (params?: Record<string, any>) => {
  const response = await axiosInstance.get("/events", { params });
  return response.data;
};

export interface CreateEventPayload {
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  isPublic: boolean;
  isPaid: boolean;
  fee: number;
  ownerId: string;
}

export const createNewEvent = async (eventData: CreateEventPayload | FormData) => {
  const headers = eventData instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
  const response = await axiosInstance.post("/events", eventData, { headers });
  return response.data;
};

export const deleteEvent = async (eventId: string) => {
  const response = await axiosInstance.delete(`/events/${eventId}`);
  return response.data;
};

export const updateEvent = async (eventId: string, eventData: Partial<CreateEventPayload>) => {
  const response = await axiosInstance.put(`/events/${eventId}`, eventData);
  return response.data;
};

export const updateEventStatus = async (eventId: string, status: "APPROVED" | "REJECTED", rejectionReason?: string) => {
  const response = await axiosInstance.patch(`/events/${eventId}/status`, { status, rejectionReason });
  return response.data;
};

export const getAdminStats = async () => {
  const response = await axiosInstance.get("/events/admin/stats");
  return response.data?.data;
};
