import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Heart, MessageSquare, Share2, Plus, Volume2, VolumeX, 
  Play, Pause, Star, ExternalLink, Package, Trash2, 
  Send, X, ChevronUp, ChevronDown, Check,
  Maximize, Minimize, MoreVertical, Calendar
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import PostSnippetModal from './PostSnippetModal';
import CommentSection from './CommentSection';
import ProfileDropdown from './ProfileDropdown';
import ChatIcon from './ChatIcon';
import NotificationIcon from './NotificationIcon';
import LoadingPopup from './LoadingPopup';
import { useChat } from '../context/ChatContext';
import { getAuthHeaders } from '../utils/apiUtils';
import { formatDate } from '../utils/dateUtils';

// High-quality initial demo snippets to ensure the feed is immediately lively
const INITIAL_FALLBACK_SNIPPETS = [
  {
    id: 'demo-1',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-modern-smartphone-42795-large.mp4',
    createdAt: '2026-09-18T10:30:00.000Z',
    product: {
      name: 'Nothing Phone (2a)',
      brand: 'Nothing',
      category: 'Mobiles',
      rating: 4.5,
      purchaseLink: 'https://nothing.tech'
    },
    caption: 'Clean transparent design with the Glyph interface! Camera is snappy for the price, battery lasts a full day and a half easily.',
    user: {
      id: 'demo-user-1',
      name: 'TechGeekAarav',
      profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    },
    likes: ['user-1', 'user-2'],
    likesCount: 142,
    isLiked: false,
    commentsCount: 2,
    comments: [
      {
        _id: 'c1',
        id: 'c1',
        user: { name: 'PriyaSharma', profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
        text: 'How is the low-light camera performance?',
        likes: ['user-2'],
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        _id: 'c2',
        id: 'c2',
        parentId: 'c1',
        user: { name: 'TechGeekAarav', profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
        text: 'Surprisingly solid with Night Mode! Minimal noise.',
        likes: ['user-1', 'user-3'],
        createdAt: new Date(Date.now() - 1800000)
      }
    ]
  },
  {
    id: 'demo-2',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-hands-holding-and-operating-a-smartphone-41443-large.mp4',
    createdAt: '2026-09-16T15:45:00.000Z',
    product: {
      name: 'Sony WH-1000XM5 Headphones',
      brand: 'Sony',
      category: 'Electronics & Appliances',
      rating: 5,
      purchaseLink: 'https://sony.co.in'
    },
    caption: 'Best active noise cancellation on the market. Auto-switches between laptop and phone smoothly. Must-have for work & travel!',
    user: {
      id: 'demo-user-2',
      name: 'SoundLoverKavita',
      profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    likes: ['user-3'],
    likesCount: 98,
    isLiked: false,
    commentsCount: 2,
    comments: [
      {
        _id: 'c3',
        id: 'c3',
        user: { name: 'RahulV', profilePic: '' },
        text: 'Are these comfortable with glasses?',
        likes: [],
        createdAt: new Date(Date.now() - 7200000)
      },
      {
        _id: 'c4',
        id: 'c4',
        parentId: 'c3',
        user: { name: 'SoundLoverKavita', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
        text: 'Very comfortable! The soft fit leather cushions do not press hard against frames.',
        likes: ['user-1'],
        createdAt: new Date(Date.now() - 3600000)
      }
    ]
  }
];

export default function SnippetsPage({ currentUser, logout, onOpenAuth, onStartChat }) {
  const navigate = useNavigate();
  const { id: routeSnippetId } = useParams();
  const { unreadChatCount } = useChat ? useChat() : { unreadChatCount: 0 };

  const [snippets, setSnippets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const [showPostModal, setShowPostModal] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [followingUsers, setFollowingUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('reviewpedia_following_users');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isPostHovered, setIsPostHovered] = useState(false);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);

  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const volumeContainerRef = useRef(null);
  const sliderTrackRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const areControlsVisible = !isPlaying || isVideoHovered;

  // Fullscreen management
  const toggleFullscreen = (e) => {
    if (e) e.stopPropagation();
    const elem = videoContainerRef.current || videoRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
          if (videoRef.current?.requestFullscreen) {
            videoRef.current.requestFullscreen().catch(e => console.log(e));
          }
        });
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (videoRef.current?.webkitEnterFullscreen) {
        videoRef.current.webkitEnterFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(e => console.log(e));
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Fetch snippets
  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/snippets`, {
        headers: { ...getAuthHeaders() },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSnippets(data);
          // If a specific snippet ID was requested in URL
          if (routeSnippetId) {
            const foundIdx = data.findIndex(s => s.id === routeSnippetId || s._id === routeSnippetId);
            if (foundIdx !== -1) {
              setCurrentIndex(foundIdx);
            }
          }
        } else {
          setSnippets(INITIAL_FALLBACK_SNIPPETS);
        }
      } else {
        setSnippets(INITIAL_FALLBACK_SNIPPETS);
      }
    } catch (err) {
      console.error('Failed to fetch snippets, using initial demo data:', err);
      setSnippets(INITIAL_FALLBACK_SNIPPETS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, [routeSnippetId]);

  const currentSnippet = snippets[currentIndex] || null;

  // Video playback management when switching snippet
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setProgress(0);
      setIsPlaying(true);
      setIsCaptionExpanded(false);
      setIsDescriptionOpen(false);
      videoRef.current.volume = isMuted ? 0 : volume;
      videoRef.current.play().catch(() => {
        setIsMuted(true);
        videoRef.current.muted = true;
        videoRef.current.play().catch(e => console.log('Autoplay deferred'));
      });

      // Register view on backend
      if (currentSnippet && !currentSnippet.id?.startsWith('demo-')) {
        const API_URL = import.meta.env.VITE_API_URL || '';
        fetch(`${API_URL}/api/snippets/${currentSnippet.id || currentSnippet._id}/view`, { method: 'POST' }).catch(() => {});
      }
    }
  }, [currentIndex, currentSnippet?.id]);

  // Handle mouse scroll to adjust volume on volume button / slider
  useEffect(() => {
    const elem = volumeContainerRef.current;
    if (!elem) return;
    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY < 0 ? 0.05 : -0.05;
      setVolume(prev => {
        let nextVol = Math.round((prev + delta) * 100) / 100;
        nextVol = Math.min(1, Math.max(0, nextVol));
        if (videoRef.current) {
          videoRef.current.volume = nextVol;
          if (nextVol === 0) {
            videoRef.current.muted = true;
            setIsMuted(true);
          } else {
            videoRef.current.muted = false;
            setIsMuted(false);
          }
        }
        return nextVol;
      });
    };
    elem.addEventListener('wheel', onWheel, { passive: false });
    return () => elem.removeEventListener('wheel', onWheel);
  }, [volumeContainerRef.current, isMuted]);

  // Click & drag on vertical volume slider track
  const handleSliderMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const track = sliderTrackRef.current;
    if (!track) return;

    const updateFromY = (clientY) => {
      const rect = track.getBoundingClientRect();
      const offsetY = rect.bottom - clientY;
      let nextVol = Math.round((offsetY / rect.height) * 100) / 100;
      nextVol = Math.min(1, Math.max(0, nextVol));
      setVolume(nextVol);
      if (videoRef.current) {
        videoRef.current.volume = nextVol;
        if (nextVol === 0) {
          videoRef.current.muted = true;
          setIsMuted(true);
        } else {
          videoRef.current.muted = false;
          setIsMuted(false);
        }
      }
    };

    updateFromY(e.clientY);

    const onMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      updateFromY(moveEvent.clientY);
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Video progress tracker
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const togglePlayPause = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (isMuted || volume === 0) {
        const nextVol = volume > 0 ? volume : 0.8;
        videoRef.current.muted = false;
        videoRef.current.volume = nextVol;
        setIsMuted(false);
        setVolume(nextVol);
      } else {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < snippets.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isCommentsOpen || showPostModal) return;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'm') {
        toggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, snippets.length, isPlaying, isMuted, isCommentsOpen, showPostModal]);

  // Handle Like Toggle
  const handleLike = async (e) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    if (!currentSnippet) return;

    // Optimistic UI update
    const snippetId = currentSnippet.id || currentSnippet._id;
    const wasLiked = !!currentSnippet.isLiked;
    const newLikesCount = wasLiked ? Math.max(0, (currentSnippet.likesCount || 0) - 1) : (currentSnippet.likesCount || 0) + 1;

    setSnippets(prev => prev.map((s, idx) => {
      if (idx === currentIndex) {
        return {
          ...s,
          isLiked: !wasLiked,
          likesCount: newLikesCount
        };
      }
      return s;
    }));

    if (snippetId.toString().startsWith('demo-')) {
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      await fetch(`${API_URL}/api/snippets/${snippetId}/like`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        credentials: 'include'
      });
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  // Handle Comments Count Sync
  const handleCommentCountChange = (count) => {
    if (!currentSnippet) return;
    setSnippets(prev => prev.map((s, idx) => {
      if (idx === currentIndex) {
        return {
          ...s,
          commentsCount: count
        };
      }
      return s;
    }));
  };

  // Share Snippet
  const handleShare = (e) => {
    if (e) e.stopPropagation();
    if (!currentSnippet) return;
    const url = `${window.location.origin}/snippets/${currentSnippet.id || currentSnippet._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setToastMessage('Link copied to clipboard!');
      setTimeout(() => setToastMessage(''), 2500);
    }
  };

  // Direct chat with reviewer
  const handleChat = (e) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    const targetUsername = currentSnippet?.user?.name;
    if (targetUsername) {
      if (onStartChat) {
        onStartChat(targetUsername);
      } else {
        navigate('/chat');
      }
    }
  };

  // Toggle follow reviewer
  const handleFollowToggle = (e) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    const targetUser = currentSnippet?.user?.name;
    if (!targetUser) return;

    setFollowingUsers(prev => {
      const nextState = { ...prev, [targetUser]: !prev[targetUser] };
      try {
        localStorage.setItem('reviewpedia_following_users', JSON.stringify(nextState));
      } catch (err) {}

      const isNowFollowing = nextState[targetUser];
      setToastMessage(isNowFollowing ? `Following @${targetUser}` : `Unfollowed @${targetUser}`);
      setTimeout(() => setToastMessage(''), 2500);
      return nextState;
    });
  };

  // Delete Snippet
  const handleDelete = async (e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;
    const snippetId = currentSnippet.id || currentSnippet._id;

    setSnippets(prev => prev.filter((_, idx) => idx !== currentIndex));
    if (currentIndex >= snippets.length - 1 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }

    if (!snippetId.toString().startsWith('demo-')) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        await fetch(`${API_URL}/api/snippets/${snippetId}`, {
          method: 'DELETE',
          headers: { ...getAuthHeaders() },
          credentials: 'include'
        });
      } catch (err) {
        console.error('Failed to delete snippet:', err);
      }
    }
  };

  const isAuthorOrAdmin = currentUser && currentSnippet && (
    (currentSnippet.user?.id && (currentSnippet.user.id.toString() === (currentUser.id || currentUser._id)?.toString())) ||
    (currentSnippet.user?.name && currentSnippet.user.name === currentUser.username) ||
    currentUser.role === 'admin'
  );

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#F8F4F0',
        zIndex: 9000
      }}>
        <LoadingPopup message="Loading snippets..." fixed={true} />
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
      backgroundColor: '#F8F4F0',
      color: '#0f172a',
      zIndex: 9000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Toast notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10005,
          backgroundColor: '#0ea5e9',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '9999px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          fontWeight: 600,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'fadeIn 0.2s ease'
        }}>
          <Check size={16} /> {toastMessage}
        </div>
      )}

      {/* Top Header Bar (Matching Detailed Review Page layout) */}
      {!isFullscreen && (
        <header style={{
          width: '100%',
          padding: '20px 30px 8px 30px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 100,
          backgroundColor: '#F8F4F0',
          flexShrink: 0
        }}>
          {/* Left: Back Button */}
          <button
            onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/browse');
              }
            }}
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
            style={{
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
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              transition: 'color 0.15s ease',
              boxShadow: 'none'
            }}
            title="Back"
          >
            <ArrowLeft size={18} color={isBackHovered ? '#0ea5e9' : '#334155'} />
            <span>Back</span>
          </button>

          {/* Center: Snippets Logo in the Middle of Header Bar */}
          <div 
            onClick={() => {
              setCurrentIndex(0);
              navigate('/snippets');
            }}
            style={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: "'Rochester', cursive",
              fontSize: '2.4rem',
              color: '#0ea5e9',
              cursor: 'pointer',
              userSelect: 'none',
              lineHeight: 1,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap'
            }}
            title="Snippets"
          >
            Snippets
          </div>

          {/* Right: User Controls (Chat, Notification, Profile / Sign In) */}
          {!currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                style={{
                  height: 40,
                  padding: '0 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  background: '#0ea5e9',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-body)',
                  transition: 'background-color 0.2s',
                  boxShadow: 'none'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
                onClick={() => onOpenAuth && onOpenAuth('login')}
              >
                Sign In
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <ChatIcon unreadCount={unreadChatCount} color="#000000" fillColor="#F8F4F0" hoverColor="#0ea5e9" size={22} onClick={() => navigate('/chat')} />
              <NotificationIcon unreadCount={0} color="#000000" fillColor="#F8F4F0" hoverColor="#0ea5e9" size={22} />
              <ProfileDropdown user={currentUser} logout={logout} />
            </div>
          )}
        </header>
      )}

      {/* Bottom Left: Reviewer info, Follow button, Product name, Category name, Description */}
      {currentSnippet && (
        <div style={{
          position: 'absolute',
          bottom: 32,
          left: 30,
          width: 320,
          maxWidth: 'calc(50vw - 280px)',
          maxHeight: 'calc(100vh - 120px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 90,
          pointerEvents: 'auto',
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}>
          {/* Creator Row with Follow Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div 
              onClick={() => navigate(`/user/${currentSnippet.user?.name}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minWidth: 0 }}
              title={`View @${currentSnippet.user?.name}'s profile`}
            >
              {currentSnippet.user?.profilePic ? (
                <img
                  src={currentSnippet.user.profilePic}
                  alt={currentSnippet.user.name}
                  style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #0ea5e9', flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  backgroundColor: '#0ea5e9',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: '2px solid #e5e0da',
                  flexShrink: 0
                }}>
                  {currentSnippet.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  @{currentSnippet.user?.name}
                </span>
                <span style={{ color: '#64748b', fontSize: '0.72rem' }}>
                  Reviewer
                </span>
              </div>
            </div>

            {/* Follow Button (replacing Chat) */}
            {(!currentUser || !currentSnippet.user?.name || currentSnippet.user.name !== currentUser.username) && (
              <button
                onClick={handleFollowToggle}
                style={{
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  backgroundColor: followingUsers[currentSnippet.user?.name] ? '#ffffff' : '#0ea5e9',
                  color: followingUsers[currentSnippet.user?.name] ? '#64748b' : '#ffffff',
                  border: followingUsers[currentSnippet.user?.name] ? '1px solid #cbd5e1' : 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  boxShadow: 'none',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  if (!followingUsers[currentSnippet.user?.name]) {
                    e.currentTarget.style.backgroundColor = '#0284c7';
                  } else {
                    e.currentTarget.style.backgroundColor = '#F8F4F0';
                    e.currentTarget.style.color = '#0f172a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!followingUsers[currentSnippet.user?.name]) {
                    e.currentTarget.style.backgroundColor = '#0ea5e9';
                  } else {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#64748b';
                  }
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title={followingUsers[currentSnippet.user?.name] ? `Unfollow @${currentSnippet.user?.name}` : `Follow @${currentSnippet.user?.name}`}
              >
                {followingUsers[currentSnippet.user?.name] ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e5e0da', margin: '0' }} />

          {/* Product Details: Product Name (no box icon) & Category Name (no brand name) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.3 }}>
              {currentSnippet.product?.name}
            </span>

            {currentSnippet.product?.category && (
              <span style={{ color: '#0284c7', fontSize: '0.78rem', fontWeight: 600 }}>
                {currentSnippet.product.category}
              </span>
            )}
          </div>

          {/* Description Section: 1 line + ... when collapsed, all description + date when expanded */}
          {!isDescriptionOpen ? (
            currentSnippet.caption && (
              <div 
                onClick={() => setIsDescriptionOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 3,
                  color: '#475569',
                  fontSize: '0.84rem',
                  lineHeight: 1.4,
                  cursor: 'pointer',
                  maxWidth: '100%'
                }}
                title="Click to view full description"
              >
                <span style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-word'
                }}>
                  {currentSnippet.caption}
                </span>
                <span style={{ color: '#0ea5e9', fontWeight: 700, flexShrink: 0 }}>
                  ...
                </span>
              </div>
            )
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              animation: 'fadeIn 0.2s ease'
            }}>
              {/* Date */}
              {(currentSnippet.createdAt || currentSnippet.date || currentSnippet.updatedAt) && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#64748b',
                  fontSize: '0.76rem',
                  fontWeight: 500
                }}>
                  <Calendar size={12} color="#0ea5e9" />
                  <span>{formatDate(currentSnippet.createdAt || currentSnippet.date || currentSnippet.updatedAt)}</span>
                </div>
              )}

              {/* Full Description text */}
              {currentSnippet.caption ? (
                <div style={{
                  color: '#334155',
                  fontSize: '0.84rem',
                  lineHeight: 1.45,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-line',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  scrollbarWidth: 'thin'
                }}>
                  {currentSnippet.caption}
                </div>
              ) : (
                <div style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  No written description provided.
                </div>
              )}

              {/* Show less toggle */}
              <span 
                onClick={() => setIsDescriptionOpen(false)}
                style={{ color: '#0ea5e9', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', alignSelf: 'flex-start' }}
              >
                show less
              </span>

              {/* External Buy Link */}
              {currentSnippet.product?.purchaseLink && (
                <a
                  href={currentSnippet.product.purchaseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#0ea5e9',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                    transition: 'background-color 0.15s ease',
                    marginTop: 4
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
                >
                  <ExternalLink size={13} /> Buy / View Product
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Viewport Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        position: 'relative',
        padding: isFullscreen ? 0 : '0 24px 20px 24px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        {currentSnippet ? (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            height: isFullscreen ? '100vh' : 'calc(100vh - 88px)',
            maxHeight: isFullscreen ? '100vh' : 'calc(100vh - 88px)',
            position: 'relative'
          }}>
            {/* 1. YouTube Shorts Vertical Video Frame */}
            <div 
              ref={videoContainerRef}
              onClick={togglePlayPause}
              onMouseEnter={() => setIsVideoHovered(true)}
              onMouseMove={() => !isVideoHovered && setIsVideoHovered(true)}
              onMouseLeave={() => {
                setIsVideoHovered(false);
                setIsVolumeHovered(false);
              }}
              style={{
                position: 'relative',
                height: '100%',
                maxHeight: '100%',
                aspectRatio: isFullscreen ? 'auto' : '9 / 16',
                width: isFullscreen ? '100vw' : 'auto',
                borderRadius: isFullscreen ? 0 : '16px',
                overflow: 'hidden',
                backgroundColor: '#000000',
                boxShadow: 'none',
                cursor: 'pointer',
                flexShrink: 0,
                display: isFullscreen ? 'flex' : 'block',
                alignItems: isFullscreen ? 'center' : 'stretch',
                justifyContent: isFullscreen ? 'center' : 'stretch'
              }}
            >
              <video
                ref={videoRef}
                src={currentSnippet.videoUrl}
                playsInline
                loop
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                style={{
                  width: isFullscreen ? 'auto' : '100%',
                  height: '100%',
                  maxHeight: '100vh',
                  aspectRatio: '9 / 16',
                  objectFit: isFullscreen ? 'contain' : 'cover',
                  display: 'block',
                  margin: isFullscreen ? '0 auto' : '0'
                }}
              />

              {/* Post Snippet Button (Middle of the other buttons inside video box top) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!currentUser) {
                    if (onOpenAuth) onOpenAuth('login');
                  } else {
                    setShowPostModal(true);
                  }
                }}
                onMouseEnter={() => setIsPostHovered(true)}
                onMouseLeave={() => setIsPostHovered(false)}
                style={{
                  position: 'absolute',
                  top: 14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 25,
                  height: 38,
                  padding: '0 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  backgroundColor: '#F8F4F0',
                  border: '1px solid #e5e0da',
                  color: isPostHovered ? '#0ea5e9' : '#334155',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                  transition: 'opacity 0.25s ease, color 0.15s ease, transform 0.15s ease',
                  whiteSpace: 'nowrap',
                  opacity: areControlsVisible ? 1 : 0,
                  pointerEvents: areControlsVisible ? 'auto' : 'none'
                }}
                title="Post Snippet"
              >
                <Plus size={16} color={isPostHovered ? '#0ea5e9' : '#334155'} />
                <span>Post Snippet</span>
              </button>

              {/* Top Controls Overlay inside video (Play/Pause, Sound & Fullscreen) */}
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  right: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  zIndex: 20,
                  opacity: areControlsVisible ? 1 : 0,
                  pointerEvents: areControlsVisible ? 'auto' : 'none',
                  transition: 'opacity 0.25s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Play/Pause Button */}
                  <button
                    onClick={togglePlayPause}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      border: 'none',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backdropFilter: 'blur(8px)',
                      transition: 'background-color 0.15s ease'
                    }}
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
                  </button>

                  {/* Volume/Mute Button & Vertical Volume Slider Popover */}
                  <div
                    ref={volumeContainerRef}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                    onMouseEnter={() => setIsVolumeHovered(true)}
                    onMouseLeave={() => setIsVolumeHovered(false)}
                  >
                    <button
                      onClick={toggleMute}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        border: 'none',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
                      title={isMuted || volume === 0 ? "Unmute" : "Mute (scroll to adjust volume)"}
                    >
                      {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>

                    {/* Vertical Volume Slider on Hover (Pure White, No Blue) */}
                    {isVolumeHovered && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 6px)',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 44,
                          minWidth: 44,
                          maxWidth: 44,
                          boxSizing: 'border-box',
                          backgroundColor: 'rgba(0, 0, 0, 0.75)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '16px',
                          padding: '12px 6px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          zIndex: 50,
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          animation: 'volumeSliderFadeIn 0.15s ease-out'
                        }}
                      >
                        {/* Invisible bridge to prevent mouse leaving hover */}
                        <div style={{
                          position: 'absolute',
                          top: -8,
                          left: 0,
                          right: 0,
                          height: 8
                        }} />

                        {/* Volume percentage text (White, fixed 100% 3-digit width) */}
                        <span style={{
                          color: '#ffffff',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                          userSelect: 'none',
                          lineHeight: 1,
                          width: '100%',
                          textAlign: 'center',
                          display: 'block',
                          fontVariantNumeric: 'tabular-nums',
                          whiteSpace: 'nowrap'
                        }}>
                          {isMuted || volume === 0 ? '0%' : `${Math.round(volume * 100)}%`}
                        </span>

                        {/* Interactive Vertical Slider Track */}
                        <div
                          ref={sliderTrackRef}
                          onMouseDown={handleSliderMouseDown}
                          style={{
                            width: '6px',
                            height: '84px',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                            position: 'relative',
                            cursor: 'pointer'
                          }}
                          title="Scroll or click/drag to adjust volume"
                        >
                          {/* Filled Bar (Pure White) */}
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: `${(isMuted ? 0 : volume) * 100}%`,
                            backgroundColor: '#ffffff',
                            borderRadius: '9999px',
                            transition: 'height 0.05s ease-out'
                          }} />

                          {/* Circular Thumb (Pure White) */}
                          <div style={{
                            position: 'absolute',
                            left: '50%',
                            bottom: `${(isMuted ? 0 : volume) * 100}%`,
                            transform: 'translate(-50%, 50%)',
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
                            pointerEvents: 'none'
                          }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Description Button (3 dots) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDescriptionOpen(prev => !prev);
                    }}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      border: 'none',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backdropFilter: 'blur(8px)',
                      transition: 'background-color 0.15s ease',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
                    title="Description"
                    aria-label="Description"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {/* Fullscreen Button in top right corner */}
                  <button
                    onClick={toggleFullscreen}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      border: 'none',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backdropFilter: 'blur(8px)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                  </button>
                </div>
              </div>



              {/* Pause Center Watermark */}
              {!isPlaying && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  backdropFilter: 'blur(10px)',
                  pointerEvents: 'none'
                }}>
                  <Play size={32} fill="#ffffff" style={{ marginLeft: 3 }} />
                </div>
              )}

              {/* YouTube Style Red Progress Bar at Bottom of Video */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '3px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                zIndex: 30
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#ff0000',
                  transition: 'width 0.1s linear'
                }} />
              </div>
            </div>

            {/* 2. YouTube Shorts Action Rail (OUTSIDE video frame, on the right) */}
            <div style={{
              position: 'absolute',
              left: isFullscreen ? 'auto' : 'calc(100% + 12px)',
              right: isFullscreen ? 16 : 'auto',
              bottom: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              zIndex: 40
            }}>
              {/* Like Button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button
                  onClick={handleLike}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e0da',
                    color: currentSnippet.isLiked ? '#ef4444' : '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.15s ease',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8F4F0';
                    if (!currentSnippet.isLiked) {
                      e.currentTarget.style.color = '#0ea5e9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    if (!currentSnippet.isLiked) {
                      e.currentTarget.style.color = '#334155';
                    }
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  title="Like"
                >
                  <Heart size={22} fill={currentSnippet.isLiked ? '#ef4444' : 'none'} color={currentSnippet.isLiked ? '#ef4444' : 'currentColor'} />
                </button>
                <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600, marginTop: 4 }}>
                  {currentSnippet.likesCount || 0}
                </span>
              </div>

              {/* Comment Button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button
                  onClick={() => setIsCommentsOpen(prev => !prev)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e0da',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.15s ease',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8F4F0';
                    e.currentTarget.style.color = '#0ea5e9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#334155';
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  title="Comments"
                >
                  <MessageSquare size={22} color="currentColor" />
                </button>
                <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600, marginTop: 4 }}>
                  {currentSnippet.commentsCount || (currentSnippet.comments || []).length}
                </span>
              </div>

              {/* Share Button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button
                  onClick={handleShare}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e0da',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.15s ease',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8F4F0';
                    e.currentTarget.style.color = '#0ea5e9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#334155';
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  title="Share"
                >
                  <Share2 size={22} color="currentColor" />
                </button>
                <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600, marginTop: 4 }}>
                  Share
                </span>
              </div>

              {/* Delete Button (if author/admin) */}
              {isAuthorOrAdmin && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <button
                    onClick={handleDelete}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
                    title="Delete"
                  >
                    <Trash2 size={20} color="currentColor" />
                  </button>
                  <span style={{ color: '#ef4444', fontSize: '0.72rem', fontWeight: 600, marginTop: 4 }}>
                    Delete
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Right Side: Comments Drawer (below Post Snippet button, right beside Next Video button) */}
      {isCommentsOpen && currentSnippet && (
        <div style={{
          position: 'absolute',
          top: 68,
          right: 80,
          width: 480,
          maxWidth: 'calc(100vw - 120px)',
          height: 'calc(100vh - 88px)',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e5e0da',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 90,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          animation: 'fadeIn 0.2s ease',
          overflow: 'hidden'
        }}>
          {/* Comments Header */}
          <div style={{
            padding: '16px 20px',
            backgroundColor: '#F8F4F0',
            borderBottom: '1px solid #e5e0da',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                Comments
              </span>
              <span style={{ color: '#64748b', fontWeight: 300, fontSize: '1rem' }}>
                {currentSnippet.commentsCount ?? (currentSnippet.comments || []).length}
              </span>
            </div>
            <button
              onClick={() => setIsCommentsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'color 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
              <X size={20} />
            </button>
          </div>

          {/* Comments Body with Reused CommentSection */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0
          }}>
            <CommentSection
              snippetId={currentSnippet.id || currentSnippet._id}
              reviewAuthor={currentSnippet.user?.name}
              currentUser={currentUser}
              onOpenAuth={onOpenAuth}
              onCommentCountChange={handleCommentCountChange}
              theme="light"
              initialComments={currentSnippet.comments || []}
              inputPosition="bottom"
            />
          </div>
        </div>
      )}

      {/* Extreme Right: Previous / Next Snippet Vertical Navigation */}
      {currentSnippet && (
        <div style={{
          position: 'absolute',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          zIndex: 95
        }}>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: currentIndex === 0 ? '#F8F4F0' : '#ffffff',
              border: '1px solid #e5e0da',
              color: currentIndex === 0 ? '#cbd5e1' : '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentIndex === 0 ? 'default' : 'pointer',
              boxShadow: currentIndex === 0 ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              if (currentIndex !== 0) {
                e.currentTarget.style.backgroundColor = '#F8F4F0';
                e.currentTarget.style.color = '#0ea5e9';
              }
            }}
            onMouseLeave={(e) => {
              if (currentIndex !== 0) {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#334155';
              }
            }}
            onFocus={(e) => e.currentTarget.style.outline = 'none'}
            title="Previous snippet"
            aria-label="Previous snippet"
          >
            <ChevronUp size={24} color="currentColor" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex >= snippets.length - 1}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: currentIndex >= snippets.length - 1 ? '#F8F4F0' : '#ffffff',
              border: '1px solid #e5e0da',
              color: currentIndex >= snippets.length - 1 ? '#cbd5e1' : '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentIndex >= snippets.length - 1 ? 'default' : 'pointer',
              boxShadow: currentIndex >= snippets.length - 1 ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              if (currentIndex < snippets.length - 1) {
                e.currentTarget.style.backgroundColor = '#F8F4F0';
                e.currentTarget.style.color = '#0ea5e9';
              }
            }}
            onMouseLeave={(e) => {
              if (currentIndex < snippets.length - 1) {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#334155';
              }
            }}
            onFocus={(e) => e.currentTarget.style.outline = 'none'}
            title="Next snippet"
            aria-label="Next snippet"
          >
            <ChevronDown size={24} color="currentColor" />
          </button>
        </div>
      )}

      {/* Post Snippet Modal */}
      {showPostModal && (
        <PostSnippetModal
          user={currentUser}
          onClose={() => setShowPostModal(false)}
          onSuccess={(newSnippet) => {
            setSnippets(prev => [newSnippet, ...prev]);
            setCurrentIndex(0);
            setToastMessage('Snippet published successfully!');
            setTimeout(() => setToastMessage(''), 2500);
          }}
        />
      )}
    </div>
  );
}
