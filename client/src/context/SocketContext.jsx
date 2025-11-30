import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated && user) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const newSocket = io(apiUrl, {
        transports: ['websocket', 'polling'], // Allow fallback to polling if websocket fails
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('join-room', user.id);
      });

      newSocket.on('connect_error', (error) => {
        console.warn('Socket connection error:', error.message);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      setSocket(newSocket);

      return () => {
        if (newSocket.connected) {
          newSocket.close();
        }
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

