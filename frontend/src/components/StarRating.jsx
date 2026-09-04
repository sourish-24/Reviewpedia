import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  rating = 0,
  onChange,
  interactive = false,
  size = 16,
  gap = 3,
  fillColor = 'var(--golden-star)',
  emptyColor = '#d4d4d8',
  showValue = false,
  valueStyle = {},
  style = {}
}) {
  const [hoverRating, setHoverRating] = useState(null);

  const numericRating = Number(rating) || 0;
  const displayRating = interactive && hoverRating !== null ? hoverRating : numericRating;

  const getFillFraction = (starNum) => {
    const diff = displayRating - (starNum - 1);
    if (diff >= 0.75) return 1;
    if (diff >= 0.25) return 0.5;
    return 0;
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: showValue ? 8 : 0,
        ...style
      }}
      onMouseLeave={() => {
        if (interactive) setHoverRating(null);
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap }}>
        {[1, 2, 3, 4, 5].map((starNum) => {
          const fillFraction = getFillFraction(starNum);

          return (
            <div
              key={starNum}
              style={{
                position: 'relative',
                width: size,
                height: size,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                userSelect: 'none'
              }}
            >
              {/* Background empty star outline */}
              <Star
                size={size}
                fill="none"
                color={emptyColor}
                strokeWidth={1.5}
                style={{ display: 'block', minWidth: size, width: size, height: size }}
              />

              {/* Filled overlay: 50% for half star, 100% for full star */}
              {fillFraction > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: fillFraction === 1 ? '100%' : '50%',
                    height: '100%',
                    overflow: 'hidden',
                    pointerEvents: 'none'
                  }}
                >
                  <Star
                    size={size}
                    fill={fillColor}
                    color={fillColor}
                    strokeWidth={1.5}
                    style={{ display: 'block', minWidth: size, width: size, maxWidth: 'none', height: size }}
                  />
                </div>
              )}

              {/* Interactive clickable zones for left half (.5) and right half (1.0) */}
              {interactive && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '50%',
                      height: '100%',
                      cursor: 'pointer',
                      zIndex: 5
                    }}
                    onMouseEnter={() => setHoverRating(starNum - 0.5)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onChange) onChange(starNum - 0.5);
                    }}
                    title={`${starNum - 0.5} stars`}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '50%',
                      height: '100%',
                      cursor: 'pointer',
                      zIndex: 5
                    }}
                    onMouseEnter={() => setHoverRating(starNum)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onChange) onChange(starNum);
                    }}
                    title={`${starNum} stars`}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      {showValue && displayRating > 0 && (
        <span
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: fillColor,
            fontFamily: 'var(--font-body)',
            lineHeight: 1,
            ...valueStyle
          }}
        >
          {displayRating % 1 === 0 ? `${displayRating}` : displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
