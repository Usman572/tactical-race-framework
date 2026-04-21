import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import { API_BASE_URL } from "../config/api";
import { measureFetch } from "../utils/telemetry";

export const RaceContext = createContext();

export function RaceProvider({ children }) {
    const [races, setRaces] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({
        sectors: [],
        types: [],
        maxDistance: 5000
    });
    
    const { user, logout } = useAuth();
    const socket = useSocket();

    useEffect(() => {
        fetchRaces();
        if (user) {
            fetchPendingRequests();
            fetchMyRequests();
            fetchUnreadCount();
        }
    }, [user]);

    useEffect(() => {
        if (socket && user) {
            const handleNotification = (notif) => {
                if (notif.type === 'JoinRequest') {
                    fetchPendingRequests();
                } else if (notif.type === 'Alert' && notif.message.includes('request')) {
                    fetchMyRequests();
                }
                fetchUnreadCount();
            };
            socket.on('race_created', (newRace) => {
                setRaces(prev => [...prev.filter(r => r._id !== newRace._id), newRace]);
            });

            socket.on('race_updated', (updatedRace) => {
                setRaces(prev => prev.map(r => r._id === updatedRace._id ? updatedRace : r));
            });

            socket.on('race_countdown_start', ({ raceId, startTime }) => {
                setRaces(prev => prev.map(r => r._id === raceId ? { ...r, startTime, status: 'Active' } : r));
            });

            socket.on('race_completed', (updatedRace) => {
                setRaces(prev => prev.map(r => r._id === updatedRace._id ? updatedRace : r));
            });

            socket.on('telemetry_pulse', ({ raceId, userId, telemetry }) => {
                setRaces(prev => prev.map(r => {
                    if (r._id !== raceId) return r;
                    const existingTelem = r.telemetry || [];
                    const index = existingTelem.findIndex(t => (t.user?._id || t.user) === userId);
                    let newTelem;
                    if (index > -1) {
                        newTelem = [...existingTelem];
                        newTelem[index] = { ...newTelem[index], ...telemetry };
                    } else {
                        newTelem = [...existingTelem, telemetry];
                    }
                    return { ...r, telemetry: newTelem };
                }));
            });

            socket.on('command_pulse', ({ raceId, command, status }) => {
                setRaces(prev => prev.map(r => r._id === raceId ? { ...r, status } : r));
            });

            return () => {
                socket.off('new_notification', handleNotification);
                socket.off('race_created');
                socket.off('race_updated');
                socket.off('race_deleted');
                socket.off('race_countdown_start');
                socket.off('race_completed');
                socket.off('telemetry_pulse');
                socket.off('command_pulse');
            };
        }
    }, [socket, user]);

    const fetchUnreadCount = async () => {
        try {
            const res = await measureFetch(`${API_BASE_URL}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.status === 401) return logout();
            const data = await res.json();
            if (Array.isArray(data)) {
                setUnreadCount(data.filter(m => !m.read && (m.recipient?._id === user.id || m.recipient === user.id)).length);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyRequests = async () => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/races/requests/my`, {
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (response.status === 401) return logout();
            const data = await response.json();
            if (response.ok) setMyRequests(data);
        } catch (error) {
            console.error('Error fetching my requests:', error);
        }
    };

    const fetchRaces = async () => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/races`);
            const data = await response.json();
            if (response.ok && Array.isArray(data)) {
                setRaces(data);
            }
        } catch (error) {
            console.error('Error fetching races:', error);
        }
    };

    const getRaceById = async (id) => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/races/${id}`, {
                headers: user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}
            });
            const data = await response.json();
            if (response.ok) {
                // Update local races list if it's already there
                setRaces(prev => prev.map(r => r._id === id ? data : r));
                return { success: true, data };
            }
            return { success: false, message: data.message };
        } catch (error) {
            return { success: false, message: "Network error" };
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/races/requests/pending`, {
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (response.status === 401) return logout();
            const data = await response.json();
            if (response.ok) setPendingRequests(data);
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        }
    };

    const requestToJoin = async (id, payload = {}) => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/races/${id}/request`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            return { success: response.ok, data, message: data.message };
        } catch (error) {
            return { success: false, message: "Network error" };
        }
    };

    const approveRequest = async (requestId) => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/races/requests/${requestId}/approve`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (response.status === 401) return logout();
            const data = await response.json();
            if (response.ok) {
                setPendingRequests(prev => prev.filter(r => r._id !== requestId));
                fetchRaces();
            }
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, message: "Network error" };
        }
    };

    const rejectRequest = async (requestId) => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/races/requests/${requestId}/reject`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (response.status === 401) return logout();
            if (response.ok) {
                setPendingRequests(prev => prev.filter(r => r._id !== requestId));
            }
            return { success: response.ok };
        } catch (error) {
            return { success: false, message: "Network error" };
        }
    };

    const addRace = async (newRace) => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/races`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}),
                },
                body: JSON.stringify(newRace),
            });
            if (response.status === 401) return logout();
            const data = await response.json();
            if (!response.ok) {
                console.error('addRace error:', data);
                return { success: false, message: data.message || 'Failed to create race' };
            }
            setRaces((prev) => [...prev, data]);
            return { success: true, data };
        } catch (error) {
            console.error('Error adding race:', error);
            return { success: false, message: error.message };
        }
    };

    const updateRace = async (id, updatedData) => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/races/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`,
                },
                body: JSON.stringify(updatedData),
            });
            if (response.status === 401) return logout();
            const data = await response.json();
            if (response.ok) {
                setRaces((prev) => prev.map(race => race._id === id ? data : race));
                return { success: true, data };
            } else {
                return { success: false, message: data.message || 'Failed to update race' };
            }
        } catch (error) {
            console.error("Error updating race:", error);
            return { success: false, message: error.message };
        }
    };

    const deleteRace = async (id) => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/races/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                },
            });
            if (response.status === 401) return logout();
            setRaces((prev) => prev.filter(race => race._id !== id));
            return { success: true };
        } catch (error) {
            console.error("Error deleting race:", error);
            return { success: false, message: error.message };
        }
    };

    const joinRace = async (id) => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/races/${id}/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                },
            });
            if (response.status === 401) return logout();
            const data = await response.json();
            if (response.ok) {
                setRaces((prev) => prev.map(race => race._id === id ? data : race));
                return { success: true, data };
            } else {
                return { success: false, message: data.message || 'Failed to join race' };
            }
        } catch (error) {
            console.error("Error joining race:", error);
            return { success: false, message: "Network error. Is the server running?" };
        }
    };

    const leaveRace = async (id) => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/races/${id}/leave`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setRaces((prev) => prev.map(race => race._id === id ? data : race));
                return { success: true, data };
            } else {
                return { success: false, message: data.message || 'Failed to leave race' };
            }
        } catch (error) {
            console.error("Error leaving race:", error);
            return { success: false, message: "Network error." };
        }
    };

    const checkIn = async (id) => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/races/${id}/checkin`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (response.status === 401) return logout();
            const data = await response.json();
            if (response.ok) {
                setRaces(prev => prev.map(r => r._id === id ? data : r));
            }
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, message: "Network error" };
        }
    };

    const startCountdown = async (id) => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/races/${id}/start-countdown`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (response.status === 401) return logout();
            const data = await response.json();
            if (response.ok) {
                setRaces(prev => prev.map(r => r._id === id ? { ...r, startTime: data.startTime, status: 'Active' } : r));
            }
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, message: "Network error" };
        }
    };

    const completeRace = async (id, winners) => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/races/${id}/complete`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}` 
                },
                body: JSON.stringify({ winners })
            });
            if (response.status === 401) return logout();
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, message: "Network error" };
        }
    };

    const sendTelemetryPulse = async (id, telemetryData) => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/races/${id}/telemetry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify(telemetryData)
            });
            return { success: response.ok };
        } catch (error) {
            return { success: false };
        }
    };

    const sendRaceCommand = async (id, command, payload = {}) => {
        try {
            const response = await measureFetch(`${API_BASE_URL}/api/races/${id}/command`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({ command, payload })
            });
            return { success: response.ok };
        } catch (error) {
            return { success: false };
        }
    };

    const filteredRaces = useMemo(() => {
        return races.filter(race => {
            const matchesSector = filters.sectors.length === 0 || filters.sectors.includes(race.sector);
            const matchesType = filters.types.length === 0 || filters.types.includes(race.type);
            const raceDistance = parseFloat(race.trackLength) || 0;
            const filterDistance = parseFloat(filters.maxDistance) || 5000;
            const matchesDistance = raceDistance <= filterDistance;
            return matchesSector && matchesType && matchesDistance;
        });
    }, [races, filters]);

    return (
        <RaceContext.Provider value={{ 
            races, filteredRaces, filters, setFilters, fetchRaces, getRaceById, addRace, updateRace, deleteRace, joinRace, leaveRace, isLoading,
            pendingRequests, fetchPendingRequests, myRequests, fetchMyRequests, requestToJoin, approveRequest, rejectRequest,
            unreadCount, fetchUnreadCount,
            checkIn, startCountdown, completeRace, sendTelemetryPulse, sendRaceCommand
        }}>
            {children}
        </RaceContext.Provider>
    );
}

export function useRaces() {
    return useContext(RaceContext);
}
