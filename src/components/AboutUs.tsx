import React, { useState } from 'react';
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
  HeartHandshake,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  Target,
  ChevronDown
} from 'lucide-react';

export const AboutUs: React.FC = () => {
  const [openSwotIndex, setOpenSwotIndex] = useState<number | null>(0);

  const swotData = [
    {
      title: 'Strengths (S)',
      subtitle: 'Internal Operational & Manufacturing Advantages',
      badge: '9 Factors',
      borderColor: 'border-emerald-200',
      bgColor: 'bg-emerald-50/50',
      iconBg: 'bg-emerald-100 text-emerald-800',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      items: [
        'Highly experienced and skilled manpower',
        'Good reputation among customers',
        'Eco-friendly in quality',
        'On-time production delivery',
        'Competitive pricing model',
        'Exclusive access to high-grade natural resources',
        'Favorable access to distribution networks',
        'Creative design team',
        'Equipped with the latest and best machines'
      ]
    },
    {
      title: 'Weaknesses (W)',
      subtitle: 'External Regulatory Scope',
      badge: '1 Factor',
      borderColor: 'border-amber-200',
      bgColor: 'bg-amber-50/50',
      iconBg: 'bg-amber-100 text-amber-800',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      items: [
        'Government Policies'
      ]
    },
    {
      title: 'Opportunities (O)',
      subtitle: 'Global Growth & Market Expansion',
      badge: '4 Strategic Vectors',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50/50',
      iconBg: 'bg-blue-100 text-blue-800',
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      items: [
        'Flexibility of international trade barriers',
        'Adopting arrival of new technologies',
        'Ability to set up additional factories',
        'Introducing a new brand in India'
      ]
    },
    {
      title: 'Threats (T)',
      subtitle: 'Market Challenges & Competition',
      badge: '1 Factor',
      borderColor: 'border-rose-200',
      bgColor: 'bg-rose-50/50',
      iconBg: 'bg-rose-100 text-rose-800',
      icon: <ShieldAlert className="w-5 h-5 text-rose-600" />,
      items: [
        'Competitor China'
      ]
    }
  ];
  return (
    <section className="py-20 bg-[#FAF8F4] border-t border-[#EFE6D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Editorial Brand Story Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-montserrat uppercase tracking-[0.25em] text-[#8C7A6B] font-bold flex items-center gap-1.5">
              THE HERITAGE & VISION Since 2019
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#214C3A] leading-tight">
              A Brief About the Company Arvika Fashion.
            </h2>
            <p className="font-sans text-base text-[#1C1C1C]/80 leading-relaxed">
              Arvika Fashion is export company in fashion accessories. (shawls, stoll, scarf, bags, etc. and beachwear fashion garments (Resort Wear) Exclusivity in respect of our scarves and Garments, keep us a part from other competitors, in respect of designs, prices, terms, quality, delivery related all elements and our philosophy consists in giving the customers a complete service with latest designs.
              Thus allowing him to follow the whole development of our items from research and production to marketing and distribution but always with particular care for the human resources and the environment. 
              Today Arvind Kumar has managed to perfect itself in global system, thus offering its customers and partners in best conditions to be successful in a more sophisticated market. For production Arvika Fashion set up a network of exclusive and personal manufacturers and it is able to create entire collection. 
              While contracting the various stages from the best drawing draft to raw materials finishing process of accessories and garments. This allows present always new items and to promote sales.
            </p>
            <p className="font-sans text-sm text-[#8C7A6B] leading-relaxed">
              After serving to 10+ customers overseas in 10+ countries adding the domesting horizon to its wing. Arvika Fashion has started its same brand to cater the chic silhouttes for the indian market. 
            </p>

            {/* PRODUCTION INFORMATION & CAPACITY */}
            <div className="pt-6 border-t border-[#EFE6D8] space-y-5 text-xs font-sans">
              
              {/* Monthly Production Capacity Grid */}
              <div>
                <div className="flex items-center space-x-2 text-[#214C3A] font-montserrat font-bold uppercase tracking-wider text-[11px] mb-2.5">
                  <Factory className="w-4 h-4 text-[#C5A059]" />
                  <span>Monthly Production Capacity</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="bg-white border border-[#EFE6D8] p-3 rounded-2xl shadow-xs">
                    <span className="text-[10px] text-[#8C7A6B] uppercase font-bold block">Scarves</span>
                    <span className="text-sm font-serif font-bold text-[#214C3A]">1,00,000 Pcs / Month</span>
                  </div>
                  <div className="bg-white border border-[#EFE6D8] p-3 rounded-2xl shadow-xs">
                    <span className="text-[10px] text-[#8C7A6B] uppercase font-bold block">Garments</span>
                    <span className="text-sm font-serif font-bold text-[#214C3A]">50,000 Pcs / Month</span>
                  </div>
                  <div className="bg-white border border-[#EFE6D8] p-3 rounded-2xl shadow-xs">
                    <span className="text-[10px] text-[#8C7A6B] uppercase font-bold block">Bags</span>
                    <span className="text-sm font-serif font-bold text-[#214C3A]">7,50,000 Pcs / Month</span>
                  </div>
                </div>
              </div>

              {/* Our Production Units */}
              <div className="bg-[#FAF0E6]/60 border border-[#E8D0BE] p-4 rounded-2xl space-y-2.5">
                <div className="flex items-center space-x-2 text-[#214C3A] font-montserrat font-bold uppercase tracking-wider text-[11px]">
                  <Building2 className="w-4 h-4 text-[#C5A059]" />
                  <span>Our Specialized Production Units</span>
                </div>

                <div className="space-y-2 text-[#1C1C1C]/90 text-[11px] leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="bg-[#214C3A] text-[#FAF8F4] w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span><strong>Wool & Silk Printing Unit:</strong> Capacity of 2,500 to 3,000 pcs per day at Varanasi, UP (on contract basis).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-[#214C3A] text-[#FAF8F4] w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <span><strong>Cotton & Viscose Printing Unit:</strong> Capacity of 25,000 to 30,000 mtrs per day at Jodhpur (on contract basis).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-[#214C3A] text-[#FAF8F4] w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <span><strong>Noida Finishing & Stitching Unit:</strong> On contract basis, with tie-ups at Barabanki, Surat, Erode, Bhagalpur, Ludhiana, Amritsar, and Varanasi for women's scarves in cotton, silk, wool, viscose, and their blends.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 relative">
            <div className="space-y-4">
              <img
                src="https://res.cloudinary.com/nwpiveo3/image/upload/v1785491636/WhatsApp_Image_2026-07-29_at_3.54.20_PM_rphk4q.jpg?q=80&w=800&auto=format&fit=crop"
                alt="Jaipur Atelier Weaving"
                className="rounded-2xl object-cover h-64 w-full border border-[#D8C6A5] shadow-md"
                referrerPolicy="no-referrer"
              />
              <img
                src="https://res.cloudinary.com/nwpiveo3/image/upload/v1785491636/WhatsApp_Image_2026-07-29_at_3.54.20_PM_1_k2gsyj.jpg?q=80&w=800&auto=format&fit=crop"
                alt="European Fashion Drape"
                className="rounded-2xl object-cover h-48 w-full border border-[#D8C6A5] shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-4 pt-8">
              <img
                src="https://res.cloudinary.com/nwpiveo3/image/upload/v1785491632/WhatsApp_Image_2026-07-29_at_3.54.11_PM_2_h5zwl5.jpg?q=80&w=800&auto=format&fit=crop"
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

        {/* SWOT ANALYSIS SECTION - ACCORDION / FAQ DROPDOWN TABS */}
        <div className="border-t border-[#EFE6D8] pt-16 space-y-8">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <span className="text-xs font-montserrat uppercase tracking-[0.25em] text-[#8C7A6B] font-bold flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              STRATEGIC ANALYSIS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#214C3A]">
              Company SWOT Analysis
            </h2>
            <p className="text-xs sm:text-sm text-[#8C7A6B] font-sans leading-relaxed">
              Click any category below to explore Arvika Fashion's operational strengths, external scope, growth opportunities, and market threat matrix.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 items-start max-w-6xl mx-auto font-sans">
            {swotData.map((tab, idx) => {
              const isOpen = openSwotIndex === idx;
              return (
                <div 
                  key={idx}
                  className={`bg-white border-2 ${tab.borderColor} rounded-2xl overflow-hidden shadow-xs transition-all duration-300`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenSwotIndex(isOpen ? null : idx)}
                    className={`w-full p-4 sm:p-5 text-left flex items-center justify-between transition-colors cursor-pointer select-none ${
                      isOpen ? tab.bgColor : 'hover:bg-[#FAF8F4]'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl ${tab.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
                        {tab.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-serif text-base sm:text-lg font-bold text-[#214C3A] truncate">
                            {tab.title}
                          </h3>
                          <span className="text-[9px] font-montserrat font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[#214C3A]">
                            {tab.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8C7A6B] font-sans truncate mt-0.5">
                          {tab.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className={`w-7 h-7 rounded-full border border-[#D8C6A5] flex items-center justify-center text-[#214C3A] shrink-0 ml-2 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-[#214C3A] text-white' : 'bg-white'
                    }`}>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  {/* Expandable Content Area */}
                  {isOpen && (
                    <div className="p-4 sm:p-5 pt-3 border-t border-gray-100 bg-white animate-fade-in space-y-2.5">
                      <ul className="grid grid-cols-1 gap-2 text-xs text-[#1C1C1C]/85">
                        {tab.items.map((item, itemIdx) => (
                          <li 
                            key={itemIdx} 
                            className="bg-[#FAF8F4] border border-[#EFE6D8] p-2.5 rounded-xl flex items-start space-x-2 shadow-xs hover:border-[#C5A059]/40 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="font-medium text-[11px] leading-tight">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Export Destination Badges */}
        <div className="border-t border-[#EFE6D8] pt-12 flex flex-col items-center space-y-6 text-center">
          <span className="text-xs font-montserrat uppercase tracking-[0.25em] text-[#8C7A6B] font-bold">
            SERVING 10+ INTERNATIONAL MARKETS
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
