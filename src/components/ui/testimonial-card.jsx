import * as React from "react";
import { Star, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Pause, Play, Quote, CheckCircle2, ArrowUpDown } from "lucide-react";
import { cn } from "../../lib/utils";
import api from "../../lib/api";

const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    name: "Dr. K. Radhakrishnan",
    title: "Cardiologist, Kannur Medical College",
    quote: "KARMA handled our Talap commercial clinic purchase with utmost transparency. The document verification and title clearance were done in less than 48 hours.",
    rating: 5,
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    bgImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80",
    location: "Talap, Kannur",
    verified: true
  },
  {
    id: 2,
    name: "Faisal Mohammed",
    title: "NRI Business Owner, Abu Dhabi",
    quote: "Finding sea-view luxury land in Payyambalam while living in the UAE was effortless with KARMA. The OTP-unlocked details and drone video gave me complete confidence to book before flying down.",
    rating: 5,
    avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    location: "Payyambalam Beach",
    verified: true
  },
  {
    id: 3,
    name: "Adv. Meenakshi Menon",
    title: "High Court Advocate",
    quote: "As a legal practitioner, I was thoroughly impressed by KARMA's confidential document vault and encumbrance tracking. Absolutely professional service.",
    rating: 5,
    avatarSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    location: "Kannur Town",
    verified: true
  },
  {
    id: 4,
    name: "K.V. Sasidharan",
    title: "Retd. PWD Executive Engineer",
    quote: "The honest pros and cons report saved us from buying a plot in a water-logging zone in Payyanur. Only KARMA has this level of integrity in Malabar real estate.",
    rating: 5,
    avatarSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80",
    location: "Payyanur",
    verified: true
  },
  {
    id: 5,
    name: "Mathew & Mini Joseph",
    title: "IT Executives, Bangalore / Chalad",
    quote: "Relocating back to Kannur was made seamless. KARMA negotiated the best valuation for our ancestral property and closed the sale within 3 weeks.",
    rating: 5,
    avatarSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
    location: "Chalad",
    verified: true
  },
  {
    id: 6,
    name: "Dr. Ananya Nair",
    title: "Pediatric Consultant, UK",
    quote: "Purchasing our luxury beachfront villa in Thalassery from London was completely stress-free. Virtual walkthroughs and verified legal clearances were top class.",
    rating: 5,
    avatarSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    bgImage: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80",
    location: "Thalassery Coast",
    verified: true
  },
  {
    id: 7,
    name: "Rashid & Shabana",
    title: "Retail Chain Owners, Dubai",
    quote: "KARMA secured a prime high-footfall commercial building in Thana for our new outlet. Outstanding market insights and hassle-free registration!",
    rating: 5,
    avatarSrc: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80",
    location: "Thana Commercial Hub",
    verified: true
  },
  {
    id: 8,
    name: "Capt. Suresh Kumar",
    title: "Merchant Navy Officer",
    quote: "While away at sea, KARMA managed my land purchase, survey, and boundary fencing flawlessly in Alavil. True peace of mind and 100% transparency.",
    rating: 5,
    avatarSrc: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80",
    location: "Alavil",
    verified: true
  }
];

const TestimonialCard = ({ testimonial, isFeatured = false, isMobile = false }) => {
  const hasBg = isFeatured || Boolean(testimonial.bgImage);

  return (
    <div 
      className={cn(
        "relative rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col h-full overflow-hidden transition-all duration-500 group select-none shadow-sm hover:shadow-xl",
        hasBg 
          ? "text-white bg-gray-900 border border-white/10" 
          : "bg-[#f8f9fa] text-[#111] border border-gray-100 hover:border-gray-200"
      )}
      style={{ minHeight: isMobile ? "280px" : "300px" }}
    >
      {hasBg && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${testimonial.bgImage || DEFAULT_TESTIMONIALS[0].bgImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/35" />
        </>
      )}

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          {/* Header Row: Stars & Badge */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:scale-110",
                    i < Math.floor(testimonial.rating || 5)
                      ? "fill-amber-400 text-amber-400"
                      : (hasBg ? "fill-transparent text-white/30" : "fill-transparent text-gray-300")
                  )}
                />
              ))}
            </div>

            {testimonial.verified && (
              <span className={cn(
                "inline-flex items-center gap-1 text-[10.5px] md:text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider",
                hasBg ? "bg-[#C5A059]/20 text-[#E5C178] border border-[#C5A059]/40" : "bg-[#FAF6EE] text-[#A8833E] border border-[#C5A059]/30"
              )}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>

          {/* Location tag if present */}
          {testimonial.location && (
            <div className={cn("text-xs font-medium mb-2.5", hasBg ? "text-amber-300/90" : "text-[#A8833E]")}>
              📍 {testimonial.location}
            </div>
          )}

          {/* Testimonial Quote */}
          <p className={cn(
            "text-sm sm:text-base md:text-lg leading-relaxed font-normal mb-4 sm:mb-6 italic",
            hasBg ? "text-white/95" : "text-gray-700"
          )}>
            "{testimonial.quote}"
          </p>
        </div>

        {/* Footer Row: Avatar & Name */}
        <div className="flex items-center justify-between pt-3.5 border-t border-white/10 dark:border-gray-200/40">
          <div className="flex items-center gap-3">
            <img 
              src={testimonial.avatarSrc} 
              alt={testimonial.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';
              }}
              className={cn(
                "w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-sm border-2",
                hasBg ? "border-amber-400/50" : "border-white"
              )}
            />
            <div>
              <h4 className={cn("font-bold text-sm md:text-base leading-snug", hasBg ? "text-white" : "text-gray-900")}>
                {testimonial.name}
              </h4>
              <p className={cn("text-xs md:text-sm", hasBg ? "text-gray-300" : "text-gray-500")}>
                {testimonial.title}
              </p>
            </div>
          </div>

          {/* Big Quote Decorative Icon */}
          <div className={cn("opacity-20 transition-opacity group-hover:opacity-40", hasBg ? "text-white" : "text-gray-400")}>
            <Quote className="w-7 h-7 md:w-10 md:h-10 transform rotate-180" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ClientsSectionDemo() {
  const [testimonials, setTestimonials] = React.useState(DEFAULT_TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [slideDirection, setSlideDirection] = React.useState('next');
  const [isHovered, setIsHovered] = React.useState(false);
  
  // Desktop horizontal swipe
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);

  // Mobile vertical swipe
  const [mobileTouchY, setMobileTouchY] = React.useState({ start: 0, end: 0 });

  // Fetch testimonials from backend API if available
  React.useEffect(() => {
    api.get('/home')
      .then(res => {
        if (res.data.success && res.data.data?.testimonials?.length > 0) {
          const avatarList = [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80'
          ];
          const mapped = res.data.data.testimonials.map((t, idx) => ({
            id: t.id || idx + 1,
            name: t.client_name,
            title: t.client_role,
            quote: t.content,
            rating: t.rating || 5,
            avatarSrc: t.photo_url || avatarList[idx % avatarList.length],
            bgImage: t.bg_image || (idx === 0 ? DEFAULT_TESTIMONIALS[0].bgImage : null),
            verified: true,
            location: t.location || "Kannur"
          }));

          if (mapped.length < 5) {
            const existingNames = new Set(mapped.map(m => m.name));
            const extra = DEFAULT_TESTIMONIALS.filter(d => !existingNames.has(d.name));
            setTestimonials([...mapped, ...extra]);
          } else {
            setTestimonials(mapped);
          }
        }
      })
      .catch(() => {});
  }, []);

  const total = testimonials.length;

  const handleNext = React.useCallback(() => {
    setSlideDirection('next');
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = React.useCallback(() => {
    setSlideDirection('prev');
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay with 4.5s intervals - automatically pauses on hover or touch
  React.useEffect(() => {
    if (isHovered || total === 0) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered, handleNext, total]);

  // Desktop horizontal swipe handlers
  const minSwipeDistance = 40;
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  // Mobile vertical swipe handlers
  const onMobileTouchStart = (e) => {
    setMobileTouchY({ start: e.targetTouches[0].clientY, end: e.targetTouches[0].clientY });
  };
  const onMobileTouchMove = (e) => {
    setMobileTouchY(prev => ({ ...prev, end: e.targetTouches[0].clientY }));
  };
  const onMobileTouchEnd = () => {
    const distance = mobileTouchY.start - mobileTouchY.end;
    if (distance > 35) {
      handleNext();
    } else if (distance < -35) {
      handlePrev();
    }
  };

  // Visible items for desktop grid carousel
  const getVisibleTestimonials = () => {
    if (total === 0) return [];
    const items = [];
    for (let i = 0; i < Math.min(total, 3); i++) {
      const idx = (currentIndex + i) % total;
      items.push({ ...testimonials[idx], displayIndex: i });
    }
    return items;
  };

  const visibleItems = getVisibleTestimonials();
  const currentTestimonial = testimonials[currentIndex] || DEFAULT_TESTIMONIALS[0];

  return (
    <section 
      className="w-full bg-white py-12 md:py-24 font-sans border-t border-gray-100 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-8">
        
        {/* ============================================================ */}
        {/* DESKTOP / TABLET VIEW (md and up): 3-Card Horizontal Carousel */}
        {/* ============================================================ */}
        <div className="hidden md:block">
          {/* Top Header & Carousel Controls */}
          <div className="flex items-end justify-between mb-10 lg:mb-12 gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="h-2 w-2 rounded-full bg-[#C5A059] animate-pulse" />
                <span className="text-xs md:text-sm font-semibold tracking-wider text-[#A8833E] uppercase">
                  Client Experiences
                </span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
                What Our Clients Say
              </h2>
              <p className="text-sm md:text-base text-gray-500 mt-2 max-w-xl">
                Real stories from buyers, investors, and sellers who found their dream properties in Kannur through KARMA Real Estate.
              </p>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-3">
              <div className="text-xs font-mono font-bold text-gray-500 px-3 py-2 bg-gray-100 rounded-full border border-gray-200">
                {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  aria-label="Previous Testimonial"
                  className="p-3 rounded-full bg-gray-900 text-white hover:bg-[#C5A059] transition-colors shadow-md hover:shadow-lg active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Next Testimonial"
                  className="p-3 rounded-full bg-gray-900 text-white hover:bg-[#C5A059] transition-colors shadow-md hover:shadow-lg active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Track */}
          <div 
            className="relative touch-pan-y"
            onTouchStart={(e) => {
              setIsHovered(true);
              onTouchStart(e);
            }}
            onTouchMove={onTouchMove}
            onTouchEnd={() => {
              setIsHovered(false);
              onTouchEnd();
            }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 transition-all duration-500">
              {visibleItems.map((item, idx) => (
                <div 
                  key={`${item.id}-${idx}`}
                  className="transition-all duration-500 transform ease-out"
                  style={{
                    animation: `fadeInRight 0.4s ease-out ${idx * 0.08}s both`
                  }}
                >
                  <TestimonialCard 
                    testimonial={item} 
                    isFeatured={item.displayIndex === 0 && Boolean(item.bgImage)} 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Pagination Dots */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-10 px-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSlideDirection(idx > currentIndex ? 'next' : 'prev');
                  setCurrentIndex(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-500",
                  currentIndex === idx
                    ? "w-8 bg-[#C5A059]"
                    : "w-2.5 bg-gray-200 hover:bg-gray-400"
                )}
              />
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* MOBILE VIEW (under md): Vertical Carousel & Card Stack Deck  */}
        {/* ============================================================ */}
        <div className="block md:hidden">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-2 w-2 rounded-full bg-[#C5A059] animate-pulse" />
                <span className="text-xs font-semibold tracking-wider text-[#A8833E] uppercase">
                  Client Experiences
                </span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                What Our Clients Say
              </h2>
            </div>

            {/* Clean Counter & Simple Navigation Arrows */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-gray-500 px-2.5 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                {String(currentIndex + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  aria-label="Previous Testimonial"
                  className="p-2 rounded-full bg-gray-900 text-white shadow-sm active:scale-90 hover:bg-[#C5A059] transition-all"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Next Testimonial"
                  className="p-2 rounded-full bg-gray-900 text-white shadow-sm active:scale-90 hover:bg-[#C5A059] transition-all"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Vertical Carousel Track with Touch Gestures */}
          <div 
            className="relative touch-pan-x select-none"
            onTouchStart={(e) => {
              setIsHovered(true);
              onMobileTouchStart(e);
            }}
            onTouchMove={onMobileTouchMove}
            onTouchEnd={() => {
              setIsHovered(false);
              onMobileTouchEnd();
            }}
          >
            {/* Background Peek Card (Stacked Depth effect) */}
            <div 
              className="absolute inset-x-3 -bottom-3 top-3 rounded-3xl bg-gray-100/90 border border-gray-200/90 shadow-sm transform translate-y-3 scale-[0.96] opacity-60 pointer-events-none -z-10 transition-all duration-300 overflow-hidden"
            >
              <div className="p-5 opacity-40">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-20 h-3 bg-gray-300 rounded" />
                  <div className="w-12 h-3 bg-gray-200 rounded" />
                </div>
                <div className="w-full h-3 bg-gray-200 rounded mb-2" />
                <div className="w-4/5 h-3 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Active Foreground Card with Vertical Transition */}
            <div className="flex items-stretch gap-2.5">
              <div 
                key={`mobile-${currentTestimonial.id}-${currentIndex}`}
                className="flex-1 transition-all duration-300 ease-out"
                style={{
                  animation: slideDirection === 'next' 
                    ? 'slideUpIn 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both'
                    : 'slideDownIn 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both'
                }}
              >
                <TestimonialCard 
                  testimonial={currentTestimonial}
                  isFeatured={Boolean(currentTestimonial.bgImage)}
                  isMobile={true}
                />
              </div>

              {/* Vertical Indicator Rail */}
              <div className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 bg-[#f8fafc] rounded-full border border-gray-100 self-center shadow-xs">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSlideDirection(idx > currentIndex ? 'next' : 'prev');
                      setCurrentIndex(idx);
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={cn(
                      "w-1.5 rounded-full transition-all duration-300",
                      currentIndex === idx
                        ? "h-5 bg-[#C5A059]"
                        : "h-1.5 bg-gray-300 hover:bg-gray-400"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Inline Keyframes for smooth slide transitions */}
      <style>{`
        @keyframes fadeInRight {
          from {
            opacity: 0.4;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideUpIn {
          from {
            opacity: 0.3;
            transform: translateY(22px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes slideDownIn {
          from {
            opacity: 0.3;
            transform: translateY(-22px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </section>
  );
}

