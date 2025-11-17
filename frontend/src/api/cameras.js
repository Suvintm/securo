import axiosClient from "./axiosClient";

// Fetch all cameras
export const getCameras = async () => {
  const res = await axiosClient.get("/cameras");
  return res.data;
};

// Create new camera
export const createCamera = async (data) => {
  const res = await axiosClient.post("/cameras", data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

// Start camera
export const startCamera = async (cameraId) => {
  const res = await axiosClient.post(`/cameras/${cameraId}/start`);
  return res.data;
};

// Stop camera
export const stopCamera = async (cameraId) => {
  const res = await axiosClient.post(`/cameras/${cameraId}/stop`);
  return res.data;
};
