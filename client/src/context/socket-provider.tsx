"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

// provider component that wraps app
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ["polling", "websocket"],
    });

    setSocket(newSocket);

    // cleanup connection when app closes
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};