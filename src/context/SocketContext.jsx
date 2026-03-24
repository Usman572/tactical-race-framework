import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config/api';

const SocketContext = createContext();

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (user) {
            // Extract the base URL from API_BASE_URL (removing /api or similar if present)
            const socketUrl = API_BASE_URL.replace('/api', '');
            const newSocket = io(socketUrl, {
                withCredentials: true,
                transports: ['websocket']
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err.message);
            });

            newSocket.on('connect', () => {
                console.log('Socket established for session:', user.id);
                newSocket.off('new_notification'); // Clear existing listeners
                newSocket.on('new_notification', (data) => {
                    if (document.hidden && Notification.permission === "granted") {
                        new Notification("New Signal", { body: data.message });
                    }
                });
                newSocket.emit('join_room', user.id || user._id);
            });

            setSocket(newSocket);

            return () => {
                newSocket.off(); // Remove all listeners
                newSocket.disconnect();
                console.log('Socket session ended');
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
