import { useEffect } from "react";
import { useSocket } from "@/context/socket-provider";

export const useRealTime = (event: string, callback: () => void) => {
  const socket = useSocket();

  useEffect(() => {
    // check if socket object exists
    if (!socket) {
      console.warn("No socket instance found.");
      return;
    }

    // check if actually connected to server
    if (!socket.connected) {
      console.log("Socket initializing...");
    }

    const onConnect = () => {
      console.log("Socket Connected to Server");
    };

    const handleEvent = (data: any) => {
      console.log(`REAL-TIME EVENT RECEIVED: "${event}"`, data);
      callback(); // this triggers fetchData()
    };

    // listeners
    socket.on("connect", onConnect);
    socket.on(event, handleEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off(event, handleEvent);
    };
  }, [socket, event, callback]);
};