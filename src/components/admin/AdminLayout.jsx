import { Outlet, NavLink, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AppDataContext } from '../../context/AppDataContext';

const TITLES = {
  '/admin/dashboard': ['Dashboard', 'Real-time overview of properties, leads and activities'],
  '/admin/properties': ['Properties', 'Published directly to the live site'],
  '/admin/crm': ['Leads & CRM', 'Every verified customer and pipeline stage in one place'],
  '/admin/documents': ['Confidential documents', 'Stored in secure vault — dynamic watermarking'],
  '/admin/cms': ['Hero & CMS Settings', 'Control homepage hero, announcement banner, contact info & statistics'],
  '/admin/testimonials': ['Client Testimonials', 'Manage client reviews and ratings displayed on homepage']
};

function Sidebar({ mobileOpen, closeSidebar }) {
  const { leads, adminUser, logoutAdmin } = useContext(AppDataContext);
  const navigate = useNavigate();
  const newLeadsCount = leads.filter(l => l.status === 'New').length;

  const handleSignOut = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  const initials = adminUser?.name
    ? adminUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && <div className="side-overlay" onClick={closeSidebar}></div>}
      
      <aside className={`side ${mobileOpen ? 'mobile-open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <Link to="/" className="logo" style={{ textDecoration: 'none' }} onClick={closeSidebar}>
            <div className="logo-mark">K</div>
            <div className="logo-txt"><b>KARMA</b><span>ADMIN PANEL</span></div>
          </Link>
          {mobileOpen && (
            <button className="mobile-close-btn" onClick={closeSidebar}>✕</button>
          )}
        </div>
        
        <div className="s-label">Manage</div>
        
        <NavLink to="/admin/dashboard" className={({isActive}) => `s-item ${isActive ? 'on' : ''}`} onClick={closeSidebar}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="3" y="3" width="8" height="10" rx="2"/><rect x="13" y="3" width="8" height="6" rx="2"/><rect x="13" y="11" width="8" height="10" rx="2"/><rect x="3" y="15" width="8" height="6" rx="2"/></svg> 
          Dashboard
        </NavLink>
        
        <NavLink to="/admin/properties" className={({isActive}) => `s-item ${isActive ? 'on' : ''}`} onClick={closeSidebar}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M3 11 12 3l9 8M5 10v10h5v-6h4v6h5V10"/></svg> 
          Properties
        </NavLink>
        
        <NavLink to="/admin/crm" className={({isActive}) => `s-item ${isActive ? 'on' : ''}`} onClick={closeSidebar}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.85M16.5 3.1a4 4 0 0 1 0 7.8"/></svg> 
          Leads & CRM
          {newLeadsCount > 0 && <span className="s-badge">{newLeadsCount}</span>}
        </NavLink>
        
        <NavLink to="/admin/documents" className={({isActive}) => `s-item ${isActive ? 'on' : ''}`} onClick={closeSidebar}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5M9 14h6M9 17h4"/></svg> 
          Confidential docs
        </NavLink>

        <NavLink to="/admin/cms" className={({isActive}) => `s-item ${isActive ? 'on' : ''}`} onClick={closeSidebar}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg> 
          Hero & CMS
        </NavLink>

        <NavLink to="/admin/testimonials" className={({isActive}) => `s-item ${isActive ? 'on' : ''}`} onClick={closeSidebar}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> 
          Testimonials
        </NavLink>
        
        <div className="s-label">Public View</div>
        <Link to="/" className="s-item" target="_blank" rel="noreferrer">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Visit Website ↗
        </Link>
        
        <div className="side-foot">
          <div className="avatar">{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <b style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{adminUser?.name || 'Administrator'}</b>
            <span style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{adminUser?.email || 'admin@karmarealestate.in'}</span>
          </div>
          <button title="Sign out" onClick={handleSignOut} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', padding: '4px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [title, sub] = TITLES[loc.pathname] || ['Dashboard', ''];
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Auth guard: Check token
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Close sidebar on route change automatically on mobile
  useEffect(() => {
    setMobileOpen(false);
  }, [loc.pathname]);

  const handleAddPropertyClick = () => {
    if (loc.pathname === '/admin/properties') {
      window.dispatchEvent(new CustomEvent('open-add-property-modal'));
    } else {
      navigate('/admin/properties?add=1');
    }
  };
  
  return (
    <div className="admin-theme">
      <div className="app">
        <Sidebar mobileOpen={mobileOpen} closeSidebar={() => setMobileOpen(false)} />
        <div className="main">
          
          {/* Mobile Header (visible only on small screens) */}
          <div className="mobile-hdr">
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <div className="logo" style={{ margin: 0, textDecoration: 'none' }}>
              <div className="logo-mark" style={{ width: '32px', height: '32px', fontSize: '14px' }}>K</div>
            </div>
            <div style={{width: '24px'}}></div>
          </div>
          
          <div className="topbar">
            <div className="topbar-title">
              <div><h1>{title}</h1><p>{sub}</p></div>
            </div>
            <button className="btn btn-blue btn-sm" onClick={handleAddPropertyClick}>+ Add property</button>
          </div>
          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
