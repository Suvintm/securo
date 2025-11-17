import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, UserPlus } from "lucide-react";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(", "));
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Registration failed");
      }
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      {/* 🌌 Floating bubbles background */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-green-400/20 "
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

      {/* 🧾 Register Card */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-white/10 backdrop-blur-md border border-gray-700 shadow-2xl rounded-2xl p-8 w-[360px]"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-green-400">
          SecureVision Register
        </h2>

        {error && (
          <p className="text-red-400 text-center mb-3 text-sm font-medium">
            {error}
          </p>
        )}

        {/* Name */}
        <div className="flex items-center bg-white/10 border border-gray-700 rounded-lg px-3 py-2 mb-4">
          <User className="text-green-400 mr-3" size={20} />
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-transparent focus:outline-none w-full text-white placeholder-gray-400"
            required
          />
        </div>

        {/* Email */}
        <div className="flex items-center bg-white/10 border border-gray-700 rounded-lg px-3 py-2 mb-4">
          <Mail className="text-green-400 mr-3" size={20} />
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
          <Lock className="text-green-400 mr-3" size={20} />
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
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg shadow-green-500/30 shadow-lg flex items-center justify-center gap-2"
        >
          <UserPlus size={18} /> Register
        </motion.button>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account?{" "}
          <a href="/login" className="text-green-400 hover:underline">
            Login
          </a>
        </p>
      </motion.form>
    </div>
  );
};

export default RegisterPage;
