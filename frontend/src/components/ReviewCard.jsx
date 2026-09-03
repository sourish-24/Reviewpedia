import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, X, MapPin, Calendar, CheckCircle, Trash2, Pencil, Heart, Image as ImageIcon, MessageSquare } from 'lucide-react';
import '../index.css';
import ConfirmModal from './ConfirmModal';
import MediaLightbox from './MediaLightbox';
import { formatDate } from '../utils/dateUtils';
import { getReviewUrl } from '../utils/urlUtils';

export default function ReviewCard({ review, onClose, onUserClick, currentUser, onDeleteSuccess, onEdit, onLikeToggle }) {
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [localReview, setLocalReview] = useState(review);

  useEffect(() => {
    setLocalReview(review);
  }, [review]);

  if (!review) return null;

  const currentReview = localReview || review;
  const likesArray = Array.isArray(currentReview.likes) ? currentReview.likes : [];
  const currentUserId = currentUser ? (currentUser.id?.toString() || currentUser._id?.toString() || currentUser.username) : null;
  const isLiked = currentUserId ? (
    likesArray.includes(currentUserId) ||
    (currentUser?.id && likesArray.includes(currentUser.id.toString())) ||
    (currentUser?._id && likesArray.includes(currentUser._id.toString())) ||
    (currentUser?.username && likesArray.includes(currentUser.username))
  ) : false;
  const likesCount = likesArray.length;

  const handleToggleLike = async (e) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      alert("Please sign in to like reviews!");
      return;
    }

    const reviewId = currentReview.id || currentReview._id;
    if (!reviewId) return;

    const updatedLikes = isLiked
      ? likesArray.filter(id => id !== currentUserId && id !== currentUser.id?.toString() && id !== currentUser._id?.toString() && id !== currentUser.username)
      : [...likesArray, currentUserId];

    setLocalReview(prev => ({
      ...prev,
      likes: updatedLikes
    }));

    if (onLikeToggle) {
      onLikeToggle(reviewId, updatedLikes);
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://reviewpedia.onrender.com';
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.likes) {
          setLocalReview(prev => ({
            ...prev,
            likes: data.likes
          }));
          if (onLikeToggle) {
            onLikeToggle(reviewId, data.likes);
          }
        }
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const handleDelete = () => {
    requestConfirm(
      "Delete Review",
      "Are you sure you want to permanently delete this review?",
      async () => {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'https://reviewpedia.onrender.com';
          const res = await fetch(`${API_URL}/api/reviews/${review.id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          if (res.ok) {
            if (onDeleteSuccess) onDeleteSuccess();
          } else {
            const data = await res.json();
            alert(data.error || "Failed to delete review");
          }
        } catch (err) {
          console.error(err);
          alert("Network error deleting review");
        }
      }
    );
  };

  return (
    <div className="review-card-overlay" style={{
      position: 'absolute', top: '20px', left: '20px', bottom: '20px', right: 'calc(50vw + 316px)', minWidth: '320px', zIndex: 1000, maxHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column'
    }}>
      <div className="glass-panel" style={{ padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '100%' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff'
        }}>
          <X size={20} />
        </button>
        
        <div style={{ paddingRight: '30px', minWidth: 0 }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '4px', margin: 0, color: '#ffffff', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              {review.product?.name}
            </h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                {review.product?.brand && <span className="chip" style={{ backgroundColor: 'rgba(14, 165, 233, 0.2)', border: '1px solid #0ea5e9', padding: '2px 8px', color: '#ffffff', fontWeight: 600, wordBreak: 'break-word', maxWidth: '100%' }}>{review.product.brand}</span>}
                <span className="chip" style={{ backgroundColor: 'transparent', padding: 0, color: '#ffffff', wordBreak: 'break-word' }}>{review.product?.category}</span>
                <span style={{ color: '#ffffff', fontSize: '0.75rem' }}>•</span>
                <span className="chip" style={{ backgroundColor: 'transparent', padding: 0, color: '#ffffff', wordBreak: 'break-word' }}>{review.source?.platform}</span>
            </div>
        </div>

        <div 
          onClick={() => navigate(getReviewUrl(review))}
          style={{ backgroundColor: '#F8F4F0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', border: '1px solid #e4e4e7', color: '#18181b' }}
        >
            {currentUser && (
                currentUser.username === review.user?.name ||
                (currentUser.id && review.user?.id && (currentUser.id === review.user.id || currentUser.id.toString() === review.user.id.toString())) ||
                (currentUser._id && review.user?.id && (currentUser._id === review.user.id || currentUser._id.toString() === review.user.id.toString()))
            ) && (
                <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', zIndex: 5 }}>
                    {onEdit && (
                        <button onClick={(e) => { e.stopPropagation(); onEdit(review); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: '2px', display: 'flex' }} title="Edit Review">
                            <Pencil size={15} />
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(e); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px', display: 'flex' }} title="Delete Review">
                        <Trash2 size={16} />
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', gap: 16 }}>
                {currentReview.review?.media && currentReview.review.media.length > 0 && (
                    <div 
                        style={{ 
                            width: 72, height: 72, backgroundColor: '#e4e4e7', border: '1px solid #d4d4d8', 
                            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            color: '#71717a', flexShrink: 0, overflow: 'hidden', cursor: 'pointer', position: 'relative' 
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxIndex(0);
                        }}
                    >
                        {currentReview.review.media[0].type === 'video' ? (
                            <video src={currentReview.review.media[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <img src={currentReview.review.media[0].url} alt="Review media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                        {currentReview.review.media.length > 1 && (
                            <div style={{ position: 'absolute', bottom: 2, right: 2, background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', padding: '1px 5px', borderRadius: '4px' }}>
                                +{currentReview.review.media.length - 1}
                            </div>
                        )}
                    </div>
                )}
                <div style={{ flex: 1, minWidth: 0, paddingRight: '36px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} fill={i < (currentReview.review?.rating || 0) ? "var(--golden-star)" : "none"} color={i < (currentReview.review?.rating || 0) ? "var(--golden-star)" : "#d4d4d8"} strokeWidth={1.5} />
                    ))}
                    </div>
                </div>
            </div>

            <p style={{ margin: 0, padding: '10px 0', lineHeight: 1.5, fontSize: '0.95rem', fontFamily: 'var(--font-body)', color: '#27272a', wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
            "{review.review?.text || review.review?.title}"
            </p>

            {/* Heart and comments button row right above horizontal rule */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 2px 0' }}>
                <button
                    onClick={handleToggleLike}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                        background: 'none',
                        border: 'none',
                        padding: '3px 8px',
                        cursor: 'pointer',
                        color: '#71717a',
                        fontSize: '0.75rem', fontWeight: 600
                    }}
                    title={isLiked ? "Unlike review" : "Like review"}
                >
                    <Heart size={14} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : '#71717a'} />
                    <span>{likesCount}</span>
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(getReviewUrl(review));
                    }}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                        background: 'none',
                        border: 'none',
                        padding: '3px 8px',
                        cursor: 'pointer',
                        color: '#71717a',
                        fontSize: '0.75rem', fontWeight: 600
                    }}
                    title="View discussion & comments"
                >
                    <MessageSquare size={14} color="#71717a" />
                    <span>{review.commentsCount || 0}</span>
                </button>
            </div>

            <div style={{ 
                position: 'absolute', top: '16px', right: '12px', 
                fontSize: '0.65rem', color: '#71717a', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em' 
            }}>
                Lat: {review.location?.lat?.toFixed(4) || 'N/A'}, Lng: {review.location?.lng?.toFixed(4) || 'N/A'}
            </div>

            {/* Profile section inside review card container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '16px', borderTop: '1px solid #e4e4e7', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div 
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: (review.source?.isScraped || (review.source?.platform && review.source.platform.toLowerCase() !== 'reviewpedia' && review.source.platform.toLowerCase() !== 'local post')) ? 'default' : 'pointer', flex: 1, minWidth: 0 }} 
                  onClick={(e) => {
                    e.stopPropagation();
                    const isScraped = review.source?.isScraped || (review.source?.platform && review.source.platform.toLowerCase() !== 'reviewpedia' && review.source.platform.toLowerCase() !== 'local post');
                    if (!isScraped && onUserClick) {
                      onUserClick(review.user?.name, review.user);
                    }
                  }}
                >
                  {review.user?.profilePic ? (
                    <img 
                      src={review.user.profilePic} 
                      alt={review.user?.name || 'User'} 
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
                    />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', flexShrink: 0 }}>
                       {review.user?.name ? review.user.name[0] : '?'}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 5, margin: 0, color: '#18181b', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {review.user?.name || 'Anonymous'} 
                      {(review.analytics?.trustScore || 0) > 80 && <CheckCircle size={14} color="var(--primary)" style={{ flexShrink: 0 }} />}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#71717a', margin: 0 }}>Trust Score: {review.analytics?.trustScore || 0}%</p>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-body)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  <Calendar size={12} /> {formatDate(review.metadata?.date, 'Unknown Date')}
                </div>
              </div>

              {review.source?.platform && review.source.platform.toLowerCase() !== 'reviewpedia' && review.source.platform.toLowerCase() !== 'local post' && (
                <div style={{ 
                  marginTop: '4px', paddingTop: '0px', borderTop: 'none',
                  fontSize: '0.72rem', color: '#a1a1aa', fontStyle: 'italic', lineHeight: 1.4
                }}>
                  This user does not exist on Reviewpedia &amp; this review was collected from {review.source.platform.charAt(0).toUpperCase() + review.source.platform.slice(1)}
                </div>
              )}
            </div>
        </div>

      </div>
      
      <ConfirmModal 
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {lightboxIndex !== null && review.review?.media && (
          <MediaLightbox
              mediaMessages={review.review.media.map(m => ({
                  mediaUrl: m.url,
                  mediaType: m.type || 'image',
                  sender: { username: review.user?.name }
              }))}
              initialIndex={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
              currentUser={currentUser}
          />
      )}
    </div>
  );
}
