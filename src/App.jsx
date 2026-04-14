import React, { useState } from 'react';
import { Search, Navigation, Plus, MapPin, BarChart3, ChevronLeft, ArrowRight, Mail } from 'lucide-react';
import AppMap from './components/Map';
import ReviewCard from './components/ReviewCard';
import MultiReviewCard from './components/MultiReviewCard';
import AgentBox from './components/AgentBox';
import CreateReview from './components/CreateReview';
import UserProfile from './components/UserProfile';
import './index.css';

function App() {
  const [appMode, setAppMode] = useState('landing');
  const [selectedLocationReviews, setSelectedLocationReviews] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCreatingReview, setIsCreatingReview] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [mapUpdateTrigger, setMapUpdateTrigger] = useState(0);

  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [marketResearchEmail, setMarketResearchEmail] = useState('');

  const handleReviewSelect = (reviewsOrReview) => {
    if (Array.isArray(reviewsOrReview)) {
       setSelectedLocationReviews(reviewsOrReview);
       setSelectedReview(null);
    } else {
       setSelectedReview(reviewsOrReview);
       setSelectedLocationReviews(null);
    }
  };

  const handleSearch = () => setQuery(searchInput);

  const startBusinessMode = () => {
     if (!marketResearchEmail || !marketResearchEmail.includes('@')) {
         alert("Please enter a valid email address to receive Agent emails.");
         return;
     }
     setShowEmailPrompt(false);
     setAppMode('business');
  };

  if (appMode === 'landing') {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ padding: '7rem 4rem', textAlign: 'center', maxWidth: 900, display: 'flex', flexDirection: 'column', gap: '3rem', alignItems: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', margin: 0 }}>Reviewpedia</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--on-surface-variant)', margin: 0, lineHeight: 1.5, maxWidth: '600px' }}>
            Discover localized product experiences. Choose how you want to explore reviews today.
          </p>

          <div style={{ display: 'flex', gap: '4rem', width: '100%', marginTop: '2rem' }}>
            <button 
              onClick={() => setAppMode('consumer')}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              style={{ flex: 1, padding: '3rem 2rem', cursor: 'pointer', border: 'none', background: 'var(--surface-lowest)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', transition: 'transform 0.2s', borderRadius: '8px', boxShadow: '0 40px 60px rgba(0, 0, 0, 0.15)' }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: 'var(--surface-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface)' }}>
                <MapPin size={32} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Browse Reviews</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', margin: 0, fontFamily: 'var(--font-body)' }}>View markers of people who bought products near you.</p>
              </div>
            </button>

            <button 
              onClick={() => setShowEmailPrompt(true)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              style={{ flex: 1, padding: '3rem 2rem', cursor: 'pointer', border: 'none', background: 'var(--surface-lowest)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', transition: 'transform 0.2s', borderRadius: '8px', boxShadow: '0 40px 60px rgba(0, 0, 0, 0.15)' }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: 'var(--surface-lowest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)' }}>
                <BarChart3 size={32} color="var(--primary)"/>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Market Research</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', margin: 0, fontFamily: 'var(--font-body)' }}>Access Geospatial data and trigger AI Sales Agents.</p>
              </div>
            </button>
          </div>
        </div>

        {showEmailPrompt && (
             <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(249, 249, 249, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                 <div className="glass-panel" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem', width: 450, background: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)' }}>
                     <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem' }}><Mail color="var(--primary)" size={24} /> Identity Verification</h3>
                     <p style={{ fontSize: '1rem', color: 'var(--on-surface-variant)', margin: 0, fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>Enter your email address to securely route AI-generated intelligence briefings and automated sales outreach directly to your inbox for verification.</p>
                     
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                         <label style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Work Email</label>
                         <input 
                             type="email" 
                             value={marketResearchEmail} 
                             onChange={(e) => setMarketResearchEmail(e.target.value)} 
                             placeholder="you@example.com"
                             autoFocus
                             onKeyDown={(e) => e.key === 'Enter' && startBusinessMode()}
                             style={{ padding: '12px 0', border: 'none', borderBottom: '2px solid var(--surface-high)', background: 'transparent', outline: 'none', fontSize: '1.1rem', fontFamily: 'var(--font-body)', transition: 'border-color 0.2s', color: 'var(--on-surface)' }}
                             onFocus={(e) => e.target.style.borderBottomColor = 'var(--primary)'}
                             onBlur={(e) => e.target.style.borderBottomColor = 'var(--surface-high)'}
                         />
                     </div>
                     <div style={{ display: 'flex', gap: 10, marginTop: '1rem' }}>
                         <button 
                            onClick={() => setShowEmailPrompt(false)} 
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-high)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            style={{ flex: 1, padding: '12px', borderRadius: '9999px', border: 'none', backgroundColor: 'transparent', color: 'var(--on-surface-variant)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, transition: 'background-color 0.2s' }}
                         >Cancel</button>
                         <button className="btn-primary" onClick={startBusinessMode} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>Initialize <ArrowRight size={16}/></button>
                     </div>
                 </div>
             </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <button 
        className="glass-panel"
        style={{
          position: 'absolute', top: 30, left: 30, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', border: '1px solid var(--outline-variant)', zIndex: 1000, background: 'var(--surface-lowest)', borderRadius: '9999px',
          boxShadow: '0 0 15px rgba(0,0,0,0.05), 0 10px 30px rgba(0,0,0,0.15)'
        }}
        onClick={() => {
            setAppMode('landing');
            setSelectedReview(null);
            setSelectedLocationReviews(null);
            setSelectedUser(null);
        }}
      >
        <ChevronLeft size={24} color="var(--on-surface)" />
      </button>

      <div className="glass-panel" style={{
          position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, width: '450px', display: 'flex', gap: 10, padding: '6px', background: 'var(--surface-lowest)', borderRadius: '9999px', border: '1px solid var(--outline-variant)'
      }}>
         <div style={{ flex: 1, display: 'flex', padding: '10px 15px', alignItems: 'center', gap: 12 }}>
            <Search size={18} color="var(--on-surface-variant)" />
            <input 
              type="text" 
              placeholder="Search products or categories..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '1rem', fontFamily: 'var(--font-body)', color: 'var(--on-surface)' }}
            />
         </div>
         <button className="btn-primary" onClick={handleSearch} style={{ border: 'none', width: 45, height: 45, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '50%' }}>
            <Navigation size={18} />
         </button>
      </div>

      <AppMap onReviewSelect={handleReviewSelect} searchQuery={query} mapUpdateTrigger={mapUpdateTrigger} viewMode={appMode} />
      
      {appMode === 'consumer' && (
        <button 
            className="glass-panel"
            style={{
            position: 'absolute', top: 30, right: 30, height: 48, padding: '0 20px',
            borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', zIndex: 1000, border: '1px solid var(--outline-variant)', whiteSpace: 'nowrap',
            color: 'var(--on-surface)'
            }}
            onClick={() => setIsCreatingReview(true)}
        >
            <Plus size={20} color="var(--on-surface)" />
            <span style={{ fontWeight: 600, fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>Add a review</span>
        </button>
      )}

      {appMode === 'business' && <AgentBox demoEmail={marketResearchEmail} />}

      {selectedReview && (
        <ReviewCard 
          review={selectedReview} 
          onClose={() => setSelectedReview(null)} 
          onUserClick={(user) => { setSelectedUser(user); setSelectedReview(null); }}
        />
      )}

      {selectedLocationReviews && (
        <MultiReviewCard 
          reviews={selectedLocationReviews} 
          onClose={() => setSelectedLocationReviews(null)} 
          onUserClick={(user) => { setSelectedUser(user); setSelectedLocationReviews(null); }}
        />
      )}

      {selectedUser && (
        <UserProfile username={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {isCreatingReview && (
        <CreateReview 
          onClose={() => setIsCreatingReview(false)} 
          onPostSuccess={() => {
            setIsCreatingReview(false);
            setMapUpdateTrigger(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
}

export default App;
