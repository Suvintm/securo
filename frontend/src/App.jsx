import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import { Toaster } from "react-hot-toast";
import { ModelProvider } from "./context/ModelContext";
import { WebSocketProvider } from "./context/WebSocketContext"; // ✅ ADD THIS LINE
import { DotLottiePlayer } from '@dotlottie/react-player';

// ✅ Loading component with Lottie animation
const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black">
      <div className="w-64 h-64">
        <DotLottiePlayer
          src="/loading.lottie"
          autoplay
          loop
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

// ✅ Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          className="bg-white text-green-500"
          reverseOrder={false}
        />
        <ModelProvider>
          {/* ✅ Wrap entire app with WebSocketProvider */}
          <WebSocketProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </WebSocketProvider>
        </ModelProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
