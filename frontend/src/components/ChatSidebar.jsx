import React from 'react';
import { ArrowLeft, User as UserIcon } from 'lucide-react';

export default function ChatSidebar({ conversations, activeConversation, onSelectConversation, onClose, currentUser }) {
    const getOtherParticipant = (convo) => {
        return convo.participants.find(p => p.username !== currentUser.username) || { username: 'Unknown' };
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
                padding: '0 24px',
                boxSizing: 'border-box',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
                display: 'flex', 
                alignItems: 'center'
            }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Chats</h2>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {conversations.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                        No active conversations yet.
                    </div>
                ) : (
                    conversations.map(convo => {
                        const otherUser = getOtherParticipant(convo);
                        const isActive = activeConversation && activeConversation._id === convo._id;
                        
                        return (
                            <div 
                                key={convo._id}
                                onClick={() => onSelectConversation(convo)}
                                style={{
                                    padding: '18px 20px',
                                    display: 'flex',
                                    gap: '15px',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                                    transition: 'background-color 0.2s',
                                    borderLeft: isActive ? '3px solid #0ea5e9' : '3px solid transparent'
                                }}
                                onMouseOver={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'; }}
                                onMouseOut={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                                {otherUser.profilePic ? (
                                    <img 
                                        src={otherUser.profilePic} 
                                        alt="Profile" 
                                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
                                    />
                                ) : (
                                    <div style={{ 
                                        width: '48px', height: '48px', borderRadius: '50%', 
                                        backgroundColor: '#0ea5e9', color: '#ffffff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0
                                    }}>
                                        {otherUser.username[0].toUpperCase()}
                                    </div>
                                )}
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <h4 style={{ margin: 0, color: '#ffffff', fontSize: '0.95rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {otherUser.username}
                                        </h4>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                            {new Date(convo.lastMessageAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {convo.lastMessage || 'Started a conversation'}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
