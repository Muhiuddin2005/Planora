import { axiosInstance } from "@/lib/axiosInstance";

export const getMyInvitations = async () => {
  const response = await axiosInstance.get("/invitations/my-invites");
  return response.data;
};

export const respondToInvitation = async (invitationId: string, status: "ACCEPTED" | "DECLINED") => {
  const response = await axiosInstance.patch(`/invitations/${invitationId}/respond`, { status });
  return response.data;
};

export const sendInvitation = async (data: { eventId: string; email: string }) => {
  const response = await axiosInstance.post("/invitations", data);
  return response.data;
};
