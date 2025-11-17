import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn } from "lucide-react";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      setUser(res);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      {/* 🌌 Floating animated bubbles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-500/40 "
          style={{
            width: Math.random() * 100 + 60,
            height: Math.random() * 100 + 60,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, Math.random() * 100 - 50],
            x: [0, Math.random() * 100 - 50],
            opacity: [0.3, 0.8, 0.3],
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

      {/* 🔒 Login Card */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-white/10 backdrop-blur-md border border-gray-700 shadow-2xl rounded-2xl p-8 lg:p-20  w-[360px] lg:w-[560px]"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-400">
          SecureVision Login
        </h2>

        {error && (
          <p className="text-red-400 text-center mb-3 text-sm font-medium">
            {error}
          </p>
        )}

        {/* Email */}
        <div className="flex items-center bg-white/10 border border-gray-700 rounded-lg px-3 py-2 lg:py-6 mb-4">
          <Mail className="text-blue-400 mr-3" size={20} />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="bg-transparent focus:outline-none w-full text-white placeholder-gray-400"
            required
          />
        </div>

        {/* Password */}
        <div className="flex items-center bg-white/10 border border-gray-700 rounded-lg px-3 py-2 mb-6">
          <Lock className="text-blue-400 mr-3" size={20} />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="bg-transparent focus:outline-none w-full text-white placeholder-gray-400"
            required
          />
        </div>

        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-blue-500/30 shadow-lg flex items-center justify-center gap-2"
        >
          <LogIn size={18} /> Login
        </motion.button>

        <p className="text-center text-sm text-gray-400 mt-5">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-400 hover:underline">
            Register
          </a>
        </p>
      </motion.form>
    </div>
  );
};

export default LoginPage;
