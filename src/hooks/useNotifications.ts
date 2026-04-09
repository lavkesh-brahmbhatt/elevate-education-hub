import { useState, useEffect } from 'react';
import api from '@/services/api';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data || []);
            setUnreadCount(data.filter((n: any) => !n.readAt).length);
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read');
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark read');
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchNotifications();

        // Polling every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    return { notifications, unreadCount, markAllRead, refresh: fetchNotifications };
};
