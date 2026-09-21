import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileDropdown({ user, logout }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initial = user.username?.[0]?.toUpperCase() || 'U';

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <div 
        onClick={() => setIsOpen(prev => !prev)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        {user.profilePic ? (
          <img 
            src={user.profilePic} 
            alt="Profile" 
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              display: 'block', 
              cursor: 'pointer', 
              border: '3px solid #0ea5e9', 
              boxSizing: 'border-box', 
              boxShadow: 'none' 
            }} 
          />
        ) : (
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            backgroundColor: '#0ea5e9', 
            color: 'white',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontWeight: 'bold', 
            fontSize: '1rem', 
            cursor: 'pointer',
            border: '3px solid #0ea5e9', 
            boxSizing: 'border-box',
            boxShadow: 'none'
          }}>
            {initial}
          </div>
        )}
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '48px',
          right: '-12px',
          left: 'auto',
          minWidth: '180px',
          background: 'rgba(3, 3, 3, 0.6)',
          border: 'none',
          borderRadius: '16px',
          padding: '12px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: 'none',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          color: '#ffffff'
        }}>
          {/* Top Segment: Username and Email (Always White) */}
          <div style={{ padding: '2px 12px 6px 12px', cursor: 'default' }}>
            <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.username}
            </div>
            {user.email && (
              <div style={{ color: '#ffffff', fontSize: '0.78rem', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                {user.email}
              </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '4px 0', padding: 0 }} />

          <div 
            onClick={() => { setIsOpen(false); navigate('/profile'); }} 
            style={{ padding: '0 12px', cursor: 'pointer', height: '36px', display: 'flex', alignItems: 'center', boxSizing: 'border-box', color: '#ffffff', fontSize: '0.9rem', fontWeight: 600, background: 'transparent', borderRadius: '8px', transition: 'color 0.2s ease' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#0ea5e9'}
            onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}
          >
            <span>My Profile</span>
          </div>

          <div 
            onClick={() => { setIsOpen(false); navigate('/chat'); }} 
            style={{ padding: '0 12px', cursor: 'pointer', height: '36px', display: 'flex', alignItems: 'center', boxSizing: 'border-box', color: '#ffffff', fontSize: '0.9rem', fontWeight: 600, background: 'transparent', borderRadius: '8px', transition: 'color 0.2s ease' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#0ea5e9'}
            onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}
          >
            <span>Chats</span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '4px 0', padding: 0 }} />

          <div 
            onClick={() => { 
              setIsOpen(false); 
              if (logout) logout(); 
              navigate('/'); 
            }} 
            style={{ padding: '0 12px', cursor: 'pointer', height: '36px', display: 'flex', alignItems: 'center', boxSizing: 'border-box', color: '#ef4444', fontSize: '0.9rem', fontWeight: 600, background: 'transparent', borderRadius: '8px' }}
          >
            <span>Sign Out</span>
          </div>
        </div>
      )}
    </div>
  );
}
