"use server";

import { cookies } from "next/headers";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const getServerAuthHeader = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const fetchDashboardData = async () => {
  try {
    const config = await getServerAuthHeader();
    
    const [hostedRes, joinedRes] = await Promise.all([
      axios.get(`${API_URL}/events/hosted`, config),
      axios.get(`${API_URL}/participations/my-requests`, config)
    ]);

    return {
      success: true,
      hostedEvents: hostedRes.data.data || [],
      joinedEvents: joinedRes.data.data || []
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: err.response?.data?.message || "Failed to fetch dashboard data"
    };
  }
};
