import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 403) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
          const msg = data?.message || "Forbidden access! Unauthorized access attempt detected.";
          window.location.href = `/login?warning=${encodeURIComponent(msg)}`;
        }
      } else if (status === 401 || (status === 404 && data?.message === "User not found!")) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
