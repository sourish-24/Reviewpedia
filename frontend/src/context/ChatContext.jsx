import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getAuthHeaders, getJsonAuthHeaders } from '../utils/apiUtils';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        return {
            unreadChatCount: 0,
            refreshUnreadCount: () => {},
            markConversationRead: () => {},
            socket: null
        };
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [socket, setSocket] = useState(null);

    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const API_URL = import.meta.env.VITE_API_URL || (isLocalhost ? '' : 'https://reviewpedia.onrender.com');
    const SOCKET_URL = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:3001' : 'https://reviewpedia.onrender.com');

    // Fetch total unread count from server
    const refreshUnreadCount = useCallback(async () => {
        if (!user) {
            setUnreadChatCount(0);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/chat/unread-count`, {
                headers: getAuthHeaders(),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success && typeof data.unreadCount === 'number') {
                setUnreadChatCount(data.unreadCount);
            }
        } catch (err) {
            console.error('Failed to fetch unread chat count:', err);
        }
    }, [user, API_URL]);

    // Mark a specific conversation as read
    const markConversationRead = useCallback(async (conversationId) => {
        if (!user || !conversationId) return;
        try {
            const res = await fetch(`${API_URL}/api/chat/conversations/${conversationId}/read`, {
                method: 'PUT',
                headers: getJsonAuthHeaders(),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                refreshUnreadCount();
            }
        } catch (err) {
            console.error('Failed to mark conversation as read:', err);
        }
    }, [user, API_URL, refreshUnreadCount]);

    // Initialize socket connection & unread count on user login
    useEffect(() => {
        if (!user) {
            setUnreadChatCount(0);
            if (socket) {
                socket.close();
                setSocket(null);
            }
            return;
        }

        // Fetch initial unread count
        refreshUnreadCount();

        // Connect socket for real-time unread updates across pages
        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
        });

        const userId = (user.id || user._id)?.toString();

        newSocket.on('connect', () => {
            if (userId) {
                newSocket.emit('join', userId);
            }
        });

        newSocket.on('receive_message', () => {
            refreshUnreadCount();
        });

        newSocket.on('unread_count_update', () => {
            refreshUnreadCount();
        });

        newSocket.on('message_deleted', () => {
            refreshUnreadCount();
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [user, API_URL]);

    return (
        <ChatContext.Provider value={{ unreadChatCount, setUnreadChatCount, refreshUnreadCount, markConversationRead, socket }}>
            {children}
        </ChatContext.Provider>
    );
};
