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
    image: 'https://res.cloudinary.com/nwpiveo3/image/upload/v1786020181/use_main_page_teq4iv.png?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 'slide-2',
    title: 'Arvika Fashion - Scandinavian Minimalist Linen Apparel & Couture',
    image: 'https://res.cloudinary.com/nwpiveo3/image/upload/v1786024983/a_stmrya.png?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 'slide-3',
    title: 'Arvika Fashion - Artisanal Handloom Cotton & Quiet Luxury Wear',
    image: 'https://res.cloudinary.com/nwpiveo3/image/upload/v1786024984/b_es2tib.png?q=80&w=2000&auto=format&fit=crop',
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
    <section className="relative w-full bg-[#FAF8F4] overflow-hidden">
      {/* Hidden H1 for SEO Search Engine Crawlers & Accessibility */}
      <h1 className="sr-only">
        Arvika Fashion | Premium Indian Craftsmanship & Organic Linen European Couture
      </h1>

      {/* Fixed Height Hero Container - Completely Stable & Does Not Resize On Slide Change */}
      <div className="w-full relative h-[380px] sm:h-[500px] md:h-[620px] lg:h-[720px] bg-[#FAF8F4] flex items-center justify-center overflow-hidden">
        {SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 w-full h-full flex items-center justify-center p-2 sm:p-4 transition-opacity duration-700 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={s.image}
              alt={s.title}
              className="max-w-full max-h-full w-auto h-auto object-contain select-none shadow-sm rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
        ))}

        {/* Slide Navigation Left Arrow */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-[#FAF8F4]/85 hover:bg-[#7B9B88] text-[#2D2A26] hover:text-white border border-[#D5E4DC] backdrop-blur-md transition-all active:scale-95 shadow-md cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Slide Navigation Right Arrow */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-[#FAF8F4]/85 hover:bg-[#7B9B88] text-[#2D2A26] hover:text-white border border-[#D5E4DC] backdrop-blur-md transition-all active:scale-95 shadow-md cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Slide Dots Indicator */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 sm:space-x-2.5 bg-[#FAF8F4]/85 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-[#D5E4DC] shadow-md">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide ? 'w-6 sm:w-8 bg-[#7B9B88]' : 'w-2 sm:w-2.5 bg-[#2D2A26]/30 hover:bg-[#7B9B88]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};






