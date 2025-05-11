
import { io } from 'socket.io-client';
import { createContext, useContext, useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const socket = io(API_URL, {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
  autoConnect: true,
  forceNew: true
});

const SocketContext = createContext({
  socket: null,
  isConnected: false,
  connectError: null
});


export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [connectError, setConnectError] = useState(null);

  useEffect(() => {
   
    const onConnect = () => {
      console.log('Socket connected with ID:', socket.id);
      setIsConnected(true);
      setConnectError(null);
    };

    const onDisconnect = (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    };

    const onConnectError = (error) => {
      console.error('Socket connection error:', error);
      setConnectError(error.message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('error', onConnectError);

    if (!socket.connected) {
      socket.connect();
    }
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('error', onConnectError);
    };
  }, []);

  const reconnect = () => {
    if (!isConnected) {
      console.log('Attempting to reconnect socket...');
      socket.connect();
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectError, reconnect }}>
      {children}
    </SocketContext.Provider>
  );
};


export const useSocket = () => useContext(SocketContext);

export default socket;