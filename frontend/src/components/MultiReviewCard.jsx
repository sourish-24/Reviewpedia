import React from 'react';
import { Star, X, MapPin, Calendar, CheckCircle, Image as ImageIcon } from 'lucide-react';
import '../index.css';

export default function MultiReviewCard({ reviews, onClose, onUserClick }) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="review-card-overlay" style={{
      position: 'absolute', top: '10%', right: '2%', width: '420px', zIndex: 1000, maxHeight: '80vh', display: 'flex', flexDirection: 'column'
    }}>
      <div className="glass-panel" style={{ padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', gap: '16px' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', cursor: 'pointer', zIndex: 10, color: 'var(--on-surface-variant)'
        }}>
          <X size={20} />
        </button>
        
        <div style={{ paddingBottom: '8px' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0, paddingRight: 30, color: 'var(--on-surface)' }}>
                {reviews.length} Review{reviews.length !== 1 ? 's' : ''} Here
            </h2>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: 8, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.map((review) => (
                <div className="tonal-panel" key={review.id} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px' }}>
                    
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ width: 72, height: 72, backgroundColor: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)', flexShrink: 0 }}>
                            <ImageIcon size={32} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.125rem', margin: 0, color: 'var(--on-surface)' }}>{review.productName}</h3>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                <span className="chip" style={{ backgroundColor: 'transparent', padding: 0, color: 'var(--on-surface-variant)' }}>{review.category}</span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '3px', margin: '8px 0 0 0' }}>
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={15} fill={i < review.rating ? "var(--golden-star)" : "none"} color={i < review.rating ? "var(--golden-star)" : "var(--empty-star)"} strokeWidth={1.5} />
                            ))}
                            </div>
                        </div>
                    </div>

                    <p style={{ margin: '0', lineHeight: 1.5, fontSize: '0.95rem', color: 'var(--on-surface)', fontFamily: 'var(--font-body)' }}>
                    "{review.summary}"
                    </p>

                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        paddingTop: '8px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => onUserClick && onUserClick(review.reviewer)}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--surface-highest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                            {review.reviewer[0]}
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 5, margin: 0, color: 'var(--on-surface)' }}>
                                    {review.reviewer} 
                                    {review.trustScore > 80 && <CheckCircle size={14} color="var(--primary)" />}
                                </p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)' }}>
                            <Calendar size={12} /> {review.date}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
