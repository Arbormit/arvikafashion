import React, { useState } from 'react';
import { Search, X, Eye, ArrowRight } from 'lucide-react';
import { Product, Currency } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currency: Currency;
  onQuickView: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  currency,
  onQuickView
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  const searchResults = query.trim() === ''
    ? []
    : products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(query.toLowerCase()) ||
        p.fabric.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-md p-4 pt-20 animate-fade-in">
      <div className="bg-[#FAF8F4] border border-[#EFE6D8] rounded-3xl max-w-2xl w-full p-6 relative shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl font-bold text-[#214C3A]">
            Search Arvika Export Catalog
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-[#1C1C1C]/70 hover:text-[#214C3A] rounded-full hover:bg-[#EFE6D8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type 'linen', 'trench', 'organic cotton', 'dress'..."
            className="w-full bg-white pl-12 pr-4 py-3.5 rounded-2xl border border-[#D8C6A5] text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#214C3A]"
          />
        </div>

        {/* Popular Search Suggestions */}
        {query.trim() === '' && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-montserrat uppercase text-[#8C7A6B] font-bold tracking-wider">
              Popular Queries:
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-sans">
              {['Normandy Linen', 'Trench Coat', 'Organic Cotton', 'Silk Merino Sweater', 'Kaftan'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="bg-[#EFE6D8] text-[#214C3A] px-3 py-1.5 rounded-full hover:bg-[#D8C6A5] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="max-h-80 overflow-y-auto space-y-2 pt-2 divide-y divide-[#EFE6D8]">
          {searchResults.map((product) => {
            const price = currency === 'INR' 
              ? `₹${product.priceINR.toLocaleString('en-IN')}` 
              : `€${product.priceEUR}`;

            return (
              <div
                key={product.id}
                onClick={() => {
                  onQuickView(product);
                  onClose();
                }}
                className="pt-3 first:pt-0 flex items-center justify-between p-2 rounded-xl hover:bg-[#EFE6D8]/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-12 h-14 rounded-lg object-cover border border-[#D8C6A5]"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#214C3A]">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-[#8C7A6B] font-sans">
                      {product.categoryName} • {product.fabric}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-serif font-bold text-sm text-[#214C3A]">
                    {price}
                  </span>
                  <Eye className="w-4 h-4 text-[#8C7A6B]" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
