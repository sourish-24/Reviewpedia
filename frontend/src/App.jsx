import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Navigation, Plus, MapPin, BarChart3, ArrowRight, ArrowUpRight, Mail, MessageCircle, Crosshair, Hexagon, Youtube, Linkedin, Instagram, Facebook, User as UserIcon, LogOut } from 'lucide-react';
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
  const [editingReviewData, setEditingReviewData] = useState(null);
  const [isMyReviewsOpen, setIsMyReviewsOpen] = useState(false);
  const [myReviewsList, setMyReviewsList] = useState([]);
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

  const homepageProfileRef = useRef(null);
  const [isHomepageProfileOpen, setIsHomepageProfileOpen] = useState(false);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (homepageProfileRef.current && !homepageProfileRef.current.contains(e.target)) {
        setIsHomepageProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    // Reset all review windows on route change
    setIsCreatingReview(false);
    setEditingReviewData(null);
    setSelectedReview(null);
    setSelectedLocationReviews(null);
    setIsMyReviewsOpen(false);
  }, [location.pathname]);

  const handleReviewSelect = (reviewsOrReview) => {
    setIsMyReviewsOpen(false);
    if (Array.isArray(reviewsOrReview)) {
       setSelectedLocationReviews(reviewsOrReview);
       setSelectedReview(null);
    } else {
       setSelectedReview(reviewsOrReview);
       setSelectedLocationReviews(null);
    }
  };

  const handleSearch = () => setQuery(searchInput);

  const handleOpenMyReviews = async () => {
      if (!user) return;
      try {
          const API_URL = import.meta.env.VITE_API_URL || '';
          const res = await fetch(`${API_URL}/api/reviews`);
          if (res.ok) {
              const data = await res.json();
              const userRev = data.filter(r => r.user?.name === user.username);
              setMyReviewsList(userRev);
              setIsMyReviewsOpen(true);
              setSelectedReview(null);
              setSelectedLocationReviews(null);
          }
      } catch (err) {
          console.error("Failed to fetch my reviews", err);
      }
  };

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
      <div 
        className="landing-dark"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }}
      >
        <div className="landing-grid-bg" />
        <div className="landing-grid-glow" />
        {/* Header */}
        <header className="landing-dark-header">
          {/* Left: Logo */}
          <div 
              className="landing-dark-logo" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{ cursor: 'pointer' }}
          >
             <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Navigation size={20} color="#ffffff" />
             </div>
             Reviewpedia
          </div>

          {/* Center: Navigation Links */}
          <nav className="landing-dark-nav" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '3rem', alignItems: 'center' }}>
             <a href="#about" style={{ fontSize: '0.88rem' }}>About</a>
             <a onClick={() => navigate('/browse')} style={{ fontSize: '0.88rem' }}>Browse Reviews</a>
             <a onClick={() => setShowEmailPrompt(true)} style={{ fontSize: '0.88rem' }}>Research</a>
             <a href="#contact" style={{ fontSize: '0.88rem' }}>Contact Us</a>
          </nav>

          {/* Right: User / Auth Controls */}
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
             {user ? (
                    <div ref={homepageProfileRef} style={{ position: 'relative' }}>
                        <div 
                            onClick={() => setIsHomepageProfileOpen(prev => !prev)}
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            {user.profilePic ? (
                                <img 
                                    src={user.profilePic} 
                                    alt="Profile" 
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '3px solid #0ea5e9', boxSizing: 'border-box', boxShadow: 'none' }} 
                                />
                            ) : (
                                <div style={{ 
                                    width: '40px', height: '40px', borderRadius: '50%', 
                                    backgroundColor: '#0ea5e9', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                                    border: '3px solid #0ea5e9', boxSizing: 'border-box',
                                    boxShadow: 'none'
                                }}>
                                    {user.username[0].toUpperCase()}
                                </div>
                            )}
                        </div>

                        {isHomepageProfileOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '48px',
                                right: '-12px',
                                left: 'auto',
                                minWidth: '180px',
                                background: 'rgba(3, 3, 3, 0.6)',
                                border: 'none',
                                borderRadius: '16px',
                                padding: '12px',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                boxShadow: 'none',
                                zIndex: 1000,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                                color: '#ffffff'
                            }}>
                                {/* Top Segment: Username and Email (Always White) */}
                                <div style={{ padding: '2px 12px 6px 12px', cursor: 'default' }}>
                                    <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user.username}
                                    </div>
                                    <div style={{ color: '#ffffff', fontSize: '0.78rem', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                                        {user.email}
                                    </div>
                                </div>

                                <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '4px 0', padding: 0 }} />

                                <div 
                                    onClick={() => { setIsHomepageProfileOpen(false); navigate('/profile'); }} 
                                    style={{ padding: '0 12px', cursor: 'pointer', height: '36px', display: 'flex', alignItems: 'center', boxSizing: 'border-box', color: '#ffffff', fontSize: '0.9rem', fontWeight: 600, background: 'transparent', borderRadius: '8px', transition: 'color 0.2s ease' }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#0ea5e9'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}
                                >
                                    <span>My Profile</span>
                                </div>

                                <div 
                                    onClick={() => { setIsHomepageProfileOpen(false); navigate('/chat'); }} 
                                    style={{ padding: '0 12px', cursor: 'pointer', height: '36px', display: 'flex', alignItems: 'center', boxSizing: 'border-box', color: '#ffffff', fontSize: '0.9rem', fontWeight: 600, background: 'transparent', borderRadius: '8px', transition: 'color 0.2s ease' }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#0ea5e9'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}
                                >
                                    <span>Chats</span>
                                </div>

                                <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '4px 0', padding: 0 }} />

                                <div 
                                    onClick={() => { setIsHomepageProfileOpen(false); logout(); navigate('/'); }} 
                                    style={{ padding: '0 12px', cursor: 'pointer', height: '36px', display: 'flex', alignItems: 'center', boxSizing: 'border-box', color: '#ef4444', fontSize: '0.9rem', fontWeight: 600, background: 'transparent', borderRadius: '8px' }}
                                >
                                    <span>Sign Out</span>
                                </div>
                            </div>
                        )}
                    </div>
             ) : (
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button 
                        style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s', padding: '6px 12px' }} 
                        onMouseOver={(e) => e.currentTarget.style.color = '#0ea5e9'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#475569'}
                        onClick={() => setShowAuthModal('login')}
                    >
                        Sign In
                    </button>
                    <button 
                        style={{ background: '#0ea5e9', border: 'none', color: '#ffffff', fontSize: '0.88rem', fontWeight: 600, padding: '8px 20px', borderRadius: '9999px', cursor: 'pointer', transition: 'background-color 0.2s' }} 
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
                        onClick={() => setShowAuthModal('signup')}
                    >
                        Sign Up
                    </button>
                </div>
             )}
          </div>
        </header>

        {/* Hero Content */}
        <div className="landing-dark-content">
          <h1 className="landing-title">
             Greener, Smarter Future With Geospatial Intelligence
          </h1>
          <p style={{ color: '#475569', fontSize: '1.25rem', maxWidth: '650px', textAlign: 'center', marginBottom: '2.5rem', lineHeight: 1.6 }}>
             Our commitment to innovation drives us to map hyper-local consumer sentiment, product feedback, and AI market research worldwide.
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '4rem' }}>
              <button className="landing-btn-primary" onClick={() => navigate('/browse')}>
                  Get Started <ArrowRight size={18} />
              </button>
              <button className="landing-btn-outline" onClick={() => setShowEmailPrompt(true)}>
                  Market Research
              </button>
          </div>
        </div>

        {/* About Us Section */}
        <section id="about" style={{ position: 'relative', zIndex: 2, padding: '80px 4rem', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#0f172a', fontFamily: 'var(--font-display)' }}>Who We Are</h2>
            <p style={{ color: '#475569', fontSize: '1.15rem', lineHeight: 1.8, maxWidth: 800, marginBottom: '4rem' }}>
                At Reviewpedia, we believe that transparency drives innovation. By combining geospatial intelligence with verified product reviews, we empower consumers and businesses to make deeply informed decisions.
            </p>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                <div className="landing-card" style={{ flex: 1, minWidth: 300, textAlign: 'left', alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <MapPin size={24} />
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem' }}>Geospatial Mapping</div>
                    <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '0.95rem' }}>To architect the data layer of physical commerce. We bring digital transparency to the real world, mapping consumer sentiment globally.</p>
                </div>
                <div className="landing-card" style={{ flex: 1, minWidth: 300, textAlign: 'left', alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <BarChart3 size={24} />
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem' }}>AI Sales & Market Intelligence</div>
                    <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '0.95rem' }}>Integrating AI Sales Agents with real-time geospatial reviews creates unprecedented actionable insights for hardware and retail founders.</p>
                </div>
            </div>
        </section>

        {/* Contact Us Section */}
        <section id="contact" style={{ position: 'relative', zIndex: 2, padding: '80px 4rem', backgroundColor: 'transparent' }}>
            <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: '1rem', color: '#0f172a', fontFamily: 'var(--font-display)' }}>Get In Touch</h2>
                <p style={{ color: '#475569', fontSize: '1.05rem', marginBottom: '2.5rem' }}>Partner with Reviewpedia to supercharge your market intelligence.</p>
                
                <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'flex-start', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(2,132,199,0.15)', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', width: '100%' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                            <label style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: 600 }}>Name</label>
                            <input type="text" placeholder="John Doe" style={{ width: '100%', padding: '12px 20px', background: '#ffffff', border: '1px solid rgba(2, 132, 199, 0.18)', borderRadius: '9999px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                            <label style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: 600 }}>Email</label>
                            <input type="email" placeholder="john@example.com" style={{ width: '100%', padding: '12px 20px', background: '#ffffff', border: '1px solid rgba(2, 132, 199, 0.18)', borderRadius: '9999px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                    </div>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                        <label style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: 600 }}>Message</label>
                        <textarea placeholder="How can we help you?" rows="4" style={{ width: '100%', padding: '14px 20px', background: '#ffffff', border: '1px solid rgba(2, 132, 199, 0.18)', borderRadius: '20px', color: '#0f172a', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}></textarea>
                    </div>
                    <button type="button" className="landing-btn-primary" style={{ width: '100%', padding: '16px', marginTop: '1rem', borderRadius: '9999px', justifyContent: 'center' }}>Send Message</button>
                </form>
            </div>
        </section>

        {/* Windora Dark Slate Navy Footer */}
        <footer style={{
            position: 'relative',
            zIndex: 2,
            padding: '4rem 4rem 2rem 4rem',
            backgroundColor: '#161e2e',
            borderRadius: '32px 32px 0 0',
            maxWidth: 1240,
            margin: '60px auto 0 auto',
            color: '#ffffff',
            fontFamily: 'var(--font-body)',
            boxSizing: 'border-box'
        }}>
            {/* Top Row: Logo & Description on Left, Email Subscription Input on Right */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '3rem', marginBottom: '3.5rem' }}>
                <div style={{ maxWidth: 420 }}>
                    <div className="landing-dark-logo" style={{ color: '#ffffff', marginBottom: '1.25rem', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                         <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <Navigation size={18} color="#ffffff" />
                         </div>
                         Reviewpedia
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
                        Your own friendly neighbourhood social media platform, made in INDIA
                    </p>
                </div>

                {/* Right side: Email input + Cyan Circular Submit Button */}
                <div style={{ flex: 1, maxWidth: 520, minWidth: 300 }}>
                    <form 
                      onSubmit={(e) => { e.preventDefault(); setShowEmailPrompt(true); }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '12px' }}
                    >
                        <input 
                          type="email" 
                          placeholder="Enter Your Email"
                          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#ffffff', fontSize: '1.5rem', fontFamily: 'var(--font-body)', width: '100%', paddingRight: '16px' }}
                        />
                        <button 
                          type="submit"
                          style={{ width: 48, height: 48, borderRadius: '50%', background: '#0ea5e9', border: 'none', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'transform 0.2s, background-color 0.2s' }}
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#0284c7'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#0ea5e9'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            <ArrowUpRight size={22} color="#ffffff" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Middle Section: Left Content (Browse/Explore) & Right Columns (PRODUCTS / COMPANY / CONTACT & ADDRESS) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem', marginBottom: '3.5rem' }}>
                {/* Left Topics & Highlights */}
                <div style={{ flex: 1, maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                    <div>
                        <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Browse</span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ffffff', margin: 0, lineHeight: 1.4 }}>
                            Products, hardware, tech, appliances &amp; local services
                        </h3>
                    </div>
                    <div>
                        <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Explore</span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ffffff', margin: 0, lineHeight: 1.4 }}>
                            Real time geospatial data for market analysis &amp; demand statistics
                        </h3>
                    </div>
                </div>

                {/* Right Columns Container (Right-aligned) */}
                <div style={{ display: 'flex', gap: '4.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', marginLeft: 'auto' }}>
                    {/* Column 1: PRODUCTS */}
                    <div>
                        <div style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PRODUCTS</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: '#94a3b8' }}>
                            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/browse')}>Browse reviews</span>
                            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/chat')}>Message</span>
                        </div>
                    </div>

                    {/* Column 2: COMPANY */}
                    <div>
                        <div style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>COMPANY</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: '#94a3b8' }}>
                            <span style={{ cursor: 'pointer' }}>Partner</span>
                            <span style={{ cursor: 'pointer' }} onClick={() => setShowEmailPrompt(true)}>Market research</span>
                            <span style={{ cursor: 'pointer' }}>Integrations</span>
                            <span style={{ cursor: 'pointer' }}>Pricing</span>
                            <span style={{ cursor: 'pointer' }}>Request Demo</span>
                        </div>
                    </div>

                    {/* Column 3: CONTACT & ADDRESS */}
                    <div style={{ maxWidth: 215 }}>
                        <div style={{ marginBottom: '1.75rem' }}>
                            <div style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CONTACT</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: '#94a3b8' }}>
                                <div>
                                    <a href="mailto:careers@reviewpedia.co.in" style={{ color: '#0ea5e9', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                                        <Mail size={13} color="#0ea5e9" style={{ flexShrink: 0 }} /> careers@reviewpedia.co.in
                                    </a>
                                    <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '2px' }}>for career info</span>
                                </div>
                                <div style={{ marginTop: '4px' }}>
                                    <a href="mailto:support@reviewpedia.co.in" style={{ color: '#0ea5e9', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                                        <Mail size={13} color="#0ea5e9" style={{ flexShrink: 0 }} /> support@reviewpedia.co.in
                                    </a>
                                    <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '2px' }}>for customer support</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ADDRESS</div>
                            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, margin: 0, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                <MapPin size={14} color="#0ea5e9" style={{ flexShrink: 0, marginTop: '3px' }} /> A-10, Sector-62, Noida, Uttar Pradesh, 201309, India
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar: Horizontal Separator + Left Legal Links + Right Circular Social Media Icons */}
            <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                {/* Left Legal Text Links */}
                <div style={{ display: 'flex', gap: '1.75rem', fontSize: '0.88rem', color: '#94a3b8' }}>
                    <span style={{ cursor: 'pointer' }}>Terms</span>
                    <span style={{ cursor: 'pointer' }}>Privacy</span>
                    <span style={{ cursor: 'pointer' }}>Cookies</span>
                    <span style={{ cursor: 'pointer' }}>Legal</span>
                    <span style={{ cursor: 'pointer' }}>Blogs</span>
                </div>

                {/* Right Social Media Icon Circles */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <a href="https://youtube.com" target="_blank" rel="noreferrer" style={{ width: 38, height: 38, borderRadius: '50%', background: '#F8F4F0', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'transform 0.2s' }} title="YouTube">
                        <Youtube size={18} />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ width: 38, height: 38, borderRadius: '50%', background: '#F8F4F0', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'transform 0.2s' }} title="LinkedIn">
                        <Linkedin size={18} />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ width: 38, height: 38, borderRadius: '50%', background: '#F8F4F0', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'transform 0.2s' }} title="Instagram">
                        <Instagram size={18} />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ width: 38, height: 38, borderRadius: '50%', background: '#F8F4F0', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'transform 0.2s' }} title="Facebook">
                        <Facebook size={18} />
                    </a>
                </div>
            </div>
        </footer>

        {/* Existing Auth / Email Prompt overlay */}
        {showEmailPrompt && (
             <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px', boxSizing: 'border-box' }}>
                 <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '440px', background: '#161E2E', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', boxShadow: 'none', color: '#ffffff', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }}>
                     {/* Title Row with Cyan Icon Badge */}
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                             <Mail size={22} color="#0ea5e9" />
                         </div>
                         <h3 style={{ margin: 0, fontSize: '1.35rem', color: '#ffffff', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Identity Verification</h3>
                     </div>

                     {/* Subtitle / Description */}
                     <p style={{ fontSize: '0.92rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                         Enter your email address to securely route AI-generated intelligence briefings and automated sales outreach directly to your inbox for verification.
                     </p>
                     
                     {/* Input Box Container */}
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                         <label style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Work Email</label>
                         <input 
                             type="email" 
                             value={marketResearchEmail} 
                             onChange={(e) => setMarketResearchEmail(e.target.value)} 
                             placeholder="you@example.com"
                             autoFocus
                             onKeyDown={(e) => e.key === 'Enter' && startBusinessMode()}
                             style={{ padding: '12px 16px', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', background: '#1f293d', outline: 'none', fontSize: '0.95rem', fontFamily: 'var(--font-body)', transition: 'all 0.2s', color: '#ffffff', boxSizing: 'border-box' }}
                             onFocus={(e) => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.2)'; }}
                             onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'; e.target.style.boxShadow = 'none'; }}
                         />
                     </div>

                     {/* Equal Width Action Buttons */}
                     <div style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
                         <button 
                             onClick={() => setShowEmailPrompt(false)} 
                             style={{
                                 flex: 1,
                                 height: '42px',
                                 background: '#161E2E',
                                 border: 'none',
                                 color: '#ffffff',
                                 borderRadius: '9999px',
                                 cursor: 'pointer',
                                 fontWeight: 600,
                                 fontSize: '0.88rem',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 transition: 'color 0.2s'
                             }}
                             onMouseOver={(e) => e.currentTarget.style.color = '#0ea5e9'}
                             onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}
                         >
                             Cancel
                         </button>
                         <button 
                             onClick={startBusinessMode}
                             style={{
                                 flex: 1,
                                 height: '42px',
                                 background: '#0ea5e9',
                                 border: 'none',
                                 color: '#ffffff',
                                 borderRadius: '9999px',
                                 cursor: 'pointer',
                                 fontWeight: 600,
                                 fontSize: '0.88rem',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 gap: '8px',
                                 transition: 'background-color 0.2s'
                             }}
                             onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                             onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
                         >
                             Initialize <ArrowRight size={16}/>
                         </button>
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
        <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ position: 'relative', width: 'max-content', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
              <header style={{
                  width: 'max-content', maxWidth: 'calc(100vw - 40px)', height: 64,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  background: 'rgba(3, 3, 3, 0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '9999px', border: 'none',
                  padding: '12px', boxShadow: 'none', color: '#ffffff', boxSizing: 'border-box'
              }}>
            {/* Left Group */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button 
                  style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none', border: 'none', color: '#ffffff', transition: 'color 0.2s', padding: 0 }}
                  onClick={() => mapComponentRef.current?.locateUser()}
                  onMouseOver={(e) => {
                      e.currentTarget.style.color = '#0ea5e9';
                      const svg = e.currentTarget.querySelector('svg');
                      if (svg) svg.setAttribute('stroke', '#0ea5e9');
                  }}
                  onMouseOut={(e) => {
                      e.currentTarget.style.color = '#ffffff';
                      const svg = e.currentTarget.querySelector('svg');
                      if (svg) svg.setAttribute('stroke', '#ffffff');
                  }}
                  title="Locate Me"
                >
                  <Crosshair size={20} color="currentColor" />
                </button>
                <button 
                   onClick={() => {
                       if (!user) setShowAuthModal('login');
                       else navigate('/chat');
                   }} 
                   style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none', border: 'none', color: '#ffffff', transition: 'color 0.2s', padding: 0 }}
                   onMouseOver={(e) => {
                       e.currentTarget.style.color = '#0ea5e9';
                       const svg = e.currentTarget.querySelector('svg');
                       if (svg) svg.setAttribute('stroke', '#0ea5e9');
                   }}
                   onMouseOut={(e) => {
                       e.currentTarget.style.color = '#ffffff';
                       const svg = e.currentTarget.querySelector('svg');
                       if (svg) svg.setAttribute('stroke', '#ffffff');
                   }}
                   title="Messages"
               >
                  <MessageCircle size={18} color="currentColor" />
               </button>
            </div>

            {/* Center Group (Search) */}
            <div style={{ width: 320, maxWidth: '40vw', height: 40, display: 'flex', alignItems: 'center', gap: 10, background: '#ffffff', borderRadius: '9999px', padding: '0 6px 0 18px', border: 'none', boxSizing: 'border-box' }}>
               <input 
                 type="text" 
                 placeholder="Search products or categories..." 
                 value={searchInput}
                 onChange={(e) => setSearchInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                 className="header-search-input"
                 style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', fontFamily: 'var(--font-body)', color: '#000000' }}
               />
               <button onClick={handleSearch} style={{ background: 'transparent', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, padding: 0 }}>
                  <Search size={18} color="#000000" />
               </button>
            </div>

            {/* Right Group (User & Add Review) */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>

                {appMode === 'consumer' && (
                    <button 
                        style={{ height: 40, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'none', border: 'none', color: '#ffffff', transition: 'color 0.2s' }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.color = '#0ea5e9';
                            const svg = e.currentTarget.querySelector('svg');
                            if (svg) svg.setAttribute('stroke', '#0ea5e9');
                            const span = e.currentTarget.querySelector('span');
                            if (span) span.style.color = '#0ea5e9';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.color = '#ffffff';
                            const svg = e.currentTarget.querySelector('svg');
                            if (svg) svg.setAttribute('stroke', '#ffffff');
                            const span = e.currentTarget.querySelector('span');
                            if (span) span.style.color = '#ffffff';
                        }}
                        onClick={() => {
                            if (!user) setShowAuthModal('login');
                            else {
                                setEditingReviewData(null);
                                setIsCreatingReview(prev => !prev);
                            }
                        }}
                    >
                        <Plus size={18} color="currentColor" /> <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#ffffff', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>Add a review</span>
                    </button>
                )}
                {appMode === 'business' && (
                    <>
                        <button 
                            style={{ height: 40, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'none', border: 'none', color: '#ffffff', transition: 'color 0.2s' }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.color = '#0ea5e9';
                                const span = e.currentTarget.querySelector('span');
                                if (span) span.style.color = '#0ea5e9';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.color = '#ffffff';
                                const span = e.currentTarget.querySelector('span');
                                if (span) span.style.color = '#ffffff';
                            }}
                            onClick={() => setIsAgentOpen(prev => !prev)}
                        >
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#ffffff', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>Open Agent Window</span>
                        </button>
                        <button 
                            style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none', border: 'none', color: '#ffffff', padding: 0, transition: 'color 0.2s' }}
                            onClick={() => setIsHexagonSettingsOpen(prev => !prev)}
                            onMouseOver={(e) => {
                                e.currentTarget.style.color = '#0ea5e9';
                                const svg = e.currentTarget.querySelector('svg');
                                if (svg) svg.setAttribute('stroke', '#0ea5e9');
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.color = '#ffffff';
                                const svg = e.currentTarget.querySelector('svg');
                                if (svg) svg.setAttribute('stroke', '#ffffff');
                            }}
                            title="Toggle Hexagon Size"
                        >
                            <Hexagon size={18} color="currentColor" />
                        </button>
                    </>
                )}
            </div>
          </header>
          {isHexagonSettingsOpen && appMode === 'business' && (
             <div style={{ position: 'absolute', left: 'calc(100% + 8px)', top: 0, width: 125, padding: '12px', background: 'rgba(3, 3, 3, 0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '16px', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: 'none', color: '#ffffff' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: '8px', whiteSpace: 'nowrap', color: '#ffffff' }}>
                    Hexagon Size
                    <span style={{ color: '#ffffff', opacity: 0.8 }}>Lvl {hexResolution}</span>
                </label>
                
                <span style={{ fontSize: '0.7rem', color: '#ffffff', fontFamily: 'var(--font-body)', marginBottom: '-4px', opacity: 0.8 }}>Massive</span>
                
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
                
                <span style={{ fontSize: '0.7rem', color: '#ffffff', fontFamily: 'var(--font-body)', marginTop: '-4px', opacity: 0.8 }}>Tiny</span>
             </div>
          )}
          </div>
          <div style={{ display: isCreatingReview ? 'block' : 'none', width: '100%' }}>
              <CreateReview 
                  key={editingReviewData ? `edit-${editingReviewData.id}` : `create-${mapUpdateTrigger}`}
                  editingReview={editingReviewData}
                  onClose={() => {
                      setIsCreatingReview(false);
                      setEditingReviewData(null);
                  }} 
                  onPostSuccess={() => {
                      setIsCreatingReview(false);
                      setEditingReviewData(null);
                      setMapUpdateTrigger(prev => prev + 1);
                      setSelectedReview(null);
                      setSelectedLocationReviews(null);
                  }}
              />
          </div>
        </div>
      )}

      {appMode !== 'chat' && appMode !== 'myProfileSettings' && !user && (
          <div style={{ position: 'absolute', top: 32, right: 30, zIndex: 1001 }}>
              <button 
                  style={{ 
                      height: 40, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      cursor: 'pointer', background: '#0ea5e9', border: 'none', color: '#ffffff',
                      borderRadius: '9999px', fontWeight: 600, fontSize: '0.88rem', fontFamily: 'var(--font-body)',
                      transition: 'background-color 0.2s', boxShadow: 'none'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
                  onClick={() => setShowAuthModal('login')}
              >
                  Sign In
              </button>
          </div>
      )}

      {appMode !== 'chat' && appMode !== 'myProfileSettings' && user && (
          <div className="nav-dropdown" style={{ position: 'absolute', top: 32, right: 30, zIndex: 1001, height: '40px', width: '40px' }}>
             {/* The dropdown menu, positioned to align with header top (top: 20 -> relative top: -12) */}
             <div className="nav-dropdown-menu" style={{ top: '-12px', right: '-12px', left: 'auto', minWidth: '160px', borderRadius: '16px', border: 'none', padding: '12px', zIndex: 1, boxShadow: 'none' }}>
                 {/* First row: My Profile with padding to not overlap the photo */}
                 <div onClick={() => navigate('/profile')} style={{ padding: '0 12px', paddingRight: '48px', cursor: 'pointer', height: '36px', display: 'flex', alignItems: 'center', boxSizing: 'border-box' }}>
                     <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>My Profile</span>
                 </div>
                 
                 {/* Second row: My Reviews */}
                 <div onClick={handleOpenMyReviews} style={{ padding: '0 12px', cursor: 'pointer', height: '36px', display: 'flex', alignItems: 'center', boxSizing: 'border-box' }}>
                     <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>My Reviews</span>
                 </div>

                 <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '4px 0', padding: 0 }} />
                 
                 {/* Third row: Sign Out */}
                 <div onClick={logout} className="nav-logout-item" style={{ padding: '0 12px', cursor: 'pointer', height: '36px', display: 'flex', alignItems: 'center', boxSizing: 'border-box' }}>
                     <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Sign Out</span>
                 </div>
             </div>
             
             {/* The profile photo, rendered ON TOP of the menu */}
             <div style={{ position: 'relative', zIndex: 10 }}>
                 {user.profilePic ? (
                     <img 
                         src={user.profilePic} 
                         alt="Profile" 
                         style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '3px solid #0ea5e9', boxSizing: 'border-box', boxShadow: 'none' }} 
                     />
                 ) : (
                     <div style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', 
                        backgroundColor: '#0ea5e9', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                        border: '3px solid #0ea5e9', boxSizing: 'border-box',
                        boxShadow: 'none'
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

      {appMode === 'consumer' && selectedReview && (
        <ReviewCard 
          review={selectedReview} 
          onClose={() => setSelectedReview(null)} 
          onUserClick={(u, userObj) => {
            const isScraped = selectedReview.source?.isScraped || (selectedReview.source?.platform && selectedReview.source.platform.toLowerCase() !== 'reviewpedia' && selectedReview.source.platform.toLowerCase() !== 'local post');
            if (!isScraped) setSelectedUser(userObj || u);
          }}
          currentUser={user}
          onDeleteSuccess={() => {
            setSelectedReview(null);
            setMapUpdateTrigger(prev => prev + 1);
          }}
          onEdit={(rev) => {
            setEditingReviewData(rev);
            setIsCreatingReview(true);
          }}
        />
      )}

      {appMode === 'consumer' && selectedLocationReviews && (
        <MultiReviewCard 
          reviews={selectedLocationReviews} 
          onClose={() => setSelectedLocationReviews(null)} 
          onUserClick={(u, userObj) => { setSelectedUser(userObj || u); }}
          currentUser={user}
          onDeleteSuccess={(deletedId) => {
            const remaining = selectedLocationReviews.filter(r => r.id !== deletedId);
            if (remaining.length === 0) setSelectedLocationReviews(null);
            else setSelectedLocationReviews(remaining);
            setMapUpdateTrigger(prev => prev + 1);
          }}
          onEdit={(rev) => {
            setEditingReviewData(rev);
            setIsCreatingReview(true);
          }}
        />
      )}

      {appMode === 'consumer' && isMyReviewsOpen && (
        <MultiReviewCard 
          reviews={myReviewsList} 
          isMyReviews={true}
          onClose={() => setIsMyReviewsOpen(false)} 
          onUserClick={(u, userObj) => { setSelectedUser(userObj || u); }}
          currentUser={user}
          onDeleteSuccess={(deletedId) => {
            const remaining = myReviewsList.filter(r => r.id !== deletedId);
            setMyReviewsList(remaining);
            setMapUpdateTrigger(prev => prev + 1);
          }}
          onEdit={(rev) => {
            setEditingReviewData(rev);
            setIsCreatingReview(true);
          }}
        />
      )}

      {selectedUser && (
        <UserProfile 
            username={typeof selectedUser === 'object' ? (selectedUser.name || selectedUser.username) : selectedUser} 
            userProfilePic={typeof selectedUser === 'object' ? selectedUser.profilePic : null}
            onClose={() => setSelectedUser(null)} 
            onChatClick={() => {
                const targetUsername = typeof selectedUser === 'object' ? (selectedUser.name || selectedUser.username) : selectedUser;
                if (!user) {
                    setShowAuthModal('login');
                } else {
                    setInitialChatUser(targetUsername);
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
           onBack={() => navigate('/')}
           onUserUpdate={(updatedUser) => setUser(updatedUser)} 
           onDeleteAccount={() => {
             logout();
             navigate('/');
           }}
        />
      )}
    </div>
  );
}

export default App;
