/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor for adding the JWT token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("quizUserToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("quizUserToken");
      sessionStorage.removeItem("quizUserLoggedIn");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth Services
export const authService = {
  register: (userData: any) => api.post("/auth/register", userData),
  login: (credentials: any) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/profile"),
};

// Quiz Services
export const quizService = {
  generate: (topicData: any) => api.post("/quizzes/generate", topicData),
  generateFromFile: (formData: FormData) => 
    api.post("/quizzes/generate-from-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getAll: () => api.get("/quizzes"),
  getMyQuizzes: () => api.get("/quizzes/my-history"),
  getById: (id: string) => api.get(`/quizzes/${id}`),
};

// Attempt Services
export const attemptService = {
  submit: (attemptData: any) => api.post("/attempts/submit", attemptData),
  getHistory: () => api.get("/attempts/my-history"),
  getLeaderboard: (quizId?: string) => api.get("/attempts/leaderboard", { params: { quizId } }),
  getStats: () => api.get("/attempts/stats"),
};
