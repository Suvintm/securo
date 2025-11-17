import React, { createContext, useState, useContext } from "react";

const ModelContext = createContext();

export const useModelContext = () => useContext(ModelContext);

export const ModelProvider = ({ children }) => {
  const [activeModels, setActiveModels] = useState([]); // e.g. [{ name: "fire", title: "Fire Detection" }]

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

  return (
    <ModelContext.Provider value={{ activeModels, updateModelStatus }}>
      {children}
    </ModelContext.Provider>
  );
};
