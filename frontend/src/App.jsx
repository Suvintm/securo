import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import { Toaster } from "react-hot-toast";
import { ModelProvider } from "./context/ModelContext";
import { WebSocketProvider } from "./context/WebSocketContext"; // ✅ ADD THIS LINE

// ✅ Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <p className="text-center mt-20">Loading...</p>;
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
