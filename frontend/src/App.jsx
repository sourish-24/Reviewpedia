import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Navigation, Plus, MapPin, BarChart3, ArrowRight, Mail, MessageCircle, Crosshair, Hexagon } from 'lucide-react';
import AppMap from './components/Map';
import ReviewCard from './components/ReviewCard';
import MultiReviewCard from './components/MultiReviewCard';
import AgentBox from './components/AgentBox';
import CreateReview from './components/CreateReview';
import UserProfile from './components/UserProfile';
import MyProfilePage from './components/MyProfilePage';
import AuthModal from './components/AuthModal';
import ChatApp from './components/ChatApp';
import { useAuth } from './context/AuthContext';
import './index.css';

function App() {
  const mapComponentRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  let appMode = 'landing';
  if (location.pathname.startsWith('/browse')) appMode = 'consumer';
  else if (location.pathname.startsWith('/research')) appMode = 'business';
  else if (location.pathname.startsWith('/profile')) appMode = 'myProfileSettings';
  else if (location.pathname.startsWith('/chat')) appMode = 'chat';
  const [selectedLocationReviews, setSelectedLocationReviews] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [initialChatUser, setInitialChatUser] = useState(null);
  const [isCreatingReview, setIsCreatingReview] = useState(false);
  const [isHexagonSettingsOpen, setIsHexagonSettingsOpen] = useState(false);
  const [hexResolution, setHexResolution] = useState(5);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [mapUpdateTrigger, setMapUpdateTrigger] = useState(0);

  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [marketResearchEmail, setMarketResearchEmail] = useState('');
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, logout, setUser } = useAuth();

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
     navigate('/research');
  };

  if (appMode === 'landing') {
    return (
      <div className="landing-dark">
        {/* Header */}
        <header className="landing-dark-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
              <div 
                  className="landing-dark-logo" 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  style={{ cursor: 'pointer' }}
              >
                 <div style={{width: 24, height: 24, background: '#ffffff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                     <div style={{width: 12, height: 12, background: '#030303', borderRadius: 2}}></div>
                 </div>
                 Reviewpedia
              </div>
              <nav className="landing-dark-nav">
                 <a href="#about">About</a>
                 <div className="nav-dropdown">
                    <a className="nav-dropdown-title">Products</a>
                    <div className="nav-dropdown-menu">
                       <div onClick={() => navigate('/browse')}>Browse Reviews</div>
                       <div onClick={() => setShowEmailPrompt(true)}>Market Research</div>
                    </div>
                 </div>
                 <a href="#contact">Contact Us</a>
              </nav>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
             <button 
                 onClick={() => { if (!user) setShowAuthModal('login'); else navigate('/chat'); }}
                 style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                 onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                 onMouseOut={(e) => e.currentTarget.style.color = '#a1a1aa'}
                 title="Chat Messages"
             >
                 <MessageCircle size={22} />
             </button>
             {user ? (
                <div className="nav-dropdown">
                    {user.profilePic ? (
                        <img 
                            src={user.profilePic} 
                            alt="Profile" 
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', boxShadow: '0 2px 10px rgba(91, 66, 243, 0.4)' }} 
                        />
                    ) : (
                        <div style={{ 
                            width: '36px', height: '36px', borderRadius: '50%', 
                            backgroundColor: '#5138d6', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                            boxShadow: '0 2px 10px rgba(91, 66, 243, 0.4)'
                        }}>
                            {user.username[0].toUpperCase()}
                        </div>
                    )}
                    <div className="nav-dropdown-menu" style={{ right: 0, left: 'auto' }}>
                       <div onClick={() => navigate('/profile')}>My Profile</div>
                       <div onClick={() => { logout(); navigate('/'); }} style={{ color: '#ef4444' }}>Logout</div>
                    </div>
                </div>
             ) : (
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="landing-btn-outline" onClick={() => setShowAuthModal('login')}>Login</button>
                    <button className="landing-btn-primary" onClick={() => setShowAuthModal('signup')}>Sign Up</button>
                </div>
             )}
          </div>
        </header>

        {/* Neon Horizon Glow */}
        <div className="landing-dark-glow-bg"></div>

        {/* Hero Content */}
        <div className="landing-dark-content">
          <div className="landing-pill">
             The Premier Network for Product Insights
          </div>
          <h1 className="landing-title">
             Discover Localized Product Experiences.
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '1.25rem', maxWidth: '600px', textAlign: 'center', marginBottom: '4rem', lineHeight: 1.6 }}>
             Don't just read reviews. See exactly where they are coming from, interact with the data, and connect directly with real buyers.
          </p>
        </div>

        {/* About Us Section */}
        <section id="about" style={{ padding: '80px 4rem', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', color: '#ffffff', fontFamily: 'var(--font-display)' }}>Who We Are</h2>
            <p style={{ color: '#a1a1aa', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: 800, marginBottom: '4rem' }}>
                At Reviewpedia, we believe that transparency drives innovation. By combining geospatial intelligence with verified product reviews, we empower both consumers and businesses to make deeply informed decisions based on hyper-local data.
            </p>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                <div className="landing-card" style={{ flex: 1, minWidth: 300, textAlign: 'left', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem' }}>Our Mission</div>
                    <p style={{ color: '#a1a1aa', lineHeight: 1.6, fontSize: '0.9rem' }}>To architect the data layer of physical commerce. We bring digital transparency to the real world, mapping consumer sentiment globally.</p>
                </div>
                <div className="landing-card" style={{ flex: 1, minWidth: 300, textAlign: 'left', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem' }}>Our Edge</div>
                    <p style={{ color: '#a1a1aa', lineHeight: 1.6, fontSize: '0.9rem' }}>Integrating AI Sales Agents with real-time geospatial reviews creates unprecedented actionable insights for hardware and retail founders.</p>
                </div>
            </div>
        </section>

        {/* Contact Us Section */}
        <section id="contact" style={{ padding: '80px 4rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff', fontFamily: 'var(--font-display)' }}>Get In Touch</h2>
                <p style={{ color: '#a1a1aa', fontSize: '1rem', marginBottom: '2.5rem' }}>Partner with Reviewpedia to supercharge your market intelligence.</p>
                
                <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'flex-start', background: 'rgba(0,0,0,0.5)', padding: '3rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', width: '100%' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                            <label style={{ color: '#a1a1aa', fontSize: '0.9rem', fontWeight: 600 }}>Name</label>
                            <input type="text" placeholder="John Doe" style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', outline: 'none' }} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                            <label style={{ color: '#a1a1aa', fontSize: '0.9rem', fontWeight: 600 }}>Email</label>
                            <input type="email" placeholder="john@example.com" style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', outline: 'none' }} />
                        </div>
                    </div>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                        <label style={{ color: '#a1a1aa', fontSize: '0.9rem', fontWeight: 600 }}>Message</label>
                        <textarea placeholder="How can we help you?" rows="4" style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', outline: 'none', resize: 'vertical' }}></textarea>
                    </div>
                    <button type="button" className="landing-btn-primary" style={{ width: '100%', padding: '16px', marginTop: '1rem', borderRadius: '8px' }}>Send Message</button>
                </form>
            </div>
        </section>

        {/* Footer */}
        <footer style={{ padding: '3rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
            <div className="landing-dark-logo" style={{ opacity: 0.5 }}>
                 <div style={{width: 20, height: 20, background: '#ffffff', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                     <div style={{width: 10, height: 10, background: '#030303', borderRadius: 2}}></div>
                 </div>
                 Reviewpedia
            </div>
            <div style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} Reviewpedia. All rights reserved.
            </div>
        </footer>

        {/* Existing Auth / Email Prompt overlay stays the same functionality */}
        {showEmailPrompt && (
             <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                 <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem', width: 450, background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px' }}>
                     <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', color: 'white' }}><Mail color="#5138d6" size={24} /> Identity Verification</h3>
                     <p style={{ fontSize: '1rem', color: '#a1a1aa', margin: 0, fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>Enter your email address to securely route AI-generated intelligence briefings and automated sales outreach directly to your inbox for verification.</p>
                     
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                         <label style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Work Email</label>
                         <input 
                             type="email" 
                             value={marketResearchEmail} 
                             onChange={(e) => setMarketResearchEmail(e.target.value)} 
                             placeholder="you@example.com"
                             autoFocus
                             onKeyDown={(e) => e.key === 'Enter' && startBusinessMode()}
                             style={{ padding: '12px 0', border: 'none', borderBottom: '2px solid rgba(255,255,255,0.2)', background: 'transparent', outline: 'none', fontSize: '1.1rem', fontFamily: 'var(--font-body)', transition: 'border-color 0.2s', color: 'white' }}
                             onFocus={(e) => e.target.style.borderBottomColor = '#5138d6'}
                             onBlur={(e) => e.target.style.borderBottomColor = 'rgba(255,255,255,0.2)'}
                         />
                     </div>
                     <div style={{ display: 'flex', gap: 10, marginTop: '1rem' }}>
                         <button 
                            onClick={() => setShowEmailPrompt(false)} 
                            className="landing-btn-outline"
                            style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
                         >Cancel</button>
                         <button className="landing-btn-primary" onClick={startBusinessMode} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>Initialize <ArrowRight size={16}/></button>
                     </div>
                 </div>
             </div>
        )}
        {showAuthModal && <AuthModal initialMode={showAuthModal} onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  return (
    <div className="app-container">
      {appMode !== 'chat' && appMode !== 'myProfileSettings' && (
        <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ position: 'relative', width: 'max-content', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
              <header style={{
                  width: 'max-content', maxWidth: 'calc(100vw - 40px)', height: 60,
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'rgba(3, 3, 3, 0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)',
              padding: '0 20px', boxShadow: 'none'
          }}>
            {/* Left Group */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button 
                  style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'transparent', border: '1px solid var(--outline-variant)', borderRadius: '50%', color: 'var(--on-surface)' }}
                  onClick={() => mapComponentRef.current?.locateUser()}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-high)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  title="Locate Me"
                >
                  <Crosshair size={20} />
                </button>
                <button 
                   onClick={() => {
                       if (!user) setShowAuthModal('login');
                       else navigate('/chat');
                   }} 
                   style={{ border: '1px solid var(--outline-variant)', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '50%', backgroundColor: 'transparent', color: 'var(--on-surface)' }}
                   onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-high)'}
                   onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                   title="Messages"
               >
                  <MessageCircle size={16} />
               </button>
            </div>

            {/* Center Group (Search) */}
            <div style={{ width: 300, maxWidth: '40vw', height: 36, display: 'flex', alignItems: 'center', gap: 10, background: '#f4f4f5', borderRadius: '8px', padding: '0 8px 0 16px', border: 'none' }}>
               <input 
                 type="text" 
                 placeholder="Search products or categories..." 
                 value={searchInput}
                 onChange={(e) => setSearchInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                 style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', fontFamily: 'var(--font-body)', color: '#030303' }}
               />
               <button onClick={handleSearch} style={{ background: 'transparent', border: 'none', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Search size={18} color="var(--primary)" />
               </button>
            </div>

            {/* Right Group (User & Add Review) */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>

                {appMode === 'consumer' && (
                    <button 
                        style={{ height: 36, padding: '0 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'transparent', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-high)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => {
                            if (!user) setShowAuthModal('login');
                            else setIsCreatingReview(prev => !prev);
                        }}
                    >
                        <Plus size={16} color="var(--on-surface)" /> <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Add a review</span>
                    </button>
                )}
                {appMode === 'business' && (
                    <>
                        <button 
                            style={{ height: 36, padding: '0 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'transparent', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)', transition: 'background-color 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-high)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => setIsAgentOpen(prev => !prev)}
                        >
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Open Agent Window</span>
                        </button>
                        <button 
                            style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'transparent', border: '1px solid var(--outline-variant)', borderRadius: '50%', color: 'var(--on-surface)' }}
                            onClick={() => setIsHexagonSettingsOpen(prev => !prev)}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-high)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Toggle Hexagon Size"
                        >
                            <Hexagon size={16} />
                        </button>
                    </>
                )}
                {!user && (
                    <button 
                        style={{ height: 36, padding: '0 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'transparent', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-high)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => setShowAuthModal('login')}
                    >
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Sign In</span>
                    </button>
                )}
            </div>
          </header>
          {isHexagonSettingsOpen && appMode === 'business' && (
             <div style={{ position: 'absolute', left: 'calc(100% + 8px)', top: 0, width: 125, padding: '12px', background: 'rgba(3, 3, 3, 0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: 'none', color: '#ffffff' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: '8px', whiteSpace: 'nowrap' }}>
                    Hexagon Size
                    <span style={{ color: '#a1a1aa' }}>Lvl {hexResolution}</span>
                </label>
                
                <span style={{ fontSize: '0.7rem', color: '#a1a1aa', fontFamily: 'var(--font-body)', marginBottom: '-4px' }}>Massive</span>
                
                <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <input 
                        type="range" 
                        min="3" 
                        max="10" 
                        value={hexResolution} 
                        onChange={(e) => setHexResolution(parseInt(e.target.value))}
                        className="hexagon-range"
                        style={{
                            width: '120px',
                            transform: 'rotate(90deg)',
                            background: `linear-gradient(to right, var(--primary) ${((hexResolution - 3) / 7) * 100}%, rgba(255, 255, 255, 0.1) ${((hexResolution - 3) / 7) * 100}%)`
                        }}
                    />
                </div>
                
                <span style={{ fontSize: '0.7rem', color: '#a1a1aa', fontFamily: 'var(--font-body)', marginTop: '-4px' }}>Tiny</span>
             </div>
          )}
          </div>
          <div style={{ display: isCreatingReview ? 'block' : 'none', width: '100%' }}>
              <CreateReview 
                  key={mapUpdateTrigger}
                  onClose={() => setIsCreatingReview(false)} 
                  onPostSuccess={() => {
                      setIsCreatingReview(false);
                      setMapUpdateTrigger(prev => prev + 1);
                  }}
              />
          </div>
        </div>
      )}

      {appMode !== 'chat' && appMode !== 'myProfileSettings' && user && (
          <div className="nav-dropdown" style={{ position: 'absolute', top: 32, right: 30, zIndex: 1001, height: '36px', width: '36px' }}>
             {/* The dropdown menu, positioned to align with header top (top: 20 -> relative top: -12) */}
             <div className="nav-dropdown-menu" style={{ top: '-12px', right: '-12px', left: 'auto', minWidth: '160px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '12px', zIndex: 1, boxShadow: 'none' }}>
                 {/* First row: My Profile with padding to not overlap the photo */}
                 <div onClick={() => navigate('/profile')} style={{ padding: '0 12px', paddingRight: '48px', cursor: 'pointer', height: '36px', display: 'flex', alignItems: 'center', borderRadius: '8px', boxSizing: 'border-box' }}>
                     <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>My Profile</span>
                 </div>
                 
                 <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.05)', margin: '4px 0', padding: 0 }} />
                 
                 {/* Second row: Logout */}
                 <div onClick={logout} style={{ padding: '0 12px', cursor: 'pointer', color: '#ef4444', height: '36px', display: 'flex', alignItems: 'center', borderRadius: '8px', boxSizing: 'border-box' }}>
                     <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Logout</span>
                 </div>
             </div>
             
             {/* The profile photo, rendered ON TOP of the menu */}
             <div style={{ position: 'relative', zIndex: 10 }}>
                 {user.profilePic ? (
                     <img 
                         src={user.profilePic} 
                         alt="Profile" 
                         style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', boxShadow: '0 2px 10px rgba(81, 56, 214, 0.4)' }} 
                     />
                 ) : (
                     <div style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', 
                        backgroundColor: 'var(--primary)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(81, 56, 214, 0.4)'
                     }}>
                         {user.username.charAt(0).toUpperCase()}
                     </div>
                 )}
             </div>
          </div>
      )}

      {appMode !== 'myProfileSettings' && (
        <AppMap ref={mapComponentRef} onReviewSelect={handleReviewSelect} searchQuery={query} mapUpdateTrigger={mapUpdateTrigger} viewMode={appMode} currentUser={user} hexResolution={hexResolution} />
      )}

      {appMode === 'business' && <AgentBox demoEmail={marketResearchEmail} isOpen={isAgentOpen} onClose={() => setIsAgentOpen(false)} />}

      {selectedReview && (
        <ReviewCard 
          review={selectedReview} 
          onClose={() => setSelectedReview(null)} 
          onUserClick={(u) => { setSelectedUser(u); setSelectedReview(null); }}
          currentUser={user}
          onDeleteSuccess={() => {
            setSelectedReview(null);
            setMapUpdateTrigger(prev => prev + 1);
          }}
        />
      )}

      {selectedLocationReviews && (
        <MultiReviewCard 
          reviews={selectedLocationReviews} 
          onClose={() => setSelectedLocationReviews(null)} 
          onUserClick={(u) => { setSelectedUser(u); setSelectedLocationReviews(null); }}
          currentUser={user}
          onDeleteSuccess={(deletedId) => {
            const remaining = selectedLocationReviews.filter(r => r.id !== deletedId);
            if (remaining.length === 0) setSelectedLocationReviews(null);
            else setSelectedLocationReviews(remaining);
            setMapUpdateTrigger(prev => prev + 1);
          }}
        />
      )}

      {selectedUser && (
        <UserProfile 
            username={selectedUser} 
            onClose={() => setSelectedUser(null)} 
            onChatClick={() => {
                if (!user) {
                    setShowAuthModal('login');
                } else {
                    setInitialChatUser(selectedUser);
                    setSelectedUser(null);
                    navigate('/chat');
                }
            }}
        />
      )}



      {showAuthModal && <AuthModal initialMode={showAuthModal} onClose={() => setShowAuthModal(false)} />}
      
      {appMode === 'chat' && user && (
          <ChatApp 
              currentUser={user} 
              onClose={() => {
                  navigate('/');
                  setInitialChatUser(null);
              }} 
              initialChatUser={initialChatUser}
          />
      )}

      {appMode === 'myProfileSettings' && user && (
        <MyProfilePage 
           user={user} 
           onUserUpdate={(updatedUser) => setUser(updatedUser)} 
        />
      )}
    </div>
  );
}

export default App;
