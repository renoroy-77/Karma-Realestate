import React from 'react';

export default function PurposeBadge({ purpose, style = {}, className = '' }) {
  const norm = String(purpose || 'Sale').toLowerCase().trim();
  let label = 'For Sale';
  let bg = '#059669'; // Emerald Green
  let icon = (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );

  if (norm.includes('rent')) {
    label = 'For Rent';
    bg = '#2563EB'; // Royal Blue
    icon = (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    );
  } else if (norm.includes('lease')) {
    label = 'For Lease';
    bg = '#D97706'; // Amber / Orange
    icon = (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    );
  }

  return (
    <span
      className={`purpose-badge ${className}`}
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 3,
        backgroundColor: bg,
        color: '#FFFFFF',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '10.5px',
        fontWeight: 700,
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
        boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
        pointerEvents: 'none',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
}
