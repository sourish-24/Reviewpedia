import React from 'react';
import { ArrowLeft, User as UserIcon } from 'lucide-react';

export default function ChatSidebar({ conversations, activeConversation, onSelectConversation, onClose, currentUser, isLoading }) {
    const getOtherParticipant = (convo) => {
        if (!convo || !Array.isArray(convo.participants)) return { username: 'Deleted User', profilePic: null };
        const found = convo.participants.find(p => p && p.username && p.username !== currentUser?.username);
        return found || { username: 'Deleted User', profilePic: null };
    };

    return (
        <div style={{ 
            width: '350px', 
            borderRight: '1px solid rgba(255, 255, 255, 0.08)', 
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: '#161E2E',
            height: '100%',
            fontFamily: 'var(--font-body)'
        }}>
            <div style={{ 
                height: '72px',
                padding: '0 20px',
                boxSizing: 'border-box',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
                display: 'flex', 
                alignItems: 'center',
                gap: '12px'
            }}>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '6px',
                            borderRadius: '8px',
                            transition: 'color 0.2s, background-color 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.color = '#94a3b8';
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="Back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Chats</h2>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {isLoading ? null : conversations.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                        No active conversations yet.
                    </div>
                ) : (
                    conversations.map(convo => {
                        const otherUser = getOtherParticipant(convo);
                        const isActive = activeConversation && activeConversation._id === convo._id;
                        const unreadCount = convo.unreadCount || 0;
                        const hasUnread = unreadCount > 0;
                        
                        return (
                            <div 
                                key={convo._id}
                                onClick={() => onSelectConversation(convo)}
                                style={{
                                    padding: '16px 20px',
                                    display: 'flex',
                                    gap: '14px',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: isActive 
                                        ? 'rgba(255, 255, 255, 0.08)' 
                                        : hasUnread 
                                            ? 'rgba(14, 165, 233, 0.06)' 
                                            : 'transparent',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                                    transition: 'background-color 0.2s',
                                    borderLeft: isActive 
                                        ? '3px solid #0ea5e9' 
                                        : hasUnread 
                                            ? '3px solid #0ea5e9' 
                                            : '3px solid transparent'
                                }}
                                onMouseOver={(e) => { 
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = hasUnread ? 'rgba(14, 165, 233, 0.1)' : 'rgba(255, 255, 255, 0.04)'; 
                                    }
                                }}
                                onMouseOut={(e) => { 
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = hasUnread ? 'rgba(14, 165, 233, 0.06)' : 'transparent'; 
                                    }
                                }}
                            >
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    {otherUser.profilePic ? (
                                        <img 
                                            src={otherUser.profilePic} 
                                            alt="Profile" 
                                            style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', display: 'block' }} 
                                        />
                                    ) : (
                                        <div style={{ 
                                            width: '46px', height: '46px', borderRadius: '50%', 
                                            backgroundColor: '#0ea5e9', color: '#ffffff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', fontSize: '1.15rem'
                                        }}>
                                            {(otherUser.username ? otherUser.username[0] : 'D').toUpperCase()}
                                        </div>
                                    )}
                                    {hasUnread && (
                                        <span style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: '12px',
                                            height: '12px',
                                            backgroundColor: '#0ea5e9',
                                            borderRadius: '50%',
                                            border: '2px solid #161E2E'
                                        }} />
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <h4 style={{ 
                                            margin: 0, 
                                            color: '#ffffff', 
                                            fontSize: '0.95rem', 
                                            fontWeight: hasUnread ? 700 : 600, 
                                            whiteSpace: 'nowrap', 
                                            overflow: 'hidden', 
                                            textOverflow: 'ellipsis' 
                                        }}>
                                            {otherUser.username}
                                        </h4>
                                        <span style={{ 
                                            fontSize: '0.72rem', 
                                            color: hasUnread ? '#38bdf8' : '#94a3b8',
                                            fontWeight: hasUnread ? 600 : 400,
                                            flexShrink: 0,
                                            marginLeft: '8px'
                                        }}>
                                            {new Date(convo.lastMessageAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                        <p style={{ 
                                            margin: 0, 
                                            fontSize: '0.84rem', 
                                            color: hasUnread ? '#e2e8f0' : '#94a3b8', 
                                            fontWeight: hasUnread ? 600 : 400,
                                            whiteSpace: 'nowrap', 
                                            overflow: 'hidden', 
                                            textOverflow: 'ellipsis',
                                            flex: 1
                                        }}>
                                            {convo.lastMessage || 'Started a conversation'}
                                        </p>
                                        {hasUnread && (
                                            <span style={{
                                                backgroundColor: '#0ea5e9',
                                                color: '#ffffff',
                                                fontSize: '0.68rem',
                                                fontWeight: 700,
                                                padding: '1px 6px',
                                                borderRadius: '9999px',
                                                flexShrink: 0,
                                                minWidth: '18px',
                                                height: '18px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxSizing: 'border-box'
                                            }}>
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
