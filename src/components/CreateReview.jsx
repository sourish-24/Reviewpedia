import React, { useState } from 'react';
import { Camera, MapPin, X, Star } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../utils/mockData';

export default function CreateReview({ onClose, onPostSuccess }) {
  const [rating, setRating] = useState(0);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!productName || !category || rating === 0 || !summary) {
      alert("Please fill out all fields and provide a rating.");
      return;
    }

    setLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => await postReview(pos.coords.latitude, pos.coords.longitude),
        async (err) => await postReview(28.7041, 77.1025) // Delhi Fallback
      );
    } else {
      await postReview(28.7041, 77.1025);
    }
  };

  const postReview = async (lat, lng) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          category,
          rating,
          summary,
          lat,
          lng,
          platform: "Local Post"
        })
      });
      if (res.ok) {
        if (onPostSuccess) onPostSuccess();
        else onClose(); // fallback
      } else {
        alert("Failed to submit the review.");
      }
    } catch (e) {
      console.error("Failed to post:", e);
      alert("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
      width: '100%', padding: '12px 16px', border: 'none', borderBottom: '2px solid transparent',
      background: 'var(--surface-highest)', outline: 'none', fontSize: '1rem',
      fontFamily: 'var(--font-body)', color: 'var(--on-surface)', transition: 'border-color 0.2s',
      borderRadius: '8px 8px 0 0'
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(26, 28, 28, 0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-panel" style={{ width: 500, padding: '32px', background: 'var(--surface-lowest)', position: 'relative', border: 'none' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}><X size={24} /></button>
        
        <h2 style={{ margin: '0 0 24px 0', fontSize: '1.75rem', color: 'var(--on-surface)' }}>Create Review</h2>

        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div className="tonal-panel" style={{ flex: 1, height: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--on-surface-variant)', background: 'var(--surface-highest)', border: '1px dashed var(--on-surface-variant)' }}>
            <Camera size={28} style={{ marginBottom: 8, color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}>Add Media</span>
          </div>
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input 
              type="text" 
              placeholder="Product Name" 
              value={productName}
              onChange={e => setProductName(e.target.value)}
              onFocus={(e) => e.target.style.borderBottomColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
              style={inputStyle} 
            />
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              onFocus={(e) => e.target.style.borderBottomColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="" disabled hidden>Select Category</option>
              {PRODUCT_CATEGORIES.map(c => <option key={c} value={c} style={{ color: 'black' }}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="tonal-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '16px', background: 'var(--surface-highest)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--on-surface)' }}>
            <MapPin size={20} color="var(--primary)" /> <span style={{ fontSize: '0.95rem', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Tag Current Location</span>
          </div>
          <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)', width: 18, height: 18, cursor: 'pointer' }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-body)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Rating</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star} 
                size={34} 
                fill={star <= rating ? "var(--golden-star)" : "none"} 
                color={star <= rating ? "var(--golden-star)" : "var(--empty-star)"}
                onClick={() => setRating(star)}
                style={{ cursor: 'pointer', transition: 'fill 0.2s', strokeWidth: 1.5 }}
              />
            ))}
          </div>
        </div>

        <textarea 
          placeholder="Share your experience (What did you like? Dislike? Was the seller reliable?)" 
          value={summary}
          onChange={e => setSummary(e.target.value)}
          onFocus={(e) => e.target.style.borderBottomColor = 'var(--primary)'}
          onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
          style={{ ...inputStyle, height: 120, resize: 'none', marginBottom: 24 }}
        />

        <button 
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ 
            width: '100%', padding: '16px', opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1.05rem'
          }}
        >
          {loading ? 'Posting...' : 'Post Review'}
        </button>
      </div>
    </div>
  );
}
