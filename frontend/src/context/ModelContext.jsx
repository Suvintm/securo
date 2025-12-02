import React, { createContext, useState, useContext, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const ModelContext = createContext();

export const useModelContext = () => useContext(ModelContext);

export const ModelProvider = ({ children }) => {
  const [activeModels, setActiveModels] = useState([]); // e.g. [{ name: "fire", title: "Fire Detection" }]

  // ✅ Fetch initial status on mount
  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        const res = await axiosClient.get("/pipeline/models/status");
        if (res.data) {
          const initialActive = Object.keys(res.data)
            .filter((key) => res.data[key])
            .map((key) => ({
              name: key,
              title: key.charAt(0).toUpperCase() + key.slice(1) + " Detection",
            }));
          setActiveModels(initialActive);
        }
      } catch (err) {
        console.error("Failed to fetch initial model status:", err);
      }
    };
    fetchInitialStatus();
  }, []);

  const updateModelStatus = (modelName, title, isActive) => {
    setActiveModels((prev) => {
      if (isActive) {
        // ✅ Add model if not already present
        if (!prev.some((m) => m.name === modelName)) {
          return [...prev, { name: modelName, title }];
        }
        return prev;
      } else {
        // 🚫 Remove model if deactivated
        return prev.filter((m) => m.name !== modelName);
      }
    });
  };

  const setAllModels = (modelsList) => {
    setActiveModels(modelsList);
  };

  return (
    <ModelContext.Provider value={{ activeModels, updateModelStatus, setAllModels }}>
      {children}
    </ModelContext.Provider>
  );
};
