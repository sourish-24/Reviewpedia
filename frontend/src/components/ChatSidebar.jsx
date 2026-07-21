import React from 'react';
import { ArrowLeft, User as UserIcon } from 'lucide-react';

export default function ChatSidebar({ conversations, activeConversation, onSelectConversation, onClose, currentUser }) {
    const getOtherParticipant = (convo) => {
        return convo.participants.find(p => p.username !== currentUser.username) || { username: 'Unknown' };
    };

    return (
        <div style={{ 
            width: '350px', 
            borderRight: '1px solid var(--outline-variant)', 
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: 'var(--surface-lowest)',
            height: '100%'
        }}>
            <div style={{ 
                height: '72px',
                padding: '0 24px',
                boxSizing: 'border-box',
                borderBottom: '1px solid var(--outline-variant)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px' 
            }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--on-surface)' }}>Chats</h2>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {conversations.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>
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
                                    padding: '15px 20px',
                                    display: 'flex',
                                    gap: '15px',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: isActive ? 'var(--surface-highest)' : 'transparent',
                                    borderBottom: '1px solid var(--outline-variant)',
                                    transition: 'background-color 0.2s'
                                }}
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
                                        backgroundColor: 'var(--primary)', color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0
                                    }}>
                                        {otherUser.username[0].toUpperCase()}
                                    </div>
                                )}
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <h4 style={{ margin: 0, color: 'var(--on-surface)', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {otherUser.username}
                                        </h4>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                                            {new Date(convo.lastMessageAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
