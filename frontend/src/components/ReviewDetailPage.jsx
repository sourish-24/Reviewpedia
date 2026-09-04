import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Star, Heart, MessageSquare, Share2, MapPin, 
  CheckCircle, Calendar, Check, Sparkles, User as UserIcon
} from 'lucide-react';
import CommentSection from './CommentSection';
import MediaLightbox from './MediaLightbox';
import StarRating from './StarRating';
import { formatDate } from '../utils/dateUtils';
import { extractReviewId } from '../utils/urlUtils';

export default function ReviewDetailPage({ currentUser, logout, onOpenMyReviews, onOpenAuth, onLikeToggle, onUserClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Extract reviewId from params or URL pathname
  const reviewId = params.id || extractReviewId(location.pathname);

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localLikes, setLocalLikes] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isLikeHovered, setIsLikeHovered] = useState(false);
  const [isCommentHovered, setIsCommentHovered] = useState(false);
  const [isShareHovered, setIsShareHovered] = useState(false);

  const commentsRef = useRef(null);
  const profileMenuRef = useRef(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || '';

  // Close profile dropdown when clicking outside (like homepage)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch review details
  useEffect(() => {
    if (!reviewId) {
      setError("Review not found");
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function fetchReview() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/reviews/${reviewId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setReview(data);
            setLocalLikes(Array.isArray(data.likes) ? data.likes : []);
            setCommentCount(data.commentsCount || 0);
            setError(null);
          }
        } else {
          if (isMounted) setError("Review not found or has been removed");
        }
      } catch (err) {
        console.error("Error fetching review detail:", err);
        if (isMounted) setError("Network error loading review");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchReview();
    return () => { isMounted = false; };
  }, [reviewId, API_URL]);

  // Handle like toggle
  const handleLike = async () => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    const currentUserId = currentUser.id?.toString() || currentUser._id?.toString() || currentUser.username;
    const isLiked = localLikes.includes(currentUserId);
    const updated = isLiked
      ? localLikes.filter(id => id !== currentUserId)
      : [...localLikes, currentUserId];

    setLocalLikes(updated);
    if (onLikeToggle) {
      onLikeToggle(reviewId, updated);
    }

    try {
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.likes) {
          setLocalLikes(data.likes);
          if (onLikeToggle) onLikeToggle(reviewId, data.likes);
        }
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  // Handle share click
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const scrollToComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentUserId = currentUser ? (currentUser.id?.toString() || currentUser._id?.toString() || currentUser.username) : null;
  const isLiked = currentUserId ? (
    localLikes.includes(currentUserId) ||
    (currentUser?.id && localLikes.includes(currentUser.id.toString())) ||
    (currentUser?._id && localLikes.includes(currentUser._id.toString())) ||
    (currentUser?.username && localLikes.includes(currentUser.username))
  ) : false;

  const mediaList = review?.review?.media || [];
  const activeMedia = mediaList[activeMediaIndex] || null;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="spinner" style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>Loading review & comments...</p>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>Review Not Found</h2>
        <p style={{ color: '#94a3b8', maxWidth: 460, marginBottom: '24px' }}>
          {error || "The review you are looking for does not exist or may have been deleted."}
        </p>
        <button
          onClick={() => navigate('/browse')}
          style={{
            height: 42,
            padding: '0 24px',
            backgroundColor: '#0ea5e9',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ArrowLeft size={16} /> Return to Browse
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      backgroundColor: '#F8F4F0',
      color: '#0f172a',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 900
    }}>
      {/* Floating Back Button */}
      <button
        onClick={() => {
          if (window.history.length > 2) navigate(-1);
          else navigate('/browse');
        }}
        onMouseEnter={() => setIsBackHovered(true)}
        onMouseLeave={() => setIsBackHovered(false)}
        style={{
          position: 'fixed',
          top: 32,
          left: 30,
          zIndex: 1001,
          height: 40,
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#F8F4F0',
          border: '1px solid #e5e0da',
          color: isBackHovered ? '#0ea5e9' : '#334155',
          borderRadius: '9999px',
          fontWeight: 600,
          fontSize: '0.88rem',
          cursor: 'pointer',
          transition: 'color 0.15s ease'
        }}
        title="Back"
      >
        <ArrowLeft size={18} color={isBackHovered ? '#0ea5e9' : '#334155'} />
        <span>Back</span>
      </button>

      {/* Floating Profile Pic or Sign In Button (Exact copy of Homepage profile menu) */}
      {!currentUser ? (
        <div style={{ position: 'fixed', top: 32, right: 30, zIndex: 1001 }}>
          <button
            style={{
              height: 40, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer', background: '#0ea5e9', border: 'none', color: '#ffffff',
              borderRadius: '9999px', fontWeight: 600, fontSize: '0.88rem', fontFamily: 'var(--font-body)',
              transition: 'background-color 0.2s', boxShadow: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
            onClick={() => onOpenAuth && onOpenAuth('login')}
          >
            Sign In
          </button>
        </div>
      ) : (
        <div ref={profileMenuRef} style={{ position: 'fixed', top: 32, right: 30, zIndex: 1001 }}>
          <div 
            onClick={() => setIsProfileMenuOpen(prev => !prev)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            {currentUser.profilePic ? (
              <img 
                src={currentUser.profilePic} 
                alt="Profile" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '3px solid #0ea5e9', boxSizing: 'border-box', boxShadow: 'none' }} 
              />
            ) : (
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '50%', 
                backgroundColor: '#0ea5e9', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                border: '3px solid #0ea5e9', boxSizing: 'border-box',
                boxShadow: 'none'
              }}>
                {currentUser.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {isProfileMenuOpen && (
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
                  {currentUser.username}
                </div>
                <div style={{ color: '#ffffff', fontSize: '0.78rem', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                  {currentUser.email}
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '4px 0', padding: 0 }} />

              <div 
                onClick={() => { setIsProfileMenuOpen(false); navigate('/profile'); }} 
                style={{ padding: '0 12px', cursor: 'pointer', height: '36px', display: 'flex', alignItems: 'center', boxSizing: 'border-box', color: '#ffffff', fontSize: '0.9rem', fontWeight: 600, background: 'transparent', borderRadius: '8px', transition: 'color 0.2s ease' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#0ea5e9'}
                onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}
              >
                <span>My Profile</span>
              </div>

              <div 
                onClick={() => { setIsProfileMenuOpen(false); navigate('/chat'); }} 
                style={{ padding: '0 12px', cursor: 'pointer', height: '36px', display: 'flex', alignItems: 'center', boxSizing: 'border-box', color: '#ffffff', fontSize: '0.9rem', fontWeight: 600, background: 'transparent', borderRadius: '8px', transition: 'color 0.2s ease' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#0ea5e9'}
                onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}
              >
                <span>Chats</span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '4px 0', padding: 0 }} />

              <div 
                onClick={() => { setIsProfileMenuOpen(false); logout(); navigate('/'); }} 
                style={{ padding: '0 12px', cursor: 'pointer', height: '36px', display: 'flex', alignItems: 'center', boxSizing: 'border-box', color: '#ef4444', fontSize: '0.9rem', fontWeight: 600, background: 'transparent', borderRadius: '8px' }}
              >
                <span>Sign Out</span>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Main Container */}
      <main style={{
        maxWidth: 820,
        width: '100%',
        margin: '32px auto 60px auto',
        padding: '0 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Main Review Section (White Box) */}
        <article style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px 28px',
          border: '1px solid #e5e0da',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Top Post Header: Category, Submitter & Date */}
          <div style={{
            padding: '0 0 16px 0',
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: (review.source?.isScraped || (review.source?.platform && review.source.platform.toLowerCase() !== 'reviewpedia' && review.source.platform.toLowerCase() !== 'local post')) ? 'default' : 'pointer'
                }}
                onClick={() => {
                  const isScraped = review.source?.isScraped || (review.source?.platform && review.source.platform.toLowerCase() !== 'reviewpedia' && review.source.platform.toLowerCase() !== 'local post');
                  if (!isScraped && onUserClick) {
                    onUserClick(review.user?.name, review.user);
                  }
                }}
              >
                {review.user?.profilePic ? (
                  <img src={review.user.profilePic} alt={review.user.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#0ea5e9', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.95rem' }}>
                    {review.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#161E2E' }}>
                      {review.user?.name || 'Anonymous Reviewer'}
                    </span>
                    {(review.analytics?.trustScore || 0) > 80 && (
                      <CheckCircle size={15} color="#0ea5e9" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} /> {formatDate(review.metadata?.date)}
              </span>
            </div>
          </div>

          {/* Product Headline & Ratings */}
          <div style={{ padding: '0 0 16px 0' }}>
            {/* Product Name & Brand Pillbox side-by-side with bottoms aligned */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '6px'
            }}>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                wordBreak: 'break-word'
              }}>
                {review.product?.name}
              </h1>
              {review.product?.brand && (
                <span style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e0da',
                  color: '#334155',
                  borderRadius: '9999px',
                  padding: '3px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  marginBottom: '5px'
                }}>
                  {review.product.brand}
                </span>
              )}
            </div>

            {/* Category Name below (out of pillbox, keeping font size) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ color: '#0284c7', fontSize: '0.78rem', fontWeight: 600 }}>
                {review.product?.category || 'General'}
              </span>
            </div>

            {/* Stars & Rating (with added gap above) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '18px' }}>
              <StarRating
                rating={review.review?.rating || 0}
                size={20}
                gap={3}
                emptyColor="#cbd5e1"
              />
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e293b' }}>
                {review.review?.rating} / 5
              </span>
            </div>
          </div>

          {/* Enlarged Media Viewer Showcase */}
          {mediaList.length > 0 && (() => {
            const activeUrl = activeMedia?.url || activeMedia?.mediaUrl || (typeof activeMedia === 'string' ? activeMedia : '');
            const isVideo = activeMedia?.type === 'video' || activeMedia?.mediaType === 'video' || (typeof activeUrl === 'string' && activeUrl.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i));
            return (
              <div style={{ padding: '0 0 20px 0' }}>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  maxHeight: 560,
                  height: 480,
                  backgroundColor: '#0f172a',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
                }}
                onClick={() => setIsLightboxOpen(true)}
                title="Click to view full screen"
                >
                  {isVideo ? (
                    <video
                      src={activeUrl}
                      controls
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <img
                      src={activeUrl}
                      alt={review.product?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  )}
                </div>

                {/* Media Thumbnails Switcher */}
                {mediaList.length > 1 && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {mediaList.map((m, idx) => {
                      const thumbUrl = typeof m === 'string' ? m : (m.url || m.mediaUrl);
                      const thumbIsVideo = m?.type === 'video' || m?.mediaType === 'video' || (typeof thumbUrl === 'string' && thumbUrl.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i));
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveMediaIndex(idx)}
                          style={{
                            width: 72,
                            height: 72,
                            borderRadius: '10px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: idx === activeMediaIndex ? '3px solid #0ea5e9' : '2px solid #e2e8f0',
                            opacity: idx === activeMediaIndex ? 1 : 0.65,
                            transition: 'all 0.15s',
                            flexShrink: 0
                          }}
                        >
                          {thumbIsVideo ? (
                            <video src={thumbUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <img src={thumbUrl} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Full Review Body Text */}
          <div style={{ padding: '0 0 20px 0' }}>
            <p style={{
              margin: 0,
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: '#334155',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'var(--font-body)'
            }}>
              {review.review?.text || review.review?.title}
            </p>
          </div>

          {/* Engagement & Action Bar */}
          <div style={{
            padding: '12px 0 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Like / Heart Button */}
              <button
                onClick={handleLike}
                onMouseEnter={() => setIsLikeHovered(true)}
                onMouseLeave={() => setIsLikeHovered(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#F8F4F0',
                  border: '1px solid #e5e0da',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  transition: 'color 0.15s ease'
                }}
              >
                <Heart
                  size={16}
                  fill={isLiked ? '#ef4444' : 'none'}
                  color={isLiked ? '#ef4444' : (isLikeHovered ? '#0ea5e9' : '#64748b')}
                />
                <span style={{
                  color: isLiked ? '#ef4444' : (isLikeHovered ? '#0ea5e9' : '#334155'),
                  transition: 'color 0.15s ease'
                }}>
                  {localLikes.length}
                </span>
              </button>

              {/* Comments count button */}
              <button
                onClick={scrollToComments}
                onMouseEnter={() => setIsCommentHovered(true)}
                onMouseLeave={() => setIsCommentHovered(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#F8F4F0',
                  border: '1px solid #e5e0da',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  color: isCommentHovered ? '#0ea5e9' : '#334155',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  transition: 'color 0.15s ease'
                }}
                title="Comments"
              >
                <MessageSquare size={16} color={isCommentHovered ? '#0ea5e9' : '#64748b'} />
                <span>{commentCount}</span>
              </button>
            </div>

            {/* Share Link Button */}
            <button
              onClick={handleShare}
              onMouseEnter={() => setIsShareHovered(true)}
              onMouseLeave={() => setIsShareHovered(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#F8F4F0',
                border: '1px solid #e5e0da',
                padding: '8px 16px',
                borderRadius: '9999px',
                cursor: 'pointer',
                color: copied ? '#10b981' : (isShareHovered ? '#0ea5e9' : '#334155'),
                fontWeight: 600,
                fontSize: '0.88rem',
                transition: 'color 0.15s ease'
              }}
            >
              {copied ? (
                <Check size={15} color="#10b981" />
              ) : (
                <Share2 size={15} color={isShareHovered ? '#0ea5e9' : '#64748b'} />
              )}
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </article>

        {/* Comment Section Container (No card, flows on page background) */}
        <section
          ref={commentsRef}
          style={{
            width: '100%',
            paddingTop: '20px',
            boxSizing: 'border-box'
          }}
        >
          <CommentSection
            reviewId={review.id || review._id}
            reviewAuthor={review.user?.name}
            currentUser={currentUser}
            onOpenAuth={onOpenAuth}
            onCommentCountChange={setCommentCount}
          />
        </section>
      </main>

      {/* Lightbox for large media viewing */}
      {isLightboxOpen && mediaList.length > 0 && (
        <MediaLightbox
          mediaMessages={mediaList.map(m => ({
            mediaUrl: typeof m === 'string' ? m : (m.url || m.mediaUrl),
            mediaType: typeof m === 'string'
              ? (m.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i) ? 'video' : 'image')
              : (m.type || m.mediaType || 'image'),
            sender: { username: review.user?.name }
          }))}
          initialIndex={activeMediaIndex}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
}
