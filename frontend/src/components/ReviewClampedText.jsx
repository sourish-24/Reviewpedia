import React, { useState, useEffect, useRef } from 'react';

export default function ReviewClampedText({ text }) {
  const textRef = useRef(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      setIsClamped(textRef.current.scrollHeight > textRef.current.clientHeight + 1);
    }
  }, [text]);

  const rawText = text || '';

  return (
    <div style={{ margin: 0, padding: '6px 0 2px 0' }}>
      <p
        ref={textRef}
        style={{
          margin: 0,
          lineHeight: 1.5,
          fontSize: '0.95rem',
          fontFamily: 'var(--font-body)',
          color: '#27272a',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        "{rawText}"
      </p>
      {(isClamped || rawText.length > 150 || (rawText.split('\n').length > 3)) && (
        <span
          style={{
            display: 'inline-block',
            marginTop: '4px',
            color: '#000000',
            fontSize: '0.84rem',
            fontWeight: 700
          }}
        >
          Show more
        </span>
      )}
    </div>
  );
}
