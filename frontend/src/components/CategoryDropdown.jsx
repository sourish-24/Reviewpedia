import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../utils/mockData';

export default function CategoryDropdown({
  value = '',
  onChange,
  inputStyle = {},
  className = 'create-review-input'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (category) => {
    onChange(category);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < PRODUCT_CATEGORIES.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : PRODUCT_CATEGORIES.length - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < PRODUCT_CATEGORIES.length) {
        handleSelect(PRODUCT_CATEGORIES[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger Button mimicking the inputStyle */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className={className}
        style={{
          ...inputStyle,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none'
        }}
      >
        <span style={{ color: value ? '#ffffff' : 'rgba(255, 255, 255, 0.5)' }}>
          {value || 'Select Category'}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0
          }}
        />
      </div>

      {/* Basic Default White Dropdown Menu - Exactly matches BrandAutocomplete dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            boxShadow: 'none',
            zIndex: 100,
            maxHeight: '210px',
            overflowY: 'auto',
            padding: '4px 0',
            boxSizing: 'border-box'
          }}
        >
          {PRODUCT_CATEGORIES.map((cat, idx) => {
            const isHighlighted = idx === highlightedIndex;
            const isSelected = value === cat;

            return (
              <div
                key={cat}
                onClick={() => handleSelect(cat)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                style={{
                  padding: '9px 16px',
                  cursor: 'pointer',
                  color: isHighlighted ? '#ffffff' : '#000000',
                  backgroundColor: isHighlighted ? '#0ea5e9' : (isSelected ? '#f1f5f9' : '#ffffff'),
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-body)',
                  userSelect: 'none',
                  transition: 'background-color 0.1s ease, color 0.1s ease'
                }}
              >
                {cat}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
