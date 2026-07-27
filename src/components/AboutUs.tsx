import React from 'react';
import { 
  Building2, 
  Sparkles, 
  Globe2, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Award, 
  MapPin, 
  Factory,
  Layers,
  HeartHandshake
} from 'lucide-react';

export const AboutUs: React.FC = () => {
  return (
    <section className="py-20 bg-[#FAF8F4] border-t border-[#EFE6D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Editorial Brand Story Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-montserrat uppercase tracking-[0.25em] text-[#8C7A6B] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              THE HERITAGE & VISION
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#214C3A] leading-tight">
              Bridging Indian Handloom Mastery with European Quiet Luxury
            </h2>
            <p className="font-sans text-base text-[#1C1C1C]/80 leading-relaxed">
              Arvika Fashion was born out of a deep reverence for natural textiles and architectural minimalism. Founded with a vision to connect India’s centuries-old weaving ateliers in Jaipur and Faridabad with modern European design sensibilities, we craft garments that speak through touch, weight, and silhouette.
            </p>
            <p className="font-sans text-sm text-[#8C7A6B] leading-relaxed">
              Every shirt, trench coat, and linen tunic represents an uncompromising dedication to ethical manufacturing—paying fair living wages, preserving heirloom weaving techniques, and adhering strictly to European Union textile standard regulations.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#EFE6D8] text-xs font-sans">
              <div className="flex items-center space-x-2 text-[#214C3A] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                <span>Zero Microplastic Synthetic Fabrics</span>
              </div>
              <div className="flex items-center space-x-2 text-[#214C3A] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                <span>Zero Waste Atelier Pattern Cutting</span>
              </div>
              <div className="flex items-center space-x-2 text-[#214C3A] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                <span>100% Pre-washed & Pre-shrunk</span>
              </div>
              <div className="flex items-center space-x-2 text-[#214C3A] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                <span>Low-Impact Azo-Free Dyes</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 relative">
            <div className="space-y-4">
              <img
                src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800&auto=format&fit=crop"
                alt="Jaipur Atelier Weaving"
                className="rounded-2xl object-cover h-64 w-full border border-[#D8C6A5] shadow-md"
                referrerPolicy="no-referrer"
              />
              <img
                src="https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop"
                alt="European Fashion Drape"
                className="rounded-2xl object-cover h-48 w-full border border-[#D8C6A5] shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-4 pt-8">
              <img
                src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop"
                alt="Faridabad Garment Unit"
                className="rounded-2xl object-cover h-48 w-full border border-[#D8C6A5] shadow-md"
                referrerPolicy="no-referrer"
              />
              <div className="bg-[#214C3A] text-[#FAF8F4] p-6 rounded-2xl border border-[#C5A059]/40 shadow-xl flex flex-col justify-between h-64">
                <Award className="w-8 h-8 text-[#D8C6A5]" />
                <div>
                  <div className="font-serif text-2xl font-bold text-[#D8C6A5]">
                    Export Excellence
                  </div>
                  <p className="text-xs text-[#FAF8F4]/80 mt-1 font-sans">
                    Official supplier to leading European boutiques, department stores, and eco-luxury brands across Sweden, Germany, France & UK.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manufacturing Facilities & Compliance Cards */}
        <div className="bg-[#EFE6D8]/40 border border-[#D8C6A5] rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-montserrat uppercase tracking-[0.2em] text-[#8C7A6B] font-bold">
              OPERATIONAL ATELIERS & EXPORT COMPLIANCE
            </span>
            <h3 className="font-serif text-3xl font-bold text-[#214C3A]">
              Manufacturing Infrastructure & Certifications
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Jaipur Unit */}
            <div className="bg-[#FAF8F4] p-6 rounded-2xl border border-[#EFE6D8] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#214C3A] text-[#D8C6A5] flex items-center justify-center font-bold">
                <Factory className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-xl text-[#214C3A]">Jaipur Organic Linen Atelier</h4>
              <p className="text-xs text-[#1C1C1C]/70 font-sans leading-relaxed">
                Specializing in Normandy flax yarn spinning, hand-loom weaving, pit loom texture creation, and closed-loop bio-enzyme softening.
              </p>
              <div className="text-[11px] font-montserrat font-semibold text-[#8C7A6B] flex items-center gap-1 pt-2">
                <MapPin className="w-3.5 h-3.5 text-[#214C3A]" />
                <span>Sitapura Industrial Area, Jaipur, Rajasthan</span>
              </div>
            </div>

            {/* Faridabad Unit */}
            <div className="bg-[#FAF8F4] p-6 rounded-2xl border border-[#EFE6D8] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#214C3A] text-[#D8C6A5] flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-xl text-[#214C3A]">Faridabad Export Tailoring Hub</h4>
              <p className="text-xs text-[#1C1C1C]/70 font-sans leading-relaxed">
                State-of-the-art export manufacturing unit dedicated to French seam tailoring, trench coat structure assembly, and EU quality control.
              </p>
              <div className="text-[11px] font-montserrat font-semibold text-[#8C7A6B] flex items-center gap-1 pt-2">
                <MapPin className="w-3.5 h-3.5 text-[#214C3A]" />
                <span>Krishna Nagar Industrial Belt, Faridabad, Haryana</span>
              </div>
            </div>

            {/* Compliance & GST Details */}
            <div className="bg-[#214C3A] text-[#FAF8F4] p-6 rounded-2xl border border-[#4A5D4E] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#D8C6A5] text-[#214C3A] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-xl text-[#D8C6A5]">GST & Export Compliance</h4>
              <div className="text-xs font-sans space-y-1.5 text-[#EFE6D8]/90">
                <p><strong>GSTIN:</strong> 06AABCA1234F1Z8</p>
                <p><strong>IE Export Code:</strong> 0508012399</p>
                <p><strong>Certifications:</strong> OEKO-TEX® 100, GOTS Organic Cotton, Fair Trade Certified, ISO 9001:2015</p>
              </div>
            </div>

          </div>
        </div>

        {/* Global Export Destination Badges */}
        <div className="border-t border-[#EFE6D8] pt-12 flex flex-col items-center space-y-6 text-center">
          <span className="text-xs font-montserrat uppercase tracking-[0.25em] text-[#8C7A6B] font-bold">
            SERVING 38+ INTERNATIONAL MARKETS
          </span>
          <div className="flex flex-wrap justify-center gap-3 text-xs font-sans font-semibold text-[#214C3A]">
            {['🇩🇰 Denmark', '🇸🇪 Sweden', '🇩🇪 Germany', '🇫🇷 France', '🇬🇧 United Kingdom', '🇳🇱 Netherlands', '🇳🇴 Norway', '🇦🇪 United Arab Emirates', '🇺🇸 United States', '🇮🇳 India Direct'].map((c, i) => (
              <span key={i} className="bg-[#EFE6D8] border border-[#D8C6A5] px-4 py-2 rounded-full shadow-xs">
                {c}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
