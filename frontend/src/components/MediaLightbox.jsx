import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

export default function MediaLightbox({ mediaMessages, initialIndex, onClose, currentUser, onDelete }) {
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % mediaMessages.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + mediaMessages.length) % mediaMessages.length);
    };

    if (!mediaMessages || mediaMessages.length === 0) return null;

    const currentMedia = mediaMessages[currentIndex];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Close Button */}
            <button 
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: 'white',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
                <X size={24} />
            </button>

            {/* Previous Button */}
            {mediaMessages.length > 1 && (
                <button 
                    onClick={handlePrev}
                    style={{
                        position: 'absolute',
                        left: '20px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: 'white',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                    <ChevronLeft size={32} />
                </button>
            )}

            {/* Media Content */}
            <div style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}>
                {currentMedia.mediaType === 'image' ? (
                    <img 
                        src={currentMedia.mediaUrl} 
                        alt="attachment" 
                        style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} 
                    />
                ) : (
                    <video 
                        controls 
                        autoPlay
                        style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                    >
                        <source src={currentMedia.mediaUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>

            {/* Next Button */}
            {mediaMessages.length > 1 && (
                <button 
                    onClick={handleNext}
                    style={{
                        position: 'absolute',
                        right: '20px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: 'white',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                    <ChevronRight size={32} />
                </button>
            )}

            {/* Delete Button */}
            {currentMedia.sender.username === currentUser?.username && onDelete && (
                <button 
                    onClick={() => onDelete(currentMedia._id)}
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '20px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: 'none',
                        color: '#ef4444',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    title="Delete Media"
                >
                    <Trash2 size={24} />
                </button>
            )}

            {/* Counter */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.9rem',
                background: 'rgba(0,0,0,0.5)',
                padding: '4px 12px',
                borderRadius: '999px'
            }}>
                {currentIndex + 1} / {mediaMessages.length}
            </div>
        </div>
    );
}
