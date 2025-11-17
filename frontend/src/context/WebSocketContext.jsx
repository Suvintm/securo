import React, { createContext, useState, useEffect, useRef } from "react";

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const alertSound = useRef(new Audio("/alert.mp3"));

  const connectWebSocket = () => {
    if (wsRef.current) return; // already connected

    wsRef.current = new WebSocket("ws://localhost:8000/api/ws/anomalies");

    wsRef.current.onopen = () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === "new_anomaly") {
        console.log("🚨 New anomaly detected:", data);

        // 🔊 Play sound
        alertSound.current.currentTime = 0;
        alertSound.current.volume = 0.6;
        alertSound.current.play().catch(() => {});

        // 🔔 Optional desktop notification
        if (Notification.permission === "granted") {
          new Notification("🚨 Anomaly Detected", {
            body: `${data.label} (${data.model}) at ${data.camera_name}`,
            icon: "/alert-icon.png",
          });
        }
      }
    };

    wsRef.current.onclose = () => {
      console.warn("🔴 WebSocket disconnected");
      wsRef.current = null;
      setIsConnected(false);
    };
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
      console.log("🔌 WebSocket manually disconnected");
    }
  };

  // ask notification permission
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <WebSocketContext.Provider
      value={{ isConnected, connectWebSocket, disconnectWebSocket }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
