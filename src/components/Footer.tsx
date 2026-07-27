import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Check, 
  Send, 
  ShieldCheck, 
  Award,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from '../types';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedCategory: (catId: string | null) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, setSelectedCategory }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSuccess(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSuccess(false), 4000);
  };

  return (
    <footer className="bg-[#1C1C1C] text-[#FAF8F4] pt-16 pb-12 border-t border-[#4A5D4E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Newsletter Signup Banner */}
        <div className="bg-[#214C3A] rounded-3xl p-8 sm:p-10 border border-[#C5A059]/40 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-2 max-w-xl text-center lg:text-left">
            <span className="text-[11px] font-montserrat uppercase tracking-widest text-[#D8C6A5] font-bold flex items-center justify-center lg:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              THE EUROPEAN EDIT NEWSLETTER
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF8F4]">
              Subscribe for VIP Early Access & Private Sales
            </h3>
            <p className="text-xs text-[#EFE6D8]/80 font-sans">
              Receive seasonal lookbooks, fabric care guides, and exclusive 15% promotional codes.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your business or personal email"
              className="bg-[#1A3D2F] border border-[#4A5D4E] text-[#FAF8F4] placeholder-[#EFE6D8]/50 px-5 py-3.5 rounded-2xl text-xs font-sans focus:outline-none focus:border-[#D8C6A5] min-w-[280px]"
            />
            <button
              type="submit"
              className="bg-[#D8C6A5] hover:bg-[#FAF8F4] text-[#214C3A] px-6 py-3.5 rounded-2xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-md whitespace-nowrap"
            >
              {newsletterSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>Subscribed!</span>
                </>
              ) : (
                <>
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Main Footer Links & Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-xs font-sans">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-10 h-10 rounded-full bg-[#214C3A] text-[#D8C6A5] flex items-center justify-center font-serif text-xl font-bold border border-[#C5A059]">
                AR
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-[0.15em] text-[#FAF8F4] uppercase leading-tight">
                  ARVIKA
                </span>
                <span className="text-[9px] font-montserrat uppercase tracking-[0.35em] text-[#D8C6A5] font-semibold">
                  FASHION • EUROPE
                </span>
              </div>
            </div>

            <p className="text-[#EFE6D8]/80 leading-relaxed max-w-sm">
              Arvika Fashion stands for premium Indian handloom craftsmanship tailored for modern European fashion. Delivering 100% pure organic Normandy linen and GOTS cotton garments globally.
            </p>

            <div className="text-[11px] text-[#D8C6A5] space-y-1 pt-2 font-mono">
              <p>GSTIN: 06AABCA1234F1Z8</p>
              <p>IE EXPORT CODE: 0508012399</p>
            </div>

            {/* Social Icons */}
            <div className="flex space-x-3 pt-2 text-[#D8C6A5]">
              <a href="#" className="p-2 bg-[#214C3A] rounded-full hover:bg-[#D8C6A5] hover:text-[#214C3A] transition-colors" title="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-[#214C3A] rounded-full hover:bg-[#D8C6A5] hover:text-[#214C3A] transition-colors" title="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-[#214C3A] rounded-full hover:bg-[#D8C6A5] hover:text-[#214C3A] transition-colors" title="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base text-[#D8C6A5] uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-[#EFE6D8]/80">
              <li>
                <button onClick={() => setActiveTab('home')} className="hover:text-[#D8C6A5] transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-[#D8C6A5] transition-colors">
                  About Us & Export Legacy
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('collections')} className="hover:text-[#D8C6A5] transition-colors">
                  All 8 Garment Collections
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('reviews')} className="hover:text-[#D8C6A5] transition-colors">
                  Client Reviews & Ratings
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('offers')} className="hover:text-[#D8C6A5] transition-colors">
                  Offers & Discounts
                </button>
              </li>
            </ul>
          </div>

          {/* Locations & Contact */}
          <div className="space-y-3 lg:col-span-2">
            <h4 className="font-serif font-bold text-base text-[#D8C6A5] uppercase tracking-wider">
              Global Locations & Ateliers
            </h4>

            <div className="space-y-3 text-[#EFE6D8]/80">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#D8C6A5] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#FAF8F4] block font-serif">European Showroom:</strong>
                  <span>Grønnegade 14, 1107 Copenhagen, Denmark</span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#D8C6A5] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#FAF8F4] block font-serif">Faridabad Export Unit:</strong>
                  <span>Plot 88, Krishna Nagar Industrial Belt, Faridabad, Haryana 121002, India</span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#D8C6A5] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#FAF8F4] block font-serif">Jaipur Weaving Atelier:</strong>
                  <span>G-14 Sitapura Industrial Area, Jaipur, Rajasthan 302022, India</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1 text-[#D8C6A5]">
                <Mail className="w-4 h-4" />
                <span>export@arvikafashion.com | info@arvika.eu</span>
              </div>
            </div>
          </div>

        </div>

        {/* Google Map Embedded Map Frame */}
        <div className="rounded-2xl overflow-hidden border border-[#4A5D4E] shadow-xl h-48 w-full">
          <iframe
            title="Arvika Showroom Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2249.728876228392!2d12.5815!3d55.6811!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTXCsDQwJzUyLjAiTiAxMsKwMzQnNTMuNCJF!5e0!3m2!1sen!2sdk!4v1650000000000!5m2!1sen!2sdk"
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'grayscale(0.6) contrast(1.1)' }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#4A5D4E] pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#EFE6D8]/60 space-y-4 sm:space-y-0">
          <div>
            © 2026 Arvika Fashion. All Rights Reserved. European & Global Export Division.
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-[#D8C6A5]">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-[#D8C6A5]">Terms of Export Service</a>
            <span>•</span>
            <a href="#" className="hover:text-[#D8C6A5]">OEKO-TEX® Compliance</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
