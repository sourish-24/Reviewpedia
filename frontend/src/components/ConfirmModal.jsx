import React from 'react';
import ReactDOM from 'react-dom';
import { AlertCircle } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10000000, // Highest z-index above MediaLightbox portal
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            <div style={{
                background: '#161E2E',
                borderRadius: '24px',
                padding: '28px',
                width: '100%',
                maxWidth: '420px',
                boxShadow: 'none',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontFamily: 'var(--font-body)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#ef4444' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <AlertCircle size={22} color="#ef4444" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{title}</h3>
                </div>
                
                <p style={{ margin: '0 0 24px 0', color: '#94a3b8', lineHeight: 1.6, fontSize: '0.92rem' }}>
                    {message}
                </p>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            background: '#161E2E',
                            border: 'none',
                            color: '#ffffff',
                            padding: '10px 20px',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            background: '#ef4444',
                            border: 'none',
                            color: '#ffffff',
                            padding: '10px 20px',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
