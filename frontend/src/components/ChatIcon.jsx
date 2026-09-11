import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * Reusable Chat Icon component for headers.
 * 
 * - Appears beside NotificationIcon in headers across pages.
 * - Black outline with #F8F4F0 inside.
 * - Smooth hover transition to #0ea5e9 and subtle scale up.
 */
export default function ChatIcon({
  unreadCount = 0,
  color = '#000000',
  fillColor = '#F8F4F0',
  hoverColor = '#0ea5e9',
  size = 22,
  onClick,
  className = '',
  style = {}
}) {
  const [isHovered, setIsHovered] = useState(false);

  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Chats"
      className={className}
      style={{
        background: 'none',
        backgroundColor: 'transparent',
        border: 'none',
        outline: 'none',
        padding: '6px',
        margin: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        color: isHovered ? hoverColor : color,
        transition: 'color 0.2s ease, transform 0.15s ease',
        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
        boxShadow: 'none',
        ...style
      }}
    >
      <MessageCircle size={size} strokeWidth={2} fill={fillColor} />

      {/* Unread count badge */}
      {unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            minWidth: '16px',
            height: '16px',
            padding: '0 4px',
            borderRadius: '9999px',
            backgroundColor: '#0ea5e9',
            color: '#ffffff',
            fontSize: '0.62rem',
            fontWeight: 700,
            fontFamily: 'var(--font-body)',
            lineHeight: '16px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'none',
            pointerEvents: 'none',
            boxSizing: 'border-box'
          }}
        >
          {displayCount}
        </span>
      )}
    </button>
  );
}
