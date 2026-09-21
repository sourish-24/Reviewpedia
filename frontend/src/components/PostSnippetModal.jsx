import React, { useState, useRef } from 'react';
import { X, UploadCloud, Video, Star, AlertCircle, CheckCircle2, Film, Sparkles, ExternalLink } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../utils/mockData';
import { getAuthHeaders } from '../utils/apiUtils';

export default function PostSnippetModal({ onClose, onSuccess, user }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [durationError, setDurationError] = useState('');

  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0] || 'General');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [caption, setCaption] = useState('');
  const [purchaseLink, setPurchaseLink] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('video/')) {
      setDurationError('Please select a valid video file (e.g. MP4, WebM, MOV).');
      return;
    }

    setDurationError('');
    setUploadError('');

    try {
      const url = URL.createObjectURL(selectedFile);
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';

      tempVideo.onloadedmetadata = () => {
        const duration = tempVideo.duration;
        setVideoDuration(duration);

        if (duration > 60.5) {
          setDurationError(`Video length is ${Math.round(duration)} seconds. Snippets must be 60 seconds or under. Please trim your video.`);
          setFile(null);
          setPreviewUrl(null);
          URL.revokeObjectURL(url);
        } else {
          setFile(selectedFile);
          setPreviewUrl(url);
          setDurationError('');
        }
      };

      tempVideo.onerror = () => {
        setDurationError('Could not read video metadata. Please try a standard MP4 or WebM video.');
        URL.revokeObjectURL(url);
      };

      tempVideo.src = url;
    } catch (err) {
      setDurationError('Failed to process video. Please try again.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a video file under 60 seconds.');
      return;
    }
    if (!productName.trim()) {
      setUploadError('Product name is required.');
      return;
    }
    if (videoDuration > 60.5) {
      setUploadError('Video must be 60 seconds or less.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const formData = new FormData();
      formData.append('video', file);

      const snippetData = {
        product: {
          name: productName.trim(),
          brand: brand.trim(),
          category: category,
          rating: Number(rating),
          purchaseLink: purchaseLink.trim()
        },
        caption: caption.trim(),
        duration: Math.round(videoDuration)
      };

      formData.append('data', JSON.stringify(snippetData));

      const res = await fetch(`${API_URL}/api/snippets`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders()
        },
        credentials: 'include',
        body: formData
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to upload snippet');
      }

      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (err) {
      console.error('Error posting snippet:', err);
      setUploadError(err.message || 'An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        color: '#0f172a',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        borderRadius: '24px',
        border: '1px solid #e5e0da',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Film size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Post a Snippet</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Review video under 60 seconds</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isUploading}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => !isUploading && (e.currentTarget.style.color = '#0f172a')}
            onMouseLeave={(e) => !isUploading && (e.currentTarget.style.color = '#64748b')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Error Banner */}
          {(durationError || uploadError) && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{durationError || uploadError}</span>
            </div>
          )}

          {/* Video Upload Area */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: 8, color: '#334155' }}>
              Snippet Video <span style={{ color: '#0ea5e9', fontSize: '0.8rem' }}>(Max 60s)</span>
            </label>

            {!file ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '16px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f8fafc',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0ea5e9';
                  e.currentTarget.style.backgroundColor = '#f0f9ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
              >
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(14, 165, 233, 0.15)',
                  color: '#0ea5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UploadCloud size={28} />
                </div>
                <div>
                  <span style={{ color: '#0ea5e9', fontWeight: 600 }}>Click to upload</span> or drag and drop
                </div>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  MP4, MOV, or WebM &bull; Vertical 9:16 recommended &bull; Under 60 seconds
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#000000',
                border: '1px solid #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <video
                  src={previewUrl}
                  controls
                  playsInline
                  style={{
                    width: '100%',
                    maxHeight: '260px',
                    objectFit: 'contain',
                    backgroundColor: '#000000'
                  }}
                />
                
                {/* Video Info Bar */}
                <div style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(14, 165, 233, 0.15)',
                      color: '#0ea5e9',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      ⏱️ {Math.round(videoDuration)}s / 60s
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#475569', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                      setVideoDuration(0);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Change Video
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: 8, color: '#334155' }}>
              Product Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sony WH-1000XM5 Headphones"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          {/* Brand & Category Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: 8, color: '#334155' }}>
                Brand (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Sony"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: 8, color: '#334155' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rating (1 to 5 Stars) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: 8, color: '#334155' }}>
              Your Product Rating <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    color: (hoverRating || rating) >= star ? '#eab308' : '#cbd5e1',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <Star size={26} fill={(hoverRating || rating) >= star ? '#eab308' : 'none'} />
                </button>
              ))}
              <span style={{ marginLeft: 8, fontSize: '0.9rem', fontWeight: 700, color: '#eab308' }}>
                {rating} / 5
              </span>
            </div>
          </div>

          {/* Caption / Review Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: 8, color: '#334155' }}>
              Review Summary & Highlights
            </label>
            <textarea
              rows={3}
              placeholder="What did you like or dislike? Sound quality, battery life, comfort, build quality..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          {/* Purchase Link */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: 8, color: '#334155' }}>
              Where to buy / Product URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://amazon.in/dp/... or store link"
              value={purchaseLink}
              onChange={(e) => setPurchaseLink(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || !file || !productName.trim()}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '14px',
              backgroundColor: isUploading || !file || !productName.trim() ? '#cbd5e1' : '#0ea5e9',
              color: '#ffffff',
              border: 'none',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: isUploading || !file || !productName.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background-color 0.2s ease',
              marginTop: 6
            }}
            onMouseEnter={(e) => {
              if (!isUploading && file && productName.trim()) {
                e.currentTarget.style.backgroundColor = '#0284c7';
              }
            }}
            onMouseLeave={(e) => {
              if (!isUploading && file && productName.trim()) {
                e.currentTarget.style.backgroundColor = '#0ea5e9';
              }
            }}
          >
            {isUploading ? (
              <>
                <div style={{
                  width: 18,
                  height: 18,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                Uploading Snippet...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Publish Snippet
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
