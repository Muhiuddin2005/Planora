import { axiosInstance } from "@/lib/axiosInstance";

export const fetchMyTickets = async () => {
  const response = await axiosInstance.get("/participations/my-tickets");
  return response.data;
};
