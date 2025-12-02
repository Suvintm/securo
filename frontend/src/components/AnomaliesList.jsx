import React, { useEffect, useState, useRef } from "react";
import axiosClient from "../api/axiosClient";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, CheckSquare, Square } from "lucide-react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import toast from "react-hot-toast";

const AnomaliesList = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const prevCountRef = useRef(0);
  const alertSound = useRef(new Audio("/alert.mp3"));

  // ✅ Selection state for bulk delete
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ✅ Fetch anomalies
  const fetchAnomalies = async () => {
    try {
      const res = await axiosClient.get("/anomalies/");
      const newAnomalies = res.data.items || [];
      if (newAnomalies.length > prevCountRef.current)
        alertSound.current.play().catch(() => { });
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

  // ✅ Toggle individual selection
  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // ✅ Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.length === anomalies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(anomalies.map((a) => a.id));
    }
  };

  // ✅ Bulk Delete Handler
  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.post("/anomalies/bulk-delete", {
        ids: selectedIds,
      });

      toast.success(`Successfully deleted ${response.data.deleted_count} anomalies`);

      if (response.data.failed_count > 0) {
        toast.error(`Failed to delete ${response.data.failed_count} anomalies`);
      }

      setSelectedIds([]);
      setShowConfirmModal(false);
      await fetchAnomalies();
    } catch (err) {
      console.error("Failed to bulk delete anomalies:", err);
      toast.error("Failed to delete anomalies");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete single anomaly (from modal)
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
      {/* Header with Select All and Delete Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          Recent Anomalies {anomalies.length > 0 && `(${anomalies.length})`}
        </h2>

        <div className="flex items-center gap-4">
          {/* Select All Checkbox */}
          {anomalies.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition border border-gray-600"
            >
              {selectedIds.length === anomalies.length ? (
                <CheckSquare className="text-blue-400" size={20} />
              ) : (
                <Square className="text-gray-400" size={20} />
              )}
              <span className="text-sm font-semibold">
                {selectedIds.length === anomalies.length ? "Deselect All" : "Select All"}
              </span>
            </button>
          )}

          {/* Delete Selected Button */}
          {selectedIds.length > 0 && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-lg font-semibold shadow-lg transition"
            >
              <Trash2 size={20} />
              Delete Selected ({selectedIds.length})
            </motion.button>
          )}
        </div>
      </div>

      {anomalies.length === 0 ? (
        <p className="text-gray-500 text-center">No anomalies detected yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {anomalies.map((a) => {
            const isSelected = selectedIds.includes(a.id);

            return (
              <motion.div
                key={a.id}
                whileHover={{ scale: 1.02 }}
                className={`relative bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border-2 ${isSelected
                    ? "border-blue-500 ring-2 ring-blue-400/50"
                    : "border-gray-700 hover:border-blue-400"
                  }`}
              >
                {/* Selection Checkbox */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelection(a.id);
                  }}
                  className="absolute top-3 left-3 z-10 cursor-pointer"
                >
                  {isSelected ? (
                    <CheckSquare className="text-blue-400 bg-gray-900/80 rounded" size={28} />
                  ) : (
                    <Square className="text-gray-400 bg-gray-900/80 rounded hover:text-white" size={28} />
                  )}
                </div>

                {/* Image - clickable to open modal */}
                <div onClick={() => setSelected(a)} className="cursor-pointer">
                  <img
                    src={a.image_url}
                    alt={a.label}
                    className="w-full h-48 object-cover"
                  />
                </div>

                {/* Details */}
                <div className="p-4 text-white" onClick={() => setSelected(a)}>
                  <h3 className="text-lg font-semibold">{a.label}</h3>
                  <p className="text-sm font-bold text-green-400 mt-1">
                    {a.model.toUpperCase()} • {(a.confidence || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {a.camera_name?.toUpperCase() || "Unknown"} —{" "}
                    {new Date(a.timestamp).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleBulkDelete}
        count={selectedIds.length}
        loading={loading}
      />

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
