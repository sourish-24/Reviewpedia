import React, { useState, useEffect } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import LoadingPopup from './LoadingPopup';
import { io } from 'socket.io-client';
import { getAuthHeaders, getJsonAuthHeaders } from '../utils/apiUtils';

export default function ChatApp({ currentUser, onClose, initialChatUser }) {
    const [socket, setSocket] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [activeConversation, setActiveConversation] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'https://reviewpedia.onrender.com';
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

    const fetchConversations = async (showLoading = false) => {
        if (showLoading) setIsLoadingConversations(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://reviewpedia.onrender.com';
            const res = await fetch(`${API_URL}/api/chat/conversations`, { 
                headers: getAuthHeaders(),
                credentials: 'include' 
            });
            const data = await res.json();
            if (data.success) {
                setConversations(data.conversations);
            }
        } catch (e) {
            console.error("Failed to fetch conversations", e);
        } finally {
            setIsLoadingConversations(false);
        }
    };

    useEffect(() => {
        fetchConversations(true);
    }, []);

    useEffect(() => {
        if (initialChatUser) {
            startConversation(initialChatUser);
        }
    }, [initialChatUser]);

    const startConversation = async (targetUsername) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://reviewpedia.onrender.com';
            const res = await fetch(`${API_URL}/api/chat/conversations`, {
                method: 'POST',
                headers: getJsonAuthHeaders(),
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

    const handleConversationDeleted = () => {
        setActiveConversation(null);
        fetchConversations(false);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: '#161E2E', zIndex: 9000, display: 'flex'
        }}>
            <LoadingPopup message={isLoadingConversations ? "Loading chats..." : null} zIndex={9999} />
            <ChatSidebar 
                conversations={conversations} 
                activeConversation={activeConversation}
                onSelectConversation={setActiveConversation}
                onClose={onClose}
                currentUser={currentUser}
                isLoading={isLoadingConversations}
            />
            {activeConversation ? (
                <ChatWindow 
                    conversation={activeConversation} 
                    currentUser={currentUser} 
                    socket={socket} 
                    onMessageSent={fetchConversations}
                    onConversationDeleted={handleConversationDeleted}
                />
            ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#161E2E', fontFamily: 'var(--font-body)' }}>
                    <div style={{ textAlign: 'center', padding: '0 24px' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', color: '#ffffff', fontSize: '1.8rem', fontWeight: 600, margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
                            Your Messages
                        </h2>
                        <p style={{ fontFamily: 'var(--font-body)', color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.8, margin: 0, maxWidth: 360 }}>
                            Select a conversation or start a new one to begin chatting with local reviewers.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
