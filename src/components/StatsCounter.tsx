import React, { useState, useEffect } from 'react';
import { Users, Handshake, Globe, Award } from 'lucide-react';

export const StatsCounter: React.FC = () => {
  const [buyers, setBuyers] = useState(0);
  const [partners, setPartners] = useState(0);
  const [countries, setCountries] = useState(0);
  const [years, setYears] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setBuyers(Math.floor(25000 * Math.min(1, progress)));
      setPartners(Math.floor(150 * Math.min(1, progress)));
      setCountries(Math.floor(10 * Math.min(1, progress)));
      setYears(Math.floor(10 * Math.min(1, progress)));

      if (currentStep >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const STATS = [
    {
      icon: <Users className="w-8 h-8 text-[#7B9B88]" />,
      value: `${buyers.toLocaleString('en-IN')}+`,
      label: 'European & Global Buyers',
      subtext: 'Delighted clients across EU & Asia'
    },
    {
      icon: <Handshake className="w-8 h-8 text-[#7B9B88]" />,
      value: `${partners}+`,
      label: 'Boutique Business Partners',
      subtext: 'Boutiques & Department Stores'
    },
    {
      icon: <Globe className="w-8 h-8 text-[#7B9B88]" />,
      value: `${countries}+`,
      label: 'Export Countries',
      subtext: 'Serving Global Markets'
    },
    {
      icon: <Award className="w-8 h-8 text-[#7B9B88]" />,
      value: `${years}+`,
      label: 'Years of Experience',
      subtext: 'Mastery in Linen & Cotton Weaving'
    }
  ];

  return (
    <section className="bg-[#FAF8F4] text-[#2D2A26] py-16 px-4 sm:px-6 lg:px-8 border-y border-[#EAE2D7] relative overflow-hidden">
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#E8F0EC]/60 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#EFE6D8]/50 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-montserrat uppercase tracking-[0.25em] text-[#7B9B88] font-bold flex items-center justify-center gap-1.5">
            EXCELLENCE IN NUMBERS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2 text-[#2D2A26]">
            Trusted for Quality & Timeless Luxury
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#EAE2D7] rounded-3xl p-6 text-center space-y-3 hover:border-[#7B9B88] hover:shadow-md transition-all transform hover:-translate-y-1"
            >
              <div className="flex justify-center">{stat.icon}</div>
              <div className="font-serif text-4xl sm:text-5xl font-bold text-[#7B9B88] tracking-tight">
                {stat.value}
              </div>
              <div className="font-serif font-bold text-lg text-[#2D2A26]">
                {stat.label}
              </div>
              {stat.subtext && (
                <p className="text-xs text-[#2D2A26]/75 font-sans">
                  {stat.subtext}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
