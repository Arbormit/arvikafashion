import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Instagram, 
  Facebook, 
  Linkedin, 
  ShieldCheck, 
  Award
} from 'lucide-react';
import { ActiveTab } from '../types';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedCategory: (catId: string | null) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, setSelectedCategory }) => {
  return (
    <footer className="bg-[#F3ECE3] text-[#2D2A26] pt-16 pb-12 border-t border-[#E5DDD0] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Main Footer Links & Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-xs font-sans">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center cursor-pointer w-full pb-1" onClick={() => setActiveTab('home')}>
              <img
                src="/logo.png"
                alt="Arvika Fashion Logo"
                className="w-full max-w-[220px] xs:max-w-[300px] sm:max-w-[360px] h-18 sm:h-22 object-contain object-left transition-transform hover:scale-[1.02]"
              />
            </div>

            <p className="text-[#2D2A26]/80 leading-relaxed max-w-sm">
              We are counted amongst topmost company in India being engaged in manufacturing and exporting of Silk & Cotton Scarves, Embroidered Shawls, Ladies Garments, and bags, Canvas, Jute, Leather bags, tie, Linen Garments & Accessories, Handcrafted Garments at competitive price.
            </p>

            <div className="text-[11px] text-[#4E6E5D] space-y-1 pt-2 font-mono font-semibold">
              <p>GSTIN: 06CBJPK9654C1ZI</p>
              <p>Since : 2019</p>
            </div>

            {/* Social Icons */}
            <div className="flex space-x-3 pt-2 text-white">
              <a 
                href="https://www.instagram.com/arvikafashion?igsh=OGcyaGk5dzZmZTU2" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 bg-[#7B9B88] rounded-full hover:bg-[#E8DCB8] hover:text-[#2D2A26] transition-colors" 
                title="Instagram @arvikafashion"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base text-[#4E6E5D] uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-[#2D2A26]/80 font-medium">
              <li>
                <button onClick={() => setActiveTab('home')} className="hover:text-[#7B9B88] transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-[#7B9B88] transition-colors">
                  About Us & Export Legacy
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('collections')} className="hover:text-[#7B9B88] transition-colors">
                  All 8 Garment Collections
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('reviews')} className="hover:text-[#7B9B88] transition-colors">
                  Client Reviews & Ratings
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('offers')} className="hover:text-[#7B9B88] transition-colors">
                  Offers & Discounts
                </button>
              </li>
            </ul>
          </div>

          {/* Locations & Contact */}
          <div className="space-y-3 lg:col-span-2">
            <h4 className="font-serif font-bold text-base text-[#4E6E5D] uppercase tracking-wider">
              Head Office Location
            </h4>

            <div className="space-y-3 text-[#2D2A26]/80">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#7B9B88] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#2D2A26] block font-serif">Head Office:</strong>
                  <span>H23, G4 Krishna Nagar, Faridabad, near Krishna Public School - 121003 India</span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#7B9B88] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#2D2A26] block font-serif">Factory Address:</strong>
                  <span>H.No. 76, Sector 91, Surya Nagar Phase 2, Near IT Computer Center Faridabad - 121003 India</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 pt-1 text-[#4E6E5D] font-medium">
                <div className="flex items-center space-x-1.5">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:export@arvikafashion.com" className="hover:underline">export@arvikafashion.com</a>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+919891179374" className="hover:underline">+91 9891179374</a>
                  <span>/</span>
                  <a href="tel:+919716505898" className="hover:underline">+91 9716505898</a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Google Map Embedded Map Frame */}
        <div className="rounded-2xl overflow-hidden border border-[#E5DDD0] shadow-md h-48 w-full">
          <iframe
            title="Arvika Fashion Map"
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14014.970482025355!2d77.3220403!3d28.4789402!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce70e1209181b%3A0xe3c8555095ff708d!2sKrishna%20public%20school!5e0!3m2!1sen!2sin!4v1753857321672!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E5DDD0] pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#2D2A26]/70 space-y-4 sm:space-y-0">
          <div>
            © 2026 Arvika Fashion. All Rights Reserved. | Design and Developed by: <a href="https://www.arbormit.com" className="hover:text-[#7B9B88] font-semibold">Arbormit</a>
          </div>
          <div className="flex space-x-4">
            <a href="javascript:void(0)" onClick={(e) => e.preventDefault()} className="hover:text-[#7B9B88]">Privacy Policy</a>
            <span>•</span>
            <a href="javascript:void(0)" onClick={(e) => e.preventDefault()} className="hover:text-[#7B9B88]">Terms of Export Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
