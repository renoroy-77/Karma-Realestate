import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "../../lib/utils";

const FeaturedTestimonial = ({ testimonial }) => (
  <div className="relative rounded-3xl overflow-hidden h-full min-h-[340px] md:min-h-[400px] lg:min-h-[500px] flex flex-col justify-end p-6 md:p-8 text-white">
    {/* Background Image */}
    <div 
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${testimonial.bgImage})` }}
    />
    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
    
    {/* Content */}
    <div className="relative z-10 flex flex-col h-full justify-end">
      <p className="text-base md:text-xl font-medium leading-relaxed mb-6 md:mb-8">
        {testimonial.quote}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={testimonial.avatarSrc} 
            alt={testimonial.name}
            className="w-12 h-12 rounded-full border-2 border-white/20 object-cover"
          />
          <span className="font-semibold">{testimonial.name}</span>
        </div>
        {/* Quote Icon */}
        <div className="opacity-30">
          <svg className="w-12 h-12 md:w-16 md:h-16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
);

const TestimonialCard = ({ testimonial }) => (
  <div className="bg-[#f2f2f2] rounded-3xl p-8 flex flex-col h-full">
    <div className="flex gap-1 mb-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-5 w-5",
            i < Math.floor(testimonial.rating)
              ? "fill-[#111] text-[#111]"
              : "fill-transparent text-[#111]"
          )}
        />
      ))}
    </div>
    
    <p className="text-[#333] text-base leading-relaxed mb-8 flex-grow">
      {testimonial.quote}
    </p>
    
    <div className="flex items-center gap-3 mt-auto">
      <img 
        src={testimonial.avatarSrc} 
        alt={testimonial.name}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div>
        <h4 className="font-semibold text-sm text-[#111]">{testimonial.name}</h4>
        <p className="text-sm text-[#666]">{testimonial.title}</p>
      </div>
    </div>
  </div>
);

export default function ClientsSectionDemo() {
  const featuredTestimonial = {
    name: "Samantha Lee",
    quote: "My property search improved drastically. Highly professional and effective. The agents understood exactly what I was looking for.",
    avatarSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=60",
    bgImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80"
  };

  const testimonials = [
    {
      name: "Ali Raza",
      title: "Entrepreneur",
      quote: "The structured approach helped me manage my property investments effectively while improving my overall returns.",
      rating: 5,
      avatarSrc: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&auto=format&fit=crop&q=60"
    },
    {
      name: "Hina Malik",
      title: "Teacher",
      quote: "The holistic approach made a real difference in my home buying journey. I feel calmer, more in control, and happy with the result.",
      rating: 5,
      avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=60"
    },
    {
      name: "John Snow",
      title: "IT Expert",
      quote: "I struggled with finding the right commercial space for years, but within a few weeks, my business location improved noticeably.",
      rating: 5,
      avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60"
    },
    {
      name: "Kathie Corl",
      title: "Neurology",
      quote: "Within weeks, I noticed a significant improvement in my investment portfolio. The personalized approach made all the difference.",
      rating: 5,
      avatarSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=60"
    }
  ];

  return (
    <section className="w-full bg-white py-20 font-sans">
      <div className="max-w-[1760px] mx-auto px-6 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#111]" />
            <span className="text-xs md:text-sm font-medium tracking-wide text-[#333] uppercase">Testimonials</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif text-[#111]">
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
            {testimonials.map((t, idx) => (
              <TestimonialCard key={idx} testimonial={t} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
