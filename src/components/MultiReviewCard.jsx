import React from 'react';
import { Star, X, MapPin, Calendar, CheckCircle, Image as ImageIcon } from 'lucide-react';
import '../index.css';

export default function MultiReviewCard({ reviews, onClose, onUserClick }) {
  if (!reviews || reviews.length === 0) return null;

  const locReview = reviews[0];

  return (
    <div className="review-card-overlay" style={{
      position: 'absolute', top: '10%', right: '2%', width: '400px', zIndex: 1000, maxHeight: '80vh', display: 'flex', flexDirection: 'column'
    }}>
      <div className="glass-panel" style={{ padding: '20px', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', cursor: 'pointer', zIndex: 10
        }}>
          <X size={20} />
        </button>
        
        <div style={{ marginBottom: 15, paddingBottom: 10, borderBottom: '1px solid var(--glass-border)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '5px', paddingRight: 30 }}>
                {reviews.length} Review{reviews.length !== 1 ? 's' : ''} Here
            </h2>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: 10, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {reviews.map((review) => (
                <div key={review.id} style={{ display: 'flex', flexDirection: 'column', gap: 10, backgroundColor: 'rgba(255,255,255,0.4)', padding: 15, borderRadius: 12 }}>
                    
                    <div style={{ display: 'flex', gap: 15 }}>
                        <div style={{ width: 80, height: 80, backgroundColor: '#cbd5e1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <ImageIcon size={32} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{review.productName}</h3>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{review.category}</p>
                            
                            <div style={{ display: 'flex', gap: '2px', margin: '5px 0', color: '#fbbf24' }}>
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                            ))}
                            </div>
                        </div>
                    </div>

                    <p style={{ margin: '0', lineHeight: 1.4, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    "{review.summary}"
                    </p>

                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderTop: '1px solid var(--glass-border)', paddingTop: '10px', marginTop: '5px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => onUserClick && onUserClick(review.reviewer)}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                            {review.reviewer[0]}
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    {review.reviewer} 
                                    {review.trustScore > 80 && <CheckCircle size={12} color="#10b981" />}
                                </p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#94a3b8' }}>
                            <p><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />{review.date}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
}
