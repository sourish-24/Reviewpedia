import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, RotateCcw, Check, X, Move, Camera } from 'lucide-react';

export default function AvatarCropModal({ imageFile, imageSrcUrl, onCropComplete, onCancel }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const VIEWPORT_SIZE = 320; // 320x320 px preview box
  const CROP_SIZE = 220; // 220px circle diameter

  useEffect(() => {
    if (!imageFile && !imageSrcUrl) return;

    let url = '';
    let isObjectUrl = false;

    if (imageFile) {
      url = URL.createObjectURL(imageFile);
      isObjectUrl = true;
    } else if (imageSrcUrl) {
      url = imageSrcUrl;
    }

    setImageSrc(url);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;

    return () => {
      if (isObjectUrl) URL.revokeObjectURL(url);
    };
  }, [imageFile, imageSrcUrl]);

  // Handle Drag / Pan (Mouse & Touch)
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Calculate new position
    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setZoom((prev) => Math.min(Math.max(1, prev + delta), 3));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleSave = () => {
    if (!imageSrc || !imgRef.current) return;

    const canvas = document.createElement('canvas');
    const OUTPUT_SIZE = 400; // Final avatar resolution 400x400
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');

    const img = imgRef.current;
    const ratio = OUTPUT_SIZE / CROP_SIZE;

    // Calculate base scale so image fills the crop circle
    const baseScale = Math.max(CROP_SIZE / img.naturalWidth, CROP_SIZE / img.naturalHeight);
    const totalScale = baseScale * zoom;

    const displayW = img.naturalWidth * totalScale;
    const displayH = img.naturalHeight * totalScale;

    // Center coordinates on output canvas
    const destCenterX = OUTPUT_SIZE / 2 + position.x * ratio;
    const destCenterY = OUTPUT_SIZE / 2 + position.y * ratio;

    ctx.save();
    ctx.translate(destCenterX, destCenterY);
    ctx.rotate((rotation * Math.PI) / 180);

    ctx.drawImage(
      img,
      - (displayW * ratio) / 2,
      - (displayH * ratio) / 2,
      displayW * ratio,
      displayH * ratio
    );
    ctx.restore();

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], 'avatar_cropped.png', { type: 'image/png' });
        onCropComplete(croppedFile);
      }
    }, 'image/png');
  };

  if (!imageSrc) return null;

  // Compute base scale for visual preview
  const baseScale = imgDimensions.width && imgDimensions.height
    ? Math.max(CROP_SIZE / imgDimensions.width, CROP_SIZE / imgDimensions.height)
    : 1;
  const totalScale = baseScale * zoom;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      zIndex: 30000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', boxSizing: 'border-box', fontFamily: 'var(--font-body)'
    }}>
      <div style={{
        width: '100%', maxWidth: '440px', background: '#161E2E',
        border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '24px',
        padding: '28px', color: '#ffffff', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '20px', boxSizing: 'border-box',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
      }}>
        {/* Modal Header */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
            Crop & Position Photo
          </h3>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Interactive Crop Viewport Box */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          onWheel={handleWheel}
          style={{
            position: 'relative',
            width: `${VIEWPORT_SIZE}px`,
            height: `${VIEWPORT_SIZE}px`,
            backgroundColor: '#090d16',
            borderRadius: '16px',
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            touchAction: 'none'
          }}
        >
          {/* Main Image */}
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Crop target"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${totalScale})`,
              transformOrigin: 'center center',
              maxWidth: 'none',
              pointerEvents: 'none',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
          />

          {/* Circular Mask Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            boxSizing: 'border-box'
          }}>
            {/* Dark Mask Surroundings */}
            <svg width={VIEWPORT_SIZE} height={VIEWPORT_SIZE} style={{ display: 'block' }}>
              <defs>
                <mask id="circle-cutout">
                  <rect width={VIEWPORT_SIZE} height={VIEWPORT_SIZE} fill="white" />
                  <circle cx={VIEWPORT_SIZE / 2} cy={VIEWPORT_SIZE / 2} r={CROP_SIZE / 2} fill="black" />
                </mask>
              </defs>
              <rect width={VIEWPORT_SIZE} height={VIEWPORT_SIZE} fill="rgba(9, 13, 22, 0.72)" mask="url(#circle-cutout)" />
              {/* Outer Cyan Ring */}
              <circle
                cx={VIEWPORT_SIZE / 2}
                cy={VIEWPORT_SIZE / 2}
                r={CROP_SIZE / 2}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2.5"
                strokeDasharray="none"
              />
              {/* Subtle Center Grid Lines */}
              <line x1={VIEWPORT_SIZE / 2 - 15} y1={VIEWPORT_SIZE / 2} x2={VIEWPORT_SIZE / 2 + 15} y2={VIEWPORT_SIZE / 2} stroke="rgba(14, 165, 233, 0.4)" strokeWidth="1" />
              <line x1={VIEWPORT_SIZE / 2} y1={VIEWPORT_SIZE / 2 - 15} x2={VIEWPORT_SIZE / 2} y2={VIEWPORT_SIZE / 2 + 15} stroke="rgba(14, 165, 233, 0.4)" strokeWidth="1" />
            </svg>
          </div>

          {/* Drag Hint Text (Plain White Text at Middle Bottom Inside Viewport) */}
          <p style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: 500,
            margin: 0,
            pointerEvents: 'none',
            zIndex: 10,
            textShadow: '0 1px 4px rgba(0,0,0,0.9)'
          }}>
            Drag image to center
          </p>
        </div>

        {/* Controls: Zoom Slider */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
            <ZoomOut size={16} color="#94a3b8" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.02"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{
                flex: 1, accentColor: '#0ea5e9', cursor: 'pointer', height: '4px'
              }}
            />
            <ZoomIn size={16} color="#94a3b8" />
          </div>
        </div>

        {/* Action Buttons (Cancel, Rotate, Reset, Apply) */}
        <div style={{ width: '100%', display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1, height: '40px', borderRadius: '9999px', background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#94a3b8'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleRotate}
            style={{
              flex: 1, height: '40px', borderRadius: '9999px', background: '#28303E',
              border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#0ea5e9'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          >
            <RotateCw size={14} /> Rotate
          </button>

          <button
            type="button"
            onClick={handleReset}
            style={{
              flex: 1, height: '40px', borderRadius: '9999px', background: '#28303E',
              border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#0ea5e9'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          >
            <RotateCcw size={14} /> Reset
          </button>

          <button
            type="button"
            onClick={handleSave}
            style={{
              flex: 1, height: '40px', borderRadius: '9999px', background: '#0ea5e9',
              border: 'none', color: '#ffffff', fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              boxShadow: 'none', transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
          >
            <Check size={16} /> Apply
          </button>
        </div>
      </div>
    </div>
  );
}
