import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Calendar, CheckCircle, Image as ImageIcon, Trash2, Pencil, Heart, MessageSquare } from 'lucide-react';
import '../index.css';
import ConfirmModal from './ConfirmModal';
import MediaLightbox from './MediaLightbox';
import { formatDate } from '../utils/dateUtils';
import { getReviewUrl } from '../utils/urlUtils';
import ReviewClampedText from './ReviewClampedText';
import StarRating from './StarRating';

export default function MultiReviewCard({ reviews, onClose, onUserClick, currentUser, onDeleteSuccess, onEdit, isMyReviews, onLikeToggle }) {
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [activeLightbox, setActiveLightbox] = useState(null);
  const [likesState, setLikesState] = useState({});

  useEffect(() => {
    if (Array.isArray(reviews)) {
      const initialState = {};
      reviews.forEach(r => {
        const id = r.id || r._id;
        initialState[id] = Array.isArray(r.likes) ? r.likes : [];
      });
      setLikesState(initialState);
    }
  }, [reviews]);

  const handleToggleLike = async (review, e) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      alert("Please sign in to like reviews!");
      return;
    }

    const reviewId = review.id || review._id;
    if (!reviewId) return;

    const currentUserId = currentUser.id?.toString() || currentUser._id?.toString() || currentUser.username;
    if (!currentUserId) return;

    const currentLikes = likesState[reviewId] || (Array.isArray(review.likes) ? review.likes : []);
    const isLiked = currentUserId ? (
      currentLikes.includes(currentUserId) ||
      (currentUser?.id && currentLikes.includes(currentUser.id.toString())) ||
      (currentUser?._id && currentLikes.includes(currentUser._id.toString())) ||
      (currentUser?.username && currentLikes.includes(currentUser.username))
    ) : false;

    const updatedLikes = isLiked
      ? currentLikes.filter(id => id !== currentUserId && id !== currentUser.id?.toString() && id !== currentUser._id?.toString() && id !== currentUser.username)
      : [...currentLikes, currentUserId];

    setLikesState(prev => ({
      ...prev,
      [reviewId]: updatedLikes
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
          setLikesState(prev => ({
            ...prev,
            [reviewId]: data.likes
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

  const requestConfirm = (title, message, onConfirmAction) => {
      setConfirmModal({
          isOpen: true,
          title,
          message,
          onConfirm: async () => {
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
              await onConfirmAction();
          }
      });
  };

  if (!reviews) return null;
  if (!isMyReviews && reviews.length === 0) return null;

  const handleDelete = (reviewId) => {
    requestConfirm(
      "Delete Review",
      "Are you sure you want to permanently delete this review?",
      async () => {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'https://reviewpedia.onrender.com';
          const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          if (res.ok) {
            if (onDeleteSuccess) onDeleteSuccess(reviewId);
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
      <div className="glass-panel" style={{ padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden', height: '100%' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff'
        }}>
          <X size={20} />
        </button>
        
        <div style={{ paddingBottom: '8px' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0, paddingRight: 30, color: '#ffffff' }}>
                {isMyReviews 
                    ? `You have ${reviews.length} Review${reviews.length !== 1 ? 's' : ''}`
                    : `${reviews.length} Review${reviews.length !== 1 ? 's' : ''} Here`
                }
            </h2>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: 8, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.length === 0 ? (
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center', padding: '32px 16px', color: '#ffffff'
                }}>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, fontFamily: 'var(--font-body)', color: 'rgba(255, 255, 255, 0.8)' }}>
                        Click on <span style={{ color: '#0ea5e9', fontWeight: 600 }}>"add a review"</span> to post a review
                    </p>
                </div>
            ) : (
                reviews.map((review) => {
                  const reviewId = review.id || review._id;
                  const currentLikes = likesState[reviewId] || (Array.isArray(review.likes) ? review.likes : []);
                  const currentUserId = currentUser ? (currentUser.id?.toString() || currentUser._id?.toString() || currentUser.username) : null;
                  const isLiked = currentUserId ? (
                    currentLikes.includes(currentUserId) ||
                    (currentUser?.id && currentLikes.includes(currentUser.id.toString())) ||
                    (currentUser?._id && currentLikes.includes(currentUser._id.toString())) ||
                    (currentUser?.username && currentLikes.includes(currentUser.username))
                  ) : false;
                  const likesCount = currentLikes.length;

                  return (
                <div 
                  key={reviewId} 
                  onClick={() => navigate(getReviewUrl(review))}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px', backgroundColor: '#F8F4F0', borderRadius: '12px', border: '1px solid #e4e4e7', color: '#18181b', position: 'relative' }}
                >
                    {currentUser && (
                        currentUser.username === review.user?.name ||
                        (currentUser.id && review.user?.id && (currentUser.id === review.user.id || currentUser.id.toString() === review.user.id.toString())) ||
                        (currentUser._id && review.user?.id && (currentUser._id === review.user.id || currentUser._id.toString() === review.user.id.toString()))
                    ) && (
                        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', zIndex: 5 }}>
                            {onEdit && (
                                <button onClick={(e) => { e.stopPropagation(); onEdit(review); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: '2px', display: 'flex' }} title="Edit Review">
                                    <Pencil size={15} />
                                </button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(reviewId); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px', display: 'flex' }} title="Delete Review">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div 
                            style={{ 
                                width: 72, height: 72, backgroundColor: '#e4e4e7', border: '1px solid #d4d4d8', 
                                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                color: '#71717a', flexShrink: 0, overflow: 'hidden', 
                                cursor: review.review?.media?.length ? 'pointer' : 'default', position: 'relative' 
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (review.review?.media?.length) {
                                    setActiveLightbox({ review, initialIndex: 0 });
                                }
                            }}
                        >
                            {review.review?.media && review.review.media.length > 0 ? (
                                <>
                                    {review.review.media[0].type === 'video' ? (
                                        <video src={review.review.media[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <img src={review.review.media[0].url} alt="Review media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                    {review.review.media.length > 1 && (
                                        <div style={{ position: 'absolute', bottom: 2, right: 2, background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', padding: '1px 5px', borderRadius: '4px' }}>
                                            +{review.review.media.length - 1}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <ImageIcon size={32} />
                            )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0, paddingRight: '36px' }}>
                            <h3 style={{ fontSize: '1.125rem', margin: 0, color: '#18181b', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                              {review.product?.name}
                            </h3>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                                {review.product?.brand && <span className="chip" style={{ backgroundColor: '#e4e4e7', padding: '2px 8px', color: '#5138d6', fontWeight: 600, wordBreak: 'break-word', maxWidth: '100%' }}>{review.product.brand}</span>}
                                <span className="chip" style={{ backgroundColor: '#e4e4e7', padding: '2px 8px', color: '#52525b', wordBreak: 'break-word', maxWidth: '100%' }}>{review.product?.category}</span>
                            </div>

                            
                            <div style={{ margin: '8px 0 0 0' }}>
                                <StarRating rating={review.review?.rating || 0} size={15} gap={2} />
                            </div>
                        </div>
                    </div>

                    <ReviewClampedText text={review.review?.text || review.review?.title} />

                    {/* Heart and comments button row right above horizontal rule */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 2px 0' }}>
                        <button
                            onClick={(e) => handleToggleLike(review, e)}
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '16px', borderTop: '1px solid #e4e4e7', marginTop: '4px' }}>

                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
                        }}>
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
                                         style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
                                     />
                                 ) : (
                                     <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--primary)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', flexShrink: 0 }}>
                                     {review.user?.name ? review.user.name[0] : '?'}
                                     </div>
                                 )}
                                 <div style={{ minWidth: 0 }}>
                                     <p style={{ fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 5, margin: 0, color: '#18181b', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                         {review.user?.name || 'Anonymous'} 
                                         {(review.analytics?.trustScore || 0) > 80 && <CheckCircle size={14} color="var(--primary)" style={{ flexShrink: 0 }} />}
                                     </p>
                                 </div>
                             </div>
                             <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-body)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                 <Calendar size={12} /> {formatDate(review.metadata?.date, 'Unknown')}
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
              );
            })
            )}
        </div>
      </div>
      
      <ConfirmModal 
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {activeLightbox && (
          <MediaLightbox
              mediaMessages={activeLightbox.review.review.media.map(m => ({
                  mediaUrl: m.url,
                  mediaType: m.type || 'image',
                  sender: { username: activeLightbox.review.user?.name }
              }))}
              initialIndex={activeLightbox.initialIndex}
              onClose={() => setActiveLightbox(null)}
              currentUser={currentUser}
          />
      )}
    </div>
  );
}
