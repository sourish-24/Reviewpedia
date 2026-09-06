import React, { useState } from 'react';
import { Camera, MapPin, X, Trash2 } from 'lucide-react';
import BrandAutocomplete, { toPascalCase } from './BrandAutocomplete';
import CategoryDropdown from './CategoryDropdown';
import StarRating from './StarRating';
import { getAuthHeaders } from '../utils/apiUtils';

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
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isAccurateLocation, setIsAccurateLocation] = useState(true);
  const fileInputRef = React.useRef(null);

  const handleClear = () => {
      setRating(0);
      setProductName('');
      setBrandName('');
      setCategory('');
      setSummary('');
      setMediaItems([]);
      setActivePreviewIndex(0);
      setDraggedIndex(null);
      setDragOverIndex(null);
      setIsAccurateLocation(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancel = () => {
      handleClear();
      if (onClose) onClose();
  };

  const handleDrop = (fromIdx, toIdx) => {
      if (fromIdx === null || toIdx === null || fromIdx === toIdx) {
          setDraggedIndex(null);
          setDragOverIndex(null);
          return;
      }
      setMediaItems(prev => {
          const updated = [...prev];
          const [moved] = updated.splice(fromIdx, 1);
          updated.splice(toIdx, 0, moved);
          return updated;
      });
      // The first image in order will be the main one on display
      setActivePreviewIndex(0);
      setDraggedIndex(null);
      setDragOverIndex(null);
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
      const API_URL = import.meta.env.VITE_API_URL || 'https://reviewpedia.onrender.com';
      
      const existingMedia = mediaItems.filter(m => m.isExisting).map(m => ({ type: m.type, url: m.url, size: m.size }));
      const newFiles = mediaItems.filter(m => !m.isExisting && m.file);
      const mediaOrder = mediaItems.map(m => {
          if (m.isExisting) return { type: 'existing', url: m.url };
          return { type: 'new' };
      });

      const payloadData = {
          product: { name: productName, brand: brandName, category },
          review: { title: summary.substring(0, 50), text: summary, rating },
          location: { lat, lng },
          source: { platform: "Reviewpedia", isScraped: false },
          existingMedia,
          mediaOrder
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
        headers: getAuthHeaders(),
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
          return updated;
      });
      // The first image in order will be the main one on display
      setActivePreviewIndex(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveMedia = (index, e) => {
      if (e) e.stopPropagation();
      setMediaItems(prev => {
          const updated = prev.filter((_, i) => i !== index);
          return updated;
      });
      setActivePreviewIndex(0);
  };

  const inputStyle = {
      width: '100%', padding: '10px 18px', border: '1px solid rgba(255, 255, 255, 0.15)',
      background: 'rgba(255, 255, 255, 0.05)', outline: 'none', fontSize: '0.9rem',
      fontFamily: 'var(--font-body)', color: '#ffffff', transition: 'border-color 0.2s',
      borderRadius: '9999px', boxSizing: 'border-box'
  };

  const currentActiveMedia = mediaItems[activePreviewIndex] || mediaItems[0];

  return (
    <div style={{ 
        width: 'min(600px, calc(100vw - 40px))',
        minWidth: 'min(580px, calc(100vw - 40px))',
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

        <div style={{ display: 'flex', gap: 18, marginBottom: 20 }}>
          <div 
            style={{ 
              width: 260, height: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', 
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ffffff', 
              background: 'rgba(255, 255, 255, 0.05)', border: mediaItems.length > 0 ? 'none' : '1px dashed rgba(255, 255, 255, 0.3)', 
              borderRadius: '18px', overflow: 'hidden', position: 'relative' 
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
                    
                    {/* Top-left badge: Main Display */}
                    {activePreviewIndex === 0 && (
                        <div style={{
                            position: 'absolute', top: 8, left: 8,
                            background: 'rgba(14, 165, 233, 0.85)', color: '#ffffff',
                            fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px',
                            borderRadius: '8px', backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', gap: 4, zIndex: 10,
                            letterSpacing: '0.02em', pointerEvents: 'none'
                        }}>
                            <span>Main Display</span>
                        </div>
                    )}

                    {/* Top overlay delete button */}
                    <button
                        onClick={(e) => handleRemoveMedia(activePreviewIndex, e)}
                        style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 6, borderRadius: '50%', display: 'flex', zIndex: 10 }}
                        title="Remove Active Media"
                    >
                        <Trash2 size={18} />
                    </button>

                    {/* Bottom strip of thumbnails + (+) button with small scrollbar & drag-and-drop */}
                    <div 
                        className="media-thumbnail-scroll"
                        onWheel={(e) => {
                            if (e.deltaY !== 0) {
                                e.currentTarget.scrollLeft += e.deltaY;
                            }
                        }}
                        style={{ 
                            position: 'absolute', bottom: 0, left: 0, right: 0, 
                            backgroundColor: 'rgba(0,0,0,0.75)', padding: '6px 8px 6px 8px', 
                            display: 'flex', gap: 8, alignItems: 'center', 
                            overflowX: 'auto', zIndex: 10 
                        }}
                    >
                        {mediaItems.map((item, idx) => {
                            const isSelected = idx === activePreviewIndex;
                            const isDragging = idx === draggedIndex;
                            const isDragOver = idx === dragOverIndex;
                            const isMain = idx === 0;

                            return (
                                <div 
                                    key={item.id}
                                    draggable={true}
                                    onDragStart={(e) => {
                                        setDraggedIndex(idx);
                                        e.dataTransfer.effectAllowed = 'move';
                                        e.dataTransfer.setData('text/plain', `${idx}`);
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = 'move';
                                        if (dragOverIndex !== idx) setDragOverIndex(idx);
                                    }}
                                    onDragLeave={(e) => {
                                        if (dragOverIndex === idx) setDragOverIndex(null);
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDrop(draggedIndex, idx);
                                    }}
                                    onDragEnd={() => {
                                        setDraggedIndex(null);
                                        setDragOverIndex(null);
                                    }}
                                    onClick={(e) => { e.stopPropagation(); setActivePreviewIndex(idx); }}
                                    style={{
                                        width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                                        position: 'relative', cursor: 'grab',
                                        opacity: isDragging ? 0.35 : 1,
                                        border: isDragOver 
                                            ? '2px dashed #38bdf8' 
                                            : isSelected 
                                                ? '2px solid var(--primary)' 
                                                : isMain 
                                                    ? '1.5px solid rgba(14, 165, 233, 0.7)' 
                                                    : '1px solid rgba(255,255,255,0.3)',
                                        boxShadow: isDragOver ? '0 0 10px rgba(56, 189, 248, 0.7)' : 'none',
                                        transform: isDragOver ? 'scale(1.08)' : 'scale(1)',
                                        transition: 'transform 0.15s ease, border-color 0.15s ease, opacity 0.15s ease'
                                    }}
                                    title={isMain ? "Main display media (drag to reorder)" : "Drag to reorder"}
                                >
                                    {item.type === 'video' ? (
                                        <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                                    ) : (
                                        <img src={item.url} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                                    )}
                                    {isMain && (
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0,
                                            background: 'rgba(14, 165, 233, 0.9)', color: '#ffffff',
                                            fontSize: '8px', fontWeight: 800, textAlign: 'center',
                                            letterSpacing: '0.5px', lineHeight: '13px', textTransform: 'uppercase',
                                            pointerEvents: 'none'
                                        }}>
                                            MAIN
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            style={{ width: 44, height: 44, borderRadius: 8, border: '1px dashed rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.25rem', flexShrink: 0 }}
                            title="Add More Media"
                        >
                            +
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <Camera size={38} style={{ marginBottom: 8, color: '#0ea5e9' }} />
                    <span style={{ fontSize: '0.95rem', fontFamily: 'var(--font-body)', fontWeight: 600, color: '#ffffff' }}>Add Media</span>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: 2 }}>Photos or Videos</span>
                </>
            )}
            <input type="file" accept="image/*,video/*" multiple ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
          </div>
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'space-between' }}>
            <input 
              type="text" 
              placeholder="Product Name" 
              value={productName}
              onChange={e => setProductName(toPascalCase(e.target.value))}
              className="create-review-input"
              style={inputStyle} 
            />
            <BrandAutocomplete 
              value={brandName}
              onChange={setBrandName}
              placeholder="Brand Name (e.g. Sony, Apple)" 
              className="create-review-input"
              inputStyle={inputStyle} 
            />
            <CategoryDropdown 
              value={category}
              onChange={setCategory}
              className="create-review-input"
              inputStyle={inputStyle}
            />

            {/* Share Location Box */}
            <div 
              style={{ 
                ...inputStyle, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none'
              }}
              onClick={() => setIsAccurateLocation(prev => !prev)}
            >
              <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-body)', color: '#ffffff' }}>
                Location
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                  {isAccurateLocation ? 'Accurate' : 'Approximate'}
                </span>
                {/* Toggle Button */}
                <div 
                  style={{
                    width: 38,
                    height: 22,
                    borderRadius: 9999,
                    background: isAccurateLocation ? '#0ea5e9' : 'rgba(255, 255, 255, 0.2)',
                    position: 'relative',
                    transition: 'background-color 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  <div 
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#ffffff',
                      position: 'absolute',
                      top: 3,
                      left: isAccurateLocation ? 19 : 3,
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '4px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#ffffff', fontFamily: 'var(--font-body)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>YOUR RATING</p>
              <StarRating
                rating={rating}
                onChange={setRating}
                interactive={true}
                size={22}
                gap={6}
                emptyColor="rgba(255, 255, 255, 0.35)"
              />
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
