import React, { useEffect, useState, useRef } from "react";
import axiosClient from "../api/axiosClient";
import { motion, AnimatePresence } from "framer-motion";

const AnomaliesList = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const prevCountRef = useRef(0);
  const alertSound = useRef(new Audio("/alert.mp3"));

  // ✅ Fetch anomalies
  const fetchAnomalies = async () => {
    try {
      const res = await axiosClient.get("/anomalies/");
      const newAnomalies = res.data.items || [];
      if (newAnomalies.length > prevCountRef.current)
        alertSound.current.play().catch(() => {});
      setAnomalies(newAnomalies);
      prevCountRef.current = newAnomalies.length;
    } catch (err) {
      console.error("Failed to fetch anomalies:", err);
    }
  };

  useEffect(() => {
    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Delete anomaly
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this anomaly?"))
      return;
    try {
      setLoading(true);
      await axiosClient.delete(`/anomalies/${id}`);
      setSelected(null);
      await fetchAnomalies();
      alert("Anomaly deleted successfully!");
    } catch (err) {
      console.error("Failed to delete anomaly:", err);
      alert("Failed to delete anomaly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black rounded-2xl p-6 shadow-2xl border border-green-800">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Recent Anomalies
      </h2>

      {anomalies.length === 0 ? (
        <p className="text-gray-500 text-center">No anomalies detected yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {anomalies.map((a) => (
            <motion.div
              key={a.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelected(a)}
              className="cursor-pointer relative bg-green rounded-xl overflow-hidden hover:border-blue-400 shadow-md hover:shadow-lg transition-all"
            >
              <img
                src={a.image_url}
                alt={a.label}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 text-gray-800">
                <h3 className="text-lg font-semibold">{a.label}</h3>
                <p className="text-sm font-bold text-green-600 mt-1">
                  {a.model.toUpperCase()} • {(a.confidence || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {a.camera_name.toUpperCase() || "Unknown"} —{" "}
                  {new Date(a.timestamp).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ✅ Modal Popup for Selected Anomaly */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-lg p-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 text-gray-600 hover:text-red-600 text-xl font-bold"
              >
                ✕
              </button>

              {/* Image */}
              <img
                src={selected.image_url}
                alt={selected.label}
                className="w-full h-64 object-cover rounded-xl mb-4"
              />

              {/* Details */}
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {selected.label}
              </h3>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Model:</strong> {selected.model}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Confidence:</strong>{" "}
                {(selected.confidence || 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Camera:</strong> {selected.camera_name || "Unknown"}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Location:</strong> {selected.camera_location || "N/A"}
              </p>
              <p className="text-sm text-gray-700 mb-3">
                <strong>Detected At:</strong>{" "}
                {new Date(selected.timestamp).toLocaleString()}
              </p>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => handleDelete(selected.id)}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnomaliesList;
