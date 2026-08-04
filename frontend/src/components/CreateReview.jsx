import React, { useState } from 'react';
import { Camera, MapPin, X, Star, Trash2 } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../utils/mockData';

export default function CreateReview({ onClose, onPostSuccess, editingReview }) {
  const [rating, setRating] = useState(editingReview?.review?.rating || 0);
  const [productName, setProductName] = useState(editingReview?.product?.name || '');
  const [brandName, setBrandName] = useState(editingReview?.product?.brand || '');
  const [category, setCategory] = useState(editingReview?.product?.category || '');
  const [summary, setSummary] = useState(editingReview?.review?.text || editingReview?.review?.title || '');
  const [loading, setLoading] = useState(false);
  const [mediaItems, setMediaItems] = useState(() => {
    if (editingReview?.review?.media && editingReview.review.media.length > 0) {
      return editingReview.review.media.map((m, i) => ({
        id: 'existing-' + i,
        url: m.url,
        type: m.type || 'image',
        size: m.size || 0,
        isExisting: true
      }));
    }
    return [];
  });
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const fileInputRef = React.useRef(null);

  const handleClear = () => {
      setRating(0);
      setProductName('');
      setBrandName('');
      setCategory('');
      setSummary('');
      setMediaItems([]);
      setActivePreviewIndex(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancel = () => {
      handleClear();
      if (onClose) onClose();
  };

  const handleSubmit = async () => {
    if (!productName || !productName.trim()) {
      alert("Please enter a product name.");
      return;
    }
    if (!category) {
      alert("Please select a category.");
      return;
    }
    if (rating === 0) {
      alert("Please provide a star rating.");
      return;
    }
    if (!summary || !summary.trim()) {
      alert("Please share your experience in the review text.");
      return;
    }

    setLoading(true);

    const getFallbackLoc = () => {
      const storedLoc = sessionStorage.getItem('userLoc');
      if (storedLoc) {
        try {
          const parsed = JSON.parse(storedLoc);
          if (parsed && Array.isArray(parsed) && parsed.length === 2) return { lat: parsed[0], lng: parsed[1] };
        } catch(e) {}
      }
      const storedState = sessionStorage.getItem('mapState');
      if (storedState) {
        try {
          const parsed = JSON.parse(storedState);
          if (parsed && parsed.lat && parsed.lng) return { lat: parsed.lat, lng: parsed.lng };
        } catch(e) {}
      }
      return { lat: 28.7041, lng: 77.1025 };
    };

    if (editingReview) {
      const fallback = getFallbackLoc();
      const lat = editingReview.location?.lat || fallback.lat;
      const lng = editingReview.location?.lng || fallback.lng;
      await postReview(lat, lng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => await postReview(pos.coords.latitude, pos.coords.longitude),
        async () => {
          const fallback = getFallbackLoc();
          await postReview(fallback.lat, fallback.lng);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
      );
    } else {
      const fallback = getFallbackLoc();
      await postReview(fallback.lat, fallback.lng);
    }
  };

  const postReview = async (lat, lng) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const existingMedia = mediaItems.filter(m => m.isExisting).map(m => ({ type: m.type, url: m.url, size: m.size }));
      const newFiles = mediaItems.filter(m => !m.isExisting && m.file);

      const payloadData = {
          product: { name: productName, brand: brandName, category },
          review: { title: summary.substring(0, 50), text: summary, rating },
          location: { lat, lng },
          source: { platform: "Reviewpedia", isScraped: false },
          existingMedia
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(payloadData));
      newFiles.forEach(item => {
          formData.append('images', item.file);
      });

      const isEdit = !!editingReview;
      const reviewId = editingReview?.id || editingReview?._id;
      const endpoint = isEdit ? `${API_URL}/api/reviews/${reviewId}` : `${API_URL}/api/reviews`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        credentials: 'include',
        body: formData
      });
      if (res.ok) {
        if (onPostSuccess) onPostSuccess();
        else onClose();
      } else {
        const errText = await res.text();
        console.error("Backend response:", errText);
        alert(`Failed to save the review.\nServer says: ${errText}`);
      }
    } catch (e) {
      console.error("Failed to post:", e);
      alert("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      const newItems = files.map((file, idx) => ({
          id: 'new-' + Date.now() + '-' + idx,
          file,
          url: URL.createObjectURL(file),
          type: file.type.startsWith('video/') ? 'video' : 'image',
          size: file.size,
          isExisting: false
      }));
      setMediaItems(prev => {
          const updated = [...prev, ...newItems];
          setActivePreviewIndex(updated.length - 1);
          return updated;
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveMedia = (index, e) => {
      if (e) e.stopPropagation();
      setMediaItems(prev => {
          const updated = prev.filter((_, i) => i !== index);
          if (activePreviewIndex >= updated.length) {
              setActivePreviewIndex(Math.max(0, updated.length - 1));
          }
          return updated;
      });
  };

  const inputStyle = {
      width: '100%', padding: '10px 18px', border: '1px solid rgba(255, 255, 255, 0.15)',
      background: 'rgba(255, 255, 255, 0.05)', outline: 'none', fontSize: '0.9rem',
      fontFamily: 'var(--font-body)', color: '#ffffff', transition: 'border-color 0.2s',
      borderRadius: '9999px', boxSizing: 'border-box'
  };

  const currentActiveMedia = mediaItems[activePreviewIndex];

  return (
    <div style={{ 
        width: '100%',
        height: 'calc(100vh - 120px)',
        maxHeight: 'calc(100vh - 120px)',
        overflow: 'hidden',
        padding: '24px', 
        background: 'rgba(3, 3, 3, 0.6)', 
        backdropFilter: 'blur(12px)', 
        WebkitBackdropFilter: 'blur(12px)',
        border: 'none',
        boxShadow: 'none',
        borderRadius: '20px',
        color: '#ffffff',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
    }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', color: '#ffffff', fontFamily: 'var(--font-display)' }}>
            {editingReview ? 'Edit Review' : 'Create Review'}
        </h2>

        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <div 
            style={{ 
              width: 200, height: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', 
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ffffff', 
              background: 'rgba(255, 255, 255, 0.05)', border: mediaItems.length > 0 ? 'none' : '1px dashed rgba(255, 255, 255, 0.3)', 
              borderRadius: '16px', overflow: 'hidden', position: 'relative' 
            }}
            onClick={() => {
              if (mediaItems.length === 0) fileInputRef.current?.click();
            }}
          >
            {mediaItems.length > 0 && currentActiveMedia ? (
                <>
                    {currentActiveMedia.type === 'video' ? (
                        <video src={currentActiveMedia.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <img src={currentActiveMedia.url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    
                    {/* Top overlay delete button */}
                    <button
                        onClick={(e) => handleRemoveMedia(activePreviewIndex, e)}
                        style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4, borderRadius: '50%', display: 'flex', zIndex: 10 }}
                        title="Remove Active Media"
                    >
                        <Trash2 size={16} />
                    </button>

                    {/* Bottom strip of thumbnails + (+) button */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', padding: '4px 6px', display: 'flex', gap: 6, alignItems: 'center', overflowX: 'auto', zIndex: 10 }}>
                        {mediaItems.map((item, idx) => (
                            <div 
                                key={item.id}
                                onClick={(e) => { e.stopPropagation(); setActivePreviewIndex(idx); }}
                                style={{
                                    width: 32, height: 32, borderRadius: 4, overflow: 'hidden', flexShrink: 0,
                                    border: idx === activePreviewIndex ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.3)',
                                    cursor: 'pointer'
                                }}
                            >
                                {item.type === 'video' ? (
                                    <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <img src={item.url} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                            </div>
                        ))}
                        <button
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            style={{ width: 32, height: 32, borderRadius: 4, border: '1px dashed rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}
                            title="Add More Media"
                        >
                            +
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <Camera size={24} style={{ marginBottom: 6, color: '#0ea5e9' }} />
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-body)', color: '#ffffff' }}>Add Media</span>
                </>
            )}
            <input type="file" accept="image/*,video/*" multiple ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
          </div>
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'space-between' }}>
            <input 
              type="text" 
              placeholder="Product Name" 
              value={productName}
              onChange={e => setProductName(e.target.value)}
              className="create-review-input"
              style={inputStyle} 
            />
            <input 
              type="text" 
              placeholder="Brand Name (e.g. Sony, Apple)" 
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              className="create-review-input"
              style={inputStyle} 
            />
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="create-review-input"
              style={{ ...inputStyle, cursor: 'pointer', color: '#ffffff' }}
            >
              <option value="" disabled hidden style={{ color: '#000000', backgroundColor: '#ffffff' }}>Select Category</option>
              {PRODUCT_CATEGORIES.map(c => <option key={c} value={c} style={{ color: '#000000', backgroundColor: '#ffffff' }}>{c}</option>)}
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '4px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#ffffff', fontFamily: 'var(--font-body)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>YOUR RATING</p>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    size={22} 
                    fill={star <= rating ? "var(--golden-star)" : "none"} 
                    color={star <= rating ? "var(--golden-star)" : "rgba(255, 255, 255, 0.4)"}
                    onClick={() => setRating(star)}
                    style={{ cursor: 'pointer', transition: 'fill 0.2s', strokeWidth: 1.5 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <textarea 
          placeholder="Share your experience (What did you like? Dislike?)" 
          value={summary}
          onChange={e => setSummary(e.target.value)}
          className="create-review-input"
          style={{ ...inputStyle, borderRadius: '20px', padding: '14px 18px', flex: 1, minHeight: '120px', resize: 'none', marginBottom: 20 }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 'auto' }}>
            <button 
              type="button"
              onClick={handleCancel}
              disabled={loading}
              style={{ 
                height: '36px', padding: '0 20px', opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.85rem',
                background: 'none', color: '#ffffff', border: 'none',
                fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s'
              }}
              onMouseOver={e => { if(!loading) e.currentTarget.style.color = '#0ea5e9'; }}
              onMouseOut={e => { if(!loading) e.currentTarget.style.color = '#ffffff'; }}
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{ 
                height: '36px', padding: '0 24px', opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.85rem',
                background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '9999px',
                fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s'
              }}
              onMouseOver={e => { if(!loading) e.currentTarget.style.backgroundColor = '#0284c7'; }}
              onMouseOut={e => { if(!loading) e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
            >
              {loading ? (editingReview ? 'Saving...' : 'Posting...') : (editingReview ? 'Save Review' : 'Post Review')}
            </button>
        </div>
      </div>
  );
}
