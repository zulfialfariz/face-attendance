// src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menambahkan Authorization header otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // token disimpan waktu login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
