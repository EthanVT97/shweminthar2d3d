import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  balance: string;
  referralCode: string;
  commission?: string;
  isAdmin?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const res = await apiRequest("POST", "/api/auth/login", { username, password });
    return res.json();
  },

  register: async (data: any): Promise<AuthResponse> => {
    const res = await apiRequest("POST", "/api/auth/register", data);
    return res.json();
  },

  getProfile: async (): Promise<{ user: User }> => {
    const res = await apiRequest("GET", "/api/auth/me");
    return res.json();
  },
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem("authToken", token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem("authToken");
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
