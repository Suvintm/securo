import React, { useEffect, useState } from "react";
import {
  getCameras,
  createCamera,
  startCamera,
  stopCamera,
} from "../api/cameras";
import axiosClient from "../api/axiosClient";
import { motion } from "framer-motion";
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
} from "lucide-react";

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
    } catch (err) {
      console.error("Start pipeline error:", err);
      alert(err.response?.data?.detail || "Failed to start pipeline");
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
    } catch (err) {
      console.error("Stop pipeline error:", err);
      alert(err.response?.data?.detail || "Failed to stop pipeline");
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
    } catch (err) {
      console.error("Detection failed:", err);
      alert("Detection failed. Please check file format.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white min-h-screen">
      <motion.h2
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl font-bold mb-6 flex items-center gap-3"
      >
        <Camera className="text-green-500" size={32} /> Camera & Anomaly
        Management
      </motion.h2>

      {/* 📁 File Upload Detection Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/80 border border-gray-800 p-6 rounded-2xl shadow-lg mb-10"
      >
        <h3 className="text-2xl font-semibold mb-3 flex items-center gap-2">
          <Upload className="text-blue-400" /> Upload Image / Video
        </h3>
        <p className="text-gray-400 mb-4">
          Upload any image or short video — the system will stop the camera and
          detect anomalies.
        </p>

        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex-1 w-full">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl p-6 cursor-pointer transition">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="hidden"
              />
              <div className="flex flex-col items-center">
                <ImageIcon className="text-blue-400 mb-2" size={40} />
                <span className="text-gray-400">
                  {selectedFile ? selectedFile.name : "Click to choose file"}
                </span>
              </div>
            </label>
          </div>

          <button
            onClick={handleFileDetect}
            disabled={!selectedFile || uploading}
            className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition flex items-center gap-2 ${
              uploading
                ? "bg-blue-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" /> Detecting...
              </>
            ) : (
              <>
                <AlertTriangle /> Detect Anomaly
              </>
            )}
          </button>
        </div>

        {/* Side-by-Side View */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Input Preview */}
          <div className="bg-gray-800/70 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center">
            <h4 className="font-semibold mb-3 text-gray-300 flex items-center gap-2">
              <Video className="text-blue-400" /> Input Preview
            </h4>
            {selectedFile ? (
              selectedFile.type.startsWith("image") ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="rounded-xl max-h-80 object-cover"
                />
              ) : (
                <video
                  src={URL.createObjectURL(selectedFile)}
                  controls
                  className="rounded-xl max-h-80"
                />
              )
            ) : (
              <div className="text-gray-500 italic">No file selected</div>
            )}
          </div>

          {/* Output Result */}
          <div className="bg-gray-800/70 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center">
            <h4 className="font-semibold mb-3 text-gray-300 flex items-center gap-2">
              <CheckCircle className="text-green-400" /> Detection Result
            </h4>

            {uploading ? (
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="text-gray-400 italic"
              >
                Analyzing... Please wait
              </motion.div>
            ) : resultImage ? (
              <img
                src={`data:image/jpeg;base64,${resultImage}`}
                alt="Detection Result"
                className="rounded-xl max-h-80 object-cover"
              />
            ) : (
              <div className="text-gray-500 italic">
                Result will appear here
              </div>
            )}

            {detections.length > 0 && (
              <pre className="mt-3 text-xs bg-gray-900 text-gray-300 p-3 rounded-xl w-full overflow-x-auto max-h-56">
                {JSON.stringify(detections, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </motion.div>

      {/* 🎥 Camera Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {cameras.length === 0 && (
          <p className="text-gray-500 text-center col-span-full">
            No cameras available.
          </p>
        )}

        {cameras.map((cam) => {
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
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 150 }}
              className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-md hover:shadow-blue-800/40 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <Camera
                  size={28}
                  className={cam.is_active ? "text-green-400" : "text-red-400"}
                />
                <h4 className="text-xl font-semibold">{cam.name}</h4>
              </div>

              <p className="text-sm text-gray-400">{cam.location}</p>
              <p className="text-sm mt-1 text-gray-400">Source: {cam.source}</p>
              <p className="text-sm mt-1">
                Status:{" "}
                <span
                  className={
                    cam.is_active
                      ? "text-green-400 font-semibold"
                      : "text-red-400"
                  }
                >
                  {cam.is_active ? "Active" : "Inactive"}
                </span>
              </p>

              <button
                onClick={() =>
                  cam.is_active ? handleStop(cam.id) : handleStart(cam.id)
                }
                disabled={isProcessing}
                className={`mt-4 w-full py-2 rounded-xl flex items-center justify-center gap-2 font-semibold transition ${
                  cam.is_active
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" />
                ) : cam.is_active ? (
                  <Square size={18} />
                ) : (
                  <Play size={18} />
                )}
                {buttonText}
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default CamerasPage;
