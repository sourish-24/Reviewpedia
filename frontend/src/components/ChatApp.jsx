import React, { useState, useEffect } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { io } from 'socket.io-client';

export default function ChatApp({ currentUser, onClose, initialChatUser }) {
    const [socket, setSocket] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const newSocket = io(API_URL, {
            withCredentials: true,
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            newSocket.emit('join', currentUser.id);
        });

        newSocket.on('disconnect', () => setIsConnected(false));
        
        newSocket.on('receive_message', (message) => {
            // Re-fetch conversations to update latest message order
            fetchConversations();
        });

        newSocket.on('message_deleted', () => {
            fetchConversations();
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, [currentUser]);

    const fetchConversations = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/chat/conversations`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setConversations(data.conversations);
            }
        } catch (e) {
            console.error("Failed to fetch conversations", e);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (initialChatUser) {
            startConversation(initialChatUser);
        }
    }, [initialChatUser]);

    const startConversation = async (targetUsername) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/chat/conversations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ targetUsername })
            });
            const data = await res.json();
            if (data.success) {
                setActiveConversation(data.conversation);
                fetchConversations();
            }
        } catch (e) {
            console.error("Failed to start conversation", e);
        }
    };

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'var(--surface-lowest)', zIndex: 9000, display: 'flex',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <ChatSidebar 
                conversations={conversations} 
                activeConversation={activeConversation}
                onSelectConversation={setActiveConversation}
                onClose={onClose}
                currentUser={currentUser}
            />
            {activeConversation ? (
                <ChatWindow 
                    conversation={activeConversation} 
                    currentUser={currentUser} 
                    socket={socket} 
                    onMessageSent={fetchConversations}
                />
            ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-lowest)' }}>
                    <div style={{ textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>💬</div>
                        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--on-surface)' }}>Your Messages</h2>
                        <p style={{ fontFamily: 'var(--font-body)' }}>Select a conversation or start a new one to begin chatting.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
