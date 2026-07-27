import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Award, Globe } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeroProps {
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedCategory: (catId: string | null) => void;
}

const SLIDES = [
  {
    id: 'slide-1',
    badge: 'ESTABLISHED IN INDIA • CURATED FOR EUROPE',
    title: 'Timeless Indian Craftsmanship for Modern European Fashion',
    subtitle: 'Where Scandinavian minimalism meets centuries-old hand-loom heritage. Premium Normandy organic linen and GOTS-certified cotton garments crafted for quiet luxury.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop',
    ctaPrimary: 'Explore Collections',
    ctaSecondary: 'Our Craft Legacy',
    targetCategory: 'pure-linen'
  },
  {
    id: 'slide-[#2]',
    badge: 'NEW SEASON 2026 • SCANDINAVIAN EDITION',
    title: 'Normandy Organic Linen Couture Collection',
    subtitle: 'Pre-washed for vintage softness with hand-finished French seam bindings. Designed for conscious living, airy breathability, and effortless elegance.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop',
    ctaPrimary: 'Shop Pure Linen',
    ctaSecondary: 'View Sustainability Certs',
    targetCategory: 'pure-linen'
  },
  {
    id: 'slide-3',
    badge: 'DIRECT EXPORT QUALITY • FARIDABAD & JAIPUR ATELIERS',
    title: 'Artisanal Trench Coats & Tailored Outerwear',
    subtitle: 'Structural elegance crafted from heavy linen-wool twills and organic cotton voile. Built for European transitional weather and timeless wardrobe longevity.',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=2000&auto=format&fit=crop',
    ctaPrimary: 'Explore Trench Coats',
    ctaSecondary: 'Wholesale & Export Desk',
    targetCategory: 'coats-jackets'
  }
];

export const Hero: React.FC<HeroProps> = ({ setActiveTab, setSelectedCategory }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleCtaClick = (category: string | null = null, tab: ActiveTab = 'collections') => {
    setActiveTab(tab);
    if (category) {
      setSelectedCategory(category);
    }
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const slide = SLIDES[currentSlide];

  return (
    <section className="relative w-full min-h-[85vh] lg:min-h-[88vh] bg-[#1C1C1C] overflow-hidden flex items-center justify-center">
      
      {/* Background Image Slider with Parallax / Smooth Transition */}
      {SLIDES.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
          }`}
          style={{ transitionProperty: 'opacity, transform', transitionDuration: '1000ms' }}
        >
          <img
            src={s.image}
            alt={s.title}
            className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.05]"
            referrerPolicy="no-referrer"
          />
          {/* Subtle vignette gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1C]/90 via-[#1C1C1C]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C] via-transparent to-black/30" />
        </div>
      ))}

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="max-w-2xl text-[#FAF8F4] space-y-6 animate-fade-in">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-[#214C3A]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D8C6A5]/40 text-[#D8C6A5] text-[11px] font-montserrat tracking-widest uppercase font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{slide.badge}</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-wide text-[#FAF8F4]">
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p className="font-sans text-base sm:text-lg text-[#EFE6D8]/90 font-light leading-relaxed max-w-xl">
            {slide.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => handleCtaClick(slide.targetCategory, 'collections')}
              className="bg-[#D8C6A5] text-[#214C3A] hover:bg-[#FAF8F4] px-8 py-4 rounded-full font-montserrat text-xs font-bold uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-lg flex items-center space-x-2"
            >
              <span>{slide.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleCtaClick(null, 'about')}
              className="bg-white/10 hover:bg-white/20 text-[#FAF8F4] border border-[#FAF8F4]/30 px-8 py-4 rounded-full font-montserrat text-xs font-bold uppercase tracking-wider backdrop-blur-sm transition-all"
            >
              <span>{slide.ctaSecondary}</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 grid grid-cols-3 gap-4 border-t border-white/15 max-w-lg text-xs font-sans text-[#EFE6D8]/80">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#D8C6A5]" />
              <span>OEKO-TEX® Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#D8C6A5]" />
              <span>GOTS Organic Cotton</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-[#D8C6A5]" />
              <span>Direct Global Export</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation Controls */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center space-x-3">
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
          className="p-3 rounded-full bg-black/40 hover:bg-[#214C3A] text-white border border-white/20 transition-all backdrop-blur-sm"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex space-x-1.5">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentSlide ? 'w-8 bg-[#D8C6A5]' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
          className="p-3 rounded-full bg-black/40 hover:bg-[#214C3A] text-white border border-white/20 transition-all backdrop-blur-sm"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
