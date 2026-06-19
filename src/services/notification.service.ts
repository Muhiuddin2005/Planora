import { axiosInstance } from "@/lib/axiosInstance";

export const getNotifications = async () => {
  const res = await axiosInstance.get("/notifications");
  return res.data?.data || [];
};

export const markNotificationAsRead = async (id: string) => {
  const res = await axiosInstance.patch(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsAsRead = async () => {
  const res = await axiosInstance.patch("/notifications/read-all");
  return res.data;
};

export const deleteNotification = async (id: string) => {
  const res = await axiosInstance.delete(`/notifications/${id}`);
  return res.data;
};
