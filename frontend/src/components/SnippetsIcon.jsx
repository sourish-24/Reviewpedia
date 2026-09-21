import React, { useState } from 'react';
import { Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable Snippets Icon component for headers.
 * 
 * - Appears beside ChatIcon and NotificationIcon in headers across pages.
 * - Black outline with #F8F4F0 inside.
 * - Smooth hover transition to #0ea5e9 and subtle scale up.
 */
export default function SnippetsIcon({
  color = '#000000',
  fillColor = '#F8F4F0',
  hoverColor = '#0ea5e9',
  size = 22,
  onClick,
  className = '',
  style = {},
  title = 'Watch Snippets'
}) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate('/snippets');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title}
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
      <Film size={size} strokeWidth={2} fill={fillColor} />
    </button>
  );
}
