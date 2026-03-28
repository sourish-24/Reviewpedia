import React from 'react';
import { User, ShieldCheck, MapPin, X, MessageCircle } from 'lucide-react';
import { generateMockReviews } from '../utils/mockData';

export default function UserProfile({ username, onClose }) {
  // Mock data for user
  const recentActivity = generateMockReviews(28.7041, 77.1025, 3).map(r => ({ ...r, reviewer: username }));

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel" style={{ width: 450, padding: 30, backgroundColor: 'rgba(255,255,255,0.95)', position: 'relative', overflowY: 'auto', maxHeight: '90vh' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15, marginBottom: 30 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '2rem' }}>
               {username[0]}
            </div>
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                    {username} <ShieldCheck color="#10b981" size={24} />
                </h2>
                <p style={{ color: '#64748b', fontSize: '1rem', marginTop: 5 }}>Verified Local Reviewer</p>
                <div style={{ display: 'flex', gap: 20, marginTop: 10, justifyContent: 'center', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={16} color="var(--primary-color)" /><span>New Delhi</span></div>
                    <div><span style={{ fontWeight: 'bold' }}>92%</span> Trust Score</div>
                    <div><span style={{ fontWeight: 'bold' }}>47</span> Reviews</div>
                </div>
            </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
            <button style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', backgroundColor: 'var(--primary-color)', color: '#fff', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <MessageCircle size={18} /> Chat with {username}
            </button>
        </div>

        <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 15, paddingBottom: 10, borderBottom: '1px solid #cbd5e1' }}>Recent Reviews</h3>
            {recentActivity.map(review => (
                <div key={review.id} style={{ marginBottom: 20 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{review.productName}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 5 }}>{review.platform} • {review.category}</p>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>"{review.summary}"</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
