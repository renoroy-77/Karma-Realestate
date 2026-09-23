import React from 'react';
import karmaLogoImg from '../../assets/karma-logo-transparent.png';

export default function KarmaLogo({ height = 40, className = '', style = {}, onClick, alt = 'KARMA REAL ESTATE' }) {
  return (
    <div 
      className={`karma-logo-container ${className}`} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        cursor: onClick ? 'pointer' : 'default',
        ...style 
      }}
      onClick={onClick}
    >
      <img 
        src={karmaLogoImg} 
        alt={alt} 
        className="karma-logo-img"
        style={{ 
          height: typeof height === 'number' ? `${height}px` : height, 
          width: 'auto',
          objectFit: 'contain', 
          display: 'block',
          filter: 'drop-shadow(0 1.5px 3px rgba(0, 0, 0, 0.2))'
        }} 
      />
    </div>
  );
}
