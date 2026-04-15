import React from 'react';
import { Star, X, MapPin, Calendar, CheckCircle } from 'lucide-react';
import '../index.css';

export default function ReviewCard({ review, onClose, onUserClick }) {
  if (!review) return null;

  return (
    <div className="review-card-overlay" style={{
      position: 'absolute', top: '10%', right: '2%', width: '380px', zIndex: 1000
    }}>
      <div className="glass-panel" style={{ padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)'
        }}>
          <X size={20} />
        </button>
        
        <div style={{ paddingRight: '30px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '4px', margin: 0 }}>{review.productName}</h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                <span className="chip" style={{ backgroundColor: 'transparent', padding: 0, color: 'var(--on-surface-variant)' }}>{review.category}</span>
                <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem' }}>•</span>
                <span className="chip" style={{ backgroundColor: 'transparent', padding: 0, color: 'var(--on-surface-variant)' }}>{review.platform}</span>
            </div>
        </div>

        <div className="tonal-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '2px', color: 'var(--on-surface)' }}>
            {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill={i < review.rating ? "var(--golden-star)" : "none"} color={i < review.rating ? "var(--golden-star)" : "var(--empty-star)"} strokeWidth={1.5} />
            ))}
            </div>

            <p style={{ margin: 0, lineHeight: 1.5, fontSize: '0.95rem', fontFamily: 'var(--font-body)', color: 'var(--on-surface)' }}>
            "{review.summary}"
            </p>
            
            <div style={{ 
                position: 'absolute', bottom: '8px', right: '12px', 
                fontSize: '0.65rem', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em' 
            }}>
                Lat: {review.lat.toFixed(4)}, Lng: {review.lng.toFixed(4)}
            </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => onUserClick(review.reviewer)}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--surface-highest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
               {review.reviewer[0]}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 5, margin: 0, color: 'var(--on-surface)' }}>
                {review.reviewer} 
                {review.trustScore > 80 && <CheckCircle size={14} color="var(--primary)" />}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', margin: 0 }}>Trust Score: {review.trustScore}%</p>
            </div>
          </div>
          
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-body)' }}>
            <Calendar size={12} /> {review.date}
          </div>
        </div>
      </div>
    </div>
  );
}
