import React, { useState, useEffect } from "react";
import CamerasPage from "./CamerasPage";
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


const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [activeSection, setActiveSection] = useState("models");
  const [loading, setLoading] = useState(false);
  const { activeModels } = useModelContext();


  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleTabChange = (tab) => {
    setLoading(true);
    setActiveSection(tab);
    setTimeout(() => setLoading(false), 1200);
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
            className="absolute w-10 h-10 bg-purple-500 rounded-full  opacity-20"
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
          {activeModels.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute top-65 left-1/2 transform -translate-x-1/2 flex flex-wrap justify-center gap-4 px-6 py-3 bg-white/10 backdrop-blur-md border border-green-400/30 rounded-2xl shadow-lg"
            >
              {activeModels.map((model) => {
                const Icon =
                  Icons[
                    model.title.toLowerCase().includes("fire")
                      ? "Flame"
                      : model.title.toLowerCase().includes("weapon")
                      ? "ShieldAlert"
                      : model.title.toLowerCase().includes("people")
                      ? "Users"
                      : model.title.toLowerCase().includes("crowd")
                      ? "UsersRound"
                      : model.title.toLowerCase().includes("accident")
                      ? "Car"
                      : model.title.toLowerCase().includes("shoplifting")
                      ? "ShoppingBag"
                      : model.title.toLowerCase().includes("vandalism")
                      ? "Hammer"
                      : "Activity"
                  ] || Icons.Activity;

                return (
                  <motion.div
                    key={model.name}
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-2 bg-gray-900/70 text-green-400 px-3 py-1.5 rounded-full border border-green-500/40 shadow-md"
                  >
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <Icon size={18} className="text-green-400" />
                    <span className="font-semibold text-sm text-white">
                      {model.title.replace("Detection", "").trim()}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          <h1 className="text-4xl lg:text-6xl font-bold tracking-wide mb-3">
            Secure<span className="text-blue-400">Vision</span> Dashboard
          </h1>
          <p className="text-gray-300 mb-6">
            Real-time anomaly detection and camera management
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold transition-all duration-300 shadow-blue-500/30 shadow-lg"
          >
            <PlusCircle size={22} />
            Add / Create Camera
          </button>

          <div className="flex justify-center gap-6 mt-8">
            {["models", "cameras", "anomalies"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-5 py-2 rounded-full font-semibold transition-all ${
                  activeSection === tab
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                See All {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
