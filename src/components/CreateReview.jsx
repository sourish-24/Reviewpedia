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

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel" style={{ width: 500, padding: 30, backgroundColor: 'rgba(255,255,255,0.95)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
        
        <h2 style={{ marginBottom: 20, fontSize: '1.5rem' }}>Create Review</h2>

        <div style={{ display: 'flex', gap: 15, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 100, borderRadius: 10, border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
            <Camera size={28} style={{ marginBottom: 5 }} />
            <span style={{ fontSize: '0.85rem' }}>Add Media</span>
          </div>
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input 
              type="text" 
              placeholder="Product Name" 
              value={productName}
              onChange={e => setProductName(e.target.value)}
              style={{ width: '100%', padding: '10px 15px', borderRadius: 8, border: '1px solid #cbd5e1' }} 
            />
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ width: '100%', padding: '10px 15px', borderRadius: 8, border: '1px solid #cbd5e1' }}
            >
              <option value="">Select Category</option>
              {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '15px', backgroundColor: '#f1f5f9', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#475569' }}>
            <MapPin size={20} /> <span style={{ fontSize: '0.9rem' }}>Tag Current Location</span>
          </div>
          <input type="checkbox" defaultChecked />
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ marginBottom: 10, fontSize: '0.9rem', color: '#64748b' }}>Your Rating</p>
          <div style={{ display: 'flex', gap: 5 }}>
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star} 
                size={28} 
                fill={star <= rating ? "#fbbf24" : "none"} 
                color={star <= rating ? "#fbbf24" : "#cbd5e1"}
                onClick={() => setRating(star)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        <textarea 
          placeholder="Share your experience (What did you like? Dislike? Was the seller reliable?)" 
          value={summary}
          onChange={e => setSummary(e.target.value)}
          style={{ width: '100%', height: 100, padding: 15, borderRadius: 8, border: '1px solid #cbd5e1', marginBottom: 20, resize: 'none' }}
        />

        <button 
          onClick={handleSubmit}
          disabled={loading}
          style={{ 
            width: '100%', padding: 15, borderRadius: 8, border: 'none', 
            backgroundColor: loading ? '#94a3b8' : 'var(--primary-color)', 
            color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? 'Posting...' : 'Post Review'}
        </button>
      </div>
    </div>
  );
}
