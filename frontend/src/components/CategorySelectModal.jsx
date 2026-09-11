import React, { forwardRef, useState } from 'react';
import { X, Check } from 'lucide-react';

/**
 * Category data with image paths.
 * Place your square category images (mobiles.jpg, cars.jpg, etc.) in frontend/public/categories/
 */
export const CATEGORY_ITEMS = [
  { id: 'All', name: 'All Categories', image: '/categories/all.jpg' },
  { id: 'Mobiles', name: 'Mobiles', image: '/categories/mobiles.jpg' },
  { id: 'Desktop, Laptop & Accessories', name: 'Desktop & Laptops', fullName: 'Desktop, Laptop & Accessories', image: '/categories/desktops.jpg' },
  { id: 'Electronics & Appliances', name: 'Electronics & Appliances', image: '/categories/electronics.jpg' },
  { id: 'Cars', name: 'Cars', image: '/categories/cars.jpg' },
  { id: 'Bikes', name: 'Bikes', image: '/categories/bikes.jpg' },
  { id: 'Fashion', name: 'Fashion', image: '/categories/fashion.jpg' },
  { id: 'Furniture', name: 'Furniture', image: '/categories/furniture.jpg' },
  { id: 'Properties', name: 'Properties', image: '/categories/properties.jpg' },
  { id: 'Food & Dining', name: 'Food & Dining', image: '/categories/food.jpg' },
  { id: 'Books, Sports & Hobbies', name: 'Books & Hobbies', fullName: 'Books, Sports & Hobbies', image: '/categories/books.jpg' },
];

/**
 * CategorySelectModal
 * 
 * Minimalist, sophisticated category selector:
 * - Pure white background rgb(255, 255, 255) with crisp black border and no shadow
 * - Heading in black with no horizontal rule
 * - Square real images for each category card (no placeholder UI / animations)
 * - Borderless individual cards with text turning blue on hover
 * - Close button turns blue on hover with transparent background
 */
const CategorySelectModal = forwardRef(({
  selectedCategory = 'All',
  onSelectCategory,
  onClose
}, ref) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isCloseHovered, setIsCloseHovered] = useState(false);

  return (
    <div
      ref={ref}
      style={{
        width: 'min(600px, calc(100vw - 40px))',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e5e0da',
        padding: '20px 22px 24px 22px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1002,
        boxShadow: 'none',
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto'
      }}
    >
      {/* Modal Top Bar: Heading in black, no horizontal rule below */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#000000',
            fontFamily: 'var(--font-body)',
            letterSpacing: '-0.01em'
          }}
        >
          Select a category to filter reviews
        </h3>

        {/* Close Button: hover makes icon blue, transparent background */}
        <button
          type="button"
          onClick={onClose}
          title="Close"
          style={{
            width: '28px',
            height: '28px',
            backgroundColor: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isCloseHovered ? '#0ea5e9' : '#000000',
            transition: 'color 0.15s ease',
            padding: 0
          }}
          onMouseEnter={() => setIsCloseHovered(true)}
          onMouseLeave={() => setIsCloseHovered(false)}
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Categories Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(114px, 1fr))',
          gap: '14px 10px',
          width: '100%'
        }}
      >
        {CATEGORY_ITEMS.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const isHovered = hoveredCategory === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              onMouseEnter={() => setHoveredCategory(cat.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              title={cat.fullName || cat.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                position: 'relative',
                boxSizing: 'border-box',
                userSelect: 'none'
              }}
            >
              {/* Selected Check Badge */}
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#0ea5e9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2
                  }}
                >
                  <Check size={11} color="#ffffff" strokeWidth={3} />
                </div>
              )}

              {/* Square Image Container */}
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: '10px',
                  backgroundColor: '#f1f5f9',
                  overflow: 'hidden',
                  marginBottom: '6px',
                  position: 'relative'
                }}
              >
                {cat.image && (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    onError={(e) => { e.currentTarget.style.opacity = '0'; }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                )}
              </div>

              {/* Category Name: turns blue on hover */}
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 600 : 500,
                  color: isHovered || isSelected ? '#0ea5e9' : '#000000',
                  fontFamily: 'var(--font-body)',
                  textAlign: 'center',
                  lineHeight: '1.25',
                  minHeight: '2.5em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s ease'
                }}
              >
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

CategorySelectModal.displayName = 'CategorySelectModal';

export default CategorySelectModal;
