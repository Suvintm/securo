import axiosClient from "./axiosClient";

export const activateModel = async (modelName) => {
    return await axiosClient.post(`/pipeline/model/${modelName}/activate`);
};

export const deactivateModel = async (modelName) => {
    return await axiosClient.post(`/pipeline/model/${modelName}/deactivate`);
};

export const activateAllModels = async () => {
    return await axiosClient.post("/pipeline/models/activate_all");
};

export const deactivateAllModels = async () => {
    return await axiosClient.post("/pipeline/models/deactivate_all");
};

export const getModelStatus = async () => {
    return await axiosClient.get("/pipeline/models/status");
};
