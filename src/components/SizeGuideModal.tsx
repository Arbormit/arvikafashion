import React from 'react';
import { X, Ruler, CheckCircle } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const SIZES = [
    { size: 'XS', eu: '34-36', uk: '6-8', bust: '82-86 cm', waist: '64-68 cm', hips: '90-94 cm' },
    { size: 'S', eu: '36-38', uk: '8-10', bust: '86-90 cm', waist: '68-72 cm', hips: '94-98 cm' },
    { size: 'M', eu: '38-40', uk: '10-12', bust: '90-94 cm', waist: '72-76 cm', hips: '98-102 cm' },
    { size: 'L', eu: '42-44', uk: '14-16', bust: '98-104 cm', waist: '80-86 cm', hips: '106-112 cm' },
    { size: 'XL', eu: '46-48', uk: '18-20', bust: '106-112 cm', waist: '88-94 cm', hips: '114-120 cm' },
    { size: 'XXL', eu: '50-52', uk: '22-24', bust: '114-120 cm', waist: '96-102 cm', hips: '122-128 cm' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#FAF8F4] border border-[#EFE6D8] rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#1C1C1C]/60 hover:text-[#214C3A] rounded-full hover:bg-[#EFE6D8]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 text-[#214C3A] mb-4">
          <div className="p-2.5 bg-[#EFE6D8] rounded-xl">
            <Ruler className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold">European & Global Sizing Guide</h3>
            <p className="text-xs text-[#8C7A6B] font-sans">Scandinavian Relaxed Fit Standards</p>
          </div>
        </div>

        <p className="text-xs text-[#1C1C1C]/80 font-sans mb-6 leading-relaxed">
          Arvika Fashion garments are tailored using a relaxed Scandinavian fit profile. If you prefer a closer silhouette, we recommend selecting one size down.
        </p>

        <div className="overflow-x-auto border border-[#EFE6D8] rounded-xl">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="bg-[#214C3A] text-[#FAF8F4] font-montserrat uppercase tracking-wider">
                <th className="p-3">Size</th>
                <th className="p-3">EU</th>
                <th className="p-3">UK/IN</th>
                <th className="p-3">Bust/Chest</th>
                <th className="p-3">Waist</th>
                <th className="p-3">Hips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE6D8] text-[#1C1C1C]">
              {SIZES.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white/60' : 'bg-[#EFE6D8]/30'}>
                  <td className="p-3 font-bold text-[#214C3A]">{row.size}</td>
                  <td className="p-3">{row.eu}</td>
                  <td className="p-3">{row.uk}</td>
                  <td className="p-3">{row.bust}</td>
                  <td className="p-3">{row.waist}</td>
                  <td className="p-3">{row.hips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-[#EFE6D8]/60 rounded-xl border border-[#D8C6A5]/50 text-xs font-sans text-[#214C3A] space-y-2">
          <div className="font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#214C3A]" />
            <span>Garment Care & Shrinkage Guarantee:</span>
          </div>
          <p className="text-[11px] text-[#1C1C1C]/80 leading-relaxed">
            All our 100% pure organic linen and cotton items are pre-shrunk in bio-enzyme gentle baths in Jaipur. They will retain their true measurements wash after wash when machine washed cold (30°C) on a gentle cycle.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-[#214C3A] text-[#FAF8F4] py-3 rounded-xl font-montserrat font-bold text-xs hover:bg-[#4A5D4E] transition-colors"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
