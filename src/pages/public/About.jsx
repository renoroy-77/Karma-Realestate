import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

export default function About() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.message) {
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    }
  };

  return (
    <>
      <Helmet>
        <title>About Us | KARMA Real Estate Kannur</title>
        <meta name="description" content="KARMA Real Estate is Kannur's most trusted property partner since 2012. Building trust and delivering dreams with complete transparency." />
      </Helmet>
      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative pt-48 pb-36 px-6 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a523b]/95 to-[#062b1e]/95 z-10"></div>
          <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000" alt="Beautiful Home" className="absolute inset-0 w-full h-full object-cover" />
          
          <div className="relative z-20 max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Building Trust, <br/>
              <span className="text-[#a8e6cf]">Delivering Dreams.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              KARMA Real Estate has been Kannur's most trusted property partner since 2012. We believe in complete transparency and honest advice.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-30 mb-24 md:mb-32">
          <div className="bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-gray-100 p-8 lg:p-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x divide-gray-100">
              <div className="text-center px-4">
                <div className="text-4xl md:text-5xl font-black text-[#0a523b] tracking-tighter mb-2">1.2k+</div>
                <div className="text-gray-500 font-semibold text-sm uppercase tracking-wider">Happy Families</div>
              </div>
              <div className="text-center px-4">
                <div className="text-4xl md:text-5xl font-black text-[#0a523b] tracking-tighter mb-2">850+</div>
                <div className="text-gray-500 font-semibold text-sm uppercase tracking-wider">Verified Properties</div>
              </div>
              <div className="text-center px-4">
                <div className="text-4xl md:text-5xl font-black text-[#0a523b] tracking-tighter mb-2">12</div>
                <div className="text-gray-500 font-semibold text-sm uppercase tracking-wider">Years of Trust</div>
              </div>
              <div className="text-center px-4">
                <div className="text-4xl md:text-5xl font-black text-[#0a523b] tracking-tighter mb-2">4.9</div>
                <div className="text-gray-500 font-semibold text-sm uppercase tracking-wider">Star Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Story & Branches */}
        <section className="max-w-7xl mx-auto px-6 mb-24 md:mb-40">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-[#eaf3ef] rounded-[40px] transform translate-x-4 translate-y-4 -z-10"></div>
              <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000" alt="Office Team" className="rounded-[40px] shadow-xl w-full h-[500px] object-cover" />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-6">Our Story</h2>
              <div className="prose prose-lg text-gray-600 mb-12 leading-relaxed">
                <p className="mb-4">
                  What started as a small two-person team in Thottada has grown into Kannur's premier real estate consultancy. We realized early on that buying property was often stressful and opaque.
                </p>
                <p>
                  Our mission is to simplify the property journey. Every property listed on KARMA is physically verified by our team, ensuring you get exactly what you see. No hidden fees, no fake listings.
                </p>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-6">Our Branches</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                  <b className="block text-lg font-bold text-gray-900 mb-1">Kannur Head Office</b>
                  <p className="text-gray-500 text-sm mb-3">2nd Floor, KARMA Tower, Fort Road, Kannur 670001</p>
                  <div className="text-[#0a523b] font-semibold flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    +91 98460 12345
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                  <b className="block text-lg font-bold text-gray-900 mb-1">Thalassery Branch</b>
                  <p className="text-gray-500 text-sm mb-3">Ground Floor, Pearl Complex, Logans Road, Thalassery 670101</p>
                  <div className="text-[#0a523b] font-semibold flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    +91 98460 54321
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-24 px-6 border-t border-gray-100">
          <div className="max-w-2xl mx-auto bg-white p-8 md:p-14 rounded-[40px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">Get in Touch</h2>
              <p className="text-gray-500 text-lg">Have a question? Drop us a message and we'll get back to you within 24 hours.</p>
            </div>
            
            {sent ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-[#eaf3ef] text-[#0a523b] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-500">Thank you for reaching out. We will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your full name" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-[#0a523b] focus:ring-2 focus:ring-[#0a523b]/20 outline-none transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-[#0a523b] focus:ring-2 focus:ring-[#0a523b]/20 outline-none transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Message</label>
                  <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="How can we help you?" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-[#0a523b] focus:ring-2 focus:ring-[#0a523b]/20 outline-none transition-all bg-gray-50 focus:bg-white resize-y min-h-[140px]"></textarea>
                </div>
                <button type="submit" className="btn-primary w-full py-4 text-lg mt-2">Send Message</button>
              </form>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
