import React, { useEffect, useState } from "react";
import {
  getCameras,
  createCamera,
  startCamera,
  stopCamera,
} from "../api/cameras";
import axiosClient from "../api/axiosClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  Play,
  Square,
  Image as ImageIcon,
  Video,
  Loader2,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Zap,
  CircleDot,
  Sparkles,
  FileVideo,
  ScanSearch,
  Power,
  PowerOff,
} from "lucide-react";
import toast from "react-hot-toast";

const CamerasPage = () => {
  const [cameras, setCameras] = useState([]);
  const [form, setForm] = useState({
    name: "",
    location: "",
    source: "laptop_cam",
    rtsp_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [processingId, setProcessingId] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resultImage, setResultImage] = useState("");
  const [detections, setDetections] = useState([]);

  const fetchCameras = async () => {
    try {
      const data = await getCameras();
      setCameras(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load cameras");
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const handleStart = async (id) => {
    setProcessingId(id);
    setIsStarting(true);
    try {
      await startCamera(id);
      await axiosClient.post("/pipeline/start");
      await fetchCameras();
      toast.success("Camera started successfully!");
    } catch (err) {
      console.error("Start pipeline error:", err);
      toast.error(err.response?.data?.detail || "Failed to start pipeline");
    } finally {
      setIsStarting(false);
      setProcessingId(null);
    }
  };

  const handleStop = async (id) => {
    setProcessingId(id);
    setIsStopping(true);
    try {
      await axiosClient.post("/pipeline/stop");
      await stopCamera(id);
      await fetchCameras();
      toast.success("Camera stopped successfully!");
    } catch (err) {
      console.error("Stop pipeline error:", err);
      toast.error(err.response?.data?.detail || "Failed to stop pipeline");
    } finally {
      setIsStopping(false);
      setProcessingId(null);
    }
  };

  const handleFileDetect = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setResultImage("");
    setDetections([]);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axiosClient.post("/pipeline/stop");
      const res = await axiosClient.post("/upload/detect", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResultImage(res.data.annotated_image);
      setDetections(res.data.detections);

      if (res.data.detections.length > 0) {
        toast.success(`Detected ${res.data.detections.length} anomaly(ies)!`);
      } else {
        toast.info("No anomalies detected in the uploaded file.");
      }
    } catch (err) {
      console.error("Detection failed:", err);
      const errorMsg = err.response?.data?.detail || "Detection failed. Please check file format.";
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-purple-500/10 blur-2xl"
          style={{
            width: Math.random() * 120 + 60,
            height: Math.random() * 120 + 60,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, Math.random() * 80 - 40],
            x: [0, Math.random() * 80 - 40],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 12 + Math.random() * 8,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      ))}

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-2">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl"
            >
              <Camera size={36} className="text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Camera & Detection Hub
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Manage cameras and detect anomalies in real-time
              </p>
            </div>
          </div>
        </motion.div>

        {/* File Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-2xl opacity-60" />

            <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-2 border-gray-700/50 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-3 bg-gradient-to-br from-blue-600/30 to-blue-500/30 rounded-xl"
                >
                  <Upload className="text-blue-400" size={28} />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Upload & Detect</h2>
                  <p className="text-gray-400 text-sm">
                    Upload image or video for instant AI analysis
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Upload Area */}
                <div className="space-y-4">
                  <label className="block group">
                    <div className="relative border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-2xl p-8 cursor-pointer transition-all duration-300 bg-gray-800/30 hover:bg-gray-800/50">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="hidden"
                      />
                      <motion.div
                        className="flex flex-col items-center"
                        whileHover={{ scale: 1.05 }}
                      >
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <ImageIcon className="text-blue-400 mb-3" size={48} />
                        </motion.div>
                        <p className="text-white font-semibold mb-1">
                          {selectedFile ? selectedFile.name : "Click to choose file"}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Supports images and videos
                        </p>
                      </motion.div>
                    </div>
                  </label>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFileDetect}
                    disabled={!selectedFile || uploading}
                    className={`w-full py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 ${uploading || !selectedFile
                        ? "bg-gray-700 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                      }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <ScanSearch size={20} />
                        <span>Detect Anomalies</span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Results Preview */}
                <div className="grid grid-rows-2 gap-4">
                  {/* Input Preview */}
                  <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-sm p-4 rounded-2xl border border-gray-600/50">
                    <div className="flex items-center gap-2 mb-3">
                      <FileVideo className="text-purple-400" size={18} />
                      <h4 className="font-semibold text-sm text-gray-300">Input Preview</h4>
                    </div>
                    <div className="bg-black/40 rounded-xl flex items-center justify-center h-32 overflow-hidden">
                      {selectedFile ? (
                        selectedFile.type.startsWith("image") ? (
                          <img
                            src={URL.createObjectURL(selectedFile)}
                            alt="Preview"
                            className="max-h-full object-contain"
                          />
                        ) : (
                          <video
                            src={URL.createObjectURL(selectedFile)}
                            className="max-h-full object-contain"
                          />
                        )
                      ) : (
                        <ImageIcon className="text-gray-600" size={40} />
                      )}
                    </div>
                  </div>

                  {/* Detection Result */}
                  <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-sm p-4 rounded-2xl border border-gray-600/50">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="text-green-400" size={18} />
                      <h4 className="font-semibold text-sm text-gray-300">Detection Result</h4>
                    </div>
                    <div className="bg-black/40 rounded-xl flex items-center justify-center h-32 overflow-hidden">
                      {uploading ? (
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-gray-400 text-sm"
                        >
                          Processing...
                        </motion.div>
                      ) : resultImage ? (
                        <img
                          src={`data:image/jpeg;base64,${resultImage}`}
                          alt="Result"
                          className="max-h-full object-contain"
                        />
                      ) : (
                        <Sparkles className="text-gray-600" size={40} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detection Details */}
              <AnimatePresence>
                {detections.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-600/30 rounded-2xl p-4"
                  >
                    <p className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle size={18} />
                      Found {detections.length} anomaly(ies)
                    </p>
                    <pre className="text-xs text-gray-300 bg-black/40 p-3 rounded-xl overflow-x-auto max-h-40">
                      {JSON.stringify(detections, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Camera Cards Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="text-yellow-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Active Cameras</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cameras.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Camera className="text-gray-600 mx-auto mb-4" size={64} />
                </motion.div>
                <p className="text-gray-500 text-lg">No cameras configured yet</p>
              </div>
            ) : (
              cameras.map((cam, index) => {
                const isProcessing = processingId === cam.id;
                const buttonText = cam.is_active
                  ? isProcessing && isStopping
                    ? "Stopping..."
                    : "Stop"
                  : isProcessing && isStarting
                    ? "Starting..."
                    : "Start";

                return (
                  <motion.div
                    key={cam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="relative group"
                  >
                    {/* Glow effect */}
                    <div className={`absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity ${cam.is_active ? "bg-green-500/20" : "bg-red-500/20"
                      }`} />

                    <div className={`relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-2 rounded-3xl p-6 shadow-xl transition-all ${cam.is_active
                        ? "border-green-600/50 hover:border-green-500/70"
                        : "border-red-600/50 hover:border-red-500/70"
                      }`}>
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <motion.div
                          animate={{ scale: cam.is_active ? [1, 1.2, 1] : 1 }}
                          transition={{ duration: 2, repeat: cam.is_active ? Infinity : 0 }}
                          className={`px-3 py-1 rounded-full flex items-center gap-2 ${cam.is_active
                              ? "bg-green-500/20 border border-green-500/50"
                              : "bg-red-500/20 border border-red-500/50"
                            }`}
                        >
                          <CircleDot size={12} className={cam.is_active ? "text-green-400" : "text-red-400"} />
                          <span className={`text-xs font-bold ${cam.is_active ? "text-green-400" : "text-red-400"}`}>
                            {cam.is_active ? "LIVE" : "OFF"}
                          </span>
                        </motion.div>
                      </div>

                      {/* Camera Icon */}
                      <motion.div
                        animate={{ rotate: cam.is_active ? [0, 5, -5, 0] : 0 }}
                        transition={{ duration: 3, repeat: cam.is_active ? Infinity : 0 }}
                        className="mb-4"
                      >
                        <div className={`inline-flex p-4 rounded-2xl ${cam.is_active
                            ? "bg-gradient-to-br from-green-600/30 to-green-500/30"
                            : "bg-gradient-to-br from-red-600/30 to-red-500/30"
                          }`}>
                          <Camera size={32} className={cam.is_active ? "text-green-400" : "text-red-400"} />
                        </div>
                      </motion.div>

                      {/* Camera Name */}
                      <h3 className="text-xl font-bold text-white mb-3">{cam.name}</h3>

                      {/* Camera Details */}
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <MapPin size={14} />
                          <span>{cam.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Video size={14} />
                          <span className="capitalize">{cam.source.replace("_", " ")}</span>
                        </div>
                      </div>

                      {/* Control Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => cam.is_active ? handleStop(cam.id) : handleStart(cam.id)}
                        disabled={isProcessing}
                        className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg ${isProcessing
                            ? "bg-gray-700 cursor-not-allowed"
                            : cam.is_active
                              ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
                              : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
                          }`}
                      >
                        {isProcessing ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : cam.is_active ? (
                          <>
                            <PowerOff size={20} />
                            <span>{buttonText}</span>
                          </>
                        ) : (
                          <>
                            <Power size={20} />
                            <span>{buttonText}</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CamerasPage;
