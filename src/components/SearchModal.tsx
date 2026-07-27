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

  const cleanQuery = query.toLowerCase().trim();

  const searchResults = cleanQuery === ''
    ? []
    : products.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(cleanQuery);
        const subMatch = p.subtitle ? p.subtitle.toLowerCase().includes(cleanQuery) : false;
        const catMatch = p.categoryName.toLowerCase().includes(cleanQuery);
        const fabricMatch = p.fabric.toLowerCase().includes(cleanQuery);
        const fitMatch = p.fit ? p.fit.toLowerCase().includes(cleanQuery) : false;
        const descMatch = p.description.toLowerCase().includes(cleanQuery);
        const colorMatch = p.colors ? p.colors.some(c => c.name.toLowerCase().includes(cleanQuery)) : false;
        const skuMatch = p.sku ? p.sku.toLowerCase().includes(cleanQuery) : false;

        return nameMatch || subMatch || catMatch || fabricMatch || fitMatch || descMatch || colorMatch || skuMatch;
      });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-md p-4 pt-16 sm:pt-20 animate-fade-in">
      <div className="bg-[#FAF8F4] border border-[#EFE6D8] rounded-3xl max-w-2xl w-full p-6 relative shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#214C3A]">
              Search Arvika Export Catalog
            </h3>
            <p className="text-xs text-[#8C7A6B] font-sans">
              Type fabric, collection name, or style to discover matching items in real time.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#1C1C1C]/70 hover:text-[#214C3A] rounded-full hover:bg-[#EFE6D8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type 'linen', 'trench', 'organic cotton', 'silk', 'dress'..."
            className="w-full bg-white pl-12 pr-10 py-3.5 rounded-2xl border border-[#D8C6A5] text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#214C3A] shadow-xs"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C7A6B] hover:text-[#214C3A] rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Popular Search Suggestions */}
        {cleanQuery === '' && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-montserrat uppercase text-[#8C7A6B] font-bold tracking-wider">
              Popular Quick Searches:
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-sans">
              {['Linen', 'Trench', 'Organic Cotton', 'Silk', 'Kaftan', 'Merino', 'Drape'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="bg-[#EFE6D8] text-[#214C3A] hover:bg-[#214C3A] hover:text-[#FAF8F4] px-3.5 py-1.5 rounded-full font-montserrat font-semibold transition-all cursor-pointer shadow-xs"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Search Status Banner */}
        {cleanQuery !== '' && (
          <div className="flex items-center justify-between text-xs font-montserrat font-bold text-[#214C3A] border-b border-[#EFE6D8] pb-2">
            <span>
              {searchResults.length} {searchResults.length === 1 ? 'Matching Product' : 'Matching Products'} Found
            </span>
            <span className="text-[11px] text-[#8C7A6B] font-normal">
              Showing relevant results for "{query}"
            </span>
          </div>
        )}

        {/* Results List */}
        {cleanQuery !== '' && searchResults.length === 0 ? (
          <div className="py-8 text-center space-y-2 bg-[#EFE6D8]/30 rounded-2xl border border-dashed border-[#D8C6A5]">
            <p className="font-serif text-lg font-bold text-[#214C3A]">No Matching Products Found</p>
            <p className="text-xs text-[#8C7A6B] font-sans">
              No items in our catalog matched <strong className="text-[#214C3A]">"{query}"</strong>. Try searching for 'linen', 'trench', or 'cotton'.
            </p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2 pt-1 divide-y divide-[#EFE6D8]">
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
                  className="pt-3 first:pt-0 flex items-center justify-between p-3 rounded-2xl hover:bg-[#EFE6D8]/60 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-14 rounded-xl object-cover border border-[#D8C6A5] group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#214C3A] group-hover:text-[#4A5D4E]">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-[#8C7A6B] font-sans flex items-center gap-1.5">
                        <span className="font-semibold text-[#214C3A]">{product.categoryName}</span>
                        <span>•</span>
                        <span>{product.fabric}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-serif font-bold text-sm text-[#214C3A]">
                      {price}
                    </span>
                    <button className="bg-[#214C3A] text-[#FAF8F4] p-2 rounded-xl group-hover:bg-[#4A5D4E] transition-colors">
                      <Eye className="w-4 h-4 text-[#D8C6A5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
