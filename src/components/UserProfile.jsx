import React from 'react';
import { User, ShieldCheck, MapPin, X, MessageCircle } from 'lucide-react';
import { generateMockReviews } from '../utils/mockData';

export default function UserProfile({ username, onClose }) {
  const recentActivity = generateMockReviews(28.7041, 77.1025, 3).map(r => ({ ...r, reviewer: username }));

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(26, 28, 28, 0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-panel" style={{ width: 450, padding: '32px', background: 'var(--surface-lowest)', position: 'relative', overflowY: 'auto', maxHeight: '90vh' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}><X size={24} /></button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', backgroundColor: 'var(--surface-highest)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '2.5rem', fontFamily: 'var(--font-display)' }}>
               {username[0]}
            </div>
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', margin: 0 }}>
                    {username} <ShieldCheck color="var(--primary)" size={24} />
                </h2>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '1rem', marginTop: '8px', fontFamily: 'var(--font-body)' }}>Verified Local Reviewer</p>
                <div className="tonal-panel" style={{ display: 'flex', gap: '20px', marginTop: '16px', justifyContent: 'center', fontSize: '0.875rem', padding: '12px 24px', borderRadius: '9999px', fontFamily: 'var(--font-body)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--on-surface)' }}><MapPin size={16} color="var(--primary)" /><span>New Delhi</span></div>
                    <div style={{ color: 'var(--on-surface-variant)' }}><span style={{ color: 'var(--on-surface)', fontWeight: 600 }}>92%</span> Trust</div>
                    <div style={{ color: 'var(--on-surface-variant)' }}><span style={{ color: 'var(--on-surface)', fontWeight: 600 }}>47</span> Reviews</div>
                </div>
            </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: '32px' }}>
            <button className="btn-primary" style={{ flex: 1, padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <MessageCircle size={18} /> Chat with {username}
            </button>
        </div>

        <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', paddingBottom: '12px', color: 'var(--on-surface)' }}>Recent Reviews</h3>
            {recentActivity.map(review => (
                <div key={review.id} className="tonal-panel" style={{ padding: '20px', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--on-surface)' }}>{review.productName}</h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                        <span className="chip" style={{ backgroundColor: 'var(--surface-lowest)', padding: '2px 8px', color: 'var(--on-surface-variant)' }}>{review.platform}</span>
                        <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem' }}>•</span>
                        <span className="chip" style={{ backgroundColor: 'var(--surface-lowest)', padding: '2px 8px', color: 'var(--on-surface-variant)' }}>{review.category}</span>
                    </div>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.5, fontFamily: 'var(--font-body)', color: 'var(--on-surface)', margin: 0 }}>"{review.summary}"</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
