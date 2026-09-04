import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Trie } from '../utils/trie';
import { BRAND_NAMES } from '../data/brands';

/**
 * Capitalizes the first letter of each word (Pascal / Title Case).
 * Handles spaces, hyphens, slashes, etc.
 */
export const toPascalCase = (str) => {
  if (!str) return '';
  return str.replace(/(^|[\s\-_/])([a-z])/g, (_, sep, char) => sep + char.toUpperCase());
};

export default function BrandAutocomplete({ 
  value = '', 
  onChange, 
  placeholder = 'Brand Name (e.g. Sony, Apple)',
  inputStyle = {},
  className = 'create-review-input'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Initialize and memoize the Trie data structure from brands list
  const trie = useMemo(() => Trie.fromArray(BRAND_NAMES), []);

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

  const handleInputChange = (e) => {
    const rawText = e.target.value;
    // Auto apply Pascal case to capitalize first letter of each word
    const formattedText = toPascalCase(rawText);
    onChange(formattedText);

    if (formattedText.trim()) {
      const matches = trie.searchPrefix(formattedText, 8);
      setSuggestions(matches);
      setIsOpen(matches.length > 0);
      setHighlightedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    if (value && value.trim()) {
      const matches = trie.searchPrefix(value, 8);
      setSuggestions(matches);
      setIsOpen(matches.length > 0);
    }
  };

  const handleSelectBrand = (brand) => {
    onChange(brand);
    setIsOpen(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectBrand(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        className={className}
        style={inputStyle}
        autoComplete="off"
      />

      {/* Basic Default White Dropdown Menu */}
      {isOpen && suggestions.length > 0 && (
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
          {suggestions.map((brand, idx) => {
            const isHighlighted = idx === highlightedIndex;

            return (
              <div
                key={brand}
                onClick={() => handleSelectBrand(brand)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                style={{
                  padding: '9px 16px',
                  cursor: 'pointer',
                  color: isHighlighted ? '#ffffff' : '#000000',
                  backgroundColor: isHighlighted ? '#0ea5e9' : '#ffffff',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-body)',
                  userSelect: 'none',
                  transition: 'background-color 0.1s ease, color 0.1s ease'
                }}
              >
                {brand}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
