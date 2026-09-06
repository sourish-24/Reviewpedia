import React, { useState } from 'react';
import { Bell } from 'lucide-react';

/**
 * Reusable Notification Icon component for headers.
 * 
 * - Appears on the left side of the profile picture in headers across pages.
 * - Shows an unread notification count badge (if unreadCount > 0).
 * - Has NO background color (pure icon presentation with smooth hover color transition).
 * 
 * @param {Object} props
 * @param {number} [props.unreadCount=0] - Number of unread notifications to display on the badge.
 * @param {string} [props.color='#ffffff'] - Base icon color.
 * @param {string} [props.hoverColor='#0ea5e9'] - Color on hover.
 * @param {number} [props.size=22] - Icon size in pixels.
 * @param {Function} [props.onClick] - Click handler.
 * @param {string} [props.className=''] - Additional CSS classes.
 * @param {React.CSSProperties} [props.style={}] - Style overrides.
 */
export default function NotificationIcon({
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
      title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'Notifications'}
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
      <Bell size={size} strokeWidth={2} fill={fillColor} />

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
            backgroundColor: '#ef4444',
            color: '#ffffff',
            fontSize: '0.62rem',
            fontWeight: 700,
            fontFamily: 'var(--font-body)',
            lineHeight: '16px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
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
