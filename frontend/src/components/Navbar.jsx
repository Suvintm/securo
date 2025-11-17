import React, { useState, useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Menu, X, Activity, PlugZap } from "lucide-react"; // ✅ added icons
import { WebSocketContext } from "../context/WebSocketContext"; // ✅ import context

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { isConnected, connectWebSocket, disconnectWebSocket } =
    useContext(WebSocketContext);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleWebSocket = () => {
    if (isConnected) {
      disconnectWebSocket();
    } else {
      connectWebSocket();
    }
  };

  return (
    <nav className="bg-gray-900 text-white px-4 sm:px-6 py-3 shadow-lg lg:py-6">
      <div className="flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src="/logo.png"
            alt="Securo Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-700"
          />
          <h1 className="text-lg sm:text-xl font-semibold tracking-wide lg:text-2xl">
            Securo
          </h1>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="sm:hidden focus:outline-none"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-4">
          {/* ✅ WebSocket Toggle */}
          <button
            onClick={toggleWebSocket}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-medium transition-all ${
              isConnected
                ? "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/30"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {isConnected ? (
              <>
                <Activity className="animate-pulse text-white" size={20} />
                <span>Live Alerts On</span>
              </>
            ) : (
              <>
                <PlugZap size={20} />
                <span>Enable Alerts</span>
              </>
            )}
          </button>

          <h2 className="text-md sm:text-lg font-medium lg:text-2xl text-gray-200">
            AI Security Dashboard
          </h2>
          <span className="text-sm text-gray-300">{user?.name || "Admin"}</span>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="flex flex-col mt-3 sm:hidden border-t border-gray-700 pt-3 space-y-3">
          <button
            onClick={toggleWebSocket}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium ${
              isConnected
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {isConnected ? (
              <>
                <Activity className="animate-pulse text-white" size={18} />
                Live Alerts On
              </>
            ) : (
              <>
                <PlugZap size={18} /> Enable Alerts
              </>
            )}
          </button>

          <span className="text-center text-sm text-gray-400">
            {user?.name || "Admin"}
          </span>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 mx-auto px-4 py-1.5 rounded-md transition w-32"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
