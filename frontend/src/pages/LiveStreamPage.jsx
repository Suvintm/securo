import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Camera,
    Wifi,
    WifiOff,
    Eye,
    Activity,
    Monitor,
    Zap,
    Radio,
    Target,
    Shield,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import axiosClient from "../api/axiosClient";

const LiveStreamPage = () => {
    const [streamStatus, setStreamStatus] = useState({
        active: false,
        camera_info: null,
        active_models: [],
        has_frame: false,
    });
    const [loading, setLoading] = useState(true);

    // Fetch stream status
    const fetchStatus = async () => {
        try {
            const res = await axiosClient.get("/stream/status");
            setStreamStatus(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch stream status:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 text-white relative overflow-hidden">
            {/* Animated Background Particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-blue-500/10 blur-xl"
                    style={{
                        width: Math.random() * 100 + 50,
                        height: Math.random() * 100 + 50,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, Math.random() * 100 - 50],
                        x: [0, Math.random() * 100 - 50],
                        opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                        duration: 10 + Math.random() * 10,
                        repeat: Infinity,
                        repeatType: "mirror",
                    }}
                />
            ))}

            <div className="relative z-10 p-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <motion.div
                                animate={{ rotate: streamStatus.active ? 360 : 0 }}
                                transition={{ duration: 2, repeat: streamStatus.active ? Infinity : 0, ease: "linear" }}
                                className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl"
                            >
                                <Camera size={36} className="text-white" />
                            </motion.div>
                            <div>
                                <motion.h1
                                    className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                                    animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                                    transition={{ duration: 5, repeat: Infinity }}
                                >
                                    Live Detection Feed
                                </motion.h1>
                                <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                                    <Radio size={14} className={streamStatus.active ? "text-green-400 animate-pulse" : "text-gray-500"} />
                                    Real-time AI-powered surveillance
                                </p>
                            </div>
                        </div>

                        {/* Enhanced Status Badge */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`px-6 py-3 rounded-full border-2 backdrop-blur-md shadow-xl flex items-center gap-3 ${streamStatus.active
                                    ? "bg-green-500/20 border-green-500/50"
                                    : "bg-red-500/20 border-red-500/50"
                                }`}
                        >
                            <motion.div
                                animate={{ scale: streamStatus.active ? [1, 1.2, 1] : 1 }}
                                transition={{ duration: 1.5, repeat: streamStatus.active ? Infinity : 0 }}
                            >
                                {streamStatus.active ? (
                                    <Wifi className="text-green-400" size={24} />
                                ) : (
                                    <WifiOff className="text-red-400" size={24} />
                                )}
                            </motion.div>
                            <div>
                                <p className="text-xs text-gray-400">Status</p>
                                <p className={`font-bold ${streamStatus.active ? "text-green-400" : "text-red-400"}`}>
                                    {streamStatus.active ? "LIVE" : "OFFLINE"}
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Camera Info Cards */}
                    <AnimatePresence>
                        {streamStatus.active && streamStatus.camera_info && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                            >
                                {/* Camera Name Card */}
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 backdrop-blur-md border border-blue-500/30 rounded-xl p-4 shadow-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                            <Monitor className="text-blue-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Camera Name</p>
                                            <p className="text-white font-semibold">{streamStatus.camera_info.name}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Location Card */}
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 shadow-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/20 rounded-lg">
                                            <Target className="text-purple-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Location</p>
                                            <p className="text-white font-semibold">{streamStatus.camera_info.location}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Active Models Card */}
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="bg-gradient-to-br from-green-900/40 to-green-800/20 backdrop-blur-md border border-green-500/30 rounded-xl p-4 shadow-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-500/20 rounded-lg">
                                            <Shield className="text-green-400" size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-400">Active Models</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {streamStatus.active_models.length > 0 ? (
                                                    streamStatus.active_models.slice(0, 3).map((model, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-300"
                                                        >
                                                            {model}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-500 text-xs">None</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Video Stream Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl opacity-50"></div>

                    <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-2 border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl">
                        {streamStatus.active ? (
                            <div className="relative aspect-video bg-black group">
                                {/* Video Stream */}
                                <img
                                    src={`http://localhost:8000/api/stream/video_feed?t=${Date.now()}`}
                                    alt="Live Stream"
                                    className="w-full h-full object-contain"
                                />

                                {/* Overlay Indicators */}
                                <div className="absolute inset-0 pointer-events-none">
                                    {/* Top Indicators */}
                                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                                        {/* LIVE Badge */}
                                        <motion.div
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="flex items-center gap-2 bg-red-600/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
                                        >
                                            <motion.div
                                                animate={{ opacity: [1, 0.3, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="w-2.5 h-2.5 bg-white rounded-full"
                                            />
                                            <span className="text-white font-bold text-sm tracking-wider">LIVE</span>
                                        </motion.div>

                                        {/* Activity Indicator */}
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            className="bg-gradient-to-br from-blue-600/90 to-purple-600/90 backdrop-blur-sm p-3 rounded-full shadow-lg"
                                        >
                                            <Activity className="text-white" size={20} />
                                        </motion.div>
                                    </div>

                                    {/* Bottom Info Bar */}
                                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-black/80 backdrop-blur-md rounded-xl p-4 border border-gray-700/50">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="text-green-400" size={16} />
                                                        <span className="text-gray-300">AI Detection Active</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="text-yellow-400" size={16} />
                                                        <span className="text-gray-300">Processing: ~30 FPS</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Eye size={16} />
                                                    <span>Monitoring</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Inactive State */
                            <div className="aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
                                {/* Animated Background Grid */}
                                <div className="absolute inset-0 opacity-10">
                                    {[...Array(10)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute h-px bg-blue-500"
                                            style={{ top: `${i * 10}%`, left: 0, right: 0 }}
                                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                                            transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                                        />
                                    ))}
                                </div>

                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-center z-10"
                                >
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="mb-6"
                                    >
                                        <div className="relative inline-block">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl"
                                            />
                                            <Camera className="relative text-gray-600" size={96} />
                                        </div>
                                    </motion.div>

                                    <h3 className="text-3xl font-bold text-transparent bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text mb-3">
                                        Camera Not Activated
                                    </h3>
                                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                        Start a camera from the Cameras page to view live detection feed with real-time AI analysis
                                    </p>

                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex items-center gap-2 text-gray-600 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700/50">
                                            <AlertCircle size={18} />
                                            <span className="text-sm">No active stream</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Info Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-center"
                >
                    <div className="inline-flex items-center gap-3 bg-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-full px-6 py-3">
                        <Shield className="text-blue-400" size={18} />
                        <span className="text-gray-400 text-sm">
                            Secure live stream • Real-time bounding boxes • Auto-save detections
                        </span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LiveStreamPage;
