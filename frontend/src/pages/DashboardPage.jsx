import React, { useState, useEffect } from "react";
import CamerasPage from "./CamerasPage";
import LiveStreamPage from "./LiveStreamPage";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ModelCard from "../components/ModelCard";
import AnomaliesList from "../components/AnomaliesList";
import Navbar from "../components/Navbar";
import AddCameraModal from "../components/AddCameraModal";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import SkeletonLoader from "../components/SkeletonLoader";
import { useModelContext } from "../context/ModelContext";
import * as Icons from "lucide-react";
import { Camera } from "lucide-react";
import { activateAllModels, deactivateAllModels, getModelStatus } from "../api/pipeline";
import toast from "react-hot-toast";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [activeSection, setActiveSection] = useState("models");
  const [loading, setLoading] = useState(false);
  const { activeModels, setAllModels } = useModelContext();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleTabChange = (tab) => {
    setLoading(true);
    setActiveSection(tab);
    setTimeout(() => setLoading(false), 1200);
  };

  const handleActivateAll = async () => {
    try {
      console.log("Activating all models...");
      await activateAllModels();
      toast.success("All models activated!");

      console.log("Fetching model status...");
      const response = await getModelStatus();
      console.log("Received response:", response);

      const status = response.data || response;
      console.log("Parsed status:", status);

      const newActive = Object.keys(status).filter(k => status[k]).map(k => ({ name: k, title: k.charAt(0).toUpperCase() + k.slice(1) + " Detection" }));
      console.log("Setting active models:", newActive);

      setAllModels(newActive);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error activating all models:", error);
      toast.error("Failed to activate all models");
    }
  };

  const handleDeactivateAll = async () => {
    try {
      await deactivateAllModels();
      toast.success("All models deactivated!");
      setAllModels([]);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error("Failed to deactivate all models");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-gray-950 to-black text-white relative overflow-hidden">
      <Navbar />

      {/* 🌌 Floating Bubbles Background */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-500/80 opacity-80 blur-2xl"
          style={{
            width: Math.random() * 80 + 40,
            height: Math.random() * 80 + 40,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, Math.random() * 80 - 40],
            x: [0, Math.random() * 80 - 40],
            opacity: [0.4, 0.9, 0.4],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8 + Math.random() * 6,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}

      {/* ✅ HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-gray-900 to-black text-white py-10 lg:py-25 shadow-lg">
        {/* Header-specific bubbles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-10 h-10 bg-purple-500 rounded-full opacity-20"
            animate={{
              x: Math.random() * 800 - 400,
              y: Math.random() * 400 - 200,
              rotate: Math.random() * 360,
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 9 + Math.random() * 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}

        <div className="relative z-10 text-center">
          {/* ✅ Active Models Display */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute top-65 left-1/2 transform -translate-x-1/2 flex flex-wrap justify-center gap-4 px-6 py-3 bg-white/10 backdrop-blur-md border border-gray-500/30 rounded-2xl shadow-lg w-full max-w-5xl"
          >
            {[
              { name: "people", title: "People" },
              { name: "weapon", title: "Weapon" },
              { name: "fire", title: "Fire" },
              { name: "shoplifting", title: "Shoplifting" },
              { name: "crowd", title: "Crowd" },
              { name: "Accident", title: "Accident" },
              { name: "Vandalism", title: "Vandalism" },
            ].map((model) => {
              const isActive = activeModels.some((m) => m.name === model.name);
              const Icon =
                Icons[
                model.name.toLowerCase() === "fire"
                  ? "Flame"
                  : model.name.toLowerCase() === "weapon"
                    ? "ShieldAlert"
                    : model.name.toLowerCase() === "people"
                      ? "Users"
                      : model.name.toLowerCase() === "crowd"
                        ? "UsersRound"
                        : model.name.toLowerCase() === "accident"
                          ? "Car"
                          : model.name.toLowerCase() === "shoplifting"
                            ? "ShoppingBag"
                            : model.name.toLowerCase() === "vandalism"
                              ? "Hammer"
                              : "Activity"
                ] || Icons.Activity;

              return (
                <motion.div
                  key={model.name}
                  whileHover={{ scale: 1.1 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-md transition-all ${isActive
                    ? "bg-green-900/40 text-green-400 border-green-500/40"
                    : "bg-red-900/40 text-red-400 border-red-500/40 opacity-70"
                    }`}
                >
                  <span className="relative flex h-3 w-3">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isActive ? "bg-green-400" : "bg-red-400"
                        }`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-3 w-3 ${isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                    ></span>
                  </span>
                  <Icon size={18} className={isActive ? "text-green-400" : "text-red-400"} />
                  <span className="font-semibold text-sm text-white">
                    {model.title}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>

          <h1 className="text-4xl lg:text-6xl font-bold tracking-wide mb-3">
            Secure<span className="text-blue-400">Vision</span> Dashboard
          </h1>
          <p className="text-gray-300 mb-6">
            Real-time anomaly detection and camera management
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 px-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 transition-all border border-blue-400/20 backdrop-blur-sm"
            >
              <PlusCircle size={20} />
              <span>Add Camera</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleActivateAll}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/20 transition-all border border-emerald-400/20 backdrop-blur-sm"
            >
              <Icons.CheckCircle size={20} />
              <span>Activate All</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDeactivateAll}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-xl font-bold text-white shadow-lg shadow-red-500/20 transition-all border border-red-400/20 backdrop-blur-sm"
            >
              <Icons.XCircle size={20} />
              <span>Deactivate All</span>
            </motion.button>
          </div>

          <div className="flex justify-center gap-6 mt-8">
            {["models", "cameras", "livestream", "anomalies"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-5 py-2 rounded-full font-semibold transition-all ${activeSection === tab
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
              >
                See All {tab === "livestream" ? "Live Stream" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ MAIN CONTENT */}
      <div className="relative py-10 px-6 overflow-hidden">
        {/* Background gradient and floating motion bubbles */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800/80 to-gray-900"></div>

        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-blue-400/10 rounded-full blur-2xl"
            style={{
              width: Math.random() * 60 + 20,
              height: Math.random() * 60 + 20,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 60 - 30],
              x: [0, Math.random() * 60 - 30],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 10 + Math.random() * 4,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        ))}

        <div className="relative z-10">
          {loading ? (
            <SkeletonLoader />
          ) : (
            <>
              {/* adding icon which choose model representation */}
              <div className="flex gap-3 text-2xl font-bold justify-center items-center mb-10 lg:text-3xl">
                <Icons.HomeIcon className="text-green-500" size={32} /> Your All Model Services Here
              </div>
              {activeSection === "models" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                  <ModelCard title="People Detection" />
                  <ModelCard title="Weapon Detection" />
                  <ModelCard title="Fire Detection" />
                  <ModelCard title="Shoplifting Detection" />
                  <ModelCard title="Crowd Detection" />
                  <ModelCard title="Accident Detection" />
                  <ModelCard title="Vandalism Detection" />
                </motion.div>
              )}
              {activeSection === "cameras" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CamerasPage />
                </motion.div>
              )}
              {activeSection === "livestream" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <LiveStreamPage />
                </motion.div>
              )}
              {activeSection === "anomalies" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AnomaliesList />
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && <AddCameraModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default DashboardPage;
