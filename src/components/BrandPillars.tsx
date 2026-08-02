import React from 'react';
import { Leaf, Award, Recycle, Globe2 } from 'lucide-react';

export const BrandPillars: React.FC = () => {
  const PILLARS = [
    {
      icon: <Leaf className="w-6 h-6 text-[#7B9B88]" />,
      title: '100% Pure Organic Linen',
      description: 'Sourced from Normandy flax fields, pre-washed for cloud-soft handfeel without synthetic softeners.'
    },
    {
      icon: <Award className="w-6 h-6 text-[#7B9B88]" />,
      title: 'Ethical Indian Craftsmanship',
      description: 'Hand-tailored by master artisans in Faridabad & Jaipur with fair living wages and safe ateliers.'
    },
    {
      icon: <Recycle className="w-6 h-6 text-[#7B9B88]" />,
      title: 'OEKO-TEX® & GOTS Certified',
      description: '100% toxic-free dyes, waterless bio-processing, plastic-free biodegradable packaging.'
    },
    {
      icon: <Globe2 className="w-6 h-6 text-[#7B9B88]" />,
      title: 'European Export Standard',
      description: 'Meeting strict EU textile quality regulations, serving boutiques across Sweden, Germany, France & UK.'
    }
  ];

  return (
    <section className="bg-[#E8F0EC]/60 border-y border-[#D5E4DC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {PILLARS.map((p, i) => (
          <div 
            key={i} 
            className="flex items-start space-x-4 p-4 rounded-xl bg-white/90 border border-[#D5E4DC] shadow-xs hover:border-[#7B9B88] transition-all"
          >
            <div className="p-3 bg-[#E8F0EC] rounded-xl flex-shrink-0">
              {p.icon}
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2D2A26] leading-snug">
                {p.title}
              </h3>
              <p className="text-xs text-[#2D2A26]/75 font-sans mt-1 leading-relaxed">
                {p.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
