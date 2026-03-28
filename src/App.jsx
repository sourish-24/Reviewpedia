import React, { useState } from 'react';
import { Search, Navigation, Plus, MapPin, BarChart3, ChevronLeft } from 'lucide-react';
import AppMap from './components/Map';
import ReviewCard from './components/ReviewCard';
import MultiReviewCard from './components/MultiReviewCard';
import AIAssistant from './components/AIAssistant';
import CreateReview from './components/CreateReview';
import UserProfile from './components/UserProfile';
import './index.css';

function App() {
  const [appMode, setAppMode] = useState('landing'); // 'landing', 'consumer', 'business'
  const [selectedLocationReviews, setSelectedLocationReviews] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCreatingReview, setIsCreatingReview] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [mapUpdateTrigger, setMapUpdateTrigger] = useState(0);

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

  if (appMode === 'landing') {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <div className="glass-panel" style={{ padding: 40, textAlign: 'center', maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 30, alignItems: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--primary-color)' }}>Reviewpedia</h1>
          <p style={{ fontSize: '1.1rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
            Discover localized product experiences. Choose how you want to explore reviews today.
          </p>

          <div style={{ display: 'flex', gap: 20, width: '100%' }}>
            <button 
              onClick={() => setAppMode('consumer')}
              className="glass-panel" 
              style={{ flex: 1, padding: 20, cursor: 'pointer', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15, transition: 'transform 0.2s', backgroundColor: '#fff' }}
            >
              <div style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                <MapPin size={32} />
              </div>
              <h3 style={{ margin: 0 }}>Browse Reviews</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>View markers of people who bought products near you.</p>
            </button>

            <button 
              onClick={() => setAppMode('business')}
              className="glass-panel" 
              style={{ flex: 1, padding: 20, cursor: 'pointer', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15, transition: 'transform 0.2s', backgroundColor: '#fff' }}
            >
              <div style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                <BarChart3 size={32} />
              </div>
              <h3 style={{ margin: 0 }}>Market Research</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Analyze regional review densities using geospatial hexagons.</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <button 
        className="glass-panel"
        style={{
          position: 'absolute', top: 20, left: 20, width: 45, height: 45, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', border: 'none', zIndex: 1000
        }}
        onClick={() => {
            setAppMode('landing');
            setSelectedReview(null);
            setSelectedLocationReviews(null);
            setSelectedUser(null);
        }}
      >
        <ChevronLeft size={24} color="#64748b" />
      </button>

      <div style={{
          position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, width: '400px', display: 'flex', gap: 10
      }}>
         <div className="glass-panel" style={{ flex: 1, display: 'flex', padding: '10px 15px', alignItems: 'center', gap: 10 }}>
            <Search size={18} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search products or categories (e.g. cars)..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '1rem' }}
            />
         </div>
         <button onClick={handleSearch} className="glass-panel" style={{ border: 'none', width: 45, height: 45, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Navigation size={20} color="var(--primary-color)" />
         </button>
      </div>

      <AppMap onReviewSelect={handleReviewSelect} searchQuery={query} mapUpdateTrigger={mapUpdateTrigger} viewMode={appMode} />
      
      {appMode === 'consumer' && (
        <button 
            className="glass-panel"
            style={{
            position: 'absolute', bottom: 100, right: 30, width: 60, height: 60,
            borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer', zIndex: 1000, backgroundColor: 'var(--primary-color)', color: '#fff'
            }}
            onClick={() => setIsCreatingReview(true)}
        >
            <Plus size={32} />
        </button>
      )}

      {appMode === 'business' && <AIAssistant />}

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
