import React, { useState } from "react";
import { createCamera } from "../api/cameras";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Video,
  MapPin,
  Link2,
  Webcam,
  PlusCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const AddCameraModal = ({ onClose }) => {
  const [form, setForm] = useState({
    name: "",
    location: "",
    source: "laptop_cam",
    rtsp_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCreating(true);

    try {
      await createCamera(form);
      setTimeout(() => {
        setSuccess(true);
        setCreating(false);
        setLoading(false);

        toast.success("📸 Camera created successfully!", {
          style: {
            background: "white",
            color: "green",
            fontWeight: "600",
            border: "2px solid #22c55e",
          },
        });

        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1200);
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create camera", {
        style: {
          background: "white",
          color: "red",
          fontWeight: "600",
          border: "2px solid red",
        },
      });
      setLoading(false);
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white rounded-2xl shadow-2xl w-[90%] sm:w-[420px] p-8 border border-gray-700"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
        >
          <XCircle size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center"
          >
            <Video size={42} className="text-blue-400 drop-shadow-lg" />
          </motion.div>
          <h2 className="text-2xl font-bold mt-2 tracking-wide">
            Add <span className="text-blue-400">New Camera</span>
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Configure your live camera source for monitoring
          </p>
        </div>

        <AnimatePresence mode="wait">
          {creating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Loader2 size={42} className="animate-spin text-blue-500 mb-3" />
              <p className="text-gray-400 font-medium">Creating Camera...</p>
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <CheckCircle2 size={50} className="text-green-500 mb-3" />
              <h3 className="text-xl font-semibold text-green-400">
                Camera Added Successfully!
              </h3>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              {/* Camera Name */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Camera Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-3 pl-10 rounded-xl bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
                <Webcam
                  className="absolute top-3 left-3 text-blue-400"
                  size={20}
                />
              </div>

              {/* Location */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="w-full p-3 pl-10 rounded-xl bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
                <MapPin
                  className="absolute top-3 left-3 text-green-400"
                  size={20}
                />
              </div>

              {/* Source Selection */}
              <div className="relative">
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full p-3 pl-10 rounded-xl bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="laptop_cam">Laptop Camera</option>
                  <option value="rtsp">RTSP Stream</option>
                </select>
                <Video
                  className="absolute top-3 left-3 text-purple-400"
                  size={20}
                />
              </div>

              {/* RTSP URL (if selected) */}
              {form.source === "rtsp" && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="RTSP URL"
                    value={form.rtsp_url}
                    onChange={(e) =>
                      setForm({ ...form, rtsp_url: e.target.value })
                    }
                    className="w-full p-3 pl-10 rounded-xl bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                  <Link2
                    className="absolute top-3 left-3 text-orange-400"
                    size={20}
                  />
                </div>
              )}

              {/* Create Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="mt-3 flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-xl shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle /> Create Camera
                  </>
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AddCameraModal;
