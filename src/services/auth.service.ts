import { axiosInstance } from "@/lib/axiosInstance";

export const loginUser = async (data: any) => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

export const registerUser = async (data: any) => {
  const response = await axiosInstance.post("/auth/register", data);
  return response.data;
};

export const verifyEmail = async (data: { email: string, otp: string }) => {
  const response = await axiosInstance.post("/auth/verify-email", data);
  return response.data;
};

export const resendOtp = async (data: { email: string }) => {
  const response = await axiosInstance.post("/auth/resend-otp", data);
  return response.data;
};

export const forgotPassword = async (data: { email: string }) => {
  const response = await axiosInstance.post("/auth/forgot-password", data);
  return response.data;
};

export const resetPassword = async (data: any) => {
  const response = await axiosInstance.post("/auth/reset-password", data);
  return response.data;
};

export const changePassword = async (data: any) => {
  const response = await axiosInstance.patch("/auth/change-password", data);
  return response.data;
};
