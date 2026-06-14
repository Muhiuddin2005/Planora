import { axiosInstance } from "@/lib/axiosInstance";

export const getPublicEvents = async () => {
  const response = await axiosInstance.get("/events");
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


