import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config/api';

const SocketContext = createContext();

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [typingStatus, setTypingStatus] = useState({}); // { senderId: boolean }
    const { user } = useAuth();

    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (user) {
            const socketUrl = API_BASE_URL.replace('/api', '');
            const newSocket = io(socketUrl, {
                withCredentials: true,
                transports: ['websocket']
            });

            newSocket.on('connect', () => {
                newSocket.off('new_notification');
                newSocket.on('new_notification', (data) => {
                    if (document.hidden && Notification.permission === "granted") {
                        new Notification("New Signal", { body: data.message });
                    }
                });

                newSocket.on('typing_start', ({ senderId }) => {
                    setTypingStatus(prev => ({ ...prev, [senderId]: true }));
                });

                newSocket.on('typing_stop', ({ senderId }) => {
                    setTypingStatus(prev => ({ ...prev, [senderId]: false }));
                });

                newSocket.emit('join_room', user.id || user._id);
                if (user.faction && user.faction !== 'None') {
                    newSocket.emit('join_faction_chat', user.faction);
                }
                newSocket.emit('join_tactical_broadcasts');
            });

            setSocket(newSocket);

            return () => {
                newSocket.off();
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, typingStatus }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    return context?.socket;
}

export function useTypingStatus() {
    const context = useContext(SocketContext);
    return context?.typingStatus;
}
