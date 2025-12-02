import axiosClient from "./axiosClient";

export const registerUser = async (data) => {
  const res = await axiosClient.post("/auth/register", data, {
    headers: { "Content-Type": "application/json" },
  });
  // Store token for cross-domain auth
  if (res.data.token) {
    localStorage.setItem("accessToken", res.data.token);
  }
  return res.data.user || res.data;
};

export const loginUser = async (data) => {
  const res = await axiosClient.post("/auth/login", data, {
    headers: { "Content-Type": "application/json" },
  });
  // Store token for cross-domain auth
  if (res.data.token) {
    localStorage.setItem("accessToken", res.data.token);
  }
  return res.data.user || res.data;
};

export const getCurrentUser = async () => {
  const res = await axiosClient.get("/auth/me");
  return res.data;
};

export const logoutUser = async () => {
  const res = await axiosClient.post("/auth/logout");
  // Clear token from localStorage
  localStorage.removeItem("accessToken");
  return res.data;
};
