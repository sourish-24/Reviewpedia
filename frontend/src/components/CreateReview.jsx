import React, { useState } from 'react';
import { Camera, MapPin, X, Star, Trash2 } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../utils/mockData';

export default function CreateReview({ onClose, onPostSuccess }) {
  const [rating, setRating] = useState(0);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = React.useRef(null);

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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const payloadData = {
          product: { name: productName, category },
          review: { title: summary.substring(0, 50), text: summary, rating },
          location: { lat, lng },
          source: { platform: "Local Post" }
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(payloadData));
      if (selectedImage) {
          formData.append('image', selectedImage);
      }

      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (res.ok) {
        if (onPostSuccess) onPostSuccess();
        else onClose(); // fallback
      } else {
        const errText = await res.text();
        console.error("Backend response:", errText);
        alert(`Failed to submit the review.\nServer says: ${errText}`);
      }
    } catch (e) {
      console.error("Failed to post:", e);
      alert("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setSelectedImage(file);
          setPreviewUrl(URL.createObjectURL(file));
      }
  };

  const inputStyle = {
      width: '100%', padding: '10px 12px', border: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(255, 255, 255, 0.03)', outline: 'none', fontSize: '0.9rem',
      fontFamily: 'var(--font-body)', color: '#ffffff', transition: 'border-color 0.2s',
      borderRadius: '8px', boxSizing: 'border-box'
  };

  return (
    <div style={{ 
        width: '100%',
        padding: '24px', 
        background: 'rgba(3, 3, 3, 0.6)', 
        backdropFilter: 'blur(12px)', 
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: 'none',
        borderRadius: '16px',
        color: '#ffffff',
        boxSizing: 'border-box'
    }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', color: '#ffffff', fontFamily: 'var(--font-display)' }}>Create Review</h2>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div 
            style={{ width: 200, height: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#a1a1aa', background: 'rgba(255, 255, 255, 0.03)', border: previewUrl ? 'none' : '1px dashed rgba(255, 255, 255, 0.2)', borderRadius: '8px', overflow: 'hidden', position: 'relative', transition: 'background 0.2s' }}
            onClick={() => fileInputRef.current?.click()}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
          >
            {previewUrl ? (
                <>
                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0}>
                        <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>Change</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                                setPreviewUrl(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            style={{ position: 'absolute', bottom: 6, right: 6, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4, display: 'flex' }}
                            title="Remove Media"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <Camera size={24} style={{ marginBottom: 6, color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}>Add Media</span>
                </>
            )}
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
          </div>
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
            <input 
              type="text" 
              placeholder="Product Name" 
              value={productName}
              onChange={e => setProductName(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              style={inputStyle} 
            />
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="" disabled hidden style={{ color: 'black' }}>Select Category</option>
              {PRODUCT_CATEGORIES.map(c => <option key={c} value={c} style={{ color: 'black' }}>{c}</option>)}
            </select>
          </div>
        </div>


        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#a1a1aa', fontFamily: 'var(--font-body)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Rating</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star} 
                size={28} 
                fill={star <= rating ? "var(--golden-star)" : "none"} 
                color={star <= rating ? "var(--golden-star)" : "var(--empty-star)"}
                onClick={() => setRating(star)}
                style={{ cursor: 'pointer', transition: 'fill 0.2s', strokeWidth: 1.5 }}
              />
            ))}
          </div>
        </div>

        <textarea 
          placeholder="Share your experience (What did you like? Dislike?)" 
          value={summary}
          onChange={e => setSummary(e.target.value)}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          style={{ ...inputStyle, height: 100, resize: 'none', marginBottom: 20 }}
        />

        <button 
          onClick={handleSubmit}
          disabled={loading}
          style={{ 
            width: '100%', padding: '12px', opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem',
            background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px',
            fontWeight: 600, transition: 'background 0.2s'
          }}
          onMouseOver={e => { if(!loading) e.currentTarget.style.background = '#634cf2'; }}
          onMouseOut={e => { if(!loading) e.currentTarget.style.background = 'var(--primary)'; }}
        >
          {loading ? 'Posting...' : 'Post Review'}
        </button>
      </div>
  );
}
