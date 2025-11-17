import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import toast from "react-hot-toast";
import { playSound } from "../utils/soundNotification"; // ✅ Import sound function
import { useModelContext } from "../context/ModelContext";


// ✅ Icon mapping
const modelIcons = {
  people: { icon: "Users", color: "text-green-500" },
  weapon: { icon: "ShieldAlert", color: "text-red-500" },
  fire: { icon: "Flame", color: "text-orange-500" },
  shoplifting: { icon: "ShoppingBag", color: "text-purple-500" },
  crowd: { icon: "UsersRound", color: "text-blue-500" },
  accident: { icon: "Car", color: "text-yellow-500" },
  vandalism: { icon: "Hammer", color: "text-pink-500" },
};

const getIcon = (iconName) => Icons[iconName] || Icons.AlertTriangle;

const ModelCard = ({ title }) => {
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { updateModelStatus } = useModelContext();


  const modelName = title.toLowerCase().includes("people")
    ? "people"
    : title.toLowerCase().includes("weapon")
    ? "weapon"
    : title.toLowerCase().includes("fire")
    ? "fire"
    : title.toLowerCase().includes("shoplifting")
    ? "shoplifting"
    : title.toLowerCase().includes("crowd")
    ? "crowd"
    : title.toLowerCase().includes("accident")
    ? "Accident"
    : title.toLowerCase().includes("vandalism")
    ? "Vandalism"
    : "";

  const key = Object.keys(modelIcons).find((k) =>
    modelName.toLowerCase().includes(k)
  );
  const { icon: iconName, color } = modelIcons[key] || modelIcons.people;
  const Icon = getIcon(iconName);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axiosClient.get("/pipeline/models/status");
        if (res.data && res.data[modelName] !== undefined) {
          setIsActive(res.data[modelName]);
        }
      } catch (err) {
        console.error("Failed to fetch model status:", err);
      }
    };
    fetchStatus();
  }, [modelName]);

  const toggleModel = async () => {
    setIsLoading(true);
    const action = isActive ? "deactivate" : "activate";
    const actionText = isActive ? "Deactivating" : "Activating";

    // Show loading toast
    const toastId = toast.loading(`${actionText} ${title}...`, {
      style: {
        background: "white",
        color: "black",
        border: "2px solid #22c55e",
        fontWeight: "600",
      },
    });

    try {
      await axiosClient.post(`/pipeline/model/${modelName}/${action}`);
      setIsActive(!isActive);
      updateModelStatus(modelName, title, !isActive); // ✅ Sync context

      toast.success(
        `${title} ${isActive ? "deactivated" : "activated"} successfully!`,
        {
          id: toastId,
          style: {
            background: "white",
            color: "black",
            border: "2px solid #22c55e",
            fontWeight: "600",
            boxShadow: "0 4px 10px rgba(0, 255, 100, 0.3)",
          },
          icon: isActive ? (
            <Icons.XCircle className="text-red-500" />
          ) : (
            <Icons.CheckCircle className="text-green-600" />
          ),
        }
      );

      // ✅ Play sound for success
      playSound(isActive ? "stop" : "success");
    } catch (err) {
      console.error("Error toggling model:", err);
      toast.error(`Failed to ${action} ${title}`, {
        id: toastId,
        style: {
          background: "white",
          color: "red",
          fontWeight: "600",
          border: "2px solid red",
        },
      });
      playSound("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      transition={{ type: "spring", stiffness: 150 }}
      className={`relative bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-xl border ${
        isActive ? "border-green-500/50" : "border-gray-700"
      } hover:shadow-lg hover:shadow-blue-800/20 transition-all`}
    >
      
      <div className="flex flex-col items-center text-center">
        <div
          className={`p-3 rounded-full bg-gray-800/60 border border-gray-700 shadow-inner mb-3`}
        >
          <Icon size={42} className={color} />
        </div>

        <h3 className="text-xl font-bold mb-2 capitalize tracking-wide">
          {title}
        </h3>

        <p
          className={`text-sm mb-4 font-medium ${
            isActive ? "text-green-400" : "text-red-400"
          }`}
        >
          Status: {isActive ? "Active" : "Inactive"}
        </p>

        <button
          onClick={toggleModel}
          disabled={isLoading}
          className={`px-5 py-2 rounded-full font-semibold w-full flex items-center justify-center gap-2 transition-all shadow-md ${
            isActive
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          } text-white`}
        >
          {isLoading ? (
            <>
              <Icons.Loader2 className="animate-spin" />
              <span className="animate-pulse">
                {isActive ? "Deactivating..." : "Activating..."}
              </span>
            </>
          ) : isActive ? (
            "Deactivate Model"
          ) : (
            "Activate Model"
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ModelCard;
