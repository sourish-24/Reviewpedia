import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, CornerDownRight, Trash2, Send, Plus, Minus, User as UserIcon } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

/**
 * Formats a date into human-friendly relative time (e.g. "2h ago", "3d ago", "2mo ago")
 */
function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return formatDate(dateStr);

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return 'just now';
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

/**
 * Builds a hierarchical comment tree from flat array using parentId
 */
function buildCommentTree(commentsList) {
  if (!Array.isArray(commentsList)) return [];
  const map = {};
  const roots = [];

  commentsList.forEach(c => {
    map[c.id] = { ...c, children: [] };
  });

  commentsList.forEach(c => {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].children.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });

  return roots;
}

export default function CommentSection({ reviewId, reviewAuthor, currentUser, onOpenAuth, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topCommentText, setTopCommentText] = useState('');
  const [isTopCommentFocused, setIsTopCommentFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [collapsedIds, setCollapsedIds] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || '';

  // Notify parent of comments count
  useEffect(() => {
    if (onCommentCountChange) {
      onCommentCountChange(comments.length);
    }
  }, [comments.length, onCommentCountChange]);

  // Fetch comments for review
  useEffect(() => {
    if (!reviewId) return;
    let isMounted = true;

    async function fetchComments() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/reviews/${reviewId}/comments`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setComments(data);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchComments();
    return () => { isMounted = false; };
  }, [reviewId, API_URL]);

  // Submit top-level comment
  const handlePostTopComment = async (e) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    if (!topCommentText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: topCommentText.trim() })
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments(prev => [...prev, newComment]);
        setTopCommentText('');
        setIsTopCommentFocused(false);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to post comment');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit nested reply
  const handlePostReply = async (parentId) => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    if (!replyText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: replyText.trim(), parentId })
      });

      if (res.ok) {
        const newReply = await res.json();
        setComments(prev => [...prev, newReply]);
        setReplyText('');
        setReplyingToId(null);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to post reply');
      }
    } catch (err) {
      console.error('Error posting reply:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle like on comment
  const handleToggleLike = async (commentId) => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    const currentUserId = currentUser.id?.toString() || currentUser._id?.toString() || currentUser.username;
    
    // Optimistic update
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const likes = Array.isArray(c.likes) ? c.likes : [];
        const isLiked = likes.includes(currentUserId);
        const updated = isLiked
          ? likes.filter(id => id !== currentUserId)
          : [...likes, currentUserId];
        return { ...c, likes: updated };
      }
      return c;
    }));

    try {
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: data.likes } : c));
      }
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment and its replies?')) return;

    try {
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        // Remove comment and descendants
        const toDelete = new Set([commentId]);
        let changed = true;
        while (changed) {
          changed = false;
          comments.forEach(c => {
            if (c.parentId && toDelete.has(c.parentId) && !toDelete.has(c.id)) {
              toDelete.add(c.id);
              changed = true;
            }
          });
        }
        setComments(prev => prev.filter(c => !toDelete.has(c.id)));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete comment');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const toggleCollapse = (id) => {
    setCollapsedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const commentTree = buildCommentTree(comments);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
      {/* Top Comment Input Area (Part of background) */}
      {currentUser ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
            {currentUser.profilePic ? (
              <img src={currentUser.profilePic} alt={currentUser.username} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#0ea5e9', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>
                {currentUser.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <span>Comment as <strong style={{ color: '#0f172a', fontWeight: 600 }}>{currentUser.username}</strong></span>
          </div>

          <textarea
            value={topCommentText}
            onChange={(e) => setTopCommentText(e.target.value)}
            onFocus={(e) => {
              setIsTopCommentFocused(true);
              e.target.style.borderColor = '#0ea5e9';
            }}
            onBlur={(e) => {
              setIsTopCommentFocused(false);
              e.target.style.borderColor = '#e5e0da';
            }}
            placeholder="What are your thoughts on this review or product?"
            rows={isTopCommentFocused || topCommentText.trim() ? 3 : 2}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '12px 14px',
              border: '1px solid #e5e0da',
              borderRadius: '12px',
              fontSize: '0.92rem',
              fontFamily: 'var(--font-body)',
              color: '#1e293b',
              outline: 'none',
              resize: 'vertical',
              backgroundColor: '#ffffff',
              transition: 'border-color 0.2s',
              lineHeight: 1.5
            }}
          />

          {(isTopCommentFocused || topCommentText.trim().length > 0) && (
            <div 
              style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {topCommentText.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setTopCommentText('');
                    setIsTopCommentFocused(false);
                  }}
                  style={{
                    height: 36,
                    padding: '0 16px',
                    borderRadius: '9999px',
                    backgroundColor: 'transparent',
                    color: '#64748b',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    transition: 'color 0.15s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#1e293b'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handlePostTopComment}
                disabled={isSubmitting || !topCommentText.trim()}
                style={{
                  height: 36,
                  padding: '0 20px',
                  borderRadius: '9999px',
                  backgroundColor: topCommentText.trim() ? '#0ea5e9' : '#e4e0dc',
                  color: topCommentText.trim() ? '#ffffff' : '#8c827a',
                  border: 'none',
                  cursor: topCommentText.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s'
                }}
              >
                <Send size={14} />
                <span>{isSubmitting ? 'Posting...' : 'Comment'}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          background: 'transparent',
          border: '1px dashed #cbd5e1',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569' }}>
            Log in or create an account to share your thoughts and join the discussion.
          </p>
          <button
            onClick={() => onOpenAuth && onOpenAuth('login')}
            style={{
              height: 38,
              padding: '0 24px',
              borderRadius: '9999px',
              backgroundColor: '#0ea5e9',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem'
            }}
          >
            Log In / Sign Up
          </button>
        </div>
      )}

      {/* Comment List / Tree */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: '0.95rem' }}>
          Loading discussion...
        </div>
      ) : commentTree.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#64748b'
        }}>
          <MessageSquare size={36} color="#cbd5e1" style={{ margin: '0 auto 12px auto' }} />
          <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem', color: '#334155' }}>No comments yet</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#94a3b8' }}>Be the first one to share your review or question!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {commentTree.map(node => (
            <CommentNode
              key={node.id}
              node={node}
              reviewAuthor={reviewAuthor}
              currentUser={currentUser}
              collapsedIds={collapsedIds}
              toggleCollapse={toggleCollapse}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              replyText={replyText}
              setReplyText={setReplyText}
              handlePostReply={handlePostReply}
              handleToggleLike={handleToggleLike}
              handleDeleteComment={handleDeleteComment}
              isSubmitting={isSubmitting}
              onOpenAuth={onOpenAuth}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Nested Reply Comment Node with YouTube/Reddit Curved Branch Tree Lines
 */
function CommentNode({
  node,
  reviewAuthor,
  currentUser,
  collapsedIds,
  toggleCollapse,
  replyingToId,
  setReplyingToId,
  replyText,
  setReplyText,
  handlePostReply,
  handleToggleLike,
  handleDeleteComment,
  isSubmitting,
  onOpenAuth,
  depth = 0
}) {
  const isCollapsed = !!collapsedIds[node.id];
  const isReplying = replyingToId === node.id;
  const isOP = reviewAuthor && node.user?.name && reviewAuthor.toLowerCase() === node.user.name.toLowerCase();
  const hasChildren = Boolean(node.children && node.children.length > 0);

  const currentUserId = currentUser ? (currentUser.id?.toString() || currentUser._id?.toString() || currentUser.username) : null;
  const likesArray = Array.isArray(node.likes) ? node.likes : [];
  const isLiked = currentUserId ? likesArray.includes(currentUserId) : false;
  const likesCount = likesArray.length;

  const isAuthor = currentUser && (
    (node.user?.id && (currentUser.id?.toString() === node.user.id.toString() || currentUser._id?.toString() === node.user.id.toString())) ||
    (node.user?.name && currentUser.username === node.user.name) ||
    currentUser.role === 'admin'
  );

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Comment Main Row: Left Avatar/Stem Column + Right Content Column */}
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
        position: 'relative'
      }}>
        {/* Left Column: Avatar (28x28) + Vertical Stem Line down to children */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '28px',
          flexShrink: 0,
          alignSelf: 'stretch',
          position: 'relative'
        }}>
          {/* Avatar */}
          {node.user?.profilePic ? (
            <img
              src={node.user.profilePic}
              alt={node.user.name}
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: '#0ea5e9',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.78rem',
              flexShrink: 0
            }}>
              {node.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}

          {/* Vertical stem line running down from avatar if has expanded children */}
          {hasChildren && !isCollapsed && (
            <div
              onClick={() => toggleCollapse(node.id)}
              style={{
                width: '2px',
                flex: 1,
                backgroundColor: '#cbd5e1',
                marginTop: '4px',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.15s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#94a3b8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#cbd5e1'}
              title="Click to collapse thread"
            >
              {/* Circular (-) collapse button positioned on the vertical line (Reddit style) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCollapse(node.id);
                }}
                style={{
                  position: 'absolute',
                  top: '10px',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: '#F8F4F0',
                  border: '1.5px solid #94a3b8',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.15s',
                  zIndex: 2
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#0ea5e9';
                  e.currentTarget.style.color = '#0ea5e9';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#94a3b8';
                  e.currentTarget.style.color = '#64748b';
                }}
                title="Collapse thread"
              >
                <Minus size={10} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

        {/* Right Content Column */}
        <div style={{ flex: 1, minWidth: 0, paddingBottom: '6px' }}>
          {/* Header Row: @Username • time ago */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
              @{node.user?.name || 'Anonymous'}
            </span>

            {isOP && (
              <span style={{ backgroundColor: 'rgba(14, 165, 233, 0.12)', color: '#0284c7', fontSize: '0.72rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>
                OP
              </span>
            )}

            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {formatTimeAgo(node.createdAt || node.metadata?.date)}
            </span>
          </div>

          {/* Comment Text */}
          <p style={{
            margin: '0 0 6px 0',
            fontSize: '0.92rem',
            lineHeight: 1.5,
            color: '#1e293b',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'var(--font-body)'
          }}>
            {node.text}
          </p>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {/* Upvote / Like Button */}
            <button
              onClick={() => handleToggleLike(node.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                padding: '2px 4px',
                cursor: 'pointer',
                color: isLiked ? '#ef4444' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'color 0.15s'
              }}
              onMouseOver={(e) => { if (!isLiked) e.currentTarget.style.color = '#0f172a'; }}
              onMouseOut={(e) => { if (!isLiked) e.currentTarget.style.color = '#64748b'; }}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart size={14} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'currentColor'} />
              {likesCount > 0 && <span>{likesCount}</span>}
            </button>

            {/* Reply Button */}
            <button
              onClick={() => {
                if (!currentUser && onOpenAuth) {
                  onOpenAuth('login');
                  return;
                }
                if (isReplying) {
                  setReplyingToId(null);
                  setReplyText('');
                } else {
                  setReplyingToId(node.id);
                  setReplyText('');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                padding: '2px 4px',
                cursor: 'pointer',
                color: isReplying ? '#0ea5e9' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'color 0.15s'
              }}
              onMouseOver={(e) => { if (!isReplying) e.currentTarget.style.color = '#0f172a'; }}
              onMouseOut={(e) => { if (!isReplying) e.currentTarget.style.color = '#64748b'; }}
            >
              <span>{isReplying ? 'Cancel' : 'Reply'}</span>
            </button>

            {/* Expand Thread button if collapsed */}
            {isCollapsed && hasChildren && (
              <button
                onClick={() => toggleCollapse(node.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'transparent',
                  border: 'none',
                  padding: '2px 4px',
                  cursor: 'pointer',
                  color: '#0ea5e9',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: '1.5px solid #0ea5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Plus size={10} strokeWidth={2.5} />
                </div>
                <span>{node.children.length} {node.children.length === 1 ? 'reply' : 'replies'}</span>
              </button>
            )}

            {/* Delete Button (Author only) */}
            {isAuthor && (
              <button
                onClick={() => handleDeleteComment(node.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: 'none',
                  padding: '2px 4px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  fontSize: '0.78rem',
                  transition: 'color 0.15s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                title="Delete comment"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            )}
          </div>

          {/* Inline Reply Input */}
          {isReplying && (
            <div style={{
              marginTop: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to @${node.user?.name || 'User'}...`}
                rows={2}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  border: '1px solid #e5e0da',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  resize: 'vertical',
                  backgroundColor: '#ffffff',
                  color: '#1e293b'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                onBlur={(e) => e.target.style.borderColor = '#e5e0da'}
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setReplyingToId(null); setReplyText(''); }}
                  style={{
                    height: 30,
                    padding: '0 14px',
                    borderRadius: '9999px',
                    backgroundColor: 'transparent',
                    color: '#64748b',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePostReply(node.id)}
                  disabled={isSubmitting || !replyText.trim()}
                  style={{
                    height: 30,
                    padding: '0 16px',
                    borderRadius: '9999px',
                    backgroundColor: replyText.trim() ? '#0ea5e9' : '#e4e0dc',
                    color: replyText.trim() ? '#ffffff' : '#8c827a',
                    border: 'none',
                    cursor: replyText.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Send size={12} />
                  <span>{isSubmitting ? 'Replying...' : 'Reply'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Children Replies with Curved Elbow Branches (YouTube/Reddit style) */}
      {!isCollapsed && hasChildren && (
        <div style={{
          position: 'relative',
          paddingLeft: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          marginTop: '8px'
        }}>
          {node.children.map((child, index) => {
            const isLast = index === node.children.length - 1;
            return (
              <div key={child.id} style={{ position: 'relative' }}>
                {/* Vertical Trunk Line down to subsequent siblings */}
                {!isLast && (
                  <div style={{
                    position: 'absolute',
                    left: '-15px',
                    top: 0,
                    bottom: '-14px',
                    width: '2px',
                    backgroundColor: '#cbd5e1'
                  }} />
                )}

                {/* Curved Elbow Branch connecting from trunk line to this child's avatar */}
                <div style={{
                  position: 'absolute',
                  left: '-15px',
                  top: 0,
                  width: '15px',
                  height: '14px',
                  borderLeft: '2px solid #cbd5e1',
                  borderBottom: '2px solid #cbd5e1',
                  borderBottomLeftRadius: '10px',
                  boxSizing: 'border-box',
                  pointerEvents: 'none'
                }} />

                <CommentNode
                  node={child}
                  reviewAuthor={reviewAuthor}
                  currentUser={currentUser}
                  collapsedIds={collapsedIds}
                  toggleCollapse={toggleCollapse}
                  replyingToId={replyingToId}
                  setReplyingToId={setReplyingToId}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  handlePostReply={handlePostReply}
                  handleToggleLike={handleToggleLike}
                  handleDeleteComment={handleDeleteComment}
                  isSubmitting={isSubmitting}
                  onOpenAuth={onOpenAuth}
                  depth={depth + 1}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

