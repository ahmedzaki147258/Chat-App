import { toast } from 'sonner';
import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useCallback, useState } from "react";
import { MessageData, SendMessagePayload } from "@/shared/types/message";

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (data: SendMessagePayload) => void;
  onNewMessage: (callback: (message: MessageData) => void) => void;
  offNewMessage: (callback: (message: MessageData) => void) => void;
}

export default function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL!, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      toast.success("Connected to server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      toast.warning("Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = useCallback((data: SendMessagePayload) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("sendMessage", data);
    } else {
      toast.error("Socket is not connected");
    }
  }, []);

  const onNewMessage = useCallback((callback: (message: MessageData) => void) => {
    socketRef.current?.on("newMessage", callback);
  }, []);

  const offNewMessage = useCallback((callback: (message: MessageData) => void) => {
    socketRef.current?.off("newMessage", callback);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    onNewMessage,
    offNewMessage
  };
}