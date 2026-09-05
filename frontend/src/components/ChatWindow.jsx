import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Loader2, Trash2, MapPin } from 'lucide-react';
import LocationPickerModal from './LocationPickerModal';
import MediaLightbox from './MediaLightbox';
import ConfirmModal from './ConfirmModal';
import { getAuthHeaders, getJsonAuthHeaders } from '../utils/apiUtils';

export default function ChatWindow({ conversation, currentUser, socket, onMessageSent }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [files, setFiles] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
    const [lightboxData, setLightboxData] = useState({ isOpen: false, initialIndex: 0 });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const [isPaperclipHovered, setIsPaperclipHovered] = useState(false);
    const [isMapPinHovered, setIsMapPinHovered] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const requestConfirm = (title, message, onConfirmAction) => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                await onConfirmAction();
            }
        });
    };

    const otherUser = React.useMemo(() => {
        if (!conversation || !Array.isArray(conversation.participants)) {
            return { username: 'Deleted User', profilePic: null };
        }
        const found = conversation.participants.find(p => p && p.username && p.username !== currentUser?.username);
        return found || { username: 'Deleted User', profilePic: null };
    }, [conversation, currentUser]);

    useEffect(() => {
        fetchMessages();
    }, [conversation._id]);

    useEffect(() => {
        if (!socket) return;
        
        const handleNewMessage = (newMessage) => {
            if (newMessage.conversationId === conversation._id) {
                setMessages(prev => [...prev, newMessage]);
                scrollToBottom();
            }
        };

        const handleMessageDeleted = ({ messageId }) => {
            setMessages(prev => prev.filter(m => m._id !== messageId));
            if (onMessageSent) onMessageSent();
        };

        socket.on('receive_message', handleNewMessage);
        socket.on('message_deleted', handleMessageDeleted);
        return () => {
            socket.off('receive_message', handleNewMessage);
            socket.off('message_deleted', handleMessageDeleted);
        };
    }, [socket, conversation._id]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const fetchMessages = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://reviewpedia.onrender.com';
            const res = await fetch(`${API_URL}/api/chat/messages/${conversation._id}`, { 
                headers: getAuthHeaders(),
                credentials: 'include' 
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
                scrollToBottom();
            }
        } catch (e) {
            console.error("Failed to fetch messages", e);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!text.trim() && files.length === 0) || isSending) return;

        setIsSending(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://reviewpedia.onrender.com';
            
            // Send text message first if it exists
            if (text.trim()) {
                const textPayload = {
                    conversationId: conversation._id,
                    receiverId: otherUser._id,
                    text: text.trim(),
                    mediaUrl: null,
                    mediaType: 'none'
                };
                const textRes = await fetch(`${API_URL}/api/chat/messages`, {
                    method: 'POST',
                    headers: getJsonAuthHeaders(),
                    credentials: 'include',
                    body: JSON.stringify(textPayload)
                });
                const textData = await textRes.json();
                if (textData.success) {
                    setMessages(prev => [...prev, textData.message]);
                } else {
                    throw new Error(textData.error?.message || "Failed to send text");
                }
            }

            // Send each file as a separate message
            for (let i = 0; i < files.length; i++) {
                const currentFile = files[i];
                const formData = new FormData();
                formData.append('file', currentFile);
                
                const uploadRes = await fetch(`${API_URL}/api/chat/upload`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    credentials: 'include',
                    body: formData
                });
                const uploadData = await uploadRes.json();
                
                if (uploadData.success) {
                    const mediaPayload = {
                        conversationId: conversation._id,
                        receiverId: otherUser._id,
                        text: '',
                        mediaUrl: uploadData.mediaUrl,
                        mediaType: uploadData.mediaType,
                        mediaSize: uploadData.mediaSize
                    };
                    const mediaRes = await fetch(`${API_URL}/api/chat/messages`, {
                        method: 'POST',
                        headers: getJsonAuthHeaders(),
                        credentials: 'include',
                        body: JSON.stringify(mediaPayload)
                    });
                    const mediaData = await mediaRes.json();
                    if (mediaData.success) {
                        setMessages(prev => [...prev, mediaData.message]);
                    } else {
                        alert(mediaData.error?.message || "Failed to send media");
                    }
                } else {
                    alert(uploadData.error?.message || "Failed to upload media");
                }
            }

            setText('');
            setFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
            scrollToBottom();
            if (onMessageSent) onMessageSent();

        } catch (e) {
            console.error("Failed to send message", e);
            alert("Error sending message: " + e.message);
        } finally {
            setIsSending(false);
        }
    };

    const handleShareLocation = () => {
        setIsLocationPickerOpen(true);
    };

    const handleConfirmLocation = async (position) => {
        setIsLocationPickerOpen(false);
        setIsSending(true);
        const { lat, lng } = position;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://reviewpedia.onrender.com';
            const payload = {
                conversationId: conversation._id,
                receiverId: otherUser._id,
                text: '',
                mediaType: 'location',
                location: {
                    lat,
                    lng,
                    address: `Shared Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
                }
            };

            const res = await fetch(`${API_URL}/api/chat/messages`, {
                method: 'POST',
                headers: getJsonAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                setMessages(prev => [...prev, data.message]);
                scrollToBottom();
                if (onMessageSent) onMessageSent();
            } else {
                alert(data.error?.message || "Failed to send location");
            }
        } catch (err) {
            console.error("Failed to send location", err);
            alert("Failed to send location: " + err.message);
        } finally {
            setIsSending(false);
        }
    };

    const mediaMessages = messages.filter(m => m.mediaType === 'image' || m.mediaType === 'video');

    const groupedMessages = React.useMemo(() => {
        const groups = [];
        let currentGroup = null;

        for (const msg of messages) {
            const isMediaOnly = !msg.text && (msg.mediaType === 'image' || msg.mediaType === 'video');
            const senderName = msg.sender?.username || ((msg.sender === currentUser?.id || msg.sender?._id === currentUser?.id) ? currentUser?.username : 'Deleted User');
            
            if (currentGroup && currentGroup.senderUsername === senderName && isMediaOnly && currentGroup.isMediaOnlyGroup) {
                currentGroup.messages.push(msg);
            } else {
                if (currentGroup) groups.push(currentGroup);
                currentGroup = {
                    senderUsername: senderName,
                    isMediaOnlyGroup: isMediaOnly,
                    messages: [msg],
                    createdAt: msg.createdAt,
                    id: msg._id
                };
            }
        }
        if (currentGroup) groups.push(currentGroup);
        return groups;
    }, [messages, currentUser]);

    const handleMediaClick = (msg) => {
        const index = mediaMessages.findIndex(m => m._id === msg._id);
        if (index !== -1) {
            setLightboxData({ isOpen: true, initialIndex: index });
        }
    };

    const renderMedia = (msg, isMine) => {
        if (msg.mediaType === 'location' && msg.location) {
            return (
                <div style={{ marginTop: msg.text ? '6px' : '0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>
                        <MapPin size={18} color="#0ea5e9" />
                        <span>Location Shared</span>
                    </div>
                    <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${msg.location.lat},${msg.location.lng}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#38bdf8', textDecoration: 'underline', fontSize: '0.88rem', fontWeight: 500 }}
                    >
                        View on Map
                    </a>
                </div>
            );
        }
        if (!msg.mediaUrl) return null;
        if (msg.mediaType === 'image') {
            return (
                <img 
                    src={msg.mediaUrl} 
                    alt="attachment" 
                    onClick={() => handleMediaClick(msg)}
                    style={{ width: '220px', height: '220px', objectFit: 'cover', borderRadius: '16px', marginTop: msg.text ? '8px' : '0', cursor: 'pointer' }} 
                />
            );
        }
        if (msg.mediaType === 'video') {
            return (
                <div style={{ position: 'relative', width: '220px', height: '220px', marginTop: msg.text ? '8px' : '0', cursor: 'pointer' }} onClick={() => handleMediaClick(msg)}>
                    <video style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px', pointerEvents: 'none' }}>
                        <source src={msg.mediaUrl} type="video/mp4" />
                    </video>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            ▶
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const handleDeleteConversation = () => {
        requestConfirm(
            "Delete Chat",
            `Are you sure you want to permanently delete this entire chat with ${otherUser.username}? All messages and media will be lost.`,
            async () => {
                setIsDeleting(true);
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'https://reviewpedia.onrender.com';
                    const res = await fetch(`${API_URL}/api/chat/conversations/${conversation._id}`, {
                        method: 'DELETE',
                        headers: getAuthHeaders(),
                        credentials: 'include'
                    });
                    const data = await res.json();
                    
                    if (data.success) {
                        if (onMessageSent) onMessageSent(); 
                        window.location.reload(); 
                    } else {
                        alert("Failed to delete chat: " + (data.error?.message || "Unknown error"));
                    }
                } catch (e) {
                    console.error("Failed to delete chat", e);
                    alert("Error: " + e.message);
                } finally {
                    setIsDeleting(false);
                }
            }
        );
    };

    const handleDeleteMessage = (messageId, onSuccess) => {
        requestConfirm(
            "Delete Message",
            "Are you sure you want to permanently delete this message? Any attached media will be deleted.",
            async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'https://reviewpedia.onrender.com';
                    const res = await fetch(`${API_URL}/api/chat/messages/${messageId}`, {
                        method: 'DELETE',
                        headers: getAuthHeaders(),
                        credentials: 'include'
                    });
                    const data = await res.json();
                    if (data.success) {
                        setMessages(prev => prev.filter(m => m._id !== messageId));
                        if (onMessageSent) onMessageSent();
                        if (onSuccess) onSuccess();
                    } else {
                        alert("Failed to delete message: " + (data.error?.message || "Unknown error"));
                    }
                } catch (e) {
                    console.error("Failed to delete message", e);
                    alert("Error: " + e.message);
                }
            }
        );
    };

    const handleDeleteGroup = (group) => {
        requestConfirm(
            "Delete chats",
            `Are you sure you want to permanently delete ${group.messages.length > 1 ? 'these ' + group.messages.length + ' messages' : 'this message'}? Any attached media will be deleted.`,
            async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'https://reviewpedia.onrender.com';
                    const messageIds = group.messages.map(m => m._id);
                    
                    for (const messageId of messageIds) {
                        const res = await fetch(`${API_URL}/api/chat/messages/${messageId}`, {
                            method: 'DELETE',
                            headers: getAuthHeaders(),
                            credentials: 'include'
                        });
                        const data = await res.json();
                        if (data.success) {
                            setMessages(prev => prev.filter(m => m._id !== messageId));
                        }
                    }
                    if (onMessageSent) onMessageSent();
                } catch (e) {
                    console.error("Failed to delete group", e);
                    alert("Error: " + e.message);
                }
            }
        );
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#161E2E', fontFamily: 'var(--font-body)' }}>
            {/* Header */}
            <div style={{ height: '72px', padding: '0 24px', boxSizing: 'border-box', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#161E2E' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {otherUser.profilePic ? (
                        <img 
                            src={otherUser.profilePic} 
                            alt="Profile" 
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                    ) : (
                        <div style={{ 
                            width: '40px', height: '40px', borderRadius: '50%', 
                            backgroundColor: '#0ea5e9', color: '#ffffff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: '1.2rem'
                        }}>
                            {(otherUser.username ? otherUser.username[0] : 'D').toUpperCase()}
                        </div>
                    )}
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{otherUser.username}</h3>
                </div>
                
                <button 
                    onClick={handleDeleteConversation}
                    disabled={isDeleting}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', borderRadius: '8px', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Delete Chat"
                >
                    {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                </button>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', backgroundColor: '#161E2E' }}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px', fontSize: '0.95rem' }}>
                        Say hi to {otherUser.username}!
                    </div>
                ) : (
                    groupedMessages.map((group, idx) => {
                        const isMine = group.senderUsername === currentUser.username;
                        const isHovered = hoveredMessageId === group.id;
                        return (
                            <div 
                                key={idx} 
                                onMouseEnter={() => setHoveredMessageId(group.id)}
                                onMouseLeave={() => setHoveredMessageId(null)}
                                style={{ 
                                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                                    alignItems: isMine ? 'flex-end' : 'flex-start',
                                    maxWidth: '70%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    flexDirection: isMine ? 'row' : 'row-reverse',
                                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                                    width: '100%'
                                }}>
                                    {isMine && isHovered && !group.isMediaOnlyGroup && (
                                        <button 
                                            onClick={() => handleDeleteGroup(group)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
                                            title="Delete Message"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                    <div style={{
                                        backgroundColor: group.isMediaOnlyGroup ? 'transparent' : (isMine ? '#1A355B' : 'rgba(255, 255, 255, 0.08)'),
                                        color: '#ffffff',
                                        padding: group.isMediaOnlyGroup ? 0 : '10px 16px',
                                        borderRadius: group.isMediaOnlyGroup ? '0px' : (isMine ? '18px 18px 0 18px' : '18px 18px 18px 0'),
                                        boxShadow: 'none',
                                        wordBreak: 'break-word',
                                        fontSize: '0.95rem',
                                        lineHeight: 1.5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: isMine ? 'flex-end' : 'flex-start'
                                    }}>
                                        {group.isMediaOnlyGroup ? (
                                            <div style={{ 
                                                display: 'flex', 
                                                flexWrap: 'wrap', 
                                                gap: '8px',
                                                justifyContent: isMine ? 'flex-end' : 'flex-start',
                                                width: '100%'
                                            }}>
                                                {group.messages.map(m => <React.Fragment key={m._id}>{renderMedia(m, isMine)}</React.Fragment>)}
                                            </div>
                                        ) : (
                                            <>
                                                {group.messages[0].text && <div style={{ lineHeight: 1.4 }}>{group.messages[0].text}</div>}
                                                {renderMedia(group.messages[0], isMine)}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div style={{ 
                                    fontSize: '0.7rem', 
                                    color: '#94a3b8', 
                                    marginTop: '4px',
                                    padding: '0 4px',
                                    alignSelf: isMine ? 'flex-end' : 'flex-start'
                                }}>
                                    {new Date(group.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '10px 24px', backgroundColor: '#28303E', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                {files.length > 0 && (
                    <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {files.map((fileObj, idx) => (
                            <div key={idx} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                backgroundColor: 'rgba(255, 255, 255, 0.08)', 
                                padding: '6px 14px', 
                                borderRadius: '9999px',
                                fontSize: '0.85rem',
                                color: '#0ea5e9',
                                border: 'none'
                            }}>
                                <Paperclip size={14} />
                                <span style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {fileObj.name}
                                </span>
                                <button 
                                    onClick={() => {
                                        const newFiles = files.filter((_, i) => i !== idx);
                                        setFiles(newFiles);
                                        if (newFiles.length === 0 && fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }} 
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '4px', padding: '2px', borderRadius: '4px' }}
                                    title="Remove file"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        multiple
                        onChange={(e) => {
                            if (e.target.files) {
                                setFiles(prev => [...prev, ...Array.from(e.target.files)]);
                            }
                        }}
                        style={{ display: 'none' }}
                        accept="image/*,video/*"
                    />
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        onMouseEnter={() => setIsPaperclipHovered(true)}
                        onMouseLeave={() => setIsPaperclipHovered(false)}
                        style={{ background: '#28303E', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        disabled={isSending}
                        title="Attach Media"
                    >
                        <Paperclip size={18} color={isPaperclipHovered ? '#ffffff' : '#94a3b8'} style={{ transition: 'color 0.2s' }} />
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={handleShareLocation}
                        onMouseEnter={() => setIsMapPinHovered(true)}
                        onMouseLeave={() => setIsMapPinHovered(false)}
                        style={{ background: '#28303E', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        disabled={isSending}
                        title="Attach Location"
                    >
                        <MapPin size={18} color={isMapPinHovered ? '#ffffff' : '#94a3b8'} style={{ transition: 'color 0.2s' }} />
                    </button>
                    
                    <input 
                        type="text" 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type a message..."
                        style={{ flex: 1, padding: '10px 20px', borderRadius: '9999px', border: 'none', background: '#28303E', color: '#ffffff', fontSize: '0.92rem', outline: 'none', fontFamily: 'var(--font-body)' }}
                        disabled={isSending}
                    />
                    
                    <button 
                        type="submit" 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, opacity: (!text.trim() && files.length === 0) ? 0.4 : 1, cursor: (!text.trim() && files.length === 0) ? 'not-allowed' : 'pointer', flexShrink: 0 }}
                        disabled={(!text.trim() && files.length === 0) || isSending}
                    >
                        {isSending ? <Loader2 size={20} className="animate-spin" color="#0EA5E9" /> : <Send size={20} color="#0EA5E9" />}
                    </button>
                </form>
            </div>
            {isLocationPickerOpen && (
                <LocationPickerModal 
                    onClose={() => setIsLocationPickerOpen(false)}
                    onConfirm={handleConfirmLocation}
                />
            )}
            {lightboxData.isOpen && (
                <MediaLightbox 
                    mediaMessages={mediaMessages}
                    initialIndex={lightboxData.initialIndex}
                    onClose={() => setLightboxData({ isOpen: false, initialIndex: 0 })}
                    currentUser={currentUser}
                    onDelete={(id) => {
                        handleDeleteMessage(id, () => {
                            if (mediaMessages.length <= 1) {
                                setLightboxData({ isOpen: false, initialIndex: 0 });
                            }
                        });
                    }}
                />
            )}
            
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
