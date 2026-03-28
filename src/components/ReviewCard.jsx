import React from 'react';
import { Star, X, MapPin, Calendar, CheckCircle } from 'lucide-react';
import '../index.css';

export default function ReviewCard({ review, onClose, onUserClick }) {
  if (!review) return null;

  return (
    <div className="review-card-overlay" style={{
      position: 'absolute', top: '10%', right: '2%', width: '350px', zIndex: 1000
    }}>
      <div className="glass-panel" style={{ padding: '20px', position: 'relative' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', cursor: 'pointer'
        }}>
          <X size={20} />
        </button>
        
        <h2 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{review.productName}</h2>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{review.category} • {review.platform}</p>

        <div style={{ display: 'flex', gap: '2px', margin: '10px 0', color: '#fbbf24' }}>
          {[...Array(5)].map((_, i) => (
             <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} />
          ))}
        </div>

        <p style={{ margin: '15px 0', lineHeight: 1.5, fontSize: '0.95rem' }}>
          "{review.summary}"
        </p>

        <div style={{
           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
           borderTop: '1px solid var(--glass-border)', paddingTop: '15px', marginTop: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => onUserClick(review.reviewer)}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
               {review.reviewer[0]}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                {review.reviewer} 
                {review.trustScore > 80 && <CheckCircle size={14} color="#10b981" />}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Trust Score: {review.trustScore}%</p>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#94a3b8' }}>
            <p><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />{review.date}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
