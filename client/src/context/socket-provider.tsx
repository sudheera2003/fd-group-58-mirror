"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

// define the context shape
const SocketContext = createContext<Socket | null>(null);

// custom hook to use the socket easily in other components
export const useSocket = () => {
  return useContext(SocketContext);
};

// the provider component that wraps your app
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // connect to backend URL
    const newSocket = io("http://localhost:5000");

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