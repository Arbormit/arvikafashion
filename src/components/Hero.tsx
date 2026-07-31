import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeroProps {
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedCategory: (catId: string | null) => void;
}

const SLIDES = [
  {
    id: 'slide-1',
    title: 'Arvika Fashion - Premium Normandy Organic Linen European Collection',
    image: 'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491637/WhatsApp_Image_2026-07-31_at_12.44.53_PM_2_lhvagv.jpg?q=80&w=2000&auto=format&fit=crop',
    aspectRatio: 1448 / 1086,
  },
  {
    id: 'slide-2',
    title: 'Arvika Fashion - Scandinavian Minimalist Linen Apparel & Couture',
    image: 'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491636/WhatsApp_Image_2026-07-31_at_12.25.11_PM_wya4me.jpg?q=80&w=2000&auto=format&fit=crop',
    aspectRatio: 1536 / 1024,
  },
  {
    id: 'slide-3',
    title: 'Arvika Fashion - Artisanal Handloom Cotton & Quiet Luxury Wear',
    image: 'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491636/WhatsApp_Image_2026-07-31_at_12.44.51_PM_1_z02wka.jpg?q=80&w=2000&auto=format&fit=crop',
    aspectRatio: 1254 / 1254,
  },
  {
    id: 'slide-4',
    title: 'Arvika Fashion - Tailored Outerwear, Linen Dresses & Trench Coats',
    image: 'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491635/WhatsApp_Image_2026-07-29_at_3.54.17_PM_ymvjo7.jpg?q=80&w=2000&auto=format&fit=crop',
    aspectRatio: 1402 / 1122,
  }
];

export const Hero: React.FC<HeroProps> = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full bg-[#1C1C1C] overflow-hidden">
      {/* Hidden H1 for SEO Search Engine Crawlers & Accessibility */}
      <h1 className="sr-only">
        Arvika Fashion | Premium Indian Craftsmanship & Organic Linen European Couture
      </h1>

      {/* Dynamic Aspect Ratio Hero Container */}
      <div 
        className="w-full relative transition-all duration-700 ease-in-out max-h-[88vh]"
        style={{ aspectRatio: `${SLIDES[currentSlide].aspectRatio}` }}
      >
        {SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
            }`}
            style={{ transitionProperty: 'opacity', transitionDuration: '1000ms' }}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-fill object-center select-none"
              referrerPolicy="no-referrer"
            />
          </div>
        ))}

        {/* Slide Navigation Left Arrow */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-black/40 hover:bg-[#214C3A] text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-xl cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Slide Navigation Right Arrow */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-black/40 hover:bg-[#214C3A] text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-xl cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Slide Dots Indicator */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 sm:space-x-2.5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/20 shadow-xl">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide ? 'w-6 sm:w-8 bg-[#D8C6A5]' : 'w-2 sm:w-2.5 bg-white/50 hover:bg-white'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};





