import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "../../lib/utils";
import api from "../../lib/api";

const FeaturedTestimonial = ({ testimonial }) => (
  <div className="relative rounded-3xl overflow-hidden h-full min-h-[340px] md:min-h-[400px] lg:min-h-[500px] flex flex-col justify-end p-6 md:p-8 text-white shadow-xl transition-all duration-300">
    {/* Background Image */}
    <div 
      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
      style={{ backgroundImage: `url(${testimonial.bgImage})` }}
    />
    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
    
    {/* Content */}
    <div className="relative z-10 flex flex-col h-full justify-end">
      {testimonial.rating && (
        <div className="flex gap-1 mb-4 text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-5 w-5",
                i < Math.floor(testimonial.rating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-white/30"
              )}
            />
          ))}
        </div>
      )}
      <p className="text-base md:text-xl font-medium leading-relaxed mb-6 md:mb-8 text-white">
        "{testimonial.quote}"
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={testimonial.avatarSrc} 
            alt={testimonial.name}
            className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
          />
          <div>
            <span className="font-semibold block text-white">{testimonial.name}</span>
            <span className="text-xs text-white/80 block">{testimonial.title}</span>
          </div>
        </div>
        {/* Quote Icon */}
        <div className="opacity-30 text-white">
          <svg className="w-12 h-12 md:w-16 md:h-16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
);

const TestimonialCard = ({ testimonial }) => {
  const hasBg = Boolean(testimonial.bgImage);

  return (
    <div 
      className={cn(
        "relative rounded-3xl p-8 flex flex-col h-full overflow-hidden transition-all duration-300",
        hasBg ? "text-white shadow-md min-h-[260px]" : "bg-[#f2f2f2] text-[#333]"
      )}
    >
      {hasBg && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url(${testimonial.bgImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/30" />
        </>
      )}

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex gap-1 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-5 w-5",
                i < Math.floor(testimonial.rating)
                  ? (hasBg ? "fill-amber-400 text-amber-400" : "fill-[#111] text-[#111]")
                  : (hasBg ? "fill-transparent text-white/30" : "fill-transparent text-[#111]")
              )}
            />
          ))}
        </div>
        
        <p className={cn("text-base leading-relaxed mb-8 flex-grow", hasBg ? "text-white/95" : "text-[#333]")}>
          "{testimonial.quote}"
        </p>
        
        <div className="flex items-center gap-3 mt-auto">
          <img 
            src={testimonial.avatarSrc} 
            alt={testimonial.name}
            className={cn("w-10 h-10 rounded-full object-cover", hasBg ? "border-2 border-white/40" : "")}
          />
          <div>
            <h4 className={cn("font-semibold text-sm", hasBg ? "text-white" : "text-[#111]")}>{testimonial.name}</h4>
            <p className={cn("text-sm", hasBg ? "text-white/70" : "text-[#666]")}>{testimonial.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ClientsSectionDemo() {
  const [testimonials, setTestimonials] = React.useState([]);

  React.useEffect(() => {
    api.get('/home')
      .then(res => {
        if (res.data.success && res.data.data?.testimonials?.length > 0) {
          const avatarList = [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=60'
          ];
          const mapped = res.data.data.testimonials.map((t, idx) => ({
            id: t.id,
            name: t.client_name,
            title: t.client_role,
            quote: t.content,
            rating: t.rating || 5,
            avatarSrc: t.photo_url || avatarList[idx % avatarList.length],
            bgImage: t.bg_image || null
          }));
          setTestimonials(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const defaultBg = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80";

  // Prioritize testimonial with a defined bgImage for the left featured slot
  const featuredItem = testimonials.find(t => t.bgImage) || testimonials[0];

  const featuredTestimonial = {
    name: featuredItem?.name || "Dr. K. Radhakrishnan",
    title: featuredItem?.title || "Cardiologist, Kannur Medical College",
    quote: featuredItem?.quote || "KARMA handled our Talap commercial clinic purchase with utmost transparency. The document verification and title clearance were done in less than 48 hours.",
    rating: featuredItem?.rating || 5,
    avatarSrc: featuredItem?.avatarSrc || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60",
    bgImage: featuredItem?.bgImage || defaultBg
  };

  const gridTestimonials = testimonials.length > 0
    ? testimonials.filter(t => t !== featuredItem)
    : [
        {
          name: "Faisal Mohammed",
          title: "NRI Business Owner, Abu Dhabi",
          quote: "Finding sea-view luxury land in Kannur while living in the UAE was effortless with KARMA. The OTP-unlocked details and drone video gave me complete confidence to book before flying down.",
          rating: 5,
          avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=60",
          bgImage: null
        },
        {
          name: "Adv. Meenakshi Menon",
          title: "High Court Advocate",
          quote: "As a legal practitioner, I was thoroughly impressed by KARMA’s confidential document vault and encumbrance tracking. Absolutely professional service.",
          rating: 5,
          avatarSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=60",
          bgImage: null
        },
        {
          name: "K.V. Sasidharan",
          title: "Retd. PWD Executive Engineer, Payyanur",
          quote: "The honest pros and cons report saved us from buying a plot in a water-logging zone. Only KARMA has this level of integrity in Malabar.",
          rating: 5,
          avatarSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=60",
          bgImage: null
        },
        {
          name: "Mathew & Mini Joseph",
          title: "Bangalore / Chalad",
          quote: "Relocating back to Kannur was made seamless. KARMA negotiated the best valuation for our ancestral property and closed the sale within 3 weeks.",
          rating: 5,
          avatarSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=60",
          bgImage: null
        }
      ];

  return (
    <section className="w-full bg-white py-20 font-sans">
      <div className="max-w-[1760px] mx-auto px-6 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#111]" />
            <span className="text-xs md:text-sm font-medium tracking-wide text-[#333] uppercase">Client Experiences</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#111]">
            What Our Clients Say
          </h2>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left: Featured Testimonial */}
          <div className="lg:col-span-1">
            <FeaturedTestimonial testimonial={featuredTestimonial} />
          </div>

          {/* Right: 2x2 Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {gridTestimonials.map((t, idx) => (
              <TestimonialCard key={t.id || idx} testimonial={t} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

