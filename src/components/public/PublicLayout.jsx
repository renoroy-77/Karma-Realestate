import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useContext, useRef } from 'react'
import { toast } from 'sonner'
import { LOCALITIES, AppDataContext } from '../../context/AppDataContext'
import api from '../../lib/api'
import KarmaLogo from '../ui/KarmaLogo'

function CookieBanner() {
  const [show, setShow] = useState(true);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  if (!show) return null;

  return (
    <>
      <div className="cookie-banner">
        <div className="cb-in">
          <div className="cb-txt">
            <b>We value your privacy</b>
            <p>We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies.</p>
          </div>
          <div className="cb-actions">
            <button className="btn btn-outline" onClick={() => setShowPrefs(true)}>Manage</button>
            <button className="btn-primary" onClick={() => setShow(false)}>Accept All</button>
          </div>
        </div>
      </div>
      
      {showPrefs && (
        <div className="overlay" style={{zIndex: 101}} onClick={(e) => e.target.className.includes('overlay') && setShowPrefs(false)}>
          <div className="modal" style={{maxWidth: 400}}>
            <div className="modal-hd">
              <b>Cookie Preferences</b>
              <button className="modal-x" onClick={() => setShowPrefs(false)}>✕</button>
            </div>
            <div className="modal-bd">
              <div className="pref-row">
                <div>
                  <b>Essential Cookies</b>
                  <p>Required for the website to function.</p>
                </div>
                <div className="toggle disabled on"></div>
              </div>
              <div className="pref-row">
                <div>
                  <b>Analytics Cookies</b>
                  <p>Help us improve our website by collecting anonymous usage data.</p>
                </div>
                <div className={`toggle ${analytics ? 'on' : ''}`} onClick={() => setAnalytics(!analytics)}></div>
              </div>
              <button className="btn-primary" style={{width: '100%', marginTop: 24}} onClick={() => { setShowPrefs(false); setShow(false); }}>
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Header() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const { user, setUser, showAuthModal, setShowAuthModal } = useContext(AppDataContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  // Scroll to top automatically when navigating between pages/properties
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Search Bar State
  const [searchPurpose, setSearchPurpose] = useState('Sale');
  const [searchLoc, setSearchLoc] = useState('');
  const [searchType, setSearchType] = useState('All');
  const [searchPrice, setSearchPrice] = useState('All');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchPurpose && searchPurpose !== 'All') params.set('purpose', searchPurpose);
    if (searchLoc) params.set('loc', searchLoc);
    if (searchType && searchType !== 'All') params.set('type', searchType);
    if (searchPrice && searchPrice !== 'All') params.set('price', searchPrice);

    navigate(`/results?${params.toString()}`);
    setIsExpanded(false);
  };

  // OTP Modal State
  const [step, setStep] = useState(0); // 0: details, 1: otp, 2: success
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', loc: 'Kannur City' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Lock cooldown effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (cooldown === 0 && attempts >= 3) {
      setAttempts(0);
    }
  }, [cooldown, attempts]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Focus first digit when step transitions to OTP
  useEffect(() => {
    if (step === 1) {
      setTimeout(() => {
        otpRefs[0]?.current?.focus();
      }, 120);
    }
  }, [step]);

  // OTP paste handler
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    setOtpError('');
    if (pasted.length === 6) {
      otpRefs[5]?.current?.focus();
      handleVerifyOtp(pasted);
    } else {
      otpRefs[pasted.length]?.current?.focus();
    }
  };

  // Send OTP
  const handleSendOtp = async (isResend = false) => {
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!formData.name.trim()) {
      setOtpError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setOtpError('Please enter a valid email address.');
      return;
    }
    if (cleanPhone.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    if (isResend) setResendSuccess('');

    try {
      const res = await api.post('/otp/send', {
        email: formData.email.trim(),
        name: formData.name.trim(),
        phone: cleanPhone,
        locality: formData.loc
      });

      if (res.data.success) {
        toast.success(isResend ? 'Fresh verification code dispatched!' : 'Verification code sent to your email!', {
          description: `Check your inbox at ${formData.email.trim()}`
        });
        if (isResend) {
          setResendSuccess('✓ A fresh 6-digit verification code has been dispatched to your email.');
          setResendCooldown(30);
        } else {
          setStep(1);
          setResendCooldown(30);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 
                  err.response?.data?.errors?.email?.[0] || 
                  err.response?.data?.errors?.phone?.[0] || 
                  (err.message === 'Network Error' ? 'Unable to connect to verification server. Please verify backend server is running.' : 'Failed to send OTP code.');
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (codeToVerify) => {
    const code = codeToVerify || otp.join('');
    if (code.length < 6) {
      setOtpError('Please enter all 6 digits of the code.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    setResendSuccess('');

    try {
      const res = await api.post('/otp/verify', {
        email: formData.email.trim(),
        otp: code
      });

      if (res.data.success) {
        if (res.data.lead_token) {
          localStorage.setItem('lead_token', res.data.lead_token);
        }
        const verifiedUser = {
          id: res.data.lead?.id,
          name: formData.name.trim() || res.data.lead?.name || 'Verified User',
          email: formData.email.trim() || res.data.lead?.email,
          phone: formData.phone.trim(),
          loc: formData.loc,
          verified: true
        };
        localStorage.setItem('lead_data', JSON.stringify(verifiedUser));
        setUser(verifiedUser);
        setStep(2);
        toast.success('Access Granted! GPS coordinates and confidential insights unlocked.', {
          description: `Welcome, ${verifiedUser.name}!`
        });
        
        // Automatically close modal after celebration
        setTimeout(() => {
          setShowAuthModal(false);
          setStep(0);
          setOtp(['', '', '', '', '', '']);
        }, 2200);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.otp?.[0] || 'Invalid verification code. Please check and try again.';
      setOtpError(msg);
      toast.error(msg);
      setAttempts(a => a + 1);
      setOtp(['', '', '', '', '', '']);
      otpRefs[0]?.current?.focus();
      if (attempts >= 2) setCooldown(60);
    } finally {
      setOtpLoading(false);
    }
  };


  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('lead_token');
    localStorage.removeItem('lead_data');
    setUser(null);
    toast.info('Logged out successfully');
  };

  // Listen for footer sell button click
  useEffect(() => {
    const handleOpenSell = () => setShowSellModal(true);
    window.addEventListener('open-sell-modal', handleOpenSell);
    return () => window.removeEventListener('open-sell-modal', handleOpenSell);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsExpanded(false);
      }
    };

    setIsExpanded(false);
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  return (
    <>
      <div className={`hdr-overlay ${isExpanded ? 'active' : ''}`} onClick={() => setIsExpanded(false)}></div>
      <header className={`hdr hdr-solid ${isExpanded ? 'hdr-expanded' : ''}`} style={{ position: 'fixed' }}>
        <div className="hdr-in">
          <Link to="/" className="logo" style={{ textDecoration: 'none', zIndex: 2 }}>
            <KarmaLogo height={44} />
          </Link>

          <div className="hdr-search-container">
            <div className="hdr-search-inner">
              {/* Small Pill */}
              <div className="search-pill-small" onClick={() => setIsExpanded(true)}>
                <div className="sp-btn">Anywhere</div>
                <span className="sp-div"></span>
                <div className="sp-btn">Any Type</div>
                <span className="sp-div"></span>
                <div className="sp-btn">Any Budget</div>
                <div className="sp-icon" style={{ background: 'var(--blue)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
              </div>

              {location.pathname.includes('/results') && (
                <button className="mf-toggle-btn-header" onClick={() => window.dispatchEvent(new Event('toggle-filters'))}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                </button>
              )}
            </div>

            {/* Large Search Bar */}
            <div className="search-bar-large-wrapper">
              <div className="search-tabs">
                <button className={searchPurpose === 'Sale' ? 'st-active' : ''} onClick={() => setSearchPurpose('Sale')}>Buy</button>
                <button className={searchPurpose === 'Rent' ? 'st-active' : ''} onClick={() => setSearchPurpose('Rent')}>Rent</button>
                <button className={searchPurpose === 'Lease' ? 'st-active' : ''} onClick={() => setSearchPurpose('Lease')}>Lease</button>
                <button className={searchPurpose === 'Commercial' ? 'st-active' : ''} onClick={() => setSearchPurpose('Commercial')}>Commercial</button>
              </div>
              <div className="search-bar-large">
                <div className="sb-field">
                  <label>Location</label>
                  <select value={searchLoc} onChange={e => setSearchLoc(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', padding: 0, margin: 0, width: '100%', fontSize: '15px', color: 'var(--ink)' }}>
                    <option value="">Any location</option>
                    <option value="Kannur City">Kannur City</option>
                    <option value="Thottada">Thottada</option>
                    <option value="Payyambalam">Payyambalam</option>
                    <option value="Talap">Talap</option>
                    <option value="Pallikkunnu">Pallikkunnu</option>
                    <option value="Chalad">Chalad</option>
                    <option value="Thalassery">Thalassery</option>
                    <option value="Payyanur">Payyanur</option>
                    <option value="Taliparamba">Taliparamba</option>
                    <option value="Mattannur">Mattannur</option>
                    <option value="Chovva">Chovva</option>
                    <option value="Dharmadam">Dharmadam</option>
                  </select>
                </div>
                <div className="sb-divider"></div>
                <div className="sb-field">
                  <label>Property Type</label>
                  <select value={searchType} onChange={e => setSearchType(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', padding: 0, margin: 0, width: '100%', fontSize: '15px', color: 'var(--ink)' }}>
                    <option value="All">Any type</option>
                    <option value="House">House</option>
                    <option value="Flat">Flat</option>
                    <option value="Land">Land</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div className="sb-divider"></div>
                <div className="sb-field">
                  <label>Budget</label>
                  <select value={searchPrice} onChange={e => setSearchPrice(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', padding: 0, margin: 0, width: '100%', fontSize: '15px', color: 'var(--ink)' }}>
                    <option value="All">Any budget</option>
                    <option value="Under 50L">Under ₹50L</option>
                    <option value="50L - 100L">₹50L - ₹100L</option>
                    <option value="Over 100L">Over ₹100L</option>
                  </select>
                </div>
                <button className="sb-search-btn" onClick={handleSearch} style={{ background: 'var(--blue)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>

          <nav className="hdr-nav" style={{ zIndex: 2 }}>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/properties" className="nav-link">Properties</Link>
            <Link to="/about" className="nav-link">About Us</Link>
            <Link to="/wishlist" className="nav-link">Wishlist</Link>
            <button className="nav-link" onClick={() => setShowSellModal(true)}>Sell Property</button>
            {user ? (
              <div className="user-dropdown-wrap" style={{ position: 'relative' }}>
                <button className="hdr-user" style={{padding: '5px', border: '1px solid #ddd', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span className="avatar" style={{background: 'var(--blue)', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </button>
                <div className="user-dropdown">
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid #eee', textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--ink)' }}>{user.name || 'Verified User'}</div>
                    {user.email && <div style={{ fontSize: '12px', color: 'var(--ink-2)', marginTop: 2 }}>{user.email}</div>}
                  </div>
                  <button onClick={handleLogout}>Log out</button>
                </div>
              </div>
            ) : (
              <button className="hdr-user" onClick={() => setShowAuthModal(true)} style={{padding: '5px', border: '1px solid #ddd', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <span className="avatar" style={{width: '32px', height: '32px', background: '#717171', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z"/></svg>
                </span>
              </button>
            )}
            <button className="pub-menu-btn" onClick={() => setShowMobileMenu(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer */}
      {showMobileMenu && (
        <div className="overlay" style={{zIndex: 99}} onClick={(e) => e.target.className.includes('overlay') && setShowMobileMenu(false)}></div>
      )}
      <div className={`pub-side ${showMobileMenu ? 'open' : ''}`}>
        <div className="pub-side-hd">
          <KarmaLogo height={38} />
          <button className="pub-side-close" onClick={() => setShowMobileMenu(false)}>✕</button>
        </div>
        <nav className="pub-side-nav">
          <Link to="/" className="pub-side-link" onClick={() => setShowMobileMenu(false)}>Home</Link>
          <Link to="/properties" className="pub-side-link" onClick={() => setShowMobileMenu(false)}>Properties</Link>
          <Link to="/about" className="pub-side-link" onClick={() => setShowMobileMenu(false)}>About Us</Link>
          <Link to="/wishlist" className="pub-side-link" onClick={() => setShowMobileMenu(false)}>Wishlist</Link>
          <button className="pub-side-link" onClick={() => { setShowMobileMenu(false); setShowSellModal(true); }}>Sell Property</button>
          {user ? (
            <div style={{ borderTop: '1px solid var(--line)', marginTop: 'auto', paddingTop: 24 }}>
              <div style={{ padding: '0 24px', fontSize: 13, color: 'var(--ink-2)', marginBottom: 4 }}>Signed in as</div>
              <div style={{ padding: '0 24px', fontSize: 16, color: 'var(--ink)', fontWeight: 600, marginBottom: 2 }}>{user.name || 'Verified User'}</div>
              {user.email && <div style={{ padding: '0 24px', fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>{user.email}</div>}
              <button className="pub-side-link" style={{color: 'var(--red)'}} onClick={() => { setShowMobileMenu(false); handleLogout(); }}>
                Log out
              </button>
            </div>
          ) : (
            <button className="pub-side-link" style={{color: 'var(--blue)'}} onClick={() => { setShowMobileMenu(false); setShowAuthModal(true); }}>
              Sign in / Register
            </button>
          )}
        </nav>
      </div>

      {/* Auth Gate and other modals below */}
      {showSellModal && (
        <div className="overlay" style={{zIndex: 101}} onClick={(e) => e.target.className.includes('overlay') && setShowSellModal(false)}>
          <div className="modal" style={{maxWidth: 400}}>
            <div className="modal-hd">
              <b>List Your Property</b>
              <button className="modal-x" onClick={() => setShowSellModal(false)}>✕</button>
            </div>
            <div className="modal-bd" style={{textAlign: 'center'}}>
              <div className="m-ic" style={{background: 'rgba(26, 77, 143, 0.1)', color: 'var(--blue)', margin: '0 auto 16px', width: 56, height: 56, borderRadius: '50%', display: 'grid', placeItems: 'center'}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 7v14M21 7v14M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M9 9h6M9 13h6M9 17h6"/></svg>
              </div>
              <h3 style={{fontSize: 20, fontWeight: 800, marginBottom: 8}}>Ready to sell or rent?</h3>
              <p style={{color: 'var(--ink-2)', fontSize: 14.5, marginBottom: 24, lineHeight: 1.5}}>
                Get your property listed on KARMA Real Estate and reach thousands of potential buyers and tenants. Contact our experts today!
              </p>
              <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <a href="https://wa.me/919995797450?text=Hello%20KARMA%20Real%20Estate,%20I%20would%20like%20to%20list%20my%20property." target="_blank" rel="noreferrer" style={{background: '#25D366', color: '#fff', fontWeight: 600, padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', border: 'none', cursor: 'pointer', transition: 'filter 0.2s'}} onMouseOver={e => e.currentTarget.style.filter = 'brightness(0.95)'} onMouseOut={e => e.currentTarget.style.filter = 'none'}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 2.01a10 10 0 0 0-8.52 15.27L2 22l4.87-1.46a10 10 0 1 0 5.14-18.53zm0 18A8 8 0 0 1 7.2 18.9l-.35-.2-3.6 1.08 1.1-3.5-.2-.36A8 8 0 1 1 12.01 20zm4.27-5.83c-.23-.12-1.38-.68-1.59-.76-.22-.08-.38-.12-.54.12s-.6 .76-.74.92c-.14.16-.27.18-.5.06a6.56 6.56 0 0 1-1.92-1.18 7.2 7.2 0 0 1-1.33-1.66c-.14-.24-.01-.37.1-.49.1-.11.23-.27.35-.4a1.6 1.6 0 0 0 .15-.25c.08-.16.04-.3-.02-.42s-.54-1.3-.74-1.78c-.2-.47-.4-.4-.54-.41-.14 0-.3-.01-.46-.01a.89.89 0 0 0-.64.3c-.22.24-.85.83-.85 2.02s.87 2.34.99 2.5c.12.16 1.7 2.6 4.12 3.64 1.48.64 2.15.7 2.94.59.56-.08 1.38-.56 1.57-1.1.2-.54.2-.1.14-.11z"/></svg>
                  Chat on WhatsApp
                </a>
                <a href="tel:+919995797450" style={{background: 'var(--blue)', color: '#fff', fontWeight: 600, padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.2s'}} onMouseOver={e => e.currentTarget.style.background = 'var(--blue-d)'} onMouseOut={e => e.currentTarget.style.background = 'var(--blue)'}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Call +91 99957 97450
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="auth-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className="auth-modal-header">
              <div className="auth-badge">
                <span className="auth-pulse-dot"></span>
                <span>Karma Verified Access</span>
              </div>
              <button 
                className="auth-close-btn" 
                title="Close"
                onClick={() => { setShowAuthModal(false); setTimeout(() => setStep(0), 300); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="auth-modal-body">
              {step === 0 && (
                <>
                  <div className="auth-hero">
                    <div className="auth-icon-wrap">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <path d="m9 12 2 2 4-4"/>
                      </svg>
                    </div>
                    <h3>Unlock Exclusive Property Details</h3>
                    <p>Verify your details once to unlock exact GPS coordinates, verified seller contacts, and honest pros & cons.</p>
                  </div>

                  {otpError && (
                    <div className="auth-error-banner">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <div>{otpError}</div>
                    </div>
                  )}

                  <div className="auth-input-group">
                    <label className="auth-label">Your Full Name *</label>
                    <div className="auth-input-wrapper">
                      <div className="auth-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <input 
                        className="auth-input"
                        value={formData.name} 
                        onChange={e => { setFormData({...formData, name: e.target.value}); setOtpError(''); }} 
                        placeholder="e.g. Anjali Menon" 
                        autoComplete="name" 
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-label">Email Address *</label>
                    <div className="auth-input-wrapper">
                      <div className="auth-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                      </div>
                      <input 
                        type="email" 
                        className="auth-input"
                        value={formData.email} 
                        onChange={e => { setFormData({...formData, email: e.target.value}); setOtpError(''); }} 
                        placeholder="e.g. anjali@example.com" 
                        autoComplete="email" 
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-label">Mobile Number *</label>
                    <div className="auth-input-wrapper">
                      <div className="auth-phone-code">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input 
                        className="auth-input"
                        value={formData.phone} 
                        onChange={e => { 
                          const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData({...formData, phone: v}); 
                          setOtpError('');
                        }} 
                        placeholder="10-digit mobile number" 
                        inputMode="numeric" 
                        maxLength={10} 
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-label">Your Preferred Location</label>
                    <div className="auth-input-wrapper">
                      <div className="auth-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </div>
                      <select 
                        className="auth-select"
                        value={formData.loc} 
                        onChange={e => setFormData({...formData, loc: e.target.value})}
                      >
                        {LOCALITIES.map(l => <option key={l.n} value={l.n}>{l.n} — {l.d}</option>)}
                        <option value="Outside Kannur">Outside Kannur</option>
                      </select>
                      <svg className="auth-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>
                  </div>

                  <button
                    className="auth-submit-btn"
                    disabled={otpLoading || !formData.name || !formData.email || formData.phone.length < 10}
                    onClick={() => handleSendOtp(false)}
                  >
                    {otpLoading ? (
                      <>
                        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
                        </svg>
                        <span>Sending 6-Digit Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </>
                    )}
                  </button>

                  <div className="auth-trust-strip">
                    <div className="auth-trust-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>100% Free Access</span>
                    </div>
                    <div className="auth-trust-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>Zero Spam</span>
                    </div>
                    <div className="auth-trust-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>Direct Owner Contacts</span>
                    </div>
                  </div>

                  <p className="m-note" style={{ marginTop: 14 }}>
                    By continuing you agree to our <Link to="/privacy-policy" onClick={() => setShowAuthModal(false)} style={{ color: 'var(--blue)', fontWeight: 600 }}>Privacy Policy</Link>.
                  </p>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="auth-hero">
                    <div className="auth-icon-wrap" style={{ background: 'linear-gradient(135deg, #eef6ff 0%, #dbeafe 100%)', color: '#1d4ed8' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                      </svg>
                    </div>
                    <h3>Enter Verification Code</h3>
                    <p style={{ marginBottom: 8 }}>We have dispatched a 6-digit code to your inbox.</p>
                    <div className="auth-email-pill">
                      <span>{formData.email}</span>
                      <button 
                        className="auth-link-btn" 
                        onClick={() => { setStep(0); setOtpError(''); setResendSuccess(''); }}
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {resendSuccess && (
                    <div className="auth-success-banner">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <div>{resendSuccess}</div>
                    </div>
                  )}

                  {otpError && (
                    <div className="auth-error-banner">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <div>{otpError}</div>
                    </div>
                  )}

                  <div className="auth-digit-grid" onPaste={handleOtpPaste}>
                    {otp.map((d, i) => (
                      <input 
                        key={i} 
                        ref={otpRefs[i]} 
                        value={d} 
                        type="text" 
                        inputMode="numeric" 
                        maxLength={1} 
                        disabled={cooldown > 0 || otpLoading}
                        className="auth-digit-box"
                        onPaste={handleOtpPaste}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(-1);
                          const newOtp = [...otp]; 
                          newOtp[i] = v; 
                          setOtp(newOtp);
                          setOtpError('');
                          if (v && i < 5) {
                            otpRefs[i + 1]?.current?.focus();
                          }
                          // Auto trigger if 6th digit entered
                          if (v && i === 5 && newOtp.every(digit => digit !== '')) {
                            handleVerifyOtp(newOtp.join(''));
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace') {
                            if (!otp[i] && i > 0) {
                              otpRefs[i - 1]?.current?.focus();
                            } else {
                              const newOtp = [...otp];
                              newOtp[i] = '';
                              setOtp(newOtp);
                            }
                          } else if (e.key === 'ArrowLeft' && i > 0) {
                            otpRefs[i - 1]?.current?.focus();
                          } else if (e.key === 'ArrowRight' && i < 5) {
                            otpRefs[i + 1]?.current?.focus();
                          }
                        }}
                      />
                    ))}
                  </div>

                  {cooldown > 0 ? (
                    <div style={{ color: 'var(--red)', textAlign: 'center', marginBottom: 18, fontSize: 13.5, fontWeight: 600 }}>
                      Too many failed attempts. Try again in {cooldown}s.
                    </div>
                  ) : (
                    <button
                      className="auth-submit-btn"
                      disabled={otpLoading || otp.join('').length < 6}
                      onClick={() => handleVerifyOtp()}
                    >
                      {otpLoading ? (
                        <>
                          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
                          </svg>
                          <span>Verifying Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Unlock Details</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </>
                      )}
                    </button>
                  )}

                  <div className="auth-resend-row">
                    {resendCooldown > 0 ? (
                      <span>Resend code in <b style={{ color: 'var(--ink)' }}>{resendCooldown}s</b></span>
                    ) : (
                      <>
                        <span>Didn't receive code?</span>
                        <button 
                          className="auth-link-btn" 
                          disabled={otpLoading}
                          onClick={() => handleSendOtp(true)}
                        >
                          Resend Code via Email
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}

              {step === 2 && (
                <div style={{ textAlign: 'center', padding: '16px 8px 8px' }}>
                  <div className="auth-icon-wrap" style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', color: '#15803d', margin: '0 auto 20px', boxShadow: '0 10px 25px -5px rgba(21, 128, 61, 0.25)' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: 23, fontWeight: 800, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.02em' }}>
                    Welcome, {formData.name || 'Friend'}!
                  </h3>
                  <p style={{ color: 'var(--ink-2)', fontSize: 14.5, marginBottom: 28, lineHeight: 1.5, maxWidth: 360, margin: '0 auto 24px' }}>
                    Your contact is verified. Exact property coordinates, full specifications, and direct seller contact info are now fully unlocked.
                  </p>
                  <button 
                    className="auth-submit-btn" 
                    onClick={() => {
                      setShowAuthModal(false);
                      setTimeout(() => setStep(0), 300);
                    }}
                  >
                    <span>Start Exploring Properties</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-in">
        <div className="f-brand">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <KarmaLogo height={48} />
          </Link>
          <p style={{ marginTop: '12px' }}>A Kannur-first property marketplace. Land, houses, flats, warehouses and commercial spaces — for sale, rent and lease.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/properties">Properties</Link>
          <Link to="/about">About Us</Link>
          <Link to="/wishlist">Wishlist</Link>
          <button onClick={() => window.dispatchEvent(new Event('open-sell-modal'))} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', font: 'inherit', cursor: 'pointer', textAlign: 'left' }}>Sell Property</button>
        </div>
        <div><h4>Company</h4><Link to="/about">About KARMA</Link><Link to="/privacy-policy">Privacy Policy</Link><Link to="/about">Contact</Link></div>
        <div><h4>Contact Us</h4>
          <a style={{ fontWeight: '600', color: 'var(--ink)' }}>Zeeshan Ali / Vijina Velikath</a>
          <a href="tel:+919995797450" style={{ fontWeight: '600', color: 'var(--ink)' }}>+91 99957 97450</a>
          <a href="mailto:hello@karmarealestate.in">hello@karmarealestate.in</a>
        </div>
      </div>
      <div className="f-bottom">
        <div className="f-bottom-in">
          <span>© 2026 KARMA Real Estate Pvt. Ltd.</span>
          <span><a style={{display:'inline',padding:'0 8px'}}>Privacy</a> · <a style={{display:'inline',padding:'0 8px'}}>Terms</a> · <a style={{display:'inline',padding:'0 8px'}}>Sitemap</a></span>
        </div>
        <div style={{ textAlign: 'center', paddingBottom: '24px', fontSize: '13px', color: 'var(--ink-2)' }}>
          Made with ❤️ Creatox Designs
        </div>
      </div>
    </footer>
  )
}

export default function PublicLayout() {
  return (
    <div style={{ background: 'var(--bg-soft)' }}>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
}
