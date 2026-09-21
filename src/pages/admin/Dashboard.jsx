import { useContext, useEffect, useState } from 'react';
import { AppDataContext, formatIndianPrice } from '../../context/AppDataContext';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

function statusPill(s) {
  const m = {
    'New': 'blue', 'new': 'blue',
    'Contacted': 'amber', 'contacted': 'amber',
    'Interested': 'green', 'interested': 'green',
    'Not Interested': 'gray', 'not_interested': 'gray',
    'Closed': 'purple', 'closed': 'purple',
    'Available': 'green', 'available': 'green',
    'Under Negotiation': 'amber', 'under_negotiation': 'amber',
    'Sold': 'red', 'sold': 'red',
    'Rented': 'red', 'rented': 'red',
    'Leased': 'red', 'leased': 'red',
    'Delisted': 'gray', 'delisted': 'gray'
  };
  const label = typeof s === 'string' ? (s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')) : s;
  return <span className={`pill ${m[s] || 'gray'}`}><i></i>{label}</span>;
}

export default function Dashboard() {
  const { props, leads } = useContext(AppDataContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard/stats')
      .then(res => {
        if (res.data.success) {
          setStats(res.data.data);
        }
      })
      .catch(err => {
        console.error('Error fetching dashboard stats', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const overview = stats?.overview;
  const activeListings = overview?.active_listings ?? props.filter(p => p.pub && p.status !== 'Sold').length;
  const newLeadsCount = overview?.new_leads_badge ?? leads.filter(l => l.status === 'New').length;
  const siteVisitsCount = overview?.site_visits_this_week ?? leads.filter(l => l.src === 'Site visit request').length;
  const soldValue = props.filter(p => p.status === 'Sold').reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
  const soldCount = props.filter(p => p.status === 'Sold').length;

  const displayLeads = stats?.recent_leads?.length ? stats.recent_leads : leads.slice(0, 5);
  const displayProps = stats?.most_viewed_properties?.length ? stats.most_viewed_properties : [...props].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const upcomingVisits = stats?.upcoming_site_visits || [];

  return (
    <div className="admin-theme">
      {/* Metric Cards */}
      <div className="stat-row">
        <Link to="/admin/properties" className="stat">
          <div className="s-top">
            <div className="s-ic" style={{ background: 'var(--accent-soft)', color: 'var(--blue)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M3 11 12 3l9 8M5 10v10h5v-6h4v6h5V10"/></svg>
            </div>
            <span className="delta up">Live on website</span>
          </div>
          <b>{activeListings}</b>
          <span>Active listings</span>
        </Link>
        
        <Link to="/admin/crm" className="stat">
          <div className="s-top">
            <div className="s-ic" style={{ background: 'var(--red-soft)', color: 'var(--red)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/></svg>
            </div>
            {newLeadsCount > 0 && <span className="delta warn">Needs follow-up</span>}
          </div>
          <b>{newLeadsCount}</b>
          <span>New leads to contact</span>
        </Link>
        
        <Link to="/admin/crm?tab=tours" className="stat">
          <div className="s-top">
            <div className="s-ic" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>
            </div>
            <span className="delta up">This week</span>
          </div>
          <b>{siteVisitsCount}</b>
          <span>Site visits requested</span>
        </Link>
        
        <Link to="/admin/properties" className="stat">
          <div className="s-top">
            <div className="s-ic" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <span className="delta up">{soldCount} completed</span>
          </div>
          <b>{soldValue ? formatIndianPrice(soldValue) : '₹0'}</b>
          <span>Property volume</span>
        </Link>
      </div>

      {/* Upcoming Site Visits (if any) */}
      {upcomingVisits.length > 0 && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-hd">
            <div>
              <h3>Upcoming Site Visits & Tours</h3>
              <p>Confirmed and pending appointments requested by buyers online</p>
            </div>
            <Link to="/admin/crm?tab=tours" className="btn btn-ghost btn-sm">Manage All Tours →</Link>
          </div>
          <div className="table-scroll">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Property</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingVisits.map(v => {
                  const dateStr = v.preferred_date ? (v.preferred_date.includes('T') ? v.preferred_date.split('T')[0] : v.preferred_date) : '';
                  let formattedDate = dateStr;
                  if (dateStr) {
                    try {
                      formattedDate = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    } catch {}
                  }
                  const slotLabel = v.preferred_time_slot ? (v.preferred_time_slot.charAt(0).toUpperCase() + v.preferred_time_slot.slice(1)) : 'General';
                  return (
                    <tr key={v.id}>
                      <td className="td-main">
                        <b>{v.visitor_name}</b>
                        <span>{v.visitor_phone} · {v.visitor_email}</span>
                      </td>
                      <td><b>{v.property?.title || 'Property #' + v.property_id}</b></td>
                      <td>{formattedDate} · {slotLabel}</td>
                      <td><span className="pill amber">{v.booking_status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Recent Leads */}
      <div className="panel">
        <div className="panel-hd">
          <div>
            <h3>Newest leads</h3>
            <p>Captured automatically through OTP unlock & site visit requests</p>
          </div>
          <Link to="/admin/crm" className="btn btn-ghost btn-sm">Open CRM</Link>
        </div>
        <div className="table-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Interested in / Contact</th>
                <th>Source</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayLeads.length > 0 ? displayLeads.map(l => (
                <tr key={l.id}>
                  <td className="td-main">
                    <b>{l.name}</b>
                    <span>{l.phone} {l.loc ? `· ${l.loc}` : ''}</span>
                  </td>
                  <td style={{ fontSize: '12.5px', color: 'var(--ink-3)' }}>
                    {l.props?.[0] || l.email || 'General search'}
                    {l.props && l.props.length > 1 && <span style={{ color: 'var(--ink-2)' }}> +{l.props.length - 1}</span>}
                  </td>
                  <td><span className={`pill ${l.src === 'Site visit request' ? 'amber' : 'gray'}`}>{l.src || 'Website'}</span></td>
                  <td>{statusPill(l.status)}</td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--ink-2)' }}>No leads captured yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Listing Performance */}
      <div className="panel">
        <div className="panel-hd">
          <div>
            <h3>Listing performance</h3>
            <p>Most viewed properties and visitor engagement</p>
          </div>
          <Link to="/admin/properties" className="btn btn-ghost btn-sm">All properties</Link>
        </div>
        <div className="table-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Property</th>
                <th>Views</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayProps.length > 0 ? displayProps.map(p => (
                <tr key={p.id}>
                  <td className="td-main">
                    <b>{p.title}</b>
                    <span>{p.locality || p.loc}</span>
                  </td>
                  <td><b>{p.view_count ?? p.views ?? 0} views</b></td>
                  <td>{p.priceFormatted || formatIndianPrice(p.price, p.purpose)}</td>
                  <td>{statusPill(p.status || 'Available')}</td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--ink-2)' }}>No properties listed</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
