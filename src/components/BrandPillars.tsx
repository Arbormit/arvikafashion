import React from 'react';
import { Leaf, Award, Recycle, Globe2 } from 'lucide-react';

export const BrandPillars: React.FC = () => {
  const PILLARS = [
    {
      icon: <Leaf className="w-6 h-6 text-[#214C3A]" />,
      title: '100% Pure Organic Linen',
      description: 'Sourced from Normandy flax fields, pre-washed for cloud-soft handfeel without synthetic softeners.'
    },
    {
      icon: <Award className="w-6 h-6 text-[#214C3A]" />,
      title: 'Ethical Indian Craftsmanship',
      description: 'Hand-tailored by master artisans in Faridabad & Jaipur with fair living wages and safe ateliers.'
    },
    {
      icon: <Recycle className="w-6 h-6 text-[#214C3A]" />,
      title: 'OEKO-TEX® & GOTS Certified',
      description: '100% toxic-free dyes, waterless bio-processing, plastic-free biodegradable packaging.'
    },
    {
      icon: <Globe2 className="w-6 h-6 text-[#214C3A]" />,
      title: 'European Export Standard',
      description: 'Meeting strict EU textile quality regulations, serving boutiques across Sweden, Germany, France & UK.'
    }
  ];

  return (
    <section className="bg-[#EFE6D8]/50 border-y border-[#D8C6A5]/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {PILLARS.map((p, i) => (
          <div 
            key={i} 
            className="flex items-start space-x-4 p-4 rounded-xl bg-[#FAF8F4]/80 border border-[#EFE6D8] shadow-sm hover:border-[#D8C6A5] transition-all"
          >
            <div className="p-3 bg-[#EFE6D8] rounded-xl flex-shrink-0">
              {p.icon}
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#214C3A] leading-snug">
                {p.title}
              </h3>
              <p className="text-xs text-[#1C1C1C]/70 font-sans mt-1 leading-relaxed">
                {p.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
