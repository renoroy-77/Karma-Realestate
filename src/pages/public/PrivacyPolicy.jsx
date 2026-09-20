import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicy() {
  return (
    <div className="nq-theme" style={{ padding: '120px 24px 60px' }}>
      <Helmet>
        <title>Privacy Policy | KARMA Real Estate</title>
      </Helmet>
      
      <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', padding: 40, borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <h1 style={{ fontSize: 32, marginBottom: 24, color: 'var(--ink)' }}>Privacy Policy</h1>
        
        <div style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)' }}>
          <p><strong>Last Updated: July 2026</strong></p>
          
          <h2 style={{ fontSize: 20, color: 'var(--ink)', margin: '24px 0 12px' }}>1. Introduction</h2>
          <p>Welcome to KARMA Real Estate. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>

          <h2 style={{ fontSize: 20, color: 'var(--ink)', margin: '24px 0 12px' }}>2. Data We Collect</h2>
          <p>We only collect the data necessary to provide our services. This includes:</p>
          <ul style={{ marginLeft: 20, marginBottom: 16 }}>
            <li><strong>Identity Data:</strong> Your name.</li>
            <li><strong>Contact Data:</strong> Your mobile phone number.</li>
            <li><strong>Location Data:</strong> Your preferred location or general locality.</li>
            <li><strong>Usage Data:</strong> Information about how you use our website, properties you view, and interactions with our platform.</li>
          </ul>

          <h2 style={{ fontSize: 20, color: 'var(--ink)', margin: '24px 0 12px' }}>3. How We Use Your Data</h2>
          <p>We use your data strictly to:</p>
          <ul style={{ marginLeft: 20, marginBottom: 16 }}>
            <li>Verify your identity via OTP to unlock premium property details.</li>
            <li>Contact you regarding properties you have expressed interest in (e.g., via "Request Site Visit").</li>
            <li>Improve our website and customer experience.</li>
          </ul>
          <p>We do <strong>not</strong> sell your personal data to any third parties.</p>

          <h2 style={{ fontSize: 20, color: 'var(--ink)', margin: '24px 0 12px' }}>4. Data Security</h2>
          <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. Access to your data is strictly limited to KARMA staff who have a business need to know.</p>

          <h2 style={{ fontSize: 20, color: 'var(--ink)', margin: '24px 0 12px' }}>5. Contact Us</h2>
          <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
          <p>KARMA Real Estate<br/>
          Fort Road, Kannur City<br/>
          Kerala 670001<br/>
          Phone: +91 99957 97450<br/>
          privacy@karmarealestate.in</p>
        </div>
      </div>
    </div>
  );
}
